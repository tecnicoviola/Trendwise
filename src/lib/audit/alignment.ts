import { Direction, RetailVisibility, SignalAlignmentKey, SignalAlignmentResult } from "@/types/data";
import { CONFIG } from "@/lib/config";

const STANDARD_SENTENCE = "This compares two observations. It does not predict retail performance.";

/**
 * Determines retail visibility based on frequency percentage and retailer coverage.
 * One-line explanation: Classifies a trend as Visible if observed frequency is at least 10% and present in at least 2 retailers.
 */
export function determineRetailVisibility(frequencyPct: number, retailerCoverageCount: number): RetailVisibility {
  if (frequencyPct >= CONFIG.VISIBLE_MIN_FREQ && retailerCoverageCount >= CONFIG.VISIBLE_MIN_RETAILERS) {
    return "Visible";
  }
  return "Low";
}

/**
 * Computes Signal Alignment between consumer search direction and retail audit visibility.
 * One-line explanation: Maps the 2D matrix of search trajectory vs retail shelf presence with strict cautionary wording.
 */
export function calculateSignalAlignment(
  searchDirection: Direction,
  retailVisibility: RetailVisibility
): SignalAlignmentResult {
  if (searchDirection === "No signal") {
    return {
      key: "insufficient_signal",
      label: "Insufficient search signal",
      description: "Search interest data does not have enough signal to establish a reliable direction.",
      standardSentence: STANDARD_SENTENCE,
      searchDirection,
      retailVisibility,
    };
  }

  if (searchDirection === "Increasing") {
    if (retailVisibility === "Visible") {
      return {
        key: "aligned_rise",
        label: "Aligned rise",
        description: "Consumer search interest is rising and the colour is already well represented on retail shelves.",
        standardSentence: STANDARD_SENTENCE,
        searchDirection,
        retailVisibility,
      };
    } else {
      return {
        key: "emerging_signal",
        label: "Emerging signal",
        description: "Consumer search interest is rising, but little retail presence has been observed yet.",
        standardSentence: STANDARD_SENTENCE,
        searchDirection,
        retailVisibility,
      };
    }
  }

  if (searchDirection === "Stable") {
    if (retailVisibility === "Visible") {
      return {
        key: "established",
        label: "Established",
        description: "Consumer search interest is steady and the colour is consistently stocked across retailers.",
        standardSentence: STANDARD_SENTENCE,
        searchDirection,
        retailVisibility,
      };
    } else {
      return {
        key: "quiet",
        label: "Quiet",
        description: "Low shelf visibility combined with flat search interest indicates little market activity on either side.",
        standardSentence: STANDARD_SENTENCE,
        searchDirection,
        retailVisibility,
      };
    }
  }

  // Decreasing
  if (retailVisibility === "Visible") {
    return {
      key: "fading_interest",
      label: "Fading interest, still stocked",
      description: "Search interest is falling while retail presence remains visible, suggesting retail merchandising may lag search trends.",
      standardSentence: STANDARD_SENTENCE,
      searchDirection,
      retailVisibility,
    };
  } else {
    return {
      key: "aligned_decline",
      label: "Aligned decline",
      description: "Consumer search interest is decreasing alongside low retail shelf availability.",
      standardSentence: STANDARD_SENTENCE,
      searchDirection,
      retailVisibility,
    };
  }
}

