import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { InferencePlatformContext } from '../InferencePlatformContext';
import { ApiKeyDetailsDrawer } from './ApiKeyDetailsDrawer';

import type { ApiKey, InferenceModel } from '@linode/api-v4';

const mockModels: InferenceModel[] = [
  {
    capabilities: ['chat', 'completion'],
    description: 'Test model 1',
    id: 'model-1',
    label: 'Model 1',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: { id: 'test', name: 'Test' },
    regions: ['us-ord'],
    tags: [],
    type: 'text-generation',
    use_cases: [],
  },
  {
    capabilities: ['chat', 'completion'],
    description: 'Test model 2',
    id: 'model-2',
    label: 'Model 2',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: { id: 'test', name: 'Test' },
    regions: ['us-ord'],
    tags: [],
    type: 'text-generation',
    use_cases: [],
  },
  {
    capabilities: ['chat', 'completion'],
    description: 'Test model 3',
    id: 'model-3',
    label: 'Model 3',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: { id: 'test', name: 'Test' },
    regions: ['us-ord'],
    tags: [],
    type: 'text-generation',
    use_cases: [],
  },
];

const mockApiKey = apiKeyFactory.build({
  allowed_models: ['*'],
  description: 'Test description',
  id: 123,
  key_prefix: 'linf_abc',
  key_type: 'user',
  label: 'my-api-key',
  status: 'active',
});

interface TestProps {
  apiKey: ApiKey | null;
  onClose: () => void;
  onSave?: () => void;
  open: boolean;
}

const defaultProps: TestProps = {
  apiKey: mockApiKey,
  onClose: vi.fn(),
  onSave: vi.fn(),
  open: true,
};

const renderWithContext = (props: TestProps = defaultProps) => {
  return renderWithTheme(
    <InferencePlatformContext.Provider
      value={{ isModelsLoading: false, models: mockModels }}
    >
      <ApiKeyDetailsDrawer {...props} />
    </InferencePlatformContext.Provider>
  );
};

describe('ApiKeyDetailsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the drawer with key label in title', () => {
    const { getByRole } = renderWithContext();
    expect(getByRole('heading', { name: 'my-api-key Details' })).toBeVisible();
  });

  it('renders null when apiKey is null', () => {
    const { queryByRole } = renderWithContext({
      ...defaultProps,
      apiKey: null,
    });
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('displays the key ID', () => {
    const { getByText } = renderWithContext();
    expect(getByText('123')).toBeVisible();
  });

  it('displays the key prefix', () => {
    const { getByText } = renderWithContext();
    expect(getByText('linf_abc...')).toBeVisible();
  });

  it('displays the description', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Test description')).toBeVisible();
  });

  it('displays "No description" when description is empty', () => {
    const { getByText } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({ description: '' }),
    });
    expect(getByText('No description')).toBeVisible();
  });

  it('displays the status badge', () => {
    const { getByText } = renderWithContext();
    expect(getByText('active')).toBeVisible();
  });

  it('displays the KeyTypeBadge for playground keys', () => {
    const { getByText } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({ key_type: 'playground' }),
    });
    expect(getByText('Playground')).toBeVisible();
  });

  it('shows edit button for Name field on user keys', () => {
    const { getByRole } = renderWithContext();
    expect(getByRole('button', { name: 'Edit Name' })).toBeVisible();
  });

  it('shows edit button for Description field on user keys', () => {
    const { getByRole } = renderWithContext();
    expect(getByRole('button', { name: 'Edit Description' })).toBeVisible();
  });

  it('does not show edit buttons for playground keys', () => {
    const { queryByRole } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({ key_type: 'playground' }),
    });
    expect(
      queryByRole('button', { name: 'Edit Name' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Edit Description' })
    ).not.toBeInTheDocument();
  });

  it('shows Close button when there are no changes', () => {
    const { getByRole } = renderWithContext();
    expect(getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('calls onClose when Close button is clicked', async () => {
    const onClose = vi.fn();
    const { getByRole } = renderWithContext({
      ...defaultProps,
      onClose,
    });
    await userEvent.click(getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Usage 24h section', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Usage 24h')).toBeVisible();
  });

  it('displays Created and Updated labels', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Updated')).toBeVisible();
  });
});
