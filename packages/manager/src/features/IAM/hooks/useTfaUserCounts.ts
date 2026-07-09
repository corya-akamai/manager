import { useAccountUsers, useGetTfaOptionalUsersQuery } from '@linode/queries';

interface UseTfaUserCountsResult {
  enforcedUsersCount: number;
  optionalUsersCount: number;
  totalUsers: number;
}

/**
 * Returns user counts relevant to the 2FA enforcement summary.
 * Both queries fetch only `page_size: 1` to retrieve the total count cheaply.
 *
 * @param isEnforced - Current form value of the enforcement toggle. When
 * `false`, `enforcedUsersCount` is 0 (reflects what will happen after save).
 */
export const useTfaUserCounts = (
  isEnforced: boolean
): UseTfaUserCountsResult => {
  const { data: allUsersData } = useAccountUsers({ params: { page_size: 1 } });
  const { data: tfaOptionalUsersData } = useGetTfaOptionalUsersQuery({
    page_size: 1,
  });

  const totalUsers = allUsersData?.results ?? 0;
  const optionalUsersCount = tfaOptionalUsersData?.results ?? 0;
  const enforcedUsersCount = isEnforced ? totalUsers - optionalUsersCount : 0;

  return { enforcedUsersCount, optionalUsersCount, totalUsers };
};
