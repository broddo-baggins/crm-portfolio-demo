import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.resolve(__dirname, "../../public/locales");

/** Every key path that appears more than once in the same object of a JSON document. */
function duplicateKeys(json: string): string[] {
  const dups: string[] = [];
  const stack: Array<{ keys: Set<string>; path: string }> = [];
  let pendingKey: string | null = null;
  // Tokenise just enough of JSON to follow object nesting and member names
  const token = /"(?:[^"\\]|\\.)*"|[{}[\]:,]/g;
  let m: RegExpExecArray | null;
  let last = "";
  while ((m = token.exec(json))) {
    const t = m[0];
    if (t === "{") {
      stack.push({ keys: new Set(), path: pendingKey ?? "" });
      pendingKey = null;
    } else if (t === "}") {
      stack.pop();
    } else if (t === "[") {
      stack.push({ keys: new Set(), path: "[]" });
    } else if (t === "]") {
      stack.pop();
    } else if (t.startsWith('"') && (last === "{" || last === ",") && stack.at(-1)?.path !== "[]") {
      const key = JSON.parse(t) as string;
      const scope = stack.at(-1)!;
      const full = scope.path ? `${scope.path}.${key}` : key;
      if (scope.keys.has(key)) dups.push(full);
      scope.keys.add(key);
      pendingKey = full;
    }
    if (t !== ":") last = t;
  }
  return dups;
}

describe("locale files", () => {
  const languages = readdirSync(LOCALES_DIR);
  const files = languages.flatMap((lng) =>
    readdirSync(path.join(LOCALES_DIR, lng))
      .filter((f) => f.endsWith(".json"))
      .map((f) => `${lng}/${f}`),
  );

  it.each(files)("%s has no duplicate keys (a later duplicate silently drops the earlier one)", (file) => {
    expect(duplicateKeys(readFileSync(path.join(LOCALES_DIR, file), "utf8"))).toEqual([]);
  });

  it("detects duplicates", () => {
    expect(duplicateKeys('{"a": {"b": 1, "b": 2}, "c": [{"d": 1}, {"d": 2}]}')).toEqual(["a.b"]);
  });

  it("titles the calendar page 'Calendar' in both languages", () => {
    const read = (lng: string) => JSON.parse(readFileSync(path.join(LOCALES_DIR, lng, "pages.json"), "utf8"));
    expect(read("en").calendar.title).toBe("Calendar");
    expect(read("he").calendar.title).toBe("יומן");
  });
});
