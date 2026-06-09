import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  expectNotificationBannerText,
  getCdsButtonByText,
} from 'src/features/IAM/utilities/testHelpers';
import {
  getShadowRootElement,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { AddCertificateDrawer } from './AddCertificateDrawer';

const mocks = vi.hoisted(() => ({
  enqueueSnackbar: vi.fn(),
  mutateAsync: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');

  return {
    ...actual,
    useCreateIdpCertificateMutation: vi.fn(() => ({
      mutateAsync: mocks.mutateAsync,
    })),
  };
});

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');

  return {
    ...actual,
    useSnackbar: vi.fn(() => ({
      enqueueSnackbar: mocks.enqueueSnackbar,
    })),
  };
});

const getTextArea = () =>
  // eslint-disable-next-line testing-library/no-node-access
  document.body.querySelector('cds-text-area') as HTMLElement | null;

const changeTextAreaValue = async (value: string) => {
  const host = getTextArea();
  if (!host) throw new Error('cds-text-area host not found');

  const inner = await getShadowRootElement<HTMLTextAreaElement>(
    host,
    'textarea'
  );

  if (!inner) throw new Error('inner textarea not found inside cds-text-area');

  await userEvent.type(inner, value);
};

describe('AddCertificateDrawer', () => {
  const onClose = vi.fn();

  const props = {
    idpConfigId: 'test-idp-config-id',
    onClose,
    open: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutateAsync.mockResolvedValue({});
  });

  it('renders drawer content', () => {
    renderWithTheme(<AddCertificateDrawer {...props} />);

    expect(screen.getByTestId('drawer-title')).toHaveTextContent(
      'Add Certificate'
    );
    expect(
      screen.getByText('Enter a SAML certificate for the IDP configuration.')
    ).toBeVisible();
    expect(screen.getByText('SAML Public Certificate')).toBeVisible();
    expect(getTextArea()).toBeInTheDocument();
  });

  it('creates certificate and closes drawer on successful submit', async () => {
    renderWithTheme(<AddCertificateDrawer {...props} />);

    // wait for cds-text-area host to be present before dispatching change
    await waitFor(() => {
      expect(getTextArea()).toBeInTheDocument();
    });

    await changeTextAreaValue('test-certificate');

    const addButton = await getCdsButtonByText(
      document.body,
      'Add Certificate'
    );

    await waitFor(() => {
      expect(addButton).toBeEnabled();
    });

    await userEvent.click(addButton as HTMLElement);

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        certificate: 'test-certificate',
      });
    });

    expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
      'Certificate added successfully.',
      { variant: 'success' }
    );

    expect(onClose).toHaveBeenCalled();
  });

  it('renders API error banner when create certificate request fails', async () => {
    mocks.mutateAsync.mockRejectedValue([
      {
        reason: 'Certificate is not valid.',
      },
    ]);

    renderWithTheme(<AddCertificateDrawer {...props} />);

    // wait for cds-text-area host to be present
    await waitFor(() => {
      expect(getTextArea()).toBeInTheDocument();
    });

    await changeTextAreaValue('invalid-cert');

    const addButton = await getCdsButtonByText(
      document.body,
      'Add Certificate'
    );

    await waitFor(() => {
      expect(addButton).toBeEnabled();
    });

    await userEvent.click(addButton as HTMLElement);

    // Error from API is surfaced in a notification banner
    await expectNotificationBannerText('Certificate is not valid.');
    expect(onClose).not.toHaveBeenCalled();
  });
});
