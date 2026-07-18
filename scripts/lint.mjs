import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("rg --files", { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const marker = ["AURACARE", "FORBIDDEN", "TOKEN"].join("_");
let failed = false;
for (const file of files) {
  if (file.startsWith(".git/") || file === "package-lock.json") continue;
  const text = readFileSync(file, "utf8");
  if (text.includes(marker)) {
    console.error(`Potential forbidden repository marker found in ${file}`);
    failed = true;
  }
}
if (!files.some((file) => readFileSync(file, "utf8").includes("Demonstration only. Not for diagnosis, prescribing or emergency use."))) {
  console.error("Missing persistent demonstration disclaimer.");
  failed = true;
}
if (failed) process.exit(1);
console.log("AuraCare repository lint checks passed.");
