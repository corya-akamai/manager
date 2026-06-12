import React from 'react';

import { useObjectStorageBucket } from 'src/features/ObjectStorage/hooks/useObjectStorageBucket';

import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { useBucketDrawers } from './hooks/useBucketDrawers';
import { CreateBucketDrawer } from './OMC_CreateBucketDrawer';

export const BucketDrawerOutlet = () => {
  const { drawer, closeDrawer } = useBucketDrawers();

  const { bucket } = useObjectStorageBucket({
    regionId: drawer?.regionId ?? '',
    bucketName: drawer?.bucketName ?? '',
    enabled: Boolean(drawer?.regionId) && Boolean(drawer?.bucketName),
  });

  return (
    <>
      <CreateBucketDrawer
        isOpen={drawer?.type === 'create-bucket'}
        onClose={closeDrawer}
      />

      <BucketDetailsDrawer
        bucket={bucket}
        isOpen={drawer?.type === 'bucket-details'}
        onClose={closeDrawer}
      />
    </>
  );
};
