export function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === undefined) return base;
  if (Array.isArray(base) && Array.isArray(patch)) {
    const primitives = patch.every((item) => item === null || typeof item !== "object");
    if (primitives) return patch as T;
    const length = Math.max(base.length, patch.length);
    return Array.from({ length }, (_, i) => {
      if (patch[i] === undefined) return base[i];
      if (base[i] === undefined) return patch[i];
      return deepMerge(base[i], patch[i]);
    }) as T;
  }
  if (isRecord(base) && isRecord(patch)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(patch)) {
      out[key] = deepMerge(base[key], patch[key]);
    }
    return out as T;
  }
  return patch as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
