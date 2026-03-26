// =====================================================
// Unit Tests - formatAmount
// =====================================================

import { describe, it, expect } from "vitest"
import { formatAmount } from "@/lib/utils"

describe("formatAmount", () => {
  it("formats zero correctly", () => {
    expect(formatAmount(0)).toBe("0,00 DA")
  })

  it("formats small numbers correctly", () => {
    expect(formatAmount(100)).toBe("100,00 DA")
  })

  it("formats large numbers correctly", () => {
    const result = formatAmount(1234567.89)
    expect(result).toContain("DA")
    expect(result).toContain("1")
  })

  it("formats negative numbers correctly", () => {
    const result = formatAmount(-500.5)
    expect(result).toContain("DA")
    expect(result).toContain("500")
  })

  it("formats numbers with decimal places correctly", () => {
    const result = formatAmount(1234.56)
    // Intl.NumberFormat uses narrow non-breaking space
    expect(result).toBe("1\u202f234,56 DA")
  })
})
