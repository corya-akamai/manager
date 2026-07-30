import { Font } from '@akamai/cds-tokens';
import {
  Box,
  ChevronDownIcon,
  ClickAwayListener,
  Typography,
} from '@linode/ui';
import React, { useState } from 'react';

import { StyledTriggerButton } from './DashboardPicker.styles';
import { DashboardPickerPanel } from './DashboardPickerPanel';

import type { CloudPulseServiceType, Dashboard } from '@linode/api-v4';
import type { Theme } from '@linode/ui';
import type { AclpServices } from 'src/featureFlags';

export interface DashboardPickerProps {
  /**
   * Feature-flag metadata by service type.
   */
  aclpServices?: Partial<AclpServices>;
  /**
   * Disables opening and interaction with the picker trigger.
   */
  disabled?: boolean;
  /**
   * Error text shown below the panel when present.
   */
  errorText?: string;
  /**
   * Shows a loading state while dashboard options are being fetched.
   */
  loading?: boolean;
  /**
   * Called when a dashboard is selected or cleared.
   */
  onChange: (dashboard: Dashboard | null) => void;
  /**
   * Dashboard options available to select.
   */
  options: Dashboard[];
  /**
   * Map used to convert service type keys into display labels.
   */
  serviceTypeMap: Map<CloudPulseServiceType, string>;
  /**
   * When false, group headers are hidden (single service type context)
   */
  showServiceTypeLabel?: boolean;
  /**
   * Currently selected dashboard value.
   */
  value: Dashboard | null;
}

export const DashboardPicker = ({
  aclpServices,
  disabled,
  errorText,
  loading,
  onChange,
  options,
  serviceTypeMap,
  showServiceTypeLabel = true,
  value,
}: DashboardPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const triggerLabel = value
    ? `${serviceTypeMap.get(value.service_type) ?? value.service_type} - ${value.label}`
    : 'Select a Dashboard';

  const triggerTextSx = (theme: Theme, isOpen = false) => ({
    color: isOpen
      ? theme.tokens.alias.Content.Text.Primary.Default
      : value
        ? theme.tokens.alias.Content.Text.Primary.Default
        : theme.palette.text.secondary,
    fontWeight: Font.FontWeight.Bold,
  });

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: 'relative' }}>
        {/* Trigger — always rendered to hold layout, hidden when panel is open */}
        <StyledTriggerButton
          data-testid="dashboard-picker-trigger"
          disabled={disabled}
          onClick={() => setOpen(true)}
          sx={(theme) => ({
            '& .dashboard-picker-trigger-icon': {
              color: triggerTextSx(theme).color,
            },
            '&:hover .dashboard-picker-trigger-icon, &:hover .dashboard-picker-trigger-text':
              {
                color: theme.tokens.alias.Action.Primary.Hover,
              },
            marginLeft: theme.spacingFunction(16),
            marginTop: theme.spacingFunction(32),
            [theme.breakpoints.down('sm')]: {
              marginLeft: 0,
              marginTop: theme.spacingFunction(16),
            },
          })}
          type="button"
        >
          <Typography
            className="dashboard-picker-trigger-text"
            sx={triggerTextSx}
            variant="h2"
          >
            {triggerLabel}
          </Typography>
          <ChevronDownIcon className="dashboard-picker-trigger-icon" />
        </StyledTriggerButton>

        {/* Panel — absolutely positioned to start at the same y as the trigger */}
        {open && (
          <DashboardPickerPanel
            aclpServices={aclpServices}
            errorText={errorText}
            handleClose={handleClose}
            loading={loading}
            onChange={onChange}
            options={options}
            serviceTypeMap={serviceTypeMap}
            showServiceTypeLabel={showServiceTypeLabel}
            triggerLabel={triggerLabel}
            triggerTextSx={triggerTextSx}
            value={value}
          />
        )}
      </Box>
    </ClickAwayListener>
  );
};
