import { BETA_API_ROOT } from '../common/constants';
import Request, {
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../common/request';

import type { Filter, Params, ResourcePage } from '../common/types';
import type { AccountMaintenance, MaintenancePolicy } from './types';

/**
 * getAccountMaintenance
 *
 * Returns a collection of Maintenance objects for any entity a user has permissions to view.
 *
 */
export const getAccountMaintenance = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<AccountMaintenance>>(
    setURL(`${BETA_API_ROOT}/account/maintenance`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getMaintenancePolicies
 *
 * Returns a list of maintenance policies that are available for Linodes in this account.
 *
 */
export const getMaintenancePolicies = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<MaintenancePolicy>>(
    setURL(`${BETA_API_ROOT}/maintenance/policies`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );
