import React from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Main } from './index';

type MountContext = {
  appName: string;
  basePath: string;
  entryUrl: string;
};

let root: Root | undefined;

/**
 * Option B — imperative mount for plain React.
 * Shell calls mount(container, context) after loading entry.js.
 */
export function mount(container: HTMLElement, context: MountContext) {
  root = createRoot(container);
  root.render(<Main />);
  return () => {
    root?.unmount();
    root = undefined;
  };
}
