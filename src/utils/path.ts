export function getBehaviorAssetPath(fsPath: string) {
  const path = fsPath.replaceAll("\\", "/").split(/(behavior_pack|[^\\/]*?bp|bp_[^\\/]*?)\//i)[2];
  if (path) {
    return path;
  }
  throw new Error(`Failed to resolve path: ${fsPath}`);
}

export function getResourceAssetPath(fsPath: string) {
  const path = fsPath.replaceAll("\\", "/").split(/(resource_pack|[^\\/]*?rp|rp_[^\\/]*?)\//i)[2];
  if (path) {
    return path.replace(/\.\w+$/, "");
  }
  throw new Error(`Failed to resolve path: ${fsPath}`);
}
