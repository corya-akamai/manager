import { Button, Tooltip } from '@akamai/cds-components/react';
import { Spacing, Typography as TypographyToken } from '@akamai/cds-tokens';
import { Typography } from '@linode/ui';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';

import { usePermissions } from '../hooks/usePermissions';
import { Box } from '../Shared/Box/Box';
import { IAM_PARENT_USERS_PENDO_IDS } from '../Shared/constants';
import { InlineMenuAction } from '../Shared/InlineMenuAction/InlineMenuAction';
import { TruncatedList } from '../Shared/TruncatedList';
import { UpdateDelegationsDrawer } from './UpdateDelegationsDrawer';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates;
  index: number;
}

export const AccountDelegationsTableRow = ({ delegation, index }: Props) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const { data: permissions } = usePermissions('account', [
    'update_delegate_users',
  ]);
  const handleUpdateDelegations = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <TableRow
      data-qa-table-row={delegation.euuid}
      key={`delegation-${delegation.euuid}-${index}`}
    >
      <TableCell>
        <Typography
          sx={{
            maxWidth: 272,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          variant="body1"
        >
          {delegation.company}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          display: { sm: 'table-cell', xs: 'none' },
          padding: Spacing.S8,
        }}
      >
        {'users' in delegation && delegation.users.length > 0 ? (
          <TruncatedList
            addEllipsis
            customOverflowButton={(numHiddenItems) => (
              <Box
                style={{
                  alignItems: 'center',
                  backgroundColor:
                    'var(--token-alias-background-informativesubtle, light-dark(#e6edfe, #515157))',
                  borderRadius: 4,
                  display: 'flex',
                  height: '20px',
                  maxWidth: 'max-content',
                  padding: `${Spacing.S4} ${Spacing.S8}`,
                  position: 'relative',
                  marginLeft: Spacing.S12,
                  flexFlow: 'unset',
                }}
              >
                <Tooltip
                  tooltipPlacement="top"
                  tooltipText="Click to View All Delegate Users"
                >
                  <Button
                    onClick={handleUpdateDelegations}
                    style={{
                      color:
                        'var(--token-alias-content-text-primary-default, light-dark(#343438, #ffffff))',
                      font: TypographyToken.Label.Regular.Xs,
                      padding: 0,
                    }}
                    variant="link"
                  >
                    +{numHiddenItems}
                  </Button>
                </Tooltip>
              </Box>
            )}
            justifyOverflowButtonRight
            listContainerSx={{
              width: '100%',
              overflow: 'hidden',
              maxHeight: 24,
              gap: 1,
              '& .last-visible-before-overflow': {
                '&::after': {
                  top: 1,
                  right: -13,
                },
              },
            }}
          >
            {delegation.users.map((user: string, index: number) => (
              <Typography key={user} variant="body1">
                {user}
                {index < delegation.users.length - 1 && ', '}
              </Typography>
            ))}
          </TruncatedList>
        ) : (
          <Typography
            sx={{ fontStyle: 'italic', textTransform: 'capitalize' }}
            variant="body1"
          >
            No Users Added
          </Typography>
        )}
      </TableCell>
      <TableCell
        actionCell
        sx={{
          textAlign: 'center',
          paddingRight: Spacing.S0,
        }}
      >
        <InlineMenuAction
          isActionDisabled={!permissions.update_delegate_users}
          label="Update Delegation"
          onClick={handleUpdateDelegations}
          pendoID={IAM_PARENT_USERS_PENDO_IDS.updateDelegation}
          tooltipText="You do not have permission to update delegations."
        />
      </TableCell>
      <UpdateDelegationsDrawer
        delegation={delegation}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
      />
    </TableRow>
  );
};
