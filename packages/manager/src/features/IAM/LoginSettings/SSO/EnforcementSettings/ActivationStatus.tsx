import { Icon, Switch, Tooltip } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { EnforcementSettingsFormValues } from './EnforcementSettings';

interface Props {
  isConfigInvalid: boolean;
}

export const ActivationStatus = ({ isConfigInvalid }: Props) => {
  const { control, setValue, watch } =
    useFormContext<EnforcementSettingsFormValues>();

  // Watch SSO enabled state to conditionally disable enforcement toggle and show tooltip
  const isSSOEnabled = watch('ssoEnabled');

  const { data: permissions } = usePermissions('account', [
    'update_idp_config',
  ]);

  return (
    <div>
      <h2
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
          font: Typography.Heading.S,
        }}
      >
        Activation Status
      </h2>
      <Controller
        control={control}
        name="ssoEnabled"
        render={({ field }) => (
          <Switch
            checked={field.value}
            disabled={
              !permissions?.update_idp_config ||
              (!isSSOEnabled && isConfigInvalid)
            }
            onChange={(e) => {
              field.onChange(e.detail);
              if (!e.detail) {
                setValue('ssoEnforced', false, { shouldDirty: true });
              }
            }}
          >
            <span
              style={{ display: 'flex', alignItems: 'center', gap: Spacing.S6 }}
            >
              Enable SSO
              {!isSSOEnabled && isConfigInvalid && (
                <Tooltip
                  key="sso-enforce-tooltip"
                  style={{ textAlign: 'left', whiteSpace: 'normal' }}
                  tooltipPlacement="bottom"
                  tooltipText="To enable SSO, the IDP configuration needs to have a valid certificate."
                >
                  <Icon icon="info-outline" size="m" />
                </Tooltip>
              )}
            </span>
          </Switch>
        )}
      />
      <p
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
          paddingLeft: 56,
          color:
            !permissions?.update_idp_config ||
            (!isSSOEnabled && isConfigInvalid)
              ? 'var(--token-alias-content-text-primary-disabled, light-dark(#a3a3ab, #83838c))'
              : undefined,
        }}
      >
        Activates the IDP configuration. With the enforcement disabled, only
        included users are required to log in with SSO.
      </p>
      <Controller
        control={control}
        name="ssoEnforced"
        render={({ field }) => (
          <Switch
            checked={field.value}
            disabled={!permissions?.update_idp_config || !isSSOEnabled}
            onChange={(e) => field.onChange(e.detail)}
          >
            <span
              style={{ display: 'flex', alignItems: 'center', gap: Spacing.S6 }}
            >
              Enforce SSO for all users
              {!isSSOEnabled && (
                <Tooltip
                  style={{ textAlign: 'left', whiteSpace: 'normal' }}
                  tooltipPlacement="bottom"
                  tooltipText="Enable SSO first to enforce it for all users."
                >
                  <Icon icon="info-outline" size="m" />
                </Tooltip>
              )}
            </span>
          </Switch>
        )}
      />
      <p
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S0,
          paddingLeft: 56,
          color: !isSSOEnabled
            ? 'var(--token-alias-content-text-primary-disabled, light-dark(#a3a3ab, #83838c))'
            : undefined,
        }}
      >
        Enforces SSO for all users of the account, except excluded users.
      </p>
    </div>
  );
};
