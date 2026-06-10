export const ADD_BUTTON_MAX_TOOLTIP = 'You can add up to 10 certificates.';

export const MAX_CERTIFICATES_REACHED_ERROR =
  'The configuration can have up to 10 certificates. Delete an unused certificate to add a new one.';

export const ALL_CERTIFICATES_DELETED_ERROR =
  'IDP configuration requires at least one active certificate. ';

export const ATTRIBUTE_MAPPING_DESCRIPTION =
  'Select which element in the SAML assertion you want to use to identify the user.';

export const ATTRIBUTE_NAME_HELPER_TEXT =
  'The name needs to match the attribute key configured in your IDP.';

export const CREATE_SUCCESS = 'IDP configuration created successfully.';

export const IDENTITY_PROVIDER_DESCRIPTION =
  'Use the IDP metadata from your identity provider (IDP) to create the configuration.';

export const UPDATE_SUCCESS = 'IDP configuration updated successfully.';

export const SSO_REQUIRES_ACTIVE_CERTIFICATE =
  'SSO requires at least one active certificate. Add a new certificate to enable the deletion.';

export const SSO_EXPIRED_ENFORCED =
  "The certificate expired. SSO-enforced users can't log in until a new certificate is added.";

export const SSO_EXPIRING =
  'The certificate is about to expire. Add a new one to ensure continued operation of this SSO federation.';

export const SSO_CANNOT_DELETE_LAST_CERTIFICATE =
  "You can't delete the last certificate while SSO is enabled. Add a new certificate or disable the SSO.";

export const DELETE_PERMISSION_ERROR =
  'You do not have permission to delete certificates.';

export const VIEW_DETAILS_PERMISSION_ERROR =
  'You do not have permission to view certificate details.';

export const ADD_CERTIFICATE_PERMISSION_ERROR =
  'You do not have permission to add certificates.';

export const METADATA_HREF = 'https://login.linode.com/saml/sp/metadata';
