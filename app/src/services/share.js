export function buildShareLink(itinerary) {
  const payload = btoa(JSON.stringify(itinerary));
  return `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(payload)}`;
}

export function parseShareLink(searchString) {
  const params = new URLSearchParams(searchString);
  const encoded = params.get('share');
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}
