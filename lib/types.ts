export interface WeatherData {
  locationName: string;
  country: string;
  latitude: number;
  longitude: number;
  current: {
    temp: number;
    tempMax: number;
    tempMin: number;
    feelsLike: number;
    conditionText: string;
    conditionCode: number;
    humidity: number;
    windSpeed: number;
    chancesOfRain: number;
    uvIndex: number;
    pressure: number;
    isDay: number;
  };
  hourly: {
    time: string;
    displayTime: string;
    temp: number;
    rainChance: number;
    conditionCode: number;
    conditionText: string;
  }[];
  daily: {
    date: string;
    displayDay: string;
    tempMax: number;
    tempMin: number;
    conditionText: string;
    conditionCode: number;
    rainChance: number;
  }[];
  lastUpdated: string;
}

export interface AqiData {
  aqi: number;
  category: string;
  categoryColor: string;
  badgeBg: string;
  summary: string;
  pm25: number;
  pm10: number;
  co: number;
  so2: number;
  no2: number;
  o3: number;
  uvIndex: number;
  dust?: number;
  hourlyAqi: {
    time: string;
    displayTime: string;
    aqi: number;
    pm25: number;
  }[];
  lastUpdated: string;
}

export interface FishingZone {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  shorePoint: [number, number]; // Lat, Lng
  zoneP1: [number, number];
  zoneP2: [number, number];
  distances: {
    p1: string;
    p2: string;
    p3: string;
  };
  recommendation: string;
  timing: string;
  seaSurfaceTemp: number; // in °C
  waveHeight: number; // in meters
  currentSpeed: string; // e.g. "1.2 knots"
  chlorophyll: string; // e.g. "High (1.8 mg/m³)"
  fishDensity: string; // "High", "Moderate"
  statusBadge: string;
}

export interface HazardZone {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  hazardType: string;
  severity: 'Extreme' | 'High' | 'Moderate';
  polygon: [number, number][];
  shorePoint: [number, number];
  distances: {
    p1: string;
    p2: string;
    p3: string;
  };
  recommendation: string;
  warningNote: string;
  waveHeight: number;
  windSpeed: number;
  visibility: string;
  currentStrength: string;
  statusBadge: string;
}

export interface TideData {
  id: string;
  locationName: string;
  currentTide: {
    status: 'Rising' | 'Falling' | 'High Tide' | 'Low Tide';
    heightMeters: number;
    currentSpeedKnots: number;
    direction: string;
  };
  nextHighTide: {
    time: string;
    heightMeters: number;
  };
  nextLowTide: {
    time: string;
    heightMeters: number;
  };
  hourlyTide: {
    time: string;
    displayTime: string;
    height: number;
  }[];
  advisory: string;
  favorableDockingWindow: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  type: string;
  distance: string;
  frequency: string;
  phone: string;
  status: '24/7 Active' | 'Standby';
}

export interface MarineData {
  waveHeight: number;
  swellWaveHeight: number;
  seaSurfaceTemp: number;
  waveDirection?: number;
  wavePeriod?: number;
  isRealTime: boolean;
  lastUpdated?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

