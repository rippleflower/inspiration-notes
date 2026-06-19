/* global console */

import { mkdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(scriptDir, "..");
const workspaceDir = resolve(clientDir, "../..");
const distDir = resolve(clientDir, "dist");
const artifactsDir = resolve(workspaceDir, "artifacts");
const archivePath = resolve(artifactsDir, "inspiration-notes-web.tar.gz");

await stat(distDir);
await mkdir(artifactsDir, { recursive: true });
await run("tar", ["-czf", archivePath, "-C", distDir, "."]);

console.log(`Packaged Web app: ${archivePath}`);

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: workspaceDir,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}
