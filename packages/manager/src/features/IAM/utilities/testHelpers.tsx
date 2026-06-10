import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getShadowRootElement } from 'src/utilities/testHelpers';

export const expectNotificationBannerText = async (text: string) => {
  await waitFor(() => {
    const banners = Array.from(
      document.querySelectorAll<HTMLElement>('cds-notification-banner')
    );

    expect(
      banners.some((banner) =>
        (banner.shadowRoot?.textContent ?? '').includes(text)
      )
    ).toBe(true);
  });
};

/**
 * Returns the `cds-button` host element whose trimmed text content matches the
 * given label.
 */
export const getCdsButtonHostByText = (
  root: ParentNode,
  text: string
): HTMLElement | undefined =>
  Array.from(root.querySelectorAll<HTMLElement>('cds-button')).find(
    (button) => button.textContent?.trim() === text
  );

/**
 * Resolves the real `<button>` element inside the shadow DOM of the
 * `cds-button` whose text content matches the given label.
 */
export const getCdsButtonByText = async (
  root: ParentNode,
  text: string
): Promise<HTMLButtonElement | null> => {
  const host = getCdsButtonHostByText(root, text);
  if (!host) {
    return null;
  }
  return getShadowRootElement<HTMLButtonElement>(host, 'button');
};

/**
 * Resolves the real `<input>` element inside a `cds-text-field` shadow DOM.
 */
export const getCdsTextFieldInput = async (
  host: HTMLElement
): Promise<HTMLInputElement | null> => {
  return getShadowRootElement<HTMLInputElement>(host, 'input');
};

export const getCdsTooltipHostByText = (
  root: ParentNode,
  text: string
): HTMLElement | undefined =>
  Array.from(root.querySelectorAll<HTMLElement>('cds-tooltip')).find(
    (tooltip) => (tooltip as any).tooltipText === text
  );

export const openActionMenu = async () => {
  const menu = screen.getByTestId('user-action-menu');

  await waitFor(() => {
    expect(menu.shadowRoot?.querySelector('cds-icon')).toBeTruthy();
  });

  const trigger = menu.shadowRoot?.querySelector('cds-icon');
  await userEvent.click(trigger as HTMLElement);
};

// Helper to get the switch control inside a `cds-switch` host element.
export const getSwitchControl = (hostEl: HTMLElement) =>
  getShadowRootElement<HTMLButtonElement>(hostEl, 'button[role="switch"]');

/** `cds-table-row` host elements in the light DOM (Lit slotted children). */
export const getCdsTableRowHosts = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>('cds-table-row'));

/**
 * Resolves the rendered `.row` element inside each `cds-table-row` shadow DOM.
 * Prefer this over `getAllByRole('row')`, which does not pierce CDS shadow roots.
 */
export const getCdsTableRows = async (
  root: ParentNode
): Promise<HTMLElement[]> => {
  await waitFor(() => {
    expect(getCdsTableRowHosts(root).length).toBeGreaterThan(0);
  });

  const hosts = getCdsTableRowHosts(root);
  const rows = await Promise.all(
    hosts.map((host) => getShadowRootElement<HTMLElement>(host, '.row'))
  );

  return rows.filter((row): row is HTMLElement => row !== null);
};
