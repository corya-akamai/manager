import {
  defaultGlobalErrorState,
  globalErrorReducer as globalErrors,
  type GlobalErrorState,
} from '@linode/core/store/globalErrors';
import {
  defaultMockFeatureFlagState,
  mockFeatureFlagReducer as mockFeatureFlags,
  type MockFeatureFlagState,
} from '@linode/core/store/mockFeatureFlags';
import {
  defaultPendingUploadState,
  pendingUploadReducer as pendingUpload,
  type PendingUploadState,
} from '@linode/core/store/pendingUpload';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

import longview, {
  defaultState as defaultLongviewState,
} from 'src/store/longview/longview.reducer';
import longviewStats, {
  defaultState as defaultLongviewStatsState,
} from 'src/store/longviewStats/longviewStats.reducer';

import type { Store } from 'redux';
import type { State as LongviewState } from 'src/store/longview/longview.reducer';
import type { State as LongviewStatsState } from 'src/store/longviewStats/longviewStats.reducer';

export interface ApplicationState {
  globalErrors: GlobalErrorState;
  longviewClients: LongviewState;
  longviewStats: LongviewStatsState;
  mockFeatureFlags: MockFeatureFlagState;
  pendingUpload: PendingUploadState;
}

export const defaultState: ApplicationState = {
  globalErrors: defaultGlobalErrorState,
  longviewClients: defaultLongviewState,
  longviewStats: defaultLongviewStatsState,
  mockFeatureFlags: defaultMockFeatureFlagState,
  pendingUpload: defaultPendingUploadState,
};

/**
 * Reducers
 */
const reducers = combineReducers<ApplicationState>({
  globalErrors,
  longviewClients: longview,
  longviewStats,
  mockFeatureFlags,
  pendingUpload,
});

export const storeFactory = () =>
  createStore(reducers, defaultState, applyMiddleware(thunk));

export type ApplicationStore = Store<ApplicationState>;
