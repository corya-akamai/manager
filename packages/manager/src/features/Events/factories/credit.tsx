import * as React from 'react';

import type { PartialEventMap } from '../types';
/** IAM RBAC - Initialization */
export const creditCard: PartialEventMap<'credit'> = {
  credit_card_updated: {
    notification: (e) => (
      <>
        Your credit card information has been <strong>updated</strong>.
      </>
    ),
  },
};
