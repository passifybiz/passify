import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("serializes headers and rows", () => {
    const csv = toCsv(["a", "b"], [[1, "x"], [2, "y"]]);
    expect(csv).toBe("a,b\r\n1,x\r\n2,y");
  });

  it("quotes fields with commas, quotes, or newlines and escapes quotes", () => {
    const csv = toCsv(["name"], [["a,b"], ['he said "hi"'], ["line1\nline2"]]);
    expect(csv).toBe('name\r\n"a,b"\r\n"he said ""hi"""\r\n"line1\nline2"');
  });

  it("renders null/undefined as empty", () => {
    expect(toCsv(["x", "y"], [[null, undefined]])).toBe("x,y\r\n,");
  });
});
