// @ts-check
/* Små tilstandsløse hjelpere uten app-avhengigheter. */

export function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $all(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emptyState(text = "Legg inn en økt eller plan, så dukker den opp her.") {
  return `<div class="empty-state"><p class="eyebrow">Tomt foreløpig</p><p>${escapeHtml(text)}</p></div>`;
}
export function readableAge(value) {
  return {
    fersk: "Ferskt",
    "6-12": "6-12 timer",
    "12-24": "12-24 timer",
    "24+": "Over ett døgn",
  }[value] || value;
}

export function readableTerrain(value) {
  return {
    skog: "Skog/vegetasjon",
    vei: "Vei/sti",
    hardt: "Hardt underlag",
    blandet: "Blandet",
  }[value] || value;
}
export function readableExperience(value) {
  return {
    start: "Startfase",
    trygg: "Trygg på grunnspor",
    videre: "Viderekommen",
  }[value] || "";
}

export function readableIntensity(value) {
  return {
    rolig: "Rolig/metodisk",
    balansert: "Balansert",
    hoy: "Høy intensitet",
  }[value] || "";
}
export function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// Lokal dato (ikke UTC): toISOString/valueAsDate ville gitt gårsdagens dato
// mellom midnatt og kl. 01/02 norsk tid.
export function localIsoDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export function highlight(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escapedQuery})`, "gi"), "<mark>$1</mark>");
}
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
