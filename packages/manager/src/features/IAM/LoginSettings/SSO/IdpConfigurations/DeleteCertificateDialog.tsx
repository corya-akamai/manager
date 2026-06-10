import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDeleteIdpCertificateMutation } from '@linode/queries';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import type { IdpCertificate } from '@linode/api-v4';

interface Props {
  certificate: IdpCertificate | null;
  idpConfigId: string;
  onClose: () => void;
  open: boolean;
}

export const DeleteCertificateDialog = ({
  certificate,
  idpConfigId,
  onClose,
  open,
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
    mutateAsync: deleteCertificate,
    reset,
  } = useDeleteIdpCertificateMutation(idpConfigId);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDelete = async () => {
    try {
      await deleteCertificate({ id: certificate?.id ?? '' });
      enqueueSnackbar('Certificate deleted successfully.', {
        variant: 'success',
      });
      handleClose();
    } catch {
      // Error handled by mutation state
    }
  };

  if (!certificate) {
    return null;
  }

  return (
    <Modal
      onModalClosed={handleClose}
      open={open}
      role="dialog"
      size={error ? 'medium' : 'small'}
    >
      <span slot="title">Delete the certificate?</span>
      <div slot="body">
        <p style={{ margin: Spacing.S0 }}>
          You’re about to delete the certificate with the expiration date:{' '}
          <strong>{certificate.not_after}</strong>. This action can’t be undone.
        </p>

        {error ? (
          <NotificationBanner
            style={{ marginTop: Spacing.S16 }}
            text={error[0].reason}
            type="error"
          />
        ) : undefined}
      </div>
      <div slot="actions">
        <Button onClick={handleClose} variant="secondary">
          Cancel
        </Button>
        <Button
          disabled={isPending}
          onClick={handleDelete}
          processing={isPending}
          variant="primary"
        >
          Delete Certificate
        </Button>
      </div>
    </Modal>
  );
};
