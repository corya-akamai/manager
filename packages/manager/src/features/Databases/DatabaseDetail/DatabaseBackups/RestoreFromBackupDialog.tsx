import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { useRestoreFromBackupMutation } from 'src/queries/databases/databases';
import { useProfile } from 'src/queries/profile/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

import type { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import type { DialogProps } from 'src/components/Dialog/Dialog';

interface Props extends Omit<DialogProps, 'title'> {
  backup: DatabaseBackup;
  database: Database;
  onClose: () => void;
  open: boolean;
}

export const RestoreFromBackupDialog: React.FC<Props> = (props) => {
  const { backup, database, onClose, open } = props;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();

  const {
    error,
    isPending,
    mutateAsync: restore,
  } = useRestoreFromBackupMutation(database.engine, database.id, backup.id);

  const handleRestoreDatabase = () => {
    restore().then(() => {
      history.push('summary');
      enqueueSnackbar('Your database is being restored.', {
        variant: 'success',
      });
      onClose();
    });
  };
  const formatedDate = `${backup.created.split('T')[0]} ${backup.created
    .split('T')[1]
    .slice(0, 5)} (UTC)`;

  const isNewDatabase = database?.platform === 'rdbms-default';
  return isNewDatabase ? (
    <Dialog
      onClose={onClose}
      open={open}
      subtitle={`From ${formatedDate}`}
      title={`Restore ${database.label}`}
    >
      <Typography sx={{ marginBottom: '20px' }}>
        Restoring a backup creates a fork from this backup. If you proceed and
        the fork is created successfully, you have 10 days to delete the
        original database cluster. Failing to do so, will lead to additional
        billing caused by two running clusters instead of one.
      </Typography>
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: 'Restore',
          onClick: handleRestoreDatabase,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Cancel',
          onClick: onClose,
        }}
        sx={{
          display: 'flex',
          marginBottom: '0',
          paddingBottom: '0',
          paddingTop: '10px',
        }}
      />
    </Dialog>
  ) : (
    <TypeToConfirmDialog
      entity={{
        action: 'restoration',
        name: database.label,
        primaryBtnText: 'Restore Database',
        subType: 'Cluster',
        type: 'Database',
      }}
      title={`Restore from Backup ${formatDate(backup.created, {
        timezone: profile?.timezone,
      })}`}
      label={'Database Label'}
      loading={isPending}
      onClick={handleRestoreDatabase}
      onClose={onClose}
      open={open}
    >
      {error ? (
        <Notice
          text={
            getAPIErrorOrDefault(error, 'Unable to restore this backup.')[0]
              .reason
          }
          variant="error"
        />
      ) : null}
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Restoring from a backup will erase all
          existing data on this cluster.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

export default RestoreFromBackupDialog;
