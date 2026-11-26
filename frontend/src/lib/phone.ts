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

export function validateAndFormatPhone(rawInput: string, locale: "ar" | "fr" | "en" = "ar"): PhoneValidationResult {
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

  // 2. Morocco: 05/06/07, also +212, 00212, 212. Stored as 0XXXXXXXXX.
  const maMatch = cleaned.match(/^(?:\+?212|00212|0)?([567][0-9]{8})$/);
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
      locale === "fr"
        ? "Entrez un numéro marocain valide, comme 06 12 34 56 78"
        : locale === "en"
          ? "Enter a valid Moroccan number, like 06 12 34 56 78"
          : mode === "KSA"
            ? "يرجى إدخال رقم جوال سعودي صحيح (مثال: 0512345678)"
            : "دخّل رقم مغربي صحيح، بحال 06 12 34 56 78",
  };
}

export function phonePlaceholder(locale: "ar" | "fr" | "en" = "ar"): string {
  const mode = process.env.NEXT_PUBLIC_PHONE_VALIDATION_MODE || "MA";
  if (locale === "fr") return mode === "KSA" ? "05XXXXXXXX" : "06 12 34 56 78";
  if (locale === "en") return mode === "KSA" ? "05XXXXXXXX" : "06 12 34 56 78";
  if (mode === "KSA") return "05XXXXXXXX";
  return "06 12 34 56 78";
}
