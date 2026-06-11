import { Button } from '@akamai/cds-components/react';
import { Typography } from '@linode/ui';
import { styled } from '@mui/material';

import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
export const StyledPlansPanel = styled(PlansPanel, {
  label: 'StyledPlansPanel',
})(() => ({
  margin: 0,
  padding: 0,
}));

export const StyledCreateBtn = styled(Button, {
  label: 'StyledCreateBtn',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
  whiteSpace: 'nowrap',
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  marginLeft: theme.spacing(),
  marginRight: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    marginRight: 0,
    padding: theme.spacing(),
  },
}));

export const StyledSpan = styled('span', {
  label: 'StyledSpan',
})(({ theme }) => ({
  borderRight: `1px solid ${theme.borderColors.borderTypography}`,
  color: theme.textColors.tableStatic,
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));
