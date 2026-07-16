import {
  Button,
  Icon,
  SearchField,
  Select,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Box } from '../../Shared/Box/Box';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';
import styles from './TfaEnforcement.module.css';

import type { SelectOption } from '../../Shared/types';
import type { TfaEnforcementFormValues } from './TfaEnforcementLanding';

const filterableOptions: SelectOption[] = [
  { label: 'Unselected first', value: 'unselected' },
  { label: 'Selected first', value: 'selected' },
];

type SortOrder = 'selected' | 'unselected';

interface Props {
  filterText: string;
  hasInteracted: boolean;
  isLoading: boolean;
  onFilterChange: (value: string) => void;
  onRefreshSorting: () => void;
  onSortOrderChange: (value: SortOrder) => void;
  scopedOptionsLength: number;
  sortOrder: SortOrder;
}

export const AccountUsersTableToolbar = ({
  filterText,
  hasInteracted,
  isLoading,
  onFilterChange,
  onRefreshSorting,
  onSortOrderChange,
  scopedOptionsLength,
  sortOrder,
}: Props) => {
  const {
    formState: { isDirty },
  } = useFormContext<TfaEnforcementFormValues>();
  const isSmUp = useBreakpoint('up', 'sm');

  return (
    <Box
      className={styles.toolbarContainer}
      direction="row"
      style={{
        flexWrap: isSmUp ? 'nowrap' : 'wrap',
        gap: isSmUp ? Spacing.S24 : Spacing.S12,
      }}
    >
      <SearchField
        data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.searchUsernameOrEmail}
        isLoading={isLoading}
        onChange={(e) => {
          const target = e.target as HTMLInputElement | null;
          onFilterChange(target?.value ?? '');
        }}
        placeholder="Search username or email"
        style={{ width: isSmUp ? 280 : '100%' }}
        value={filterText}
      />
      <Box
        className={styles.toolbarSortingContainer}
        direction="row"
        style={{
          gap: isSmUp ? Spacing.S12 : Spacing.S8,
          width: isSmUp ? 'fit-content' : '100%',
        }}
      >
        <p
          style={{
            width: isSmUp ? 'fit-content' : '100%',
          }}
        >
          Sort by
        </p>
        <Select
          data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.sortByUsers}
          items={filterableOptions}
          onChange={(e) => {
            const item = (e as CustomEvent).detail as SelectOption;
            if (item?.value === 'selected' || item?.value === 'unselected') {
              onSortOrderChange(item.value);
            }
          }}
          selected={filterableOptions.find((o) => o.value === sortOrder)}
          valueFn={(item) => (item as SelectOption).label}
        />
      </Box>
      {hasInteracted && isDirty && (
        <Tooltip
          className={styles.toolbarTooltip}
          tooltipPlacement="bottom"
          tooltipText="Click to re-apply the sort order with the current selection state."
        >
          <Button
            data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.refreshSorting}
            disabled={scopedOptionsLength === 0}
            onClick={onRefreshSorting}
            type="button"
            variant="link"
          >
            <Icon icon="reload" size="s" />
            Refresh sorting
            <Icon icon="info-outline" size="s" />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};
