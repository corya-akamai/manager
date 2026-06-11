import { Spacing } from '@akamai/cds-tokens';
import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import LogoWhite from 'src/assets/icons/db-logo-white.svg';
import Logo from 'src/assets/icons/db-logo.svg';

import type { SxProps, Theme } from '@mui/material/styles';

interface Props {
  sx?: SxProps<Theme>;
}

export const DatabaseLogo = ({ sx }: Props) => {
  const theme = useTheme();

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', margin: Spacing.S20 }}
    >
      <Typography sx={{ display: 'inline-block', textAlign: 'center' }}>
        <Typography
          component="span"
          sx={{
            color: theme.palette.mode === 'light' ? theme.color.headline : '',
            display: 'flex',
          }}
        >
          Powered by &nbsp;
          {theme.palette.mode === 'light' ? <Logo /> : <LogoWhite />}
        </Typography>
      </Typography>
    </div>
  );
};

export default DatabaseLogo;
