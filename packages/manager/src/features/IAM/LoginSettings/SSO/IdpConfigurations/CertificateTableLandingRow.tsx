import {
  Button,
  Icon,
  TableCell,
  TableRow,
  Tooltip,
} from '@akamai/cds-components/react';
import { truncateMiddle } from '@akamai/compute-ui-core/formatting';
import React from 'react';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { CopyTooltip } from 'src/features/IAM/Shared/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/features/IAM/Shared/DateTimeDisplay/DateTimeDisplay';
import { StatusIcon } from 'src/features/IAM/Shared/StatusIcon/StatusIcon';

import {
  DELETE_PERMISSION_ERROR,
  SSO_CANNOT_DELETE_LAST_CERTIFICATE,
  SSO_REQUIRES_ACTIVE_CERTIFICATE,
  VIEW_DETAILS_PERMISSION_ERROR,
} from '../../constants';
import styles from './CertificatesTable.module.css';

import type { IdpCertificate } from '@linode/api-v4';
import type { Status } from 'src/features/IAM/Shared/StatusIcon/StatusIcon';

interface CertificateTableLandingProps {
  activeCertificateCount?: null | number;
  cert: IdpCertificate;
  isMobileScreen: boolean;
  isSmallScreen: boolean;
  onDelete: (cert: IdpCertificate) => void;
  onViewDetails: (cert: IdpCertificate) => void;
  ssoEnabled?: boolean;
  status: Status;
  totalCertificateCount?: number;
}

export const CertificateTableLandingRow = ({
  cert,
  isSmallScreen,
  isMobileScreen,
  status,
  onDelete,
  onViewDetails,
  ssoEnabled,
  activeCertificateCount,
  totalCertificateCount,
}: CertificateTableLandingProps) => {
  // TODO - UIE-11305 replace with actual permissions check for creating IDP configurations
  const { data: permissions } = usePermissions('account', ['is_account_admin']);

  const isSsoEnabled = !!ssoEnabled;
  const activeCount = activeCertificateCount ?? 0;
  const totalCount = totalCertificateCount ?? 0;

  const isCertValid = status !== 'error' && status !== 'inactive';

  // Deletion is disabled when:
  // - SSO is enabled and deleting this certificate would leave zero valid certificates (i.e.,
  //   this is the only non-expired certificate), OR
  // - the current user lacks permission to delete certificates.
  const canDelete = !!permissions?.is_account_admin;

  // Block deletion when SSO is enabled and deleting would leave zero valid certificates,
  // or when SSO is enabled and this is the only certificate at all.
  const blocksDueToOnlyTotal = isSsoEnabled && totalCount === 1;
  const blocksDueToOnlyValid = isSsoEnabled && activeCount === 1 && isCertValid;

  const ssoBlocksDelete = blocksDueToOnlyTotal || blocksDueToOnlyValid;

  const deleteDisabled = !canDelete || ssoBlocksDelete;

  return (
    <TableRow hoverable key={cert.id} rowborder>
      <TableCell className={styles.certCellLanding}>
        {truncateMiddle(cert.certificate, isSmallScreen ? 24 : 46)}
        <CopyTooltip text={cert.certificate} />
      </TableCell>
      {!isMobileScreen && (
        <TableCell className={styles.expirationCell} hidden={isSmallScreen}>
          <StatusIcon pulse={false} status={status} />
          <DateTimeDisplay displayTime={false} value={cert.not_after} />
        </TableCell>
      )}

      <TableCell className={styles.actionCell}>
        <Tooltip
          className={styles.actionButton}
          disabled={permissions?.is_account_admin}
          tooltipPlacement="bottom"
          tooltipText={VIEW_DETAILS_PERMISSION_ERROR}
        >
          <Button
            disabled={!permissions?.is_account_admin}
            onClick={() => onViewDetails(cert)}
            style={{
              paddingRight: 'var(--token-global-spacing-s8, 8px)',
            }}
            type="button"
            variant="link"
          >
            View Details
            {!permissions?.is_account_admin && (
              <Icon icon="info-outline" size="s" />
            )}
          </Button>
        </Tooltip>
        <Tooltip
          className={styles.actionButton}
          disabled={!deleteDisabled}
          tooltipPlacement="bottom"
          tooltipText={
            !canDelete
              ? DELETE_PERMISSION_ERROR
              : blocksDueToOnlyTotal
                ? SSO_CANNOT_DELETE_LAST_CERTIFICATE
                : SSO_REQUIRES_ACTIVE_CERTIFICATE
          }
        >
          <Button
            disabled={deleteDisabled}
            onClick={() => {
              if (!deleteDisabled) {
                onDelete(cert);
              }
            }}
            style={{
              paddingLeft: 'var(--token-global-spacing-s8, 8px)',
            }}
            type="button"
            variant="link"
          >
            Delete
            {deleteDisabled && <Icon icon="info-outline" size="s" />}
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};
