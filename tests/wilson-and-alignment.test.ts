import { describe, it, expect } from "vitest";
import { calculateWilsonInterval } from "@/lib/stats/wilson";
import { determineRetailVisibility, calculateSignalAlignment } from "@/lib/audit/alignment";

describe("Section 12.8: Wilson score interval", () => {
  it("k = 8, n = 50 gives about 0.0834-0.2851", () => {
    const res = calculateWilsonInterval(8, 50);
    expect(res.lower).toBeCloseTo(0.0834, 3);
    expect(res.upper).toBeCloseTo(0.2851, 3);
  });

  it("k = 0 lower bound 0; k = n upper bound 1", () => {
    const res0 = calculateWilsonInterval(0, 50);
    expect(res0.lower).toBe(0);

    const resN = calculateWilsonInterval(50, 50);
    expect(resN.upper).toBe(1);
  });
});

describe("Section 12.9: Visibility rule and Signal Alignment combinations", () => {
  it("Retail visibility thresholds: 10% with 2 retailers is Visible, 9.9% is Low, 15% with 1 retailer is Low", () => {
    expect(determineRetailVisibility(10.0, 2)).toBe("Visible");
    expect(determineRetailVisibility(12.5, 3)).toBe("Visible");
    expect(determineRetailVisibility(9.9, 2)).toBe("Low");
    expect(determineRetailVisibility(15.0, 1)).toBe("Low");
    expect(determineRetailVisibility(0, 0)).toBe("Low");
  });

  it("All six Signal Alignment combinations produce the correct labels and standard caution sentence", () => {
    const expected = [
      { dir: "Increasing", vis: "Visible", label: "Aligned rise" },
      { dir: "Increasing", vis: "Low", label: "Emerging signal" },
      { dir: "Stable", vis: "Visible", label: "Established" },
      { dir: "Stable", vis: "Low", label: "Quiet" },
      { dir: "Decreasing", vis: "Visible", label: "Fading interest, still stocked" },
      { dir: "Decreasing", vis: "Low", label: "Aligned decline" },
    ] as const;

    for (const testCase of expected) {
      const res = calculateSignalAlignment(testCase.dir, testCase.vis);
      expect(res.label).toBe(testCase.label);
      expect(res.standardSentence).toBe(
        "This compares two observations. It does not predict retail performance."
      );
    }

    const noSig = calculateSignalAlignment("No signal", "Low");
    expect(noSig.label).toBe("Insufficient search signal");
    expect(noSig.standardSentence).toBe(
      "This compares two observations. It does not predict retail performance."
    );
  });
});

