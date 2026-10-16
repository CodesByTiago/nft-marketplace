export function toWei(eth: string) {
  const [whole, fraction = ""] = eth.split(".");
  const decimals = fraction.padEnd(18, "0").slice(0, 18);
  return BigInt(whole) * 10n ** 18n + BigInt(decimals || "0");
}

export function formatEth(wei: bigint) {
  const cents = (wei + 5n * 10n ** 15n) / 10n ** 16n;
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
}
