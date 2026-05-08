export async function fetchLocationAutocomplete(query) {
  if (!query) return [];
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6`);
    return response.ok ? await response.json() : [];
  } catch (error) {
    return [];
  }
}

export async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
    if (!response.ok) return null;
    const json = await response.json();
    return json.address?.city || json.address?.town || json.address?.village || json.address?.county || 'Current location';
  } catch {
    return null;
  }
}
