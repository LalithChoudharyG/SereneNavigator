type OverrideEntry = {
  services: Partial<{
    police: string[];
    ambulance: string[];
    fire: string[];
    dispatch: string[];
  }>;
  sources: string[]; // human-readable proof / reference
};

export const EMERGENCY_OVERRIDES: Record<string, OverrideEntry> = {
  IN: {
    services: {
      police: ["100"],
      fire: ["101"],
      ambulance: ["102", "108"],
      dispatch: ["112"],
    },
    sources: ["India ERSS 112 (official)", "Common national emergency numbers"],
  },

  CI: {
    services: {
      police: ["110", "111", "170"],
      fire: ["180"],
      ambulance: ["185"],
    },
    sources: ["Travel advisory help pages (verified)"],
  },
};
