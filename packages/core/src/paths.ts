import path from "node:path";

export const OUTERLOOP_DIR = ".outerloop";

export function getOuterloopDir(cwd = process.cwd()): string {
  return path.join(cwd, OUTERLOOP_DIR);
}

export function getEvidenceDir(cwd = process.cwd()): string {
  return path.join(getOuterloopDir(cwd), "evidence");
}

export function getVerdictsDir(cwd = process.cwd()): string {
  return path.join(getOuterloopDir(cwd), "verdicts");
}

export function getLedgerDir(cwd = process.cwd()): string {
  return path.join(getOuterloopDir(cwd), "ledger");
}

export function getManifestsDir(cwd = process.cwd()): string {
  return path.join(getOuterloopDir(cwd), "manifests");
}

export function getTasteDir(cwd = process.cwd()): string {
  return path.join(getOuterloopDir(cwd), "taste");
}

export function getPolicyDir(cwd = process.cwd()): string {
  return path.join(getOuterloopDir(cwd), "policy");
}