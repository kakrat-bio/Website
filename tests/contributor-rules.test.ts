import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { TRACKS, RULE_CHANGES, RULES_UPDATED } from "../src/lib/contributors/rules";

// The rule book (src/lib/contributors/rules.ts) is the only place contributor
// terms may be written. These checks stop pages drifting apart again.
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|mdx?)$/.test(f) ? [p] : [];
  });
}

describe("contributor rule book", () => {
  it("is the only place in the site code with a rupee amount or a track word count", () => {
    const offenders = files("src")
      .filter((f) => !f.endsWith(join("contributors", "rules.ts")))
      // The admin page still labels pitches sent under the old "Kakrat Voices" track.
      .filter((f) => !f.endsWith("PitchesAdmin.tsx"))
      .filter((f) => {
        const s = readFileSync(f, "utf8");
        return /₹\s?\d|\b(500 to 900|800 to 1,500)\b|T-shirt|Kakrat Voices/.test(s);
      });
    expect(offenders).toEqual([]);
  });

  it("has a dated change log whose newest entry matches RULES_UPDATED", () => {
    expect(RULE_CHANGES[0].date).toBe(RULES_UPDATED);
    expect(readFileSync("docs/GUEST-WRITERS.md", "utf8")).toContain(RULES_UPDATED);
  });

  it("gives every track a positive word range and at least one rate", () => {
    for (const t of Object.values(TRACKS)) {
      expect(t.words.min).toBeLessThan(t.words.max);
      expect(t.payINR.length).toBeGreaterThan(0);
    }
  });
});
