import { AccountResource } from '@linode/api-v4/src/account';
import Factory from 'src/factories/factoryProxy';

export const accountResourcesFactory = Factory.Sync.makeFactory<AccountResource>(
  [
    {
      resource_type: "linode",
      resources: [
        {
          name: "debian-us-123",
          id: "linode1234"
        }
      ]
    },
    {
      resource_type: "firewall",
      resources: [
        {
          name: "firewall-us-123",
          id: "firewall123"
        }
      ]
    }
  ]
);
