export function tokenId(name: string) {
  return `#${(name.match(/#(\d+)$/)?.[1] ?? "0").padStart(4, "0")}`;
}
