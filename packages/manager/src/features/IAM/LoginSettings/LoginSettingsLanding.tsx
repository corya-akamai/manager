import { Spacing } from '@akamai/cds-tokens';
import {
  useGetIdpConfigsQuery,
  useGetTfaEnforcementAccountSettingsQuery,
} from '@linode/queries';
import * as React from 'react';

import { useIsIAMTfaEnforcementEnabled } from '../hooks/useIsIAMTfaEnforcementEnabled';
import { Box } from '../Shared/Box/Box';
import { CircleProgress } from '../Shared/CircleProgress/CircleProgress';
import { SSOSection } from './SSOSection';
import { TFASection } from './TFASection';

export const LoginSettingsLanding = () => {
  const { isIAMTfaEnforcementEnabled } = useIsIAMTfaEnforcementEnabled();

  const {
    data: idpConfigs,
    error: ssoError,
    isLoading: isSSOLoading,
  } = useGetIdpConfigsQuery();

  const {
    data: tfaSettings,
    error: tfaError,
    isLoading: isTFALoading,
  } = useGetTfaEnforcementAccountSettingsQuery(isIAMTfaEnforcementEnabled);

  if (isSSOLoading || (isIAMTfaEnforcementEnabled && isTFALoading)) {
    return <CircleProgress />;
  }

  return (
    <Box direction="column" style={{ gap: Spacing.S16 }}>
      {isIAMTfaEnforcementEnabled && (
        <TFASection error={tfaError} tfaSettings={tfaSettings} />
      )}
      <SSOSection error={ssoError} idpConfigs={idpConfigs} />
    </Box>
  );
};
