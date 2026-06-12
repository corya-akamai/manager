import { renderHook, waitFor } from '@testing-library/react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsIAMEnabled } from './useIsIAMEnabled';

import type { IAMFlagSet } from './useFlags';

const ACCOUNT_PERMISSIONS_URL =
  '*/v4beta/iam/users/mock-user/permissions/account';

const queryMocks = vi.hoisted(() => ({
  useUserAccountPermissions: vi
    .fn()
    .mockReturnValue(['cancel_account', 'create_user']),
  useProfile: vi
    .fn()
    .mockReturnValue({ data: { username: 'mock-user', restricted: true } }),
}));

const useFlagsMock = vi.hoisted(() => vi.fn(() => ({})));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useUserAccountPermissions: queryMocks.useUserAccountPermissions,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock(import('./useFlags'), () => ({
  useFlags: () => useFlagsMock(),
}));

const renderUseIsIAMEnabled = (flags: IAMFlagSet) => {
  useFlagsMock.mockReturnValue(flags);

  return renderHook(() => useIsIAMEnabled(), {
    wrapper: (ui) => wrapWithTheme(ui),
  });
};

describe('useIsIAMEnabled', () => {
  it('should be enabled for a BETA user', async () => {
    const accountPermissions = ['cancel_account', 'create_user'];
    server.use(
      http.get(ACCOUNT_PERMISSIONS_URL, () => {
        return HttpResponse.json(accountPermissions);
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: accountPermissions,
    });

    const { result } = renderUseIsIAMEnabled({
      iam: { beta: true, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isIAMEnabled).toBe(true);
    });
  });

  it('should enabled for a GA user', async () => {
    const accountPermissions = ['cancel_account', 'create_user'];
    server.use(
      http.get(ACCOUNT_PERMISSIONS_URL, () => {
        return HttpResponse.json(accountPermissions);
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: accountPermissions,
    });

    const { result } = renderUseIsIAMEnabled({
      iam: { beta: false, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isIAMEnabled).toBe(true);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(true);
    });
  });

  it('should be diabled for all users via a feature flag', async () => {
    const accountPermissions = ['cancel_account', 'create_user'];
    server.use(
      http.get(ACCOUNT_PERMISSIONS_URL, () => {
        return HttpResponse.json(accountPermissions);
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: accountPermissions,
    });

    const { result } = renderUseIsIAMEnabled({
      iam: { beta: false, enabled: false },
    });

    await waitFor(() => {
      expect(result.current.isIAMEnabled).toBe(false);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(false);
    });
  });

  it('should be diabled for a user via API', async () => {
    server.use(
      http.get(ACCOUNT_PERMISSIONS_URL, () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: null,
    });

    const { result } = renderUseIsIAMEnabled({
      iam: { beta: true, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isIAMEnabled).toBe(false);
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(true);
    });
  });
});
