import * as React from 'react';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'tss-react/mui';
import { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';
import {
  gPay,
  initGooglePaymentInstance,
} from 'src/features/Billing/GooglePayProvider';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';
import Grid from '@mui/material/Unstable_Grid2';

const useStyles = makeStyles()(() => ({
  button: {
    border: 0,
    padding: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.7,
    },
  },
  disabled: {
    cursor: 'default',
    opacity: 0.3,
    '&:hover': {
      opacity: 0.3,
    },
  },
}));

interface Props {
  setMessage: (message: PaymentMessage) => void;
  setProcessing: (processing: boolean) => void;
  onClose: () => void;
  renderError: (errorMsg: string) => JSX.Element;
  disabled: boolean;
}

export const GooglePayChip = (props: Props) => {
  const {
    disabled: disabledDueToProcessing,
    setMessage,
    setProcessing,
    onClose,
    renderError,
  } = props;
  const { classes, cx } = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data, isLoading, error: clientTokenError } = useClientToken();
  const [initializationError, setInitializationError] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    const init = async () => {
      if (status === 'ready' && data) {
        const { error } = await initGooglePaymentInstance(
          data.client_token as string
        );
        if (error) {
          setInitializationError(true);
        }
      }
    };
    init();
  }, [status, data]);

  const handleMessage = (message: PaymentMessage) => {
    setMessage(message);
    if (message.variant === 'success') {
      onClose();
    }
  };

  const handlePay = () => {
    gPay(
      'add-recurring-payment',
      {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'USD',
        countryCode: 'US',
      },
      handleMessage,
      setProcessing
    );
  };

  if (status === 'error' || clientTokenError) {
    return renderError('Error loading Google Pay.');
  }

  if (initializationError) {
    return renderError('Error initializing Google Pay.');
  }

  if (isLoading) {
    return (
      <Grid>
        <CircleProgress mini />
      </Grid>
    );
  }

  return (
    <Grid>
      <button
        className={cx({
          [classes.button]: true,
          [classes.disabled]: disabledDueToProcessing,
        })}
        onClick={handlePay}
        disabled={disabledDueToProcessing}
        data-qa-button="gpayChip"
      >
        <GooglePayIcon width="49" height="26" />
      </button>
    </Grid>
  );
};

export default GooglePayChip;
