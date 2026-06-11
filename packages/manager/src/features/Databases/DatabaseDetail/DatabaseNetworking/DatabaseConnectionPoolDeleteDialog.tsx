import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormField,
  Modal,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useDeleteDatabaseConnectionPoolMutation } from '@linode/queries';
import * as React from 'react';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
  poolLabel: string;
}

export const DatabaseConnectionPoolDeleteDialog = (props: Props) => {
  const { onClose, open, databaseId, poolLabel } = props;
  const {
    error,
    isPending,
    reset,
    mutateAsync: deleteConnectionPool,
  } = useDeleteDatabaseConnectionPoolMutation(databaseId, poolLabel);
  const [poolName, setPoolName] = React.useState('');

  const onDelete = () => {
    deleteConnectionPool().then(() => {
      toast.open({
        text: `Connection Pool ${poolLabel} deleted successfully.`,
        type: 'success',
      });
      onClose();
    });
  };

  const clearErrorAndClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal closeModal={() => clearErrorAndClose()} open={open} size="medium">
      <span slot="title">Delete Connection Pool {poolLabel}?</span>
      <div slot="body">
        {error ? (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={
              getAPIErrorOrDefault(
                error,
                'There was an error deleting this Connection Pool.'
              )[0].reason
            }
            type="error"
          />
        ) : null}
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          <strong>Warning:</strong> Deletion will break the service URI for any
          clients using this pool.
        </NotificationBanner>
        <p>
          To confirm deletion, type the name of the Database Cluster{' '}
          <strong>({poolLabel})</strong> in the field below:
        </p>
        <FormField>
          <label
            htmlFor="clusterName" // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            style={{ fontWeight: 700, marginBottom: Spacing.S8 }}
          >
            Cluster Name
          </label>
          <TextField
            id="clusterName"
            onChange={(e) => setPoolName(e.detail as unknown as string)}
            placeholder={poolLabel}
            value={poolName}
          />
        </FormField>
        <p>
          To disable type-to-confirm, go to the Type-to-Confirm section of{' '}
          <a href="/profile/preferences">Preferences</a>.
        </p>
      </div>

      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={clearErrorAndClose} variant="link">
          Cancel
        </Button>
        <Button
          disabled={poolName !== poolLabel}
          onClick={onDelete}
          processing={isPending}
          variant="danger"
        >
          Delete Connection Pool
        </Button>
      </div>
    </Modal>
  );
};
