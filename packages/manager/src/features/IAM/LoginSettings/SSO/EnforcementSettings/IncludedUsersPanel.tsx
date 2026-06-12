import {
  Badge,
  FormError,
  FormField,
  FormLabel,
  TagInput,
} from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useAllAccountUsersQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { useDebouncedValue } from '@linode/utilities';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useBreakpoint } from 'src/features/IAM/hooks/useBreakpoint';
import { useDelegationRole } from 'src/features/IAM/hooks/useDelegationRole';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useTagInputCloseHandler } from 'src/features/IAM/hooks/useTagInputCloseHandler';
import {
  ERROR_STATE_TITLE,
  SSO_INCLUDED_USERS_DOCS_LINK,
} from 'src/features/IAM/Shared/constants';
import { Link } from 'src/features/IAM/Shared/Link/Link';

import type { EnforcementSettingsFormValues } from './EnforcementSettings';
import type { TagInputElement } from '@akamai/cds-components';

interface Props {
  includedUsers: string[] | undefined;
}

export const IncludedUsersPanel = ({ includedUsers }: Props) => {
  const isSmUp = useBreakpoint('up', 'sm');
  const { control, getValues, trigger, watch } =
    useFormContext<EnforcementSettingsFormValues>();

  // Watch SSO enabled/enforced states to conditionally update badge status`
  const isSSOEnabled = watch('ssoEnabled');
  const isSSOEnforced = watch('ssoEnforced');
  const excludedUsers = watch('excludedUsers');

  // Filter out delegate users from the included/excluded users if user is a child user
  const { isChildUserType } = useDelegationRole();

  // TODO:  CDS - UIE-11408 - replace after tag input supports passing in options directly
  // instead of using ref to set preselected options
  const tagInputNodeRef = React.useRef<null | TagInputElement<string>>(null);
  const tagInputRef = React.useCallback(
    (node: null | TagInputElement<string>) => {
      tagInputNodeRef.current = node;
      if (node && includedUsers && includedUsers.length > 0) {
        node.setValue(includedUsers);
      }
    },
    [includedUsers]
  );

  // TODO - CDS - UIE-11498 - replace after tag input handles it internally
  useTagInputCloseHandler(tagInputNodeRef);

  // TODO - CDS - UIE-11498 - replace after tag input handles it internally
  // When excludedUsers changes, we must: (1) update validFn on the Lit element directly so it
  // uses the latest excludedUsers, and (2) call setValue() instead of bare requestUpdate().
  // requestUpdate() alone does not change _tags, so Lit's updated() hook never fires _updateValidity(),
  // which means the element-level `invalid` attribute is never cleared. setValue() re-sets _tags,
  // triggering the full update lifecycle: _renderTag (tag highlighting) + _updateValidity (invalid attr).
  // Replace with a reactive @property({ attribute: false }) on validFn in TagInputElement
  // so that passing a new function reference from React is sufficient to re-evaluate.
  React.useLayoutEffect(() => {
    const node = tagInputNodeRef.current;
    if (node) {
      node.validFn = (item: string) => !excludedUsers.includes(item);
      try {
        node.setValue(getValues('includedUsers'));
      } catch {
        // ElementInternals.setFormValue is not supported in jsdom (test environment).
        // Fall back to requestUpdate() which re-renders tags via _renderTag.
        node.requestUpdate();
      }
    }
  }, [excludedUsers, getValues]);

  const { data: permissions } = usePermissions('account', ['view_user']);
  const [usernameInput, setUsernameInput] = React.useState<string>('');

  const debouncedUsernameInput = useDebouncedValue(usernameInput);

  const { error: searchError, filter } = getAPIFilterFromQuery(
    debouncedUsernameInput,
    {
      searchableFieldsWithoutOperator: ['username', 'email'],
    }
  );

  // TODO - CDS: UIE-11455: replace with useAccountUsersInfiniteQuery when tag input supports infinite loading
  const {
    data: users,
    error,
    isLoading,
  } = useAllAccountUsersQuery(permissions?.view_user, {
    ...filter,
    ...(isChildUserType
      ? {
          user_type: 'child',
        }
      : {}),
    '+order': 'asc',
    '+order_by': 'username',
  });

  const userOptions = React.useMemo(() => {
    return users?.map((user) => user.username);
  }, [users]);

  const tagInputValidFn = (item: string) => !excludedUsers.includes(item);

  return (
    <div>
      <div style={{ display: 'flex', gap: Spacing.S12 }}>
        <h2
          style={{
            marginTop: Spacing.S0,
            marginBottom: Spacing.S12,
            font: Typography.Heading.S,
          }}
        >
          Included users
        </h2>
        <Badge color={isSSOEnabled && !isSSOEnforced ? 'green' : 'neutral'}>
          {isSSOEnabled && !isSSOEnforced ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <p
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
        }}
      >
        Before enforcing SSO for all users, enable it for included users only to
        test the SSO login flow. With SSO enforced globally, this list doesn’t
        apply. <Link to={SSO_INCLUDED_USERS_DOCS_LINK}>Learn more.</Link>
      </p>
      <Controller
        control={control}
        name="includedUsers"
        render={({ field, fieldState }) => (
          <FormField
            error={Boolean(fieldState.error?.message)}
            labelPosition="top"
            style={{ padding: Spacing.S0 }}
          >
            <FormLabel
              slot="label"
              style={{
                textAlign: 'left',
                padding: Spacing.S0,
                marginBottom: Spacing.S8,
              }}
            >
              Included Users
            </FormLabel>
            <TagInput
              filterFn={() => true}
              isError={Boolean(searchError || error)}
              isLoading={isLoading}
              items={userOptions ?? []}
              loadingErrorLabel={searchError?.message || ERROR_STATE_TITLE}
              onChange={(e) => {
                field.onChange(e.detail);
                trigger(['includedUsers', 'excludedUsers']);
              }}
              onSearchChange={(e) => setUsernameInput(e.detail)}
              placeholder="Search by name or email or select from the list"
              ref={tagInputRef}
              restricted
              style={{
                width: isSmUp ? 560 : '100%',
                boxSizing: 'border-box',
              }}
              validFn={tagInputValidFn}
            />
            <FormError slot="error">{fieldState.error?.message}</FormError>
          </FormField>
        )}
        rules={{
          validate: (value) => {
            const excludedUsers = getValues('excludedUsers');
            const overlap = value.filter((user) =>
              excludedUsers.includes(user)
            );
            return (
              overlap.length === 0 ||
              `Users can't be included and excluded at the same time. Remove the highlighted users from either list.`
            );
          },
        }}
      />
    </div>
  );
};
