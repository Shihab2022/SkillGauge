import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextFunction, Response } from "express";
import { optionalAuth, AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { UserRole } from "../../../generated/prisma/enums";

/** Browser-supplied guest key: UUIDs and similar safe id strings only. */
const GUEST_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

/**
 * Identity middleware for the login-free resume suite.
 *
 * - Signed-in visitors keep their real account (token parsed by `optionalAuth`).
 * - Everyone else is resolved to a lightweight, login-less "guest" user keyed
 *   by the browser's stable `x-guest-id` header. The guest row is created on
 *   first use so `ownerId` foreign keys keep working without any schema change,
 *   and resumes/analyses persist across visits in the same browser. Guests can
 *   later sign up normally — their data simply stays under the guest account.
 */
export const resumeIdentity = (req: AuthRequest, res: Response, next: NextFunction) => {
  void optionalAuth(req, res, async (err?: unknown) => {
    if (err) return next(err);
    if (req.user) return next();
    try {
      const raw = req.headers["x-guest-id"];
      const guestId = typeof raw === "string" && GUEST_ID_RE.test(raw) ? raw : crypto.randomUUID();
      const email = `guest-${guestId}@guest.local`.toLowerCase();
      const select = { id: true, name: true, email: true, status: true } as const;

      let user = await prisma.user.findUnique({ where: { email }, select });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: "Guest User",
            email,
            // Random, unusable password — guests never log in with it.
            password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), config.bcrypt_salt_rounds),
            role: UserRole.CANDIDATE,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
          select,
        });
      }

      if (user.status === "ACTIVE") {
        req.user = { id: user.id, name: user.name, email: user.email, role: "CANDIDATE" };
      }
      next();
    } catch (error) {
      next(error);
    }
  });
};
