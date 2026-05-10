const PLACEHOLDER_IMAGE = '/destination-placeholder.svg';

export function buildDestinationImageUrl(destinationName, country = '') {
  const label = [destinationName, country, 'travel'].filter(Boolean).join(', ');
  if (!label) return PLACEHOLDER_IMAGE;

  return `https://source.unsplash.com/featured/1600x900/?${encodeURIComponent(label)}`;
}

export function getDestinationFallbackImage() {
  return PLACEHOLDER_IMAGE;
}

