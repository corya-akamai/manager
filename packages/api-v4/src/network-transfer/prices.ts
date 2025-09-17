import { API_ROOT } from 'src/common/constants';
import Request, { setMethod, setParams, setURL } from 'src/common/request';

import type { Params, PriceType, ResourcePage } from 'src/common/types';

export const getNetworkTransferPrices = (params?: Params) =>
  Request<ResourcePage<PriceType>>(
    setURL(`${API_ROOT}/network-transfer/prices`),
    setMethod('GET'),
    setParams(params),
  );
