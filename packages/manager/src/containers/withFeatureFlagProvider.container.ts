import { LAUNCH_DARKLY_API_KEY } from '@linode/core/constants';
import { withLDProvider } from 'launchdarkly-react-client-sdk';

/**
 * only wrap the component in the HOC if we've passed
 * the Launch Darkly API key as an environment variable.
 *
 * Otherwise, we can't communicate with the Launch Darkly API
 * which makes this HOC have no effect - just return the component
 * as normal in this case
 */
const featureFlagProvider = LAUNCH_DARKLY_API_KEY
  ? withLDProvider({
      clientSideID: LAUNCH_DARKLY_API_KEY,
      options: { allAttributesPrivate: true },
    })
  : (component: React.ComponentType) => component;

export default featureFlagProvider;
