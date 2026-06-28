import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatDateISO,
  formatCurrency,
  calculateItemAmount,
  capitalizeFirst,
} from "../../shared/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("handles falsy conditional classes", () => {
    const isActive = false;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class");
  });

  it("handles array input", () => {
    const result = cn(["class-a", "class-b"]);
    expect(result).toContain("class-a");
    expect(result).toContain("class-b");
  });
});

describe("formatDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatDate("2024-06-15");
    expect(result).toBe("Jun 15, 2024");
  });

  it("formats a date with time component", () => {
    const result = formatDate("2024-12-25T10:30:00Z");
    expect(result).toContain("Dec");
    expect(result).toContain("25");
    expect(result).toContain("2024");
  });

  it("returns empty string for empty input", () => {
    expect(formatDate("")).toBe("");
  });

  it("returns original string for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateISO", () => {
  it("formats a Date object to ISO string", () => {
    const date = new Date(2024, 5, 15); // June is 5 (0-indexed)
    const result = formatDateISO(date);
    expect(result).toBe("2024-06-15");
  });

  it("pads single-digit months and days with zero", () => {
    const date = new Date(2024, 0, 5); // January 5
    const result = formatDateISO(date);
    expect(result).toBe("2024-01-05");
  });
});

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    const result = formatCurrency(1234.56, "USD");
    expect(result).toContain("1,234.56");
  });

  it("formats EUR correctly", () => {
    const result = formatCurrency(999.99, "EUR");
    expect(result).toContain("999.99");
  });

  it("handles zero amount", () => {
    const result = formatCurrency(0, "USD");
    expect(result).toContain("0.00");
  });

  it("handles large amounts", () => {
    const result = formatCurrency(1000000.5, "USD");
    expect(result).toContain("1,000,000.50");
  });
});

describe("calculateItemAmount", () => {
  it("calculates amount correctly", () => {
    expect(calculateItemAmount(5, 100)).toBe(500);
  });

  it("handles decimal rates", () => {
    expect(calculateItemAmount(3, 49.99)).toBe(149.97);
  });

  it("handles zero quantity", () => {
    expect(calculateItemAmount(0, 100)).toBe(0);
  });

  it("handles zero rate", () => {
    expect(calculateItemAmount(10, 0)).toBe(0);
  });

  it("rounds to two decimal places", () => {
    expect(calculateItemAmount(3, 33.333)).toBe(100);
  });

  it("treats undefined as 0", () => {
    expect(calculateItemAmount(undefined, 50)).toBe(0);
    expect(calculateItemAmount(2, undefined)).toBe(0);
  });

  it("treats null as 0", () => {
    expect(calculateItemAmount(null, 50)).toBe(0);
    expect(calculateItemAmount(2, null)).toBe(0);
  });

  it("treats NaN as 0", () => {
    expect(calculateItemAmount(Number.NaN, 50)).toBe(0);
    expect(calculateItemAmount(2, Number.NaN)).toBe(0);
  });
});

describe("capitalizeFirst", () => {
  it("capitalizes the first letter", () => {
    expect(capitalizeFirst("hello")).toBe("Hello");
  });

  it("lowercases the rest of the string", () => {
    expect(capitalizeFirst("HELLO")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(capitalizeFirst("")).toBe("");
  });

  it("handles single character", () => {
    expect(capitalizeFirst("a")).toBe("A");
  });

  it("handles mixed case", () => {
    expect(capitalizeFirst("hEllO")).toBe("Hello");
  });
});
