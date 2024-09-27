import { AccountPermissions } from '@linode/api-v4/src/account';
import Factory from 'src/factories/factoryProxy';

export const accountPermissionsFactory = Factory.Sync.makeFactory<AccountPermissions>({
  account_access: [
    {
      resource_type: "account",
      roles: [
        {
          name: "accountAdmin",
          description: "Access to perform any supported action on all resources in the account",
          permissions: [
            "createLinode",
            "updateLinode",
            "updateFirewall"
          ]
        }
      ]
    },
    {
      resource_type: "firewall",
      roles: [
        {
          name: "firewallCreator",
          description: "Access to create a firewall instance",
        }
      ]
    },
    {
      resource_type: "linode",
      roles: [
        {
          name: "accountLinodeAdmin",
          description: "Access to perform any supported action on all linode instances in the account",
          permissions: [
            "createLinode",
            "updateLinode",
            "deleteLinode"
          ]
        }
      ]
    }
  ],
  resource_access: [
    {
      resource_type: "linode",
      roles: [
        {
          name: "linodeContributor",
          description: "Access to update a linode instance",
          permissions: [
            "updateLinode",
            "viewLinode"
          ]
        }
      ]
    },
    {
      resource_type: "firewall",
      roles: [
        {
          name: "firewallViewer",
          description: "Access to view a firewall instance"
        },
        {
          name: "firewallAdmin",
          description: "Access to perform any supported action on a firewall instance"
        }
      ]
    }
  ]
});
