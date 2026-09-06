export interface CoastalCity {
  name: string;
  lat: number;
  lng: number;
  state: string;
  isMajorPort?: boolean;
}

export interface CoastalState {
  state: string;
  code: string;
  cities: CoastalCity[];
}

export const COASTAL_INDIA: CoastalState[] = [
  {
    state: 'Gujarat',
    code: 'GJ',
    cities: [
      { name: 'Porbandar', lat: 21.6417, lng: 69.6293, state: 'Gujarat', isMajorPort: true },
      { name: 'Veraval', lat: 20.9000, lng: 70.3667, state: 'Gujarat', isMajorPort: true },
      { name: 'Dwarka', lat: 22.2442, lng: 68.9685, state: 'Gujarat', isMajorPort: true },
      { name: 'Okha', lat: 22.4635, lng: 69.0716, state: 'Gujarat', isMajorPort: true },
      { name: 'Mandvi (Kutch)', lat: 22.8333, lng: 69.3500, state: 'Gujarat' },
      { name: 'Jakhau', lat: 23.2389, lng: 68.7061, state: 'Gujarat' },
      { name: 'Mundra', lat: 22.8386, lng: 69.7214, state: 'Gujarat', isMajorPort: true },
      { name: 'Kandla', lat: 23.0033, lng: 70.2183, state: 'Gujarat', isMajorPort: true },
      { name: 'Mangrol', lat: 21.1219, lng: 70.1172, state: 'Gujarat' },
      { name: 'Diu', lat: 20.7144, lng: 70.9874, state: 'Gujarat' },
    ],
  },
  {
    state: 'Maharashtra',
    code: 'MH',
    cities: [
      { name: 'Mumbai', lat: 18.9220, lng: 72.8347, state: 'Maharashtra', isMajorPort: true },
      { name: 'Ratnagiri', lat: 16.9902, lng: 73.3120, state: 'Maharashtra' },
      { name: 'Alibaug', lat: 18.6414, lng: 72.8722, state: 'Maharashtra' },
      { name: 'Sindhudurg', lat: 16.0594, lng: 73.4686, state: 'Maharashtra' },
    ],
  },
  {
    state: 'Goa',
    code: 'GA',
    cities: [
      { name: 'Panaji', lat: 15.4909, lng: 73.8278, state: 'Goa', isMajorPort: true },
      { name: 'Vasco da Gama', lat: 15.3982, lng: 73.8113, state: 'Goa', isMajorPort: true },
    ],
  },
  {
    state: 'Karnataka',
    code: 'KA',
    cities: [
      { name: 'Mangaluru', lat: 12.9141, lng: 74.8560, state: 'Karnataka', isMajorPort: true },
      { name: 'Karwar', lat: 14.8136, lng: 74.1298, state: 'Karnataka', isMajorPort: true },
      { name: 'Udupi', lat: 13.3409, lng: 74.7421, state: 'Karnataka' },
    ],
  },
  {
    state: 'Kerala',
    code: 'KL',
    cities: [
      { name: 'Kochi', lat: 9.9312, lng: 76.2673, state: 'Kerala', isMajorPort: true },
      { name: 'Kollam', lat: 8.8932, lng: 76.6141, state: 'Kerala' },
      { name: 'Kannur', lat: 11.8745, lng: 75.3704, state: 'Kerala' },
      { name: 'Alappuzha', lat: 9.4981, lng: 76.3388, state: 'Kerala' },
      { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, state: 'Kerala', isMajorPort: true },
    ],
  },
  {
    state: 'Tamil Nadu',
    code: 'TN',
    cities: [
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', isMajorPort: true },
      { name: 'Tuticorin', lat: 8.7642, lng: 78.1348, state: 'Tamil Nadu', isMajorPort: true },
      { name: 'Rameswaram', lat: 9.2876, lng: 79.3129, state: 'Tamil Nadu' },
      { name: 'Nagapattinam', lat: 10.7672, lng: 79.8436, state: 'Tamil Nadu' },
    ],
  },
  {
    state: 'Andhra Pradesh',
    code: 'AP',
    cities: [
      { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh', isMajorPort: true },
      { name: 'Kakinada', lat: 16.9891, lng: 82.2475, state: 'Andhra Pradesh', isMajorPort: true },
      { name: 'Nellore', lat: 14.4426, lng: 79.9865, state: 'Andhra Pradesh' },
    ],
  },
  {
    state: 'Odisha',
    code: 'OD',
    cities: [
      { name: 'Puri', lat: 19.8135, lng: 85.8312, state: 'Odisha' },
      { name: 'Paradip', lat: 20.3164, lng: 86.6114, state: 'Odisha', isMajorPort: true },
      { name: 'Gopalpur', lat: 19.2606, lng: 84.9080, state: 'Odisha' },
    ],
  },
  {
    state: 'West Bengal',
    code: 'WB',
    cities: [
      { name: 'Digha', lat: 21.6266, lng: 87.5074, state: 'West Bengal' },
      { name: 'Sundarbans coastal area', lat: 21.8753, lng: 88.1869, state: 'West Bengal' },
      { name: 'Kolkata (Diamond Harbour)', lat: 22.1966, lng: 88.1887, state: 'West Bengal', isMajorPort: true },
    ],
  },
  {
    state: 'Puducherry',
    code: 'PY',
    cities: [
      { name: 'Puducherry town', lat: 11.9416, lng: 79.8083, state: 'Puducherry', isMajorPort: true },
    ],
  },
  {
    state: 'Daman & Diu',
    code: 'DD',
    cities: [
      { name: 'Daman', lat: 20.3974, lng: 72.8328, state: 'Daman & Diu' },
    ],
  },
  {
    state: 'Lakshadweep',
    code: 'LD',
    cities: [
      { name: 'Kavaratti', lat: 10.5669, lng: 72.6420, state: 'Lakshadweep', isMajorPort: true },
    ],
  },
  {
    state: 'Andaman & Nicobar',
    code: 'AN',
    cities: [
      { name: 'Port Blair', lat: 11.6234, lng: 92.7265, state: 'Andaman & Nicobar', isMajorPort: true },
    ],
  },
];

/**
 * Returns a flat list of all coastal cities in the dataset
 */
export function getAllCoastalCities(): CoastalCity[] {
  return COASTAL_INDIA.flatMap((s) => s.cities);
}

/**
 * Find city by name (case-insensitive substring or exact match)
 */
export function findCoastalCity(name: string): CoastalCity | undefined {
  const norm = name.toLowerCase().trim();
  const all = getAllCoastalCities();
  return (
    all.find((c) => c.name.toLowerCase() === norm) ||
    all.find((c) => norm.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(norm))
  );
}

/**
 * Find the nearest coastal city to the provided coordinates using Haversine calculation
 */
export function findNearestCoastalCity(lat: number, lng: number): { city: CoastalCity; distanceKm: number } {
  const all = getAllCoastalCities();
  let minDistance = Infinity;
  let nearest = all[0];

  for (const c of all) {
    const d = calculateHaversineKm(lat, lng, c.lat, c.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = c;
    }
  }

  return { city: nearest, distanceKm: Math.round(minDistance * 10) / 10 };
}

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
