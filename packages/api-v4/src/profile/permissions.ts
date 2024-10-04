import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { ProfilePermissions } from './types';
/**
 * getPermissions
 *
 * Return all permissions for user's profile.
 *
 */
export const getPermissions = () => {
  return Request<ProfilePermissions>(
    setURL(`${API_ROOT}/profile/permissions`),
    setMethod('GET')
  );
};
