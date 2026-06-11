import {
  Badge,
  Button,
  FormError,
  FormField,
  Switch,
  TextField,
} from '@akamai/cds-components/react';
import { Alias, Spacing } from '@akamai/cds-tokens';
import { Alias as DarkThemeAlias } from '@akamai/cds-tokens/themes/dark';
import { Autocomplete, CloseIcon, Typography } from '@linode/ui';
import React from 'react';

import {
  formatConfigValue,
  isConfigBoolean,
  isConfigStringWithEnum,
  isTopLevelCategory,
} from './utilities';

import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type { ConfigValue } from '@linode/api-v4';

interface Props {
  configItem?: ConfigurationOption;
  errorText: string | undefined;
  onBlur?: () => void;
  onChange: (config: ConfigValue) => void;
  onRemove?: (label: string) => void;
}

export const DatabaseConfigurationItem = (props: Props) => {
  const { configItem, errorText, onBlur, onChange, onRemove } = props;
  const configLabel = configItem?.label || '';

  const renderInputField = () => {
    if (configItem && isConfigBoolean(configItem)) {
      return (
        <FormField>
          <Switch
            checked={Boolean(configItem.value)}
            onChange={(e) => onChange(e.detail)}
          >
            {formatConfigValue(String(configItem.value))}
          </Switch>
        </FormField>
      );
    }
    if (configItem && isConfigStringWithEnum(configItem)) {
      const options =
        configItem.enum?.map((option) => ({ label: option })) || [];
      const selectedValue = options.find(
        (option) => option.label === String(configItem.value)
      );
      return (
        <Autocomplete
          autoHighlight
          disableClearable
          disablePortal={false} // Portal must be enabled for the popper to open in a CDS Drawer
          errorText={errorText}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          label={''}
          onChange={(_, selected) => {
            onChange(selected?.label ?? '');
          }}
          options={options}
          placeholder="Select an option"
          value={selectedValue ?? options[0]}
        />
      );
    }
    if (
      (configItem?.type === 'number' || configItem?.type === 'integer') &&
      typeof configItem.value !== 'boolean'
    ) {
      return (
        <FormField
          error={Boolean(errorText)}
          labelPosition="top"
          onBlur={onBlur}
        >
          <TextField
            error={Boolean(errorText)}
            onChange={(e) => {
              const raw =
                (e.currentTarget as EventTarget & { value?: string })?.value ??
                '';
              if (raw === '') {
                onChange('');
              } else {
                const n = Number(raw);
                // Pass raw string for non-numeric input so Yup's typeError
                // fires with a clear message rather than receiving NaN.
                onChange(isNaN(n) ? raw : n);
              }
            }}
            placeholder={
              configItem.isNew ? String(configItem?.example ?? '') : ''
            }
            value={String(configItem.value ?? '')}
          />
          <FormError slot="error">{errorText}</FormError>
        </FormField>
      );
    }

    if (
      configItem?.type === 'string' ||
      (Array.isArray(configItem?.type) &&
        configItem?.type.includes('string') &&
        !configItem.enum)
    ) {
      return (
        <FormField
          error={Boolean(errorText)}
          labelPosition="top"
          onBlur={onBlur}
        >
          <TextField
            error={Boolean(errorText)}
            onChange={(e) =>
              onChange(
                (e.currentTarget as EventTarget & { value?: string })?.value ??
                  ''
              )
            }
            placeholder={String(configItem?.example ?? '')}
            value={configItem.value ? String(configItem.value) : ''}
          />
          <FormError slot="error">{errorText}</FormError>
        </FormField>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        alignItems: 'flex-start',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: Spacing.S12,
      }}
    >
      <div
        style={{
          background: `light-dark(${Alias.Background.Neutral}, ${DarkThemeAlias.Background.Neutral})`,
          padding: Spacing.S8,
          width: '100%',
        }}
      >
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Body.Bold,
            mr: 0.5,
          })}
        >
          {isTopLevelCategory(configItem?.category ?? '')
            ? configLabel
            : `${configItem?.category}.${configLabel}`}
        </Typography>
        {configItem?.requires_restart && (
          <Badge color="amber">RESTARTS SERVICE</Badge>
        )}
        {configItem?.description && (
          <Typography mt={0.5}>{configItem?.description}</Typography>
        )}
        {renderInputField()}
      </div>

      {configItem?.isNew && configItem && onRemove && (
        <Button
          onClick={() => onRemove(configItem?.label)}
          size="large"
          style={{ paddingLeft: 12, paddingRight: 12 }}
          variant="icon"
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
};
