import httpStatus from "http-status";
import axios from "axios";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import ApiError from "../../helpers/ApiError";
import { IAuthUser } from "../../types";
import { analyzeResume } from "./ai.service";
import { resumeToPlainText } from "./scoring";
import type { ResumeContent } from "./resume.validation";

const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"];
const MAX_FETCH_BYTES = 10 * 1024 * 1024;

export function assertSafeResumeUrl(raw: string): URL {
  let target = raw.trim();
  // Transform common share links to direct downloadable streams
  const gdriveMatch = target.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch?.[1]) {
    target = `https://drive.google.com/uc?export=download&id=${gdriveMatch[1]}`;
  } else if (/dropbox\.com/i.test(target)) {
    target = target.replace(/[?&]dl=0/, "").replace(/[?&]raw=0/, "");
    target += target.includes("?") ? "&raw=1" : "?raw=1";
  }

  const url = new URL(target);
  if (!["http:", "https:"].includes(url.protocol)) throw new ApiError(httpStatus.BAD_REQUEST, "Only http(s) URLs are supported");
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.includes(host) || host.endsWith(".internal") || host.endsWith(".local")) {
    throw new ApiError(httpStatus.BAD_REQUEST, "That URL target is not allowed");
  }
  return url;
}

/** Robust text-based PDF extractor using pdf-parse with fallback */
export async function extractPdfText(buf: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buf });
    const res = await parser.getText();
    await parser.destroy();
    const text = typeof res === "string" ? res : ((res as unknown as { text?: string })?.text ?? "");
    if (text && text.trim().length > 0) {
      return text.replace(/\s+/g, " ").trim();
    }
  } catch {
    // continue to regex fallback
  }

  // Fallback stream extractor
  try {
    const raw = buf.toString("latin1");
    const out: string[] = [];
    const streamRe = /stream\r?\n([\s\S]*?)endstream/g;
    let m: RegExpExecArray | null;
    while ((m = streamRe.exec(raw))) {
      const chunk = m[1] ?? "";
      const paren = /\((?:\\.|[^()\\])*\)/g;
      let p: RegExpExecArray | null;
      while ((p = paren.exec(chunk))) {
        out.push(p[0].slice(1, -1).replace(/\\([()\\nrt])/g, "$1"));
      }
    }
    return out.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

export async function fetchResumeUrlText(raw: string): Promise<{ text: string; mime: string }> {
  const url = assertSafeResumeUrl(raw);
  const res = await axios.get(url.toString(), {
    timeout: 20000,
    maxContentLength: MAX_FETCH_BYTES,
    maxRedirects: 5,
    responseType: "arraybuffer",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "application/pdf,text/plain,text/html,*/*",
    },
    validateStatus: (s) => s >= 200 && s < 400,
  }).catch((err) => {
    const msg = err?.response?.status === 403 || err?.response?.status === 401
      ? "Target website requires authentication (e.g. LinkedIn). Please paste your resume text or upload your PDF instead."
      : "Could not fetch that URL. Ensure the URL is public, accessible, and links directly to a resume.";
    throw new ApiError(httpStatus.BAD_REQUEST, msg);
  });

  const mime = String(res.headers?.["content-type"] ?? "");
  const buf = Buffer.from(res.data as ArrayBuffer);

  if (/pdf/i.test(mime) || url.pathname.toLowerCase().endsWith(".pdf")) {
    const text = await extractPdfText(buf);
    if (text.length < 50) {
      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "No extractable text found (scanned PDF?). Upload a text-based PDF or paste text directly.");
    }
    return { text: text.slice(0, 30000), mime: "application/pdf" };
  }

  // HTML cleanup
  let text = buf.toString("utf-8");
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  if (text.length < 50) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "No readable resume text found at that URL. Please paste text directly or upload a PDF.");
  }
  return { text: text.slice(0, 30000), mime: mime || "text/plain" };
}

/** Extracts text from uploaded files (PDF, Images via Vision OCR, Text files) */
export async function extractUploadedFileText(payload: {
  fileBase64: string;
  fileName: string;
  fileMime: string;
}): Promise<{ text: string; fileName: string; fileMime: string }> {
  const buf = Buffer.from(payload.fileBase64, "base64");
  const isPdf = /pdf/i.test(payload.fileMime) || payload.fileName.toLowerCase().endsWith(".pdf");
  const isImage = /^image\//i.test(payload.fileMime) || /\.(png|jpe?g|webp)$/i.test(payload.fileName);

  if (isPdf) {
    const text = await extractPdfText(buf);
    if (text.length < 40) {
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "Could not extract text from this PDF (it might be an image scan). Please paste your resume text or upload a text-based PDF."
      );
    }
    return { text: text.slice(0, 30000), fileName: payload.fileName, fileMime: "application/pdf" };
  }

  if (isImage) {
    if (config.ai.enabled && config.ai.api_key) {
      try {
        const dataUrl = `data:${payload.fileMime || "image/jpeg"};base64,${payload.fileBase64}`;
        const res = await axios.post(
          `${config.ai.base_url}/chat/completions`,
          {
            model: config.ai.model || "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert OCR resume reader. Extract all text content from the resume image accurately. Preserve headings, bullets, dates, contact information, skills, and work history verbatim. Return only the extracted plain text.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Transcribe all text from this resume image accurately:" },
                  { type: "image_url", image_url: { url: dataUrl } },
                ],
              },
            ],
            max_tokens: 3000,
          },
          { timeout: 35000, headers: { Authorization: `Bearer ${config.ai.api_key}` } }
        );
        const text = String(res.data?.choices?.[0]?.message?.content ?? "").trim();
        if (text.length >= 40) {
          return { text: text.slice(0, 30000), fileName: payload.fileName, fileMime: payload.fileMime };
        }
      } catch {
        // continue to error
      }
    }
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Image resume uploaded. To parse image resumes, ensure AI is connected or upload a PDF/text file."
    );
  }

  // Plain text / Markdown
  const text = buf.toString("utf-8").trim();
  if (text.length < 30) {
    throw new ApiError(httpStatus.BAD_REQUEST, "The file does not contain sufficient text (min 30 characters).");
  }
  return { text: text.slice(0, 30000), fileName: payload.fileName, fileMime: payload.fileMime || "text/plain" };
}

