import { FishingZone, HazardZone, TideData, EmergencyContact } from './types';
import { findCoastalCity } from './coastalIndia';

// Pre-crafted primary ports for authentic fidelity
const PRIMARY_FISHING_ZONES: Record<string, FishingZone> = {
  porbandar: {
    id: 'porbandar',
    name: 'Porbandar Coast',
    state: 'Gujarat',
    lat: 21.6417,
    lng: 69.6293,
    shorePoint: [21.6417, 69.6293],
    zoneP1: [21.5200, 69.4800],
    zoneP2: [21.4300, 69.3900],
    distances: {
      p1: 'Porbandar Light Anchor Point',
      p2: '14.2 km SW (Thermal Front Boundary)',
      p3: '22.8 km WSW (Pelagic Upwelling Core)',
    },
    recommendation: 'Surface chlorophyll thermal front detected 14–22 km offshore. Favorable aggregation for mackerel and ribbonfish shoals.',
    timing: '05:30 AM – 11:00 AM',
    seaSurfaceTemp: 28.4,
    waveHeight: 1.2,
    currentSpeed: '1.4 knots',
    chlorophyll: 'High (1.8 mg/m³)',
    fishDensity: 'High (Pelagic Shoal)',
    statusBadge: 'Optimal PFZ Window',
  },
  veraval: {
    id: 'veraval',
    name: 'Veraval Coast',
    state: 'Gujarat',
    lat: 20.9000,
    lng: 70.3667,
    shorePoint: [20.9000, 70.3667],
    zoneP1: [20.7600, 70.2400],
    zoneP2: [20.6700, 70.3200],
    distances: {
      p1: 'Veraval Breakwater Mark',
      p2: '18.5 km SSW (SST Gradient Edge)',
      p3: '26.1 km S (Chlorophyll Convergence)',
    },
    recommendation: 'Strong sea surface temperature drop zone. Dense school of cephalopods and pelagic tuna detected along continental slope margin.',
    timing: '06:00 AM – 12:30 PM',
    seaSurfaceTemp: 27.8,
    waveHeight: 1.5,
    currentSpeed: '1.8 knots',
    chlorophyll: 'Very High (2.4 mg/m³)',
    fishDensity: 'Very High (Squid & Ribbonfish)',
    statusBadge: 'High Yield PFZ',
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai Offshore Basin',
    state: 'Maharashtra',
    lat: 18.9220,
    lng: 72.8347,
    shorePoint: [18.9220, 72.8347],
    zoneP1: [18.8200, 72.6100],
    zoneP2: [18.7100, 72.5200],
    distances: {
      p1: 'Colaba Point Anchorage',
      p2: '23.5 km WSW (Bombay High Shelf Break)',
      p3: '36.2 km WSW (Deep Pelagic Upwelling)',
    },
    recommendation: 'Continental shelf thermocline boundary active. Abundant shoals of Bombay duck, croakers, and seer fish detected.',
    timing: '05:00 AM – 11:30 AM',
    seaSurfaceTemp: 28.9,
    waveHeight: 1.3,
    currentSpeed: '1.5 knots',
    chlorophyll: 'High (1.9 mg/m³)',
    fishDensity: 'High (Bombay Duck & Seerfish)',
    statusBadge: 'Active Shelf PFZ',
  },
  kochi: {
    id: 'kochi',
    name: 'Kochi Malabar Coast',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    shorePoint: [9.9312, 76.2673],
    zoneP1: [9.8500, 76.0800],
    zoneP2: [9.7200, 76.0100],
    distances: {
      p1: 'Fort Kochi Fairway Buoy',
      p2: '19.4 km WSW (Chakara Mudbank Edge)',
      p3: '29.8 km SW (Upwelling Core Vector)',
    },
    recommendation: 'Chakara nutrient enrichment plumes detected. Heavy aggregations of oil sardine and Indian mackerel within 18–30 km.',
    timing: '05:15 AM – 10:45 AM',
    seaSurfaceTemp: 28.2,
    waveHeight: 1.1,
    currentSpeed: '1.2 knots',
    chlorophyll: 'Extreme (3.2 mg/m³)',
    fishDensity: 'Very High (Oil Sardine & Mackerel)',
    statusBadge: 'Prime Harvest Zone',
  },
  chennai: {
    id: 'chennai',
    name: 'Chennai Coromandel Coast',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    shorePoint: [13.0827, 80.2707],
    zoneP1: [13.1400, 80.4800],
    zoneP2: [13.0200, 80.5900],
    distances: {
      p1: 'Chennai Harbor North Breakwater',
      p2: '21.0 km ENE (Bay of Bengal Thermal Boundary)',
      p3: '34.5 km E (Deep Water Pelagic Corridor)',
    },
    recommendation: 'Offshore thermal front in the Bay of Bengal shows consistent convergence. Favorable trolling grounds for skipjack tuna and barracuda.',
    timing: '04:45 AM – 10:15 AM',
    seaSurfaceTemp: 29.3,
    waveHeight: 1.4,
    currentSpeed: '1.6 knots',
    chlorophyll: 'Moderate (1.5 mg/m³)',
    fishDensity: 'High (Tuna & Barracuda)',
    statusBadge: 'Optimal PFZ Window',
  },
  visakhapatnam: {
    id: 'visakhapatnam',
    name: 'Visakhapatnam Canyon Sector',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
    shorePoint: [17.6868, 83.2185],
    zoneP1: [17.6200, 83.4200],
    zoneP2: [17.5100, 83.5500],
    distances: {
      p1: 'Dolphin Nose Lighthouse Anchor',
      p2: '22.0 km ESE (Submarine Canyon Shelf)',
      p3: '38.0 km SE (Deep Eddy Convergence)',
    },
    recommendation: 'Submarine canyon upwelling current provides rich nutrient concentration. Exceptional grounds for yellowfin tuna and ribbonfish.',
    timing: '05:00 AM – 11:00 AM',
    seaSurfaceTemp: 28.7,
    waveHeight: 1.3,
    currentSpeed: '1.3 knots',
    chlorophyll: 'High (2.1 mg/m³)',
    fishDensity: 'High (Yellowfin Tuna & Ribbonfish)',
    statusBadge: 'Deep Canyon PFZ',
  },
  paradip: {
    id: 'paradip',
    name: 'Paradip Coastal Sector',
    state: 'Odisha',
    lat: 20.3164,
    lng: 86.6114,
    shorePoint: [20.3164, 86.6114],
    zoneP1: [20.2100, 86.8200],
    zoneP2: [20.1000, 86.9500],
    distances: {
      p1: 'Paradip South Breakwater',
      p2: '24.0 km ESE (Mahanadi River Plume Front)',
      p3: '37.5 km SE (Continental Margin Shoals)',
    },
    recommendation: 'Mahanadi estuarine nutrient plumes drifting south-east. Heavy concentration of pomfret, hilsa, and tiger prawns.',
    timing: '05:30 AM – 11:15 AM',
    seaSurfaceTemp: 27.9,
    waveHeight: 1.4,
    currentSpeed: '1.7 knots',
    chlorophyll: 'Very High (2.7 mg/m³)',
    fishDensity: 'Very High (Hilsa & Pomfret)',
    statusBadge: 'High Yield Estuarine PFZ',
  },
  digha: {
    id: 'digha',
    name: 'Digha / Sundarbans Coast',
    state: 'West Bengal',
    lat: 21.6266,
    lng: 87.5074,
    shorePoint: [21.6266, 87.5074],
    zoneP1: [21.4800, 87.6800],
    zoneP2: [21.3600, 87.8200],
    distances: {
      p1: 'Digha Mohana Fishery Wharf',
      p2: '21.5 km SE (Deltaic Plume Front)',
      p3: '35.0 km SE (Bay Apex Feeding Shelf)',
    },
    recommendation: 'Sundarbans brackish-marine confluence front active. Unrivaled seasonal concentration of silver pomfret and migratory hilsa.',
    timing: '05:00 AM – 10:30 AM',
    seaSurfaceTemp: 28.5,
    waveHeight: 1.2,
    currentSpeed: '1.5 knots',
    chlorophyll: 'Extreme (3.4 mg/m³)',
    fishDensity: 'Very High (Hilsa & Bhetki)',
    statusBadge: 'Prime Harvest Window',
  },
};

