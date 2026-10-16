export function toWei(eth: string) {
  const [whole, fraction = ""] = eth.split(".");
  const decimals = fraction.padEnd(18, "0").slice(0, 18);
  return BigInt(whole) * 10n ** 18n + BigInt(decimals || "0");
}

export function formatEth(wei: bigint, digits = 2) {
  const unit = 10n ** BigInt(18 - digits);
  const scaled = (wei + unit / 2n) / unit;
  const scale = 10n ** BigInt(digits);
  return `${scaled / scale}.${(scaled % scale).toString().padStart(digits, "0")}`;
}
