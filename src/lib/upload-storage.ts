import path from "node:path";
import fs from "node:fs";

/**
 * Keep merchant uploads outside the deployable build when NORLA_UPLOAD_DIR is
 * configured. The in-app folder remains a read-only fallback during migration,
 * so existing database URLs keep working until old files are copied.
 */
export function getUploadDirectories() {
  const cwd = path.resolve(process.cwd());
  const isStandalone = path.basename(cwd) === "standalone" && path.basename(path.dirname(cwd)) === ".next";
  const projectRoot = isStandalone ? path.resolve(cwd, "..", "..") : cwd;
  const projectUploads = path.resolve(projectRoot, "public", "uploads");
  const legacy = path.resolve(cwd, "public", "uploads");
  // Older deployments wrote images into standalone output. Search that directory
  // even when PM2 starts from the repository root, until deploy migrates them.
  const legacyStandalone = path.resolve(projectRoot, ".next", "standalone", "public", "uploads");
  const configured = process.env.NORLA_UPLOAD_DIR?.trim();
  const primary = configured ? path.resolve(configured) : projectUploads;
  return [...new Set([primary, projectUploads, legacy, legacyStandalone])]
    .filter((directory) => fs.existsSync(directory) || directory === primary);
}

export function getPrimaryUploadDirectory() {
  return getUploadDirectories()[0];
}