/**
 * Determines whether the coastline is on India's West coast, East coast, or South tip
 */
function getCoastlineOrientation(state: string, lng: number): 'west' | 'east' | 'south' {
  const westStates = ['Gujarat', 'Maharashtra', 'Goa', 'Karnataka', 'Daman & Diu', 'Lakshadweep'];
  if (westStates.includes(state)) return 'west';
  if (state === 'Kerala') return lng < 77.0 ? 'west' : 'south';
  return 'east';
}

/**
 * Dynamically computes fishing zone geometry and metadata for any coastal city
 */
export function getFishingZoneForCity(city: string, state: string, lat: number, lng: number): FishingZone {
  const norm = city.toLowerCase().replace(/[^a-z]/g, '');
  if (PRIMARY_FISHING_ZONES[norm]) {
    return PRIMARY_FISHING_ZONES[norm];
  }

  const orientation = getCoastlineOrientation(state, lng);
  const latSign = orientation === 'south' ? -1 : -0.7;
  const lngSign = orientation === 'west' ? -1 : orientation === 'east' ? 1 : 0.2;

  const zoneP1: [number, number] = [
    Math.round((lat + latSign * 0.14) * 10000) / 10000,
    Math.round((lng + lngSign * 0.18) * 10000) / 10000,
  ];

  const zoneP2: [number, number] = [
    Math.round((lat + latSign * 0.26) * 10000) / 10000,
    Math.round((lng + lngSign * 0.32) * 10000) / 10000,
  ];

  const seed = (Math.abs(lat) * 13 + Math.abs(lng) * 19) % 1;
  const sst = Math.round((27.5 + seed * 2.2) * 10) / 10;
  const wave = Math.round((1.0 + seed * 0.8) * 10) / 10;
  const drift = (1.2 + seed * 0.6).toFixed(1);

  return {
    id: norm,
    name: `${city} Coastal Sector`,
    state,
    lat,
    lng,
    shorePoint: [lat, lng],
    zoneP1,
    zoneP2,
    distances: {
      p1: `${city} Baseline Anchor Point`,
      p2: `16.4 km ${orientation === 'west' ? 'SW' : orientation === 'east' ? 'SE' : 'S'} (Thermal Gradient)`,
      p3: `28.2 km ${orientation === 'west' ? 'WSW' : orientation === 'east' ? 'ESE' : 'SSW'} (Pelagic Shoal Core)`,
    },
    recommendation: `Satellite chlorophyll & thermal front active 16–28 km offshore ${city}. Favorable schooling detected for coastal pelagic species.`,
    timing: '05:30 AM – 11:30 AM',
    seaSurfaceTemp: sst,
    waveHeight: wave,
    currentSpeed: `${drift} knots`,
    chlorophyll: seed > 0.5 ? 'High (2.0 mg/m³)' : 'Moderate (1.6 mg/m³)',
    fishDensity: seed > 0.6 ? 'High (Pelagic Shoals)' : 'Moderate (Coastal Finfish)',
    statusBadge: seed > 0.4 ? 'Optimal PFZ Window' : 'Active PFZ Zone',
  };
}

