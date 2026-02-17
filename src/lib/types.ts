export type AdvisoryLevel = "LEVEL1" | "LEVEL2" | "LEVEL3" | "LEVEL4";
export type WaterSafety = "SAFE" | "VARIABLE" | "UNSAFE";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type Vaccine = {
  name: string;
  required: boolean;
  description: string;
};

export type EmergencyEmbassy = {
  country: string;
  address: string;
  phone: string;
  hours?: string;
  website?: string;
};

export type EmergencyPhrase = {
  english: string;
  local: string;
  pronunciation?: string;
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  startDate?: string; // ISO
  endDate?: string;   // ISO
};

export type Destination = {
  id: string;
  name: string; // slug for URL: "japan"
  code: string; // country code: "JP"
  region: string;

  safety: {
    advisoryLevel: AdvisoryLevel;
    advisorySummary: string;
    commonScams: string[];
    localLaws: string[];
    politicalStability: string;
  };

  health: {
    vaccines: Vaccine[];
    diseases: string[];
    waterSafety: WaterSafety;
    foodPrecautions: string[];
    personalizedTips: string[];
  };

  emergency: {
    police: string;
    ambulance: string;
    fire: string;
    embassies: EmergencyEmbassy[];
    phrases: EmergencyPhrase[];
  };

  cultural: {
    etiquette: string[];
    transportation: string[];
    money: string[];
    communication: string[];
  };

  alerts: Alert[];
};

export type Country = {
  code: string;        // ISO alpha-2 (e.g., "JP")
  code3?: string;      // ISO alpha-3 (optional)
  name: string;        // "Japan"
  officialName?: string;
  slug: string;        // "japan"
  continent: string;   // "Asia", "Europe", "North America", etc.
  region?: string;     // raw region from API (optional)
  subregion?: string;  // raw subregion (optional)
  aliases?: string[];
  featured?: boolean;
};

export type CountryBase = {
  code: string;
  name: string;
  slug?: string;
  continent?: string;
  officialName?: string;
  aliases?: string[];
};


export type RestCountryFacts = {
  name?: string;
  flagUrl?: string;
  currencies?: Array<{ code: string; name?: string; symbol?: string }>;
  languages?: string[];
  calling?: { root?: string; suffixes?: string[] };
  timezones?: string[];
  capital?: string[];
  latlng?: [number, number] | null;
  region?: string;
  subregion?: string;
};

export type UsAdvisory = {
  source: "us";
  level?: 1 | 2 | 3 | 4;
  levelText?: string;
  summary?: string;
  dateIssued?: string;
  dateUpdated?: string;
  officialUrl?: string;
};

export type EmergencyNumbers = {
  source: "override" | "postgres-cache" | "memory-cache" | "emergencynumberapi";
  disclaimer?: string;

  country?: {
    name?: string;
    isoCode?: string;
    isoNumeric?: string;
  };

  localOnly?: boolean;
  member112?: boolean;

  services: {
    police: string[];
    ambulance: string[];
    fire: string[];
    dispatch: string[];
  };

  // ✅ truth layer
  verified: boolean;
  verifiedSources: string[]; // e.g. ["India ERSS 112 (official)"]

  // metadata
  fetchedAt?: string;  // ISO
  expiresAt?: string;  // ISO
};



export type CountryProfile = {
  code: string;
  name: string;
  facts?: RestCountryFacts;
  advisory?: UsAdvisory;
  emergencyNumbers?: EmergencyNumbers;
};



