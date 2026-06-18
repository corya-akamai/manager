import React from 'react';
import { useSelector } from 'react-redux';

import { IAMFlagOverridesProvider } from 'src/features/IAM/hooks/useFlags';

import type { IAMFlagSet } from 'src/features/IAM/hooks/useFlags';
import type { ApplicationState } from 'src/store';

const selectIAMMockFlags = (state: ApplicationState): IAMFlagSet => {
  const { iam, iamFederation, iamNewBadge } = state.mockFeatureFlags;

  return {
    ...(iam !== undefined && { iam }),
    ...(iamFederation !== undefined && { iamFederation }),
    ...(iamNewBadge !== undefined && { iamNewBadge }),
  };
};

/** Cloud Manager only — wires Dev Tools mock flags into IAM. Not part of distributed IAM. */
export const IAMFlagOverridesBridge = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mockFlags = useSelector(selectIAMMockFlags);

  return (
    <IAMFlagOverridesProvider value={mockFlags}>
      {children}
    </IAMFlagOverridesProvider>
  );
};