/**
 * Dynamically computes maritime hazard zone polygon & severity for any coastal city
 */
export function getHazardZoneForCity(city: string, state: string, lat: number, lng: number): HazardZone {
  const norm = city.toLowerCase().replace(/[^a-z]/g, '');
  const orientation = getCoastlineOrientation(state, lng);
  const latSign = orientation === 'south' ? -1 : -0.6;
  const lngSign = orientation === 'west' ? -1 : orientation === 'east' ? 1 : 0.3;

  const polyP1: [number, number] = [
    Math.round((lat + latSign * 0.12) * 10000) / 10000,
    Math.round((lng + lngSign * 0.15) * 10000) / 10000,
  ];

  const polyP2: [number, number] = [
    Math.round((lat + latSign * 0.22) * 10000) / 10000,
    Math.round((lng + lngSign * 0.28) * 10000) / 10000,
  ];

  const polyP3: [number, number] = [
    Math.round((lat + latSign * 0.18) * 10000) / 10000,
    Math.round((lng + lngSign * 0.38) * 10000) / 10000,
  ];

  const seed = (Math.abs(lat) * 23 + Math.abs(lng) * 31) % 1;
  const waveHeight = Math.round((2.0 + seed * 1.1) * 10) / 10;
  const windSpeed = Math.round(24 + seed * 12);
  const currentKnots = (2.4 + seed * 1.2).toFixed(1);

  return {
    id: `${norm}-hazard`,
    name: `${city} Coastal Sector`,
    state,
    lat,
    lng,
    hazardType: seed > 0.5 ? 'Strong Undercurrent & Rip Swell' : 'Submerged Reefs & Heavy Breakers',
    severity: seed > 0.6 ? 'Extreme' : 'High',
    shorePoint: [lat, lng],
    polygon: [[lat, lng], polyP1, polyP2, polyP3],
    distances: {
      p1: `${city} Shoreline Anchor Point`,
      p2: `15.0 km ${orientation === 'west' ? 'SW' : 'SE'} (Rip Confluence Zone)`,
      p3: `29.5 km ${orientation === 'west' ? 'WSW' : 'ESE'} (Cross-Sea Swell Axis)`,
    },
    recommendation: `Avoid navigation near outer reef margin. Strong cross-sea swell and localized rip velocities (> ${currentKnots} kts) reported offshore.`,
    warningNote: `Subsurface bathymetric compression creates hazardous chop during ebb tide. Keel clearance must exceed 2.2m.`,
    waveHeight,
    windSpeed,
    visibility: `${(3.5 + seed * 2.0).toFixed(1)} km`,
    currentStrength: `${currentKnots} knots (High)`,
    statusBadge: seed > 0.5 ? 'High Risk Alert' : 'Navigational Danger',
  };
}

