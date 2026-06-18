import {
  FeatureFlagClient,
  launchDarklyProvider,
} from '@akamai/compute-ui-core/feature-flags';
import React, { useEffect, useState } from 'react';

import { LAUNCH_DARKLY_API_KEY } from '../Shared/constants';

export interface IAMFlags {
  iam: {
    beta?: boolean;
    enabled: boolean;
  };
  iamFederation: {
    enabled: boolean;
  };
  iamNewBadge: boolean;
}

export type IAMFlagSet = Partial<IAMFlags>;

const IAMFlagOverridesContext = React.createContext<IAMFlagSet>({});

/** Optional host overrides (e.g. Cloud Manager Dev Tools). Defaults to none. */
export const IAMFlagOverridesProvider = IAMFlagOverridesContext.Provider;

export const client = new FeatureFlagClient<IAMFlags>({
  provider: launchDarklyProvider({
    clientId: LAUNCH_DARKLY_API_KEY,
  }),
});

export function useFlags(): IAMFlagSet {
  const overrides = React.useContext(IAMFlagOverridesContext);
  const [flags, setFlags] = useState(client.getFlags());

  useEffect(() => {
    client.start();

    return client.subscribe((flags) => {
      setFlags(flags);
    });
  }, []);

  return { ...flags, ...overrides };
}
