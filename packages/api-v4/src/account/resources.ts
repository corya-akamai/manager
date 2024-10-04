import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { AccountResource } from './types';

/**
 * getAccountResources
 *
 * Return all resources for account.
 *
 */
export const getAccountResources = () => {
  return Request<AccountResource>(
    setURL(`${API_ROOT}/account/resources`),
    setMethod('GET')
  );
};
