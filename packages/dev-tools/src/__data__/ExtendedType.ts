import { extendType } from '@linode/utilities';

import types from './types.json';

import type { LinodeType } from '@linode/api-v4';

const _types = types.data as LinodeType[];

export const extendedTypes = _types.map(extendType);
