import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { AccountPermissions } from './types';

/**
 * getAccountPermissions
 *
 * Return all permissions for account.
 *
 */
export const getAccountPermissions = () => {
  return Request<AccountPermissions>(
    setURL(`${API_ROOT}/account/permissions`),
    setMethod('GET')
  );
};
