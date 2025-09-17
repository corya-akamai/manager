import actionCreatorFactory, { isType } from 'typescript-fsa';

import type { Reducer } from 'redux';

const actionCreator = actionCreatorFactory('@@manager/pending-upload');

export const setPendingUpload = actionCreator<boolean>('set-pending-upload');

export type PendingUploadState = boolean;
export const defaultPendingUploadState: PendingUploadState = false;

export const pendingUploadReducer: Reducer<PendingUploadState> = (
  state = defaultPendingUploadState,
  action,
) => {
  if (isType(action, setPendingUpload)) {
    return action.payload;
  }
  return state;
};

