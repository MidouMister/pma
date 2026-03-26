// =====================================================
// Unit Tests - formatDelai
// =====================================================

import { describe, it, expect } from "vitest"
import { formatDelai } from "@/lib/utils"

describe("formatDelai", () => {
  it("formats 0 months and 0 days correctly", () => {
    expect(formatDelai(0, 0)).toBe("0 jour")
  })

  it("formats only months correctly", () => {
    expect(formatDelai(3, 0)).toBe("3 mois")
  })

  it("formats only days correctly", () => {
    expect(formatDelai(0, 15)).toBe("15 jours")
  })

  it("formats months and days correctly", () => {
    expect(formatDelai(3, 15)).toBe("3 mois 15 jours")
  })

  it("formats large numbers correctly", () => {
    expect(formatDelai(12, 30)).toBe("12 mois 30 jours")
  })
})
