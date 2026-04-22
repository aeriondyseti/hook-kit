/**
 * Turn a nested hook-input object into flat `[key, value]` rows suitable for
 * `OutputBuilder.appendTable`. Primitives stringify directly; objects/arrays
 * become compact JSON. Long values are truncated so the table stays readable.
 *
 * This lives in `examples/` to show a pattern you might adopt in your own
 * hooks — it is not re-exported from the library.
 */
export function flatten(input: Record<string, unknown>, maxLen = 80): string[][] {
    const rows: string[][] = [];
    for (const [key, value] of Object.entries(input)) {
        if (key === 'transcript') continue;
        rows.push([`<color:"gray">${key}</color>`, fmt(value, maxLen)]);
    }
    return rows;
}

function fmt(value: unknown, maxLen: number): string {
    const s =
        value === null ? 'null'
            : value === undefined ? 'undefined'
                : typeof value === 'string' ? value
                    : typeof value === 'number' || typeof value === 'boolean' ? String(value)
                        : JSON.stringify(value);
    return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
}
