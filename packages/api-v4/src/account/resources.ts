import { API_ROOT } from '../constants';
import Request, {
  setMethod,
  setURL
} from '../request';
import {
  AccountResource
} from './types';

/**
 * getResources
 *
 * Return all resources for account.
 *
 */
export const getResources = () => {
  return Request<AccountResource>(setURL(`${API_ROOT}/resources`), setMethod('GET'));
};