const createAnalysis = async (user: IAuthUser, payload: {
  resumeId?: string; resumeText?: string; jobDescriptionId?: string; jobDescription?: string;
  source?: "BUILDER" | "UPLOAD" | "URL"; fileName?: string; fileMime?: string; sourceUrl?: string;
}) => {
  let content: ResumeContent | null = null;
  let text = (payload.resumeText ?? "").slice(0, 30000);
  let resumeId: string | null = null;
  if (payload.resumeId) {
    const r = await prisma.resume.findFirst({ where: { id: payload.resumeId, ownerId: user.id, deletedAt: null } });
    if (!r) throw new ApiError(httpStatus.NOT_FOUND, "Resume not found");
    resumeId = r.id;
    content = r.content as unknown as ResumeContent;
    text = resumeToPlainText(content, r.targetRole);
  }
  if (!text || text.length < 50) throw new ApiError(httpStatus.BAD_REQUEST, "Resume text is too short to analyze (min 50 characters)");
  let jobText: string | null = payload.jobDescription ?? null;
  let jobId: string | null = null;
  if (payload.jobDescriptionId) {
    const j = await prisma.jobDescription.findFirst({ where: { id: payload.jobDescriptionId, ownerId: user.id, deletedAt: null } });
    if (!j) throw new ApiError(httpStatus.NOT_FOUND, "Job description not found");
    jobId = j.id;
    jobText = j.description;
  }
  const record = await prisma.resumeAnalysis.create({
    data: {
      ownerId: user.id, resumeId, jobDescriptionId: jobId, source: payload.source ?? (resumeId ? "BUILDER" : "UPLOAD"),
      status: "PENDING", resumeText: text.slice(0, 15000), fileName: payload.fileName ?? null,
      fileMime: payload.fileMime ?? null, sourceUrl: payload.sourceUrl ?? null,
    },
  });
  try {
    const { report, provider } = await analyzeResume({ content, resumeText: text, jobDescription: jobText });
    const updated = await prisma.resumeAnalysis.update({
      where: { id: record.id },
      data: { status: "COMPLETED", score: report.overallScore, categoryScores: report.categoryScores as unknown as object, report: report as unknown as object, provider },
    });
    if (resumeId) await prisma.resume.update({ where: { id: resumeId }, data: { latestScore: report.overallScore, lastAnalyzedAt: new Date() } });
    return updated;
  } catch (err) {
    await prisma.resumeAnalysis.update({ where: { id: record.id }, data: { status: "FAILED", error: err instanceof Error ? err.message : "Analysis failed" } });
    throw new ApiError(httpStatus.BAD_GATEWAY, "AI analysis is temporarily unavailable. Please try again.");
  }
};

const listAnalyses = async (user: IAuthUser, q: { page?: number; limit?: number }) => {
  const page = Math.max(q.page || 1, 1);
  const limit = Math.min(Math.max(q.limit || 12, 1), 100);
  const where = { ownerId: user.id };
  const [total, data] = await Promise.all([
    prisma.resumeAnalysis.count({ where }),
    prisma.resumeAnalysis.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getAnalysis = async (user: IAuthUser, id: string) => {
  const a = await prisma.resumeAnalysis.findFirst({ where: { id, ownerId: user.id } });
  if (!a) throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
  return a;
};

const deleteAnalysis = async (user: IAuthUser, id: string) => {
  const a = await prisma.resumeAnalysis.findFirst({ where: { id, ownerId: user.id } });
  if (!a) throw new ApiError(httpStatus.NOT_FOUND, "Analysis not found");
  await prisma.resumeAnalysis.delete({ where: { id } });
  return null;
};

const listJobs = async (user: IAuthUser) => {
  return prisma.jobDescription.findMany({ where: { ownerId: user.id, deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 50 });
};

const createJob = async (user: IAuthUser, p: { title: string; company?: string; description: string; sourceUrl?: string }) => {
  return prisma.jobDescription.create({ data: { ownerId: user.id, title: p.title, company: p.company ?? null, description: p.description, sourceUrl: p.sourceUrl ?? null } });
};

const updateJob = async (user: IAuthUser, id: string, p: Record<string, unknown>) => {
  const j = await prisma.jobDescription.findFirst({ where: { id, ownerId: user.id, deletedAt: null } });
  if (!j) throw new ApiError(httpStatus.NOT_FOUND, "Job description not found");
  return prisma.jobDescription.update({ where: { id }, data: p as never });
};

const deleteJob = async (user: IAuthUser, id: string) => {
  const j = await prisma.jobDescription.findFirst({ where: { id, ownerId: user.id, deletedAt: null } });
  if (!j) throw new ApiError(httpStatus.NOT_FOUND, "Job description not found");
  await prisma.jobDescription.update({ where: { id }, data: { deletedAt: new Date() } });
  return null;
};

export const AnalysisServices = { createAnalysis, listAnalyses, getAnalysis, deleteAnalysis, listJobs, createJob, updateJob, deleteJob };
