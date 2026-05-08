export const moodOptions = [
  { value: 'Relax', label: 'Relax', description: 'Low energy, comfort, calm beaches' },
  { value: 'Adventure', label: 'Adventure', description: 'Active landscapes, hiking, exploration' },
  { value: 'Culture', label: 'Culture', description: 'Museums, history, local craft' },
  { value: 'Food', label: 'Food', description: 'Local cuisine, markets, tastings' },
  { value: 'Nature', label: 'Nature', description: 'Parks, hikes, green escapes' },
  { value: 'Nightlife', label: 'Nightlife', description: 'Bars, music, late-evening energy' },
];

export const durationOptions = [
  { value: 'A few hours', label: 'A few hours', description: 'Short local escape with 3–5 highlights' },
  { value: '1 Day', label: '1 Day', description: 'A full day itinerary with punctual stops' },
  { value: '2–3 Days', label: '2–3 Days', description: 'A weekend-style trip with leisure time' },
  { value: '1 Week+', label: '1 Week+', description: 'A longer trip with deeper exploration' },
];

export const radiusOptions = [
  { value: '< 50 km', label: '< 50 km', description: 'Nearby escape' },
  { value: '50–150 km', label: '50–150 km', description: 'Day trip range' },
  { value: '150–300 km', label: '150–300 km', description: 'Regional weekend' },
  { value: '300–500 km', label: '300–500 km', description: 'Extended travel radius' },
  { value: 'Anywhere', label: 'Anywhere', description: 'No distance limit' },
];

export const budgetOptions = ['Economy', 'Budget', 'Mid-Range', 'Premium', 'Luxury'];
export const transportModes = ['On Foot', 'Car', 'Public Transport', 'Train', 'Flight'];

export const destinationLibrary = [
  { name: 'Lisbon', mood: 'Relax', coords: [38.7223, -9.1393], subtitle: 'A warm coastal city with mellow charm.' },
  { name: 'Lake Como', mood: 'Relax', coords: [45.9979, 9.2572], subtitle: 'A quiet waterside escape with scenic villas.' },
  { name: 'Interlaken', mood: 'Adventure', coords: [46.6863, 7.8632], subtitle: 'Mountain trails, canyon swings, and adrenaline.' },
  { name: 'Reykjavik', mood: 'Adventure', coords: [64.1265, -21.8174], subtitle: 'Volcanoes, waterfalls, and midnight adventures.' },
  { name: 'Kyoto', mood: 'Culture', coords: [35.0116, 135.7681], subtitle: 'Temples, tea houses, and heritage walks.' },
  { name: 'Istanbul', mood: 'Food', coords: [41.0082, 28.9784], subtitle: 'Markets, street food, and rich flavour scenes.' },
  { name: 'Rome', mood: 'Culture', coords: [41.9028, 12.4964], subtitle: 'Ancient history with modern cafés nearby.' },
  { name: 'Naples', mood: 'Food', coords: [40.8518, 14.2681], subtitle: 'Pizza origins, seaside dining, and lively markets.' },
  { name: 'Vancouver', mood: 'Nature', coords: [49.2827, -123.1207], subtitle: 'Parks, coastal trails, and forest views.' },
  { name: 'Mallorca', mood: 'Nature', coords: [39.6953, 3.0176], subtitle: 'Island bays, olive groves, and quiet villages.' },
  { name: 'Berlin', mood: 'Nightlife', coords: [52.52, 13.405], subtitle: 'Late nights, underground bars, and creative energy.' },
  { name: 'Barcelona', mood: 'Nightlife', coords: [41.3851, 2.1734], subtitle: 'Cocktails, live music, and seaside sunset bars.' },
];

export const defaultWizardState = {
  mood: [],
  duration: '',
  radius: '',
  budget: 'Mid-Range',
  adults: 2,
  children: 0,
  transport: ['Car'],
  location: { label: 'Your location', coords: null },
};
