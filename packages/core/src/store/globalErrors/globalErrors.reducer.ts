import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { clearErrors, setErrors } from './globalErrors.actions';

import type { GlobalErrorState } from './types';
import type { Reducer } from 'redux';

export const defaultGlobalErrorState: GlobalErrorState = {};

export const globalErrorReducer: Reducer<GlobalErrorState> =
  reducerWithInitialState(defaultGlobalErrorState)
    .case(setErrors, (state, payload) => {
      return payload
        ? {
            ...state,
            ...payload,
          }
        : {};
    })
    .case(clearErrors, (state, payload) => {
      /**
       * if a payload exists, only clear the specified
       * errors. If not, clear it all.
       */
      return payload
        ? {
            ...state,
            ...payload,
          }
        : {};
    })
    .default((state) => state);
