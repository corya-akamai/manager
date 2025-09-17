import { API_ROOT } from '../common/constants';
import Request, { setMethod, setURL } from '../common/request';

/**
 * cancelObjectStorage
 *
 * Cancels Object Storage service
 */
export const cancelObjectStorage = () =>
  Request<{}>(setMethod('POST'), setURL(`${API_ROOT}/object-storage/cancel`));