/**
 * Dynamically computes tide predictions, harmonic flow, and docking gates for any coastal city
 */
export function getTideDataForCity(city: string, state: string, lat: number, lng: number): TideData {
  const norm = city.toLowerCase().replace(/[^a-z]/g, '');
  const seed = (Math.abs(lat) * 17 + Math.abs(lng) * 29) % 1;

  const currentHeight = Math.round((1.8 + seed * 1.4) * 100) / 100;
  const highHeight = Math.round((3.2 + seed * 0.9) * 100) / 100;
  const lowHeight = Math.round((0.5 + seed * 0.4) * 100) / 100;
  const isRising = seed > 0.45;

  const hourlyTide = [
    { time: '14:00', displayTime: '2 PM', height: Math.round((1.8 + seed * 0.5) * 10) / 10 },
    { time: '15:00', displayTime: '3 PM', height: Math.round((2.2 + seed * 0.6) * 10) / 10 },
    { time: '16:00', displayTime: '4 PM', height: Math.round((2.7 + seed * 0.7) * 10) / 10 },
    { time: '17:00', displayTime: '5 PM', height: Math.round((3.2 + seed * 0.6) * 10) / 10 },
    { time: '18:00', displayTime: '6 PM', height: Math.round((3.5 + seed * 0.5) * 10) / 10 },
    { time: '19:00', displayTime: '7 PM', height: Math.round((3.1 + seed * 0.4) * 10) / 10 },
    { time: '20:00', displayTime: '8 PM', height: Math.round((2.4 + seed * 0.3) * 10) / 10 },
    { time: '21:00', displayTime: '9 PM', height: Math.round((1.7 + seed * 0.3) * 10) / 10 },
  ];

  return {
    id: norm,
    locationName: `${city} Coastal Anchorage`,
    currentTide: {
      status: isRising ? 'Rising' : 'Falling',
      heightMeters: currentHeight,
      currentSpeedKnots: Math.round((1.2 + seed * 0.9) * 10) / 10,
      direction: isRising ? 'ENE (Flood stream)' : 'WSW (Ebb stream)',
    },
    nextHighTide: {
      time: '05:45 PM',
      heightMeters: highHeight,
    },
    nextLowTide: {
      time: '11:30 PM',
      heightMeters: lowHeight,
    },
    hourlyTide,
    advisory: isRising
      ? `Flood tide in progress at ${city}. Basin mouth draft depth is optimal for commercial trawlers (> 2.4m).`
      : `Outgoing ebb stream in progress at ${city}. Exercise caution and maintain steerage speed at harbor breakwater.`,
    favorableDockingWindow: '04:30 PM – 07:15 PM',
  };
}

