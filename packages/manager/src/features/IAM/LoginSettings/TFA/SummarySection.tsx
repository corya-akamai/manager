import {
  Checkbox,
  FormError,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { usePermissions } from '../../hooks/usePermissions';

import type { TfaEnforcementFormValues } from './TfaEnforcementLanding';

interface Props {
  enforcedUsersCount: number;
  isEnforced: boolean;
  optionalUsersCount: number;
  totalUsers: number;
}

export const SummarySection = ({
  enforcedUsersCount,
  isEnforced,
  optionalUsersCount,
  totalUsers,
}: Props) => {
  const {
    control,
    formState: { dirtyFields },
  } = useFormContext<TfaEnforcementFormValues>();
  // TODO: UIE-12176 Replace with the correct permissions once they are available in the API.
  const { data: permissions } = usePermissions('account', [
    'update_account_settings',
  ]);

  // TODO: UIE-12026 - When the Account Users table is implemented,
  // update hasSettingsChanged to also include dirty optional users selections.
  const hasSettingsChanged = !!dirtyFields.tfa_enforced;

  return (
    <>
      <NotificationBanner type="info">
        <>
          {isEnforced && optionalUsersCount > 0 ? (
            <>
              <strong>Summary:</strong>
              <ul
                style={{
                  margin: `${Spacing.S4} 0 ${Spacing.S8}`,
                  paddingLeft: Spacing.S20,
                }}
              >
                <li>
                  Two-factor authentication will be enforced for{' '}
                  <strong>
                    {enforcedUsersCount} of {totalUsers} account users
                  </strong>
                  .
                </li>
                <li>
                  The remaining <strong>{optionalUsersCount} users</strong> will
                  be able to log in using password only. 2FA is optional for
                  them.
                </li>
              </ul>
            </>
          ) : (
            <p style={{ margin: `0 0 ${Spacing.S8}` }}>
              <strong>Summary:</strong> Two-factor authentication will be
              enforced for{' '}
              <strong>
                {enforcedUsersCount} of {totalUsers} account users
              </strong>
              .
            </p>
          )}
          <strong>What happens next:</strong>
          <ul style={{ margin: `${Spacing.S4} 0 0`, paddingLeft: Spacing.S20 }}>
            {isEnforced ? (
              <>
                <li>
                  Users with enforced two-step login who don&apos;t have it yet
                  configured will receive an email with instructions how to do
                  it. They will be required to configure it before their next
                  log in.
                </li>
                <li>
                  New users added to the account will be required to configure
                  two-factor authentication by default before their first log
                  in.
                </li>
              </>
            ) : (
              <>
                <li>
                  Users who were already enforced to use two-factor
                  authentication will be able to switch to password-only login.
                </li>
                <li>
                  For new users added to the account two-factor authentication
                  will be optional.
                </li>
              </>
            )}
          </ul>
        </>
      </NotificationBanner>

      {hasSettingsChanged && (
        <Controller
          control={control}
          name="isAcknowledged"
          render={({ field, fieldState }) => (
            <div>
              <Checkbox
                checked={field.value}
                disabled={!permissions?.update_account_settings}
                onChange={(e) => field.onChange(e.detail as boolean)}
                required
              >
                {isEnforced
                  ? 'I understand that my changes will be applied immediately and will block selected users from logging in until they configure two-factor authentication.'
                  : 'I understand that this change will be applied immediately.'}
              </Checkbox>
              {Boolean(fieldState.error?.message) && (
                <FormError slot="error" style={{ paddingLeft: Spacing.S32 }}>
                  {fieldState.error?.message}
                </FormError>
              )}
            </div>
          )}
          rules={{
            validate: (value) =>
              value ||
              'You need to confirm that you understand the impact of applied changes.',
          }}
        />
      )}
    </>
  );
};
