import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getShadowRootElement } from 'src/utilities/testHelpers';

/** jsdom does not implement scrollIntoView; CDS select calls it when opening. */
export const mockScrollIntoView = () => {
  Element.prototype.scrollIntoView ??= vi.fn();
};

export const changeCdsTextField = async (host: HTMLElement, value: string) => {
  const input = await getCdsTextFieldInput(host);

  if (!input) {
    throw new Error('cds-text-field input not found');
  }

  await act(async () => {
    fireEvent.input(input, { target: { value } });
    fireEvent.change(input, { target: { value } });

    host.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: value,
      })
    );
  });
};

export const changeCdsTextArea = async (host: HTMLElement, value: string) => {
  const textarea = await getShadowRootElement<HTMLTextAreaElement>(
    host,
    'textarea'
  );

  if (!textarea) {
    throw new Error('cds-text-area textarea not found');
  }

  await act(async () => {
    fireEvent.input(textarea, { target: { value } });
    fireEvent.change(textarea, { target: { value } });

    host.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: value,
      })
    );
  });
};

export const submitCdsDrawerForm = () => {
  const form =
    document.querySelector('cds-drawer form') ??
    document.querySelector('form[slot="body"]');

  if (!form) {
    throw new Error('drawer form not found');
  }

  fireEvent.submit(form);
};

export const expectCdsFormError = async (text: RegExp | string) => {
  await waitFor(() => {
    const errors = Array.from(
      document.querySelectorAll<HTMLElement>('cds-form-error')
    );

    expect(errors.length).toBeGreaterThan(0);

    expect(
      errors.some((error) => {
        const content =
          error.innerText ||
          Array.from(error.childNodes)
            .map((node) => node.textContent ?? '')
            .join('') ||
          error.textContent ||
          '';

        return typeof text === 'string'
          ? content.includes(text)
          : text.test(content);
      })
    ).toBe(true);
  });
};

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
