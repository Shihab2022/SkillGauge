import httpStatus from "http-status";
import axios from "axios";
import { prisma } from "../../lib/prisma";
import ApiError from "../../helpers/ApiError";
import { IAuthUser } from "../../types";
import { analyzeResume } from "./ai.service";
import { resumeToPlainText } from "./scoring";
import type { ResumeContent } from "./resume.validation";

const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"];
const MAX_FETCH_BYTES = 4 * 1024 * 1024;

export function assertSafeResumeUrl(raw: string): URL {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new ApiError(httpStatus.BAD_REQUEST, "Only http(s) URLs are supported");
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.includes(host) || host.endsWith(".internal") || host.endsWith(".local")) {
    throw new ApiError(httpStatus.BAD_REQUEST, "That URL target is not allowed");
  }
  return url;
}

export async function fetchResumeUrlText(raw: string): Promise<{ text: string; mime: string }> {
  const url = assertSafeResumeUrl(raw);
  const res = await axios.get(url.toString(), {
    timeout: 15000, maxContentLength: MAX_FETCH_BYTES, responseType: "arraybuffer",
    headers: { "User-Agent": "SkillGauge-ResumeAnalyzer/1.0", Accept: "application/pdf,text/plain,text/html" },
    validateStatus: (s) => s >= 200 && s < 300,
  }).catch(() => null);
  if (!res) throw new ApiError(httpStatus.BAD_REQUEST, "Could not fetch that URL. Check it is public and points to a resume file.");
  const mime = String(res.headers?.["content-type"] ?? "");
  const buf = Buffer.from(res.data as ArrayBuffer);
  if (/pdf/i.test(mime) || url.pathname.toLowerCase().endsWith(".pdf")) {
    const text = extractPdfText(buf);
    if (text.length < 50) throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "No extractable text found (scanned PDF?). Upload a text-based PDF instead.");
    return { text: text.slice(0, 30000), mime: "application/pdf" };
  }
  const text = buf.toString("utf-8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 50) throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "No resume text found at that URL.");
  return { text: text.slice(0, 30000), mime: mime || "text/plain" };
}

/** Minimal text-based PDF extractor (server-side, no execution of uploads). */
export function extractPdfText(buf: Buffer): string {
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
