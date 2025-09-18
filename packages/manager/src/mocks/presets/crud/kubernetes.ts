import {
  createKubernetesCluster,
  createKubernetesNodePools,
  deleteKubernetesCluster,
  deleteKubernetesNodePools,
  getKubernetesClusters,
  getKubernetesNodePools,
  getKubernetesVersions,
  updateKubernetesCluster,
  updateKubernetesNodePools,
} from 'src/mocks/presets/crud/handlers/kubernetes';

import type { MockPresetCrud } from '@linode/dev-tools/mocks';

export const kubernetesCrudPreset: MockPresetCrud = {
  group: { id: 'Kubernetes' },
  handlers: [
    createKubernetesCluster,
    createKubernetesNodePools,
    deleteKubernetesCluster,
    deleteKubernetesNodePools,
    getKubernetesClusters,
    getKubernetesNodePools,
    getKubernetesVersions,
    updateKubernetesCluster,
    updateKubernetesNodePools,
  ],
  id: 'kubernetes:crud',
  label: 'Kubernetes CRUD',
};
