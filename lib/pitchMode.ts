/**
 * When PITCH_MODE is true, nav helpers rewrite known real routes to `/pitch/*` facades.
 * Set `NEXT_PUBLIC_PITCH_MODE=true` for investor demos; omit or false for daily use.
 * Real routes stay reachable by direct URL (e.g. /sleep) when those routes exist.
 */

export const PITCH_MODE =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_PITCH_MODE === "true";

const PITCH_ROUTES: Record<string, string> = {
  "/sleep": "/pitch/sleep",
};

export function pitchHref(href: string): string {
  if (!PITCH_MODE) return href;
  return PITCH_ROUTES[href] ?? href;
}
