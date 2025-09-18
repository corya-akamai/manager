import { extendedTypes } from '@linode/dev-tools/__data__';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { NodePoolPanel } from './NodePoolPanel';

import type { NodePoolPanelProps } from './NodePoolPanel';

const props: NodePoolPanelProps = {
  handleConfigurePool: vi.fn(),
  hasSelectedRegion: true,
  isPlanPanelDisabled: () => false,
  isSelectedRegionEligibleForPlan: () => false,
  regionsData: [],
  selectedRegionId: 'us-east',
  selectedTier: 'standard',
  types: extendedTypes,
  typesLoading: false,
};

describe('NodePoolPanel', () => {
  it('should render plan heading', async () => {
    const { findByText } = renderWithThemeAndHookFormContext({
      component: <NodePoolPanel {...props} />,
    });

    await findByText('Dedicated CPU');
  });
});
