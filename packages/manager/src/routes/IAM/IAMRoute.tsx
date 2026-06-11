import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { DocumentTitleSegment } from 'src/features/IAM/Shared/DocumentTitleSegment/DocumentTitleSegment';
import { SuspenseLoader } from 'src/features/IAM/Shared/SuspenseLoader/SuspenseLoader';

export const IAMRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Identity and Access" />
      <ProductInformationBanner bannerLocation="Identity and Access" />
      <Outlet />
    </React.Suspense>
  );
};
