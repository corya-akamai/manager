import { actionCreatorFactory } from 'typescript-fsa';

import type { GlobalErrorState } from './types';

const actionCreator = actionCreatorFactory('@@manager/globalErrors');

export const setErrors = actionCreator<Partial<GlobalErrorState>>('/set');

export const clearErrors = actionCreator<Partial<GlobalErrorState> | undefined>(
  '/clear',
);