/**
 * Returns localized emergency rescue contacts based on state and city
 */
export function getEmergencyContactsForCity(city: string, state: string, lat: number, lng: number): EmergencyContact[] {
  // Indian Coast Guard regional MRCC centers mapped to Indian maritime zones
  let mrccName = 'Indian Coast Guard MRCC Mumbai';
  let mrccPhone = '1554 (Toll Free) / +91 22 24376133';
  let distNm = '8.4 NM';

  if (state === 'Gujarat') {
    mrccName = `Indian Coast Guard MRCC Porbandar / Vadinar`;
    mrccPhone = '1554 (Toll Free) / +91 286 2242190';
    distNm = '6.2 NM';
  } else if (state === 'Maharashtra' || state === 'Goa' || state === 'Daman & Diu') {
    mrccName = `Indian Coast Guard MRCC Mumbai / Goa`;
    mrccPhone = '1554 (Toll Free) / +91 22 24376133';
    distNm = '7.5 NM';
  } else if (state === 'Karnataka' || state === 'Kerala' || state === 'Lakshadweep') {
    mrccName = `Indian Coast Guard MRCC Kochi`;
    mrccPhone = '1554 (Toll Free) / +91 484 2210886';
    distNm = '8.1 NM';
  } else if (state === 'Tamil Nadu' || state === 'Puducherry') {
    mrccName = `Indian Coast Guard MRCC Chennai`;
    mrccPhone = '1554 (Toll Free) / +91 44 23460405';
    distNm = '6.8 NM';
  } else if (state === 'Andhra Pradesh' || state === 'Odisha') {
    mrccName = `Indian Coast Guard MRCC Visakhapatnam / Paradip`;
    mrccPhone = '1554 (Toll Free) / +91 891 2515053';
    distNm = '7.2 NM';
  } else if (state === 'West Bengal') {
    mrccName = `Indian Coast Guard MRCC Haldia / Kolkata`;
    mrccPhone = '1554 (Toll Free) / +91 3224 252288';
    distNm = '8.9 NM';
  } else if (state === 'Andaman & Nicobar') {
    mrccName = `Indian Coast Guard MRCC Port Blair`;
    mrccPhone = '1554 (Toll Free) / +91 3192 232230';
    distNm = '5.4 NM';
  }

  return [
    {
      id: 'icg-mrcc',
      name: mrccName,
      type: 'Maritime Search & Rescue Coordination',
      distance: distNm,
      frequency: 'VHF Ch 16 (156.8 MHz) / 2182 kHz',
      phone: mrccPhone,
      status: '24/7 Active',
    },
    {
      id: 'marine-police',
      name: `${city} Coastal Marine Police Station`,
      type: 'Coastal Law Enforcement & Patrol',
      distance: '3.8 NM',
      frequency: 'VHF Ch 68 / 1093 Emergency',
      phone: '1093 (Toll Free Coastal Helpline)',
      status: '24/7 Active',
    },
    {
      id: 'fisheries-control',
      name: `Department of Fisheries Harbor Control (${city})`,
      type: 'Vessel Traffic & Port Authority',
      distance: '2.1 NM',
      frequency: 'VHF Ch 12 (Harbor Operations)',
      phone: '+91 286 2242190',
      status: '24/7 Active',
    },
    {
      id: 'isro-sar',
      name: 'ISRO NavIC / INSAT Distress Alert Hub',
      type: 'Satellite Telemetry & Beacon Uplink',
      distance: 'Satellite Uplink (GEO-3)',
      frequency: '406.05 MHz EPIRB / DAT Beacon',
      phone: 'Automated Satellite Relay',
      status: '24/7 Active',
    },
  ];
}
