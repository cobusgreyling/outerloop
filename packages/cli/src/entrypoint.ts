import { realpathSync } from "node:fs";

export function isCliEntrypoint(
  modulePath: string,
  argv: string[] = process.argv,
): boolean {
  const entry = argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(modulePath);
  } catch {
    return false;
  }
}