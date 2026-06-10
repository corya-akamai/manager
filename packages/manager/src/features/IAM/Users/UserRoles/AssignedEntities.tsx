import { Button, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { sortByString } from '@akamai/compute-ui-core/formatting';
import { Chip, CloseIcon } from '@linode/ui';
import * as React from 'react';

import { SingleRowTruncatedList } from '../../Shared/SingleRowTruncatedList/SingleRowTruncatedList';
import styles from '../../Shared/SingleRowTruncatedList/SingleRowTruncatedList.module.css';

import type { CombinedEntity, ExtendedRoleView } from '../../Shared/types';
import type { AccountRoleType, EntityRoleType } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  onButtonClick: (roleName: AccountRoleType | EntityRoleType) => void;
  onRemoveAssignment: (entity: CombinedEntity, role: ExtendedRoleView) => void;
  role: ExtendedRoleView;
}

const MAX_ITEMS_TO_RENDER = 25;

export const AssignedEntities = ({
  onButtonClick,
  onRemoveAssignment,
  role,
  disabled,
}: Props) => {
  const combinedEntities: CombinedEntity[] = React.useMemo(
    () =>
      role.entity_names!.map((name, index) => ({
        name,
        id: role.entity_ids![index],
      })),
    [role.entity_names, role.entity_ids]
  );

  const sortedEntities = React.useMemo(
    () =>
      [...combinedEntities].sort((a, b) => sortByString(a.name, b.name, 'asc')),
    [combinedEntities]
  );

  const entitiesToRender = React.useMemo(
    () => sortedEntities.slice(0, MAX_ITEMS_TO_RENDER),
    [sortedEntities]
  );

  const chipGapPx = Number.parseInt(Spacing.S8, 10) || 8;

  const items = entitiesToRender.map((entity) => (
    <Tooltip
      disabled={entity.name.length <= 30}
      key={entity.id}
      tooltipPlacement="top"
      tooltipText={entity.name}
    >
      <Chip
        data-testid="entities"
        deleteIcon={
          disabled ? undefined : <CloseIcon data-testid="CloseIcon" />
        }
        label={
          entity.name.length > 30
            ? `${entity.name.slice(0, 20)}...`
            : entity.name
        }
        onDelete={disabled ? undefined : () => onRemoveAssignment(entity, role)}
        sx={{
          backgroundColor:
            'var(--token-alias-background-informativesubtle, light-dark(#e6edfe, #515157))',
          color:
            'var(--token-alias-content-text-primary-default, light-dark(#343438, #ffffff))',
          '& .MuiChip-deleteIcon': {
            color:
              'var(--token-alias-content-text-primary-default, light-dark(#343438, #ffffff))',
          },
        }}
      />
    </Tooltip>
  ));

  // Phantom uses MAX_ITEMS_TO_RENDER digits to ensure the worst-case pill width is measured
  const phantomLabel = `+${MAX_ITEMS_TO_RENDER}`;

  return (
    <SingleRowTruncatedList
      gapPx={chipGapPx}
      items={items}
      overflowButtonPhantom={
        <span className={styles.overflowPillBadge}>
          <Button
            className={styles.overflowPillButton}
            size="small"
            variant="link"
          >
            {phantomLabel}
          </Button>
        </span>
      }
      renderOverflowButton={(hiddenCount) => (
        <span className={styles.overflowPillBadge}>
          <Tooltip
            tooltipPlacement="top"
            tooltipText="Click to View All Entities"
          >
            <Button
              className={styles.overflowPillButton}
              onClick={() => onButtonClick(role.name)}
              size="small"
              variant="link"
            >
              +{hiddenCount}
            </Button>
          </Tooltip>
        </span>
      )}
      totalCount={sortedEntities.length}
    />
  );
};
