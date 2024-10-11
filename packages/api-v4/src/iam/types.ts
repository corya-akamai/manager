export interface UserPermissions {
  account_access: string[];
  resource_access: ResourceAccess[];
}

export interface ResourceAccess {
  resource_id: string;
  resource_type: string;
  roles: string[];
}

export interface AccountPermissions {
  account_access: Access[];
  resource_access: Access[];
}

interface Access {
  resource_type: string;
  roles: Roles[];
}

export interface Roles {
  name: string;
  description: string;
  permissions?: string[];
}

export type AccountResource = {
  resource_type: string;
  resources: Resource[];
}[];

export interface Resource {
  name: string;
  id: string;
}
