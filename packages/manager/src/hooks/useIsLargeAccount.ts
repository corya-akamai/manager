import { LARGE_ACCOUNT_THRESHOLD } from '@linode/core/constants';
import { useLinodesQuery } from '@linode/queries';

export const useIsLargeAccount = (enabled = true) => {
  const { data: linodesData } = useLinodesQuery({}, {}, enabled);

  if (!linodesData) {
    return undefined;
  }

  return linodesData.results > LARGE_ACCOUNT_THRESHOLD;
};
