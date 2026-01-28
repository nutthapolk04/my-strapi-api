export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'toset_admin_jwt_secret_12345'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'toset_api_token_salt_12345'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'toset_transfer_token_salt_12345'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
  },
});
