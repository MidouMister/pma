// =====================================================
// Unit Tests - calculateProgress
// =====================================================

import { describe, it, expect } from "vitest"
import { calculateProgress } from "@/lib/utils"

describe("calculateProgress", () => {
  it("returns 0 for empty array", () => {
    expect(calculateProgress([])).toBe(0)
  })

  it("returns 0 when all montantHT are zero", () => {
    const phases = [
      { progress: 50, montantHT: 0 },
      { progress: 100, montantHT: 0 },
    ]
    expect(calculateProgress(phases)).toBe(0)
  })

  it("calculates weighted average correctly", () => {
    const phases = [
      { progress: 50, montantHT: 100000 },
      { progress: 100, montantHT: 100000 },
    ]
    // (50*100000 + 100*100000) / 200000 = 75
    expect(calculateProgress(phases)).toBe(75)
  })

  it("handles single phase correctly", () => {
    const phases = [{ progress: 80, montantHT: 50000 }]
    expect(calculateProgress(phases)).toBe(80)
  })

  it("rounds to 2 decimal places", () => {
    const phases = [
      { progress: 33.33, montantHT: 100000 },
      { progress: 66.66, montantHT: 100000 },
    ]
    // (33.33*100000 + 66.66*100000) / 200000 = 49.995 -> 50
    expect(calculateProgress(phases)).toBe(50)
  })
})
