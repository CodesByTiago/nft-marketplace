import { describe, expect, it } from "vitest";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";

describe("eth", () => {
  it("converte ETH em wei sem perder precisão", () => {
    expect(toWei("1")).toBe(10n ** 18n);
    expect(toWei("0.02")).toBe(20n * 10n ** 15n);
    expect(toWei("12.123456789012345678")).toBe(12123456789012345678n);
  });

  it("formata wei com duas casas decimais", () => {
    expect(formatEth(toWei("1.5"))).toBe("1.50");
    expect(formatEth(toWei("0.005"))).toBe("0.01");
    expect(formatEth(0n)).toBe("0.00");
  });
});
