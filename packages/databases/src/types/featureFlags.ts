interface BaseFeatureFlag {
  enabled: boolean;
}

interface BetaFeatureFlag extends BaseFeatureFlag {
  beta: boolean;
}

export interface Flags {
  databaseAdvancedConfig: boolean;
  databaseBeta: boolean;
  databasePremium: boolean;
  databaseResize: boolean;
  databaseRestrictPlanResize: boolean;
  databases: boolean;
  databaseVpc: boolean;
  dbaasV2: BetaFeatureFlag;
  dbaasV2MonitorMetrics: BetaFeatureFlag;
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;
