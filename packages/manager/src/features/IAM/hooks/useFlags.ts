import {
  FeatureFlagClient,
  launchDarklyProvider,
} from '@akamai/compute-ui-core/feature-flags';
import { useEffect, useState } from 'react';

import { LAUNCH_DARKLY_API_KEY } from '../Shared/constants';

export interface IAMFlags {
  iam: {
    beta: boolean;
    enabled: boolean;
  };
  iamFederation: {
    enabled: boolean;
  };
  iamNewBadge: boolean;
}

export type IAMFlagSet = Partial<IAMFlags>;

export const client = new FeatureFlagClient<IAMFlags>({
  provider: launchDarklyProvider({
    clientId: LAUNCH_DARKLY_API_KEY,
  }),
});

export function useFlags(): IAMFlagSet {
  const [flags, setFlags] = useState(client.getFlags());

  useEffect(() => {
    client.start();

    return client.subscribe((flags) => {
      setFlags(flags);
    });
  }, []);

  return flags;
}
