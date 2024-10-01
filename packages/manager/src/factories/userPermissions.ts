
import { UserPermissions } from '@linode/api-v4/src/account/types';
import Factory from 'src/factories/factoryProxy';

export const userPermissionsfactory = Factory.Sync.makeFactory<UserPermissions>({
  account_access: [
    "accountLinodeAdmin",
    "linodeCreator",
    "firewallCreator"
  ],
  resource_access: [
    {
      resource_id: "L1000",
      resource_type: "linode",
      roles: [
        "linodeContributor"
      ]
    },
    {
      resource_id: "firewall_1000",
      resource_type: "firewall",
      roles: [
        "firewallAdmin"
      ]
    }
  ]
})