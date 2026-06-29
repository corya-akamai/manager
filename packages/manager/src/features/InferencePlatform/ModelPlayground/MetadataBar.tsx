import { Box, keyframes, Stack, Tooltip, useTheme } from '@linode/ui';
import { useInterval } from '@linode/utilities';
import Check from '@mui/icons-material/Check';
import Warning from '@mui/icons-material/Warning';
import React, { memo, useCallback, useState } from 'react';

import { pulse } from './animations';

import type { MessageMetadata } from './ModelPlaygroundContext';

interface MetadataBarProps {
  metadata?: MessageMetadata;
  startedAt: number;
  timeToFirstTokenMs?: number;
}

const statSlideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const MetadataBar = memo(
  ({ metadata, startedAt, timeToFirstTokenMs }: MetadataBarProps) => {
    const theme = useTheme();
    const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);
    const pending = !metadata;
    const cancelled = metadata?.cancelled ?? false;
    const complete = !pending && !cancelled;

    const tickElapsed = useCallback(
      () => setElapsed(Date.now() - startedAt),
      [startedAt]
    );

    useInterval({
      callback: tickElapsed,
      delay: 100,
      when: !metadata,
    });

    const ttft =
      timeToFirstTokenMs !== undefined
        ? `${(timeToFirstTokenMs / 1000).toFixed(2)}s`
        : null;
    const displayMs = metadata ? metadata.durationMs : elapsed;
    const decodeMs =
      metadata && timeToFirstTokenMs !== undefined
        ? metadata.durationMs - timeToFirstTokenMs
        : null;
    const tps =
      metadata?.completionTokens && decodeMs !== null && decodeMs > 0
        ? (metadata.completionTokens / (decodeMs / 1000)).toFixed(1)
        : null;

    const stats = [
      { label: 'TTFT', value: ttft },
      { label: 'Response Time', value: `${(displayMs / 1000).toFixed(1)}s` },
      { label: 'Tokens/s', value: tps },
      { label: 'In Tokens', value: metadata?.promptTokens?.toString() ?? null },
      {
        label: 'Out Tokens',
        value: metadata?.completionTokens?.toString() ?? null,
      },
    ];

    return (
      <Stack
        alignItems="center"
        direction="row"
        gap={2.5}
        sx={{
          bgcolor: complete
            ? theme.palette.mode === 'dark'
              ? theme.tokens.alias.Background.Recommendationsubtle
              : theme.tokens.color.Green[10]
            : 'transparent',
          border: complete
            ? 'none'
            : `1px solid ${theme.tokens.alias.Border.Normal}`,
          borderRadius: '8px',
          px: 1.5,
          py: 0.75,
        }}
      >
        {pending ? (
          <Box
            sx={{
              animation: `${pulse} 1.2s ease-out infinite`,
              bgcolor: 'text.disabled',
              borderRadius: '50%',
              flexShrink: 0,
              height: 11,
              width: 11,
            }}
          />
        ) : cancelled ? (
          <Tooltip title="Response was cancelled">
            <Warning
              sx={{
                color: theme.tokens.alias.Content.Icon.Warning,
                flexShrink: 0,
                fontSize: '16px',
              }}
            />
          </Tooltip>
        ) : (
          <Check
            sx={{
              color: theme.tokens.alias.Content.Icon.Recommendation,
              flexShrink: 0,
              fontSize: '16px',
            }}
          />
        )}
        <Stack
          alignItems="center"
          direction="row"
          gap={2}
          sx={{
            color: pending ? 'text.secondary' : 'text.primary',
            flex: 1,
            fontSize: theme.tokens.font.FontSize.Xs,
            justifyContent: 'flex-end',
          }}
        >
          {stats
            .filter(({ value }) => value !== null)
            .map(({ label, value }) => (
              <Box
                component="span"
                key={label}
                sx={{ animation: `${statSlideIn} 0.3s ease-in-out both` }}
              >
                <Box component="span" sx={{ font: theme.font.semibold }}>
                  {value}
                </Box>{' '}
                {label}
              </Box>
            ))}
        </Stack>
      </Stack>
    );
  }
);
