import { TableCell, TableRow } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { Typography } from '@linode/ui';
import React from 'react';

import { usePermissions } from '../hooks/usePermissions';
import { IAM_PARENT_USERS_PENDO_IDS } from '../Shared/constants';
import { InlineMenuAction } from '../Shared/InlineMenuAction/InlineMenuAction';
import {
  getAccountDelegationsTableCellStyle,
  useAccountDelegationsTableColumns,
} from './accountDelegationsTableColumnsUtils';
import { DelegatedUsersList } from './DelegatedUsersList';
import { UpdateDelegationsDrawer } from './UpdateDelegationsDrawer';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates;
  index: number;
}

export const AccountDelegationsTableRow = ({ delegation, index }: Props) => {
  const { columnWidths, showUsers } = useAccountDelegationsTableColumns();
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
      zebra
    >
      <TableCell
        style={getAccountDelegationsTableCellStyle(columnWidths.account)}
      >
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
      {showUsers ? (
        <TableCell
          style={getAccountDelegationsTableCellStyle(columnWidths.users, {
            shrinkable: true,
          })}
        >
          {'users' in delegation && delegation.users.length > 0 ? (
            <DelegatedUsersList
              onViewAll={handleUpdateDelegations}
              users={delegation.users}
            />
          ) : (
            <Typography
              sx={{ fontStyle: 'italic', textTransform: 'capitalize' }}
              variant="body1"
            >
              No Users Added
            </Typography>
          )}
        </TableCell>
      ) : null}
      <TableCell
        style={{
          ...getAccountDelegationsTableCellStyle(columnWidths.actions),
          paddingRight: Spacing.S0,
          textAlign: 'center',
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
