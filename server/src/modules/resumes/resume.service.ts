import httpStatus from "http-status";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import ApiError from "../../helpers/ApiError";
import { IAuthUser } from "../../types";
import { resumeToPlainText } from "./scoring";
import type { ResumeContent } from "./resume.validation";

export const emptyResumeContent = (): ResumeContent => ({
  personal: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "", summary: "" },
  summary: "",
  experience: [],
  education: [],
  skillGroups: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  volunteer: [],
  publications: [],
  sectionOrder: ["summary", "experience", "skills", "projects", "education", "certifications", "languages", "awards", "volunteer", "publications"],
});

async function ownResume(userId: string, resumeId: string) {
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, ownerId: userId, deletedAt: null } });
  if (!resume) throw new ApiError(httpStatus.NOT_FOUND, "Resume not found");
  return resume;
}

const list = async (user: IAuthUser, q: { page?: number; limit?: number; q?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) => {
  const page = Math.max(q.page || 1, 1);
  const limit = Math.min(Math.max(q.limit || 12, 1), 100);
  const where: Record<string, unknown> = { ownerId: user.id, deletedAt: null };
  if (q.status) where.status = q.status;
  if (q.q) where.OR = [{ title: { contains: q.q, mode: "insensitive" } }, { targetRole: { contains: q.q, mode: "insensitive" } }];
  const [total, data] = await Promise.all([
    prisma.resume.count({ where }),
    prisma.resume.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: "desc" } }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const create = async (user: IAuthUser, payload: { title: string; targetRole?: string; content?: ResumeContent; templateId?: string; customization?: unknown; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) => {
  return prisma.resume.create({
    data: {
      ownerId: user.id,
      title: payload.title,
      targetRole: payload.targetRole ?? null,
      content: (payload.content ?? emptyResumeContent()) as unknown as object,
      templateId: payload.templateId ?? "ats-classic-01",
      customization: (payload.customization ?? {}) as unknown as object,
      status: payload.status ?? "DRAFT",
    },
  });
};

const getById = async (user: IAuthUser, resumeId: string) => ownResume(user.id, resumeId);

const update = async (user: IAuthUser, resumeId: string, payload: Record<string, unknown>) => {
  await ownResume(user.id, resumeId);
  const data: Record<string, unknown> = {};
  if (payload.title !== undefined) data.title = payload.title;
  if (payload.targetRole !== undefined) data.targetRole = payload.targetRole;
  if (payload.content !== undefined) data.content = payload.content as object;
  if (payload.templateId !== undefined) data.templateId = payload.templateId;
  if (payload.customization !== undefined) data.customization = payload.customization as object;
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.isPublic !== undefined) {
    data.isPublic = payload.isPublic;
    data.publicSlug = payload.isPublic ? crypto.randomBytes(8).toString("hex") : null;
  }
  return prisma.resume.update({ where: { id: resumeId }, data });
};

const remove = async (user: IAuthUser, resumeId: string) => {
  await ownResume(user.id, resumeId);
  await prisma.resume.update({ where: { id: resumeId }, data: { deletedAt: new Date(), isPublic: false, publicSlug: null } });
  return null;
};

const duplicate = async (user: IAuthUser, resumeId: string, title?: string) => {
  const src = await ownResume(user.id, resumeId);
  return prisma.resume.create({
    data: {
      ownerId: user.id, title: title ?? `${src.title} (copy)`, targetRole: src.targetRole,
      content: src.content as unknown as object, templateId: src.templateId,
      customization: src.customization as unknown as object, status: "DRAFT",
    },
  });
};

const versions = async (user: IAuthUser, resumeId: string) => {
  await ownResume(user.id, resumeId);
  return prisma.resumeVersion.findMany({ where: { resumeId }, orderBy: { version: "desc" }, take: 30 });
};

const snapshot = async (user: IAuthUser, resumeId: string, label?: string) => {
  const src = await ownResume(user.id, resumeId);
  const last = await prisma.resumeVersion.findFirst({ where: { resumeId }, orderBy: { version: "desc" } });
  const version = (last?.version ?? 0) + 1;
  return prisma.resumeVersion.create({
    data: { resumeId, version, content: src.content as unknown as object, templateId: src.templateId, label: label ?? `v${version}` },
  });
};

const publicGet = async (slug: string) => {
  const resume = await prisma.resume.findFirst({ where: { publicSlug: slug, isPublic: true, deletedAt: null } });
  if (!resume) throw new ApiError(httpStatus.NOT_FOUND, "Shared resume not found");
  return resume;
};

const plainText = async (user: IAuthUser, resumeId: string) => {
  const r = await ownResume(user.id, resumeId);
  const text = resumeToPlainText(r.content as unknown as ResumeContent, r.targetRole);
  return { resume: r, text };
};

export const ResumeServices = { list, create, getById, update, remove, duplicate, versions, snapshot, publicGet, plainText };
