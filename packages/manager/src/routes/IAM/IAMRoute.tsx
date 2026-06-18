import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { DocumentTitleSegment } from 'src/features/IAM/Shared/DocumentTitleSegment/DocumentTitleSegment';
import styles from 'src/features/IAM/Shared/global.module.css';
import { SuspenseLoader } from 'src/features/IAM/Shared/SuspenseLoader/SuspenseLoader';

export const IAMRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <div className={styles.noMargin}>
        <DocumentTitleSegment segment="Identity and Access" />
        <ProductInformationBanner bannerLocation="Identity and Access" />
        <Outlet />
      </div>
    </React.Suspense>
  );
};
