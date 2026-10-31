export type PhoneValidationResult = {
  isValid: boolean;
  country: "SA" | "MA" | null;
  e164WithPlus: string; // TikTok Pixel + TikTok CAPI: "+966512345678" / "+212612345678"
  digitsOnlyNoPlus: string; // Meta CAPI + Snapchat CAPI: "966512345678" / "212612345678"
  localDisplay: string; // "0512345678" / "0612345678"
  errorMessage?: string;
};

// Converts Arabic/Persian numerals (٠١٢٣٤٥٦٧٨٩) to Western numerals (0123456789) and strips separators
export function normalizeDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[\s\-().]/g, "");
}

export function validateAndFormatPhone(rawInput: string): PhoneValidationResult {
  const mode = process.env.NEXT_PUBLIC_PHONE_VALIDATION_MODE || "MA"; // 'KSA' | 'MA' | 'BOTH'
  const cleaned = normalizeDigits(rawInput.trim());

  // 1. KSA: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX, 009665XXXXXXXX, 9665XXXXXXXX
  const ksaMatch = cleaned.match(/^(?:\+?966|00966|0)?(5[0-9]{8})$/);
  if (ksaMatch && (mode === "KSA" || mode === "BOTH")) {
    const subscriber = ksaMatch[1];
    return {
      isValid: true,
      country: "SA",
      e164WithPlus: `+966${subscriber}`,
      digitsOnlyNoPlus: `966${subscriber}`,
      localDisplay: `0${subscriber}`,
    };
  }

  // 2. Morocco: 06XXXXXXXX, 07XXXXXXXX, +2126XXXXXXXX, 002126XXXXXXXX, 2126XXXXXXXX
  const maMatch = cleaned.match(/^(?:\+?212|00212|0)?([67][0-9]{8})$/);
  if (maMatch && (mode === "MA" || mode === "BOTH")) {
    const subscriber = maMatch[1];
    return {
      isValid: true,
      country: "MA",
      e164WithPlus: `+212${subscriber}`,
      digitsOnlyNoPlus: `212${subscriber}`,
      localDisplay: `0${subscriber}`,
    };
  }

  return {
    isValid: false,
    country: null,
    e164WithPlus: "",
    digitsOnlyNoPlus: "",
    localDisplay: cleaned,
    errorMessage:
      mode === "KSA"
        ? "يرجى إدخال رقم جوال سعودي صحيح (مثال: 0512345678)"
        : mode === "MA"
          ? "دخل رقم مغربي صحيح (مثال: 0612345678 أو 0712345678)"
          : "يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام (مثال: 0612345678 أو 0512345678)",
  };
}

export function phonePlaceholder(): string {
  const mode = process.env.NEXT_PUBLIC_PHONE_VALIDATION_MODE || "MA";
  if (mode === "KSA") return "05XXXXXXXX";
  if (mode === "MA") return "06XXXXXXXX أو 07XXXXXXXX";
  return "06XXXXXXXX أو 07XXXXXXXX";
}
