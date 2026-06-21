import "server-only";

/**
 * Importing this module marks a file as server-only — Next.js raises a
 * build-time error if it is ever pulled into a client bundle, preventing
 * secrets (ANTHROPIC_API_KEY, RESEND_API_KEY, DATABASE_URL) from leaking.
 *
 * Use as a side-effect import at the top of any module that reads secrets.
 */
export {};
