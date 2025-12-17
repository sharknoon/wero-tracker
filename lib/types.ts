export type SupportStatus = "supported" | "announced" | "none";

export interface SourceLink {
  label: string;
  url: string;
}

export interface FeatureSupport {
  status: SupportStatus;
  sources?: SourceLink[];
  notes?: string;
}

export interface AppAvailability {
  weroApp: FeatureSupport;
  bankingApp: FeatureSupport;
}

export interface Bank {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  overallStatus: SupportStatus;
  statusSources?: SourceLink[];
  features: {
    p2p: FeatureSupport;
    onlinePayments: FeatureSupport;
    localPayments: FeatureSupport;
  };
  appAvailability: AppAvailability;
  lastUpdated: string;
}

export interface Country {
  code: string;
  name: string;
  banks: Bank[];
}

export interface WeroData {
  lastUpdated: string;
  dataSource: string;
  countries: Country[];
}
