/**
 * Access control v0 (spec §18). UI-level only — no real auth/payment yet.
 * Phase 0 behavior: everyone can read; the access level field drives badges
 * and CTA copy so a future paywall can switch on without data changes.
 */
import type { ReportAccessLevel } from "./reportTypes";

export type UserStatus = "anonymous" | "founding" | "pro";

export function canReadReport(
  accessLevel: ReportAccessLevel,
  userStatus: UserStatus = "anonymous",
): boolean {
  if (accessLevel === "public") return true;
  if (accessLevel === "founding")
    return userStatus === "founding" || userStatus === "pro";
  if (accessLevel === "pro") return userStatus === "pro";
  if (accessLevel === "research") return userStatus === "pro";
  return false;
}

/**
 * Phase 0 override — every report is readable during the founding period,
 * regardless of access level. Flip to `canReadReport` when the paywall ships.
 */
export const FOUNDING_PERIOD = true;

export function isReadable(
  accessLevel: ReportAccessLevel,
  userStatus: UserStatus = "anonymous",
): boolean {
  if (FOUNDING_PERIOD) return true;
  return canReadReport(accessLevel, userStatus);
}

export const ACCESS_BADGE: Record<
  ReportAccessLevel,
  { label: string; tone: "founding" | "pro" | "research" | "public" }
> = {
  public: { label: "Public", tone: "public" },
  founding: { label: "Founding Access", tone: "founding" },
  pro: { label: "Pro", tone: "pro" },
  research: { label: "Research", tone: "research" },
};
