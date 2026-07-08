import { toast } from '@akamai/cds-components/notification-toast';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  NotificationBanner,
  Switch,
} from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import {
  useGetTfaEnforcementAccountSettingsQuery,
  useUpdateTfaEnforcementAccountSettingsMutation,
} from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useFlags } from 'src/hooks/useFlags';

import { useIsIAMEnabled } from '../../hooks/useIsIAMEnabled';
import { Box } from '../../Shared/Box/Box';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { IAM_LABEL, TFA_ENFORCEMENT_LINK } from '../../Shared/constants';
import { DocsLink } from '../../Shared/DocsLink/DocsLink';
import { DocumentTitleSegment } from '../../Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from '../../Shared/ErrorState/ErrorState';
import { LandingHeader } from '../../Shared/LandingHeader/LandingHeader';
import { Paper } from '../../Shared/Paper/Paper';

import type { APIError } from '@linode/api-v4';

interface TfaEnforcementFormValues {
  tfa_enforced: boolean;
}

export const TfaEnforcementLanding = () => {
  const navigate = useNavigate();
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();

  const {
    data: tfaSettings,
    error: settingsError,
    isLoading,
  } = useGetTfaEnforcementAccountSettingsQuery();

  const { mutateAsync: updateTfaSettings } =
    useUpdateTfaEnforcementAccountSettingsMutation();

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    getValues,
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm<TfaEnforcementFormValues>({
    values: {
      tfa_enforced: tfaSettings?.tfa_enforced ?? false,
    },
  });

  const isEnforced = watch('tfa_enforced');

  const onSubmit = async (values: TfaEnforcementFormValues) => {
    try {
      await updateTfaSettings({ tfa_enforced: values.tfa_enforced });
      toast.open({
        text: '2FA enforcement updated successfully.',
        type: 'success',
      });
      reset({ ...getValues() }, { keepDirty: false });
      navigate({ to: '/iam/settings' });
    } catch (err) {
      const apiErrors = err as APIError[];
      setError('root', {
        message: apiErrors[0]?.reason ?? 'An error occurred.',
      });
    }
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (settingsError) {
    return (
      <Paper>
        <ErrorState />
      </Paper>
    );
  }

  return (
    <>
      <DocumentTitleSegment segment="2FA Enforcement" />
      <LandingHeader>
        <Breadcrumb>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/users' })}
          >
            {IAM_LABEL}
            {flags.iamNewBadge && isIAMEnabled ? <Badge type="new" /> : null}
          </BreadcrumbItem>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/settings' })}
          >
            Account Settings
          </BreadcrumbItem>
          <BreadcrumbItem>
            Manage Two-Factor Authentication Enforcement
          </BreadcrumbItem>
        </Breadcrumb>
        <DocsLink href={TFA_ENFORCEMENT_LINK} />
      </LandingHeader>

      {errors.root?.message && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={errors.root.message}
          type="error"
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: Spacing.S24,
          marginTop: Spacing.S24,
        }}
      >
        <Box>
          <Controller
            control={control}
            name="tfa_enforced"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.detail)}
                size="small"
              >
                Enforce two-factor authentication on this account
              </Switch>
            )}
          />
          <p>
            Enable this option to select users you want to enforce the
            two-factor authentication for.
          </p>
        </Box>
        {isEnforced && (
          <Paper padding={Spacing.S16} paddingTop={Spacing.S16}>
            <h3
              style={{
                font: Typography.Heading.S,
                marginBottom: Spacing.S8,
              }}
            >
              Account Users
            </h3>
            <p>
              Select users you want to enforce two-factor authentication for.
              For unselected users the 2FA login will be optional.
            </p>
            {/* TODO: UIE-12026 - Account Users table will be implemented in a separate ticket */}
          </Paper>
        )}

        <Box direction="row" style={{ justifyContent: 'flex-end' }}>
          <Button
            disabled={!isDirty}
            processing={isSubmitting}
            type="submit"
            variant="primary"
          >
            Update Two-Factor Authentication Enforcement
          </Button>
        </Box>
      </form>
    </>
  );
};
