import { API_ROOT } from '../constants';
import Request, {
  setMethod,
  setURL
} from '../request';
import {
  AccountPermissions,
} from './types';

/**
 * getPermissions
 *
 * Return all permissions for account.
 *
 */
export const getPermissions = () => {
  return Request<AccountPermissions>(setURL(`${API_ROOT}/permissions`), setMethod('GET'));
};

