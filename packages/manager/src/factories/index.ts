export * from './dashboards';
export * from './featureFlags';
export * from './longviewClient';
export * from './longviewDisks';
export * from './longviewProcess';
export * from './longviewResponse';
export * from './longviewService';
export * from './longviewSubscription';
export * from './longviewTopProcesses';
export * from './promotionalOffer';
export * from './stackscripts';
export * from './types';

// Convert factory output to our itemsById pattern
export const normalizeEntities = (entities: any[]) => {
  return entities.reduce((acc, thisThing) => {
    return { ...acc, [thisThing.id]: thisThing };
  }, {});
};
