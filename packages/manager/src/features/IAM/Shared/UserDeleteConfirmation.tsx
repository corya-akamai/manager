import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useAccountUser, useAccountUserDeleteMutation } from '@linode/queries';
import * as React from 'react';

import { useDelegationRole } from '../hooks/useDelegationRole';
import { usePermissions } from '../hooks/usePermissions';
import { CircleProgress } from './CircleProgress/CircleProgress';
import { ErrorState } from './ErrorState/ErrorState';
import styles from './RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog.module.css';
import { getDeleteUserTooltipText } from './utilities';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  username: string;
}

export const UserDeleteConfirmation = (props: Props) => {
  const { onClose: _onClose, onSuccess, open, username } = props;

  const { profileUserName } = useDelegationRole();

  const { data: permissions } = usePermissions('account', ['delete_user']);

  const {
    data: user,
    error: userError,
    isLoading: isLoadingUser,
  } = useAccountUser(username);

  const isDelegateUserType = user?.user_type === 'delegate';

  const isDeleteUserDisabled =
    !permissions.delete_user ||
    profileUserName === username ||
    isDelegateUserType;

  const deleteText = getDeleteUserTooltipText(
    permissions.delete_user,
    profileUserName,
    username,
    isDelegateUserType
  );

  const {
    error,
    isPending,
    mutateAsync: deleteUser,
    reset,
  } = useAccountUserDeleteMutation(username);

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    _onClose();
  };

  const onDelete = async () => {
    await deleteUser();
    toast.open({
      text: `User ${username} has been successfully deleted.`,
      type: 'success',
    });
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!open) {
    return null;
  }

  let bodyContent: React.ReactNode;
  if (userError) {
    bodyContent = <ErrorState />;
  } else if (isLoadingUser) {
    bodyContent = <CircleProgress />;
  } else {
    bodyContent = (
      <>
        {isDeleteUserDisabled && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S8 }}
            text={deleteText}
            type="error"
          />
        )}
        <NotificationBanner type="warning">
          <strong>Warning:</strong> Deleting <strong>{username}</strong> is
          permanent and can&apos;t be undone.
        </NotificationBanner>
        {error && <ErrorState />}
      </>
    );
  }

  const modalSize =
    error || isDeleteUserDisabled || userError || isLoadingUser
      ? 'medium'
      : 'small';

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      onModalClosed={onClose}
      open={open}
      role="dialog"
      size={modalSize}
    >
      <span slot="title">{`Delete user?`}</span>
      <div slot="body">{bodyContent}</div>
      <div
        slot="actions"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: Spacing.S8,
          marginTop: Spacing.S16,
          alignItems: 'center',
        }}
      >
        <Button
          onClick={onClose}
          style={{ marginRight: Spacing.S8 }}
          variant="link"
        >
          Cancel
        </Button>
        <Button
          disabled={isDeleteUserDisabled || !!userError || isLoadingUser}
          onClick={onDelete}
          processing={isPending}
          variant="primary"
        >
          Delete User
        </Button>
      </div>
    </Modal>
  );
};
