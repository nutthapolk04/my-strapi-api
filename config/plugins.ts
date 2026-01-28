export default ({ env }) => ({
    'users-permissions': {
        config: {
            jwtSecret: env('JWT_SECRET', 'toset_jwt_secret_12345'),
        },
    },
    'content-releases': {
        enabled: false,
    },
    'review-workflows': {
        enabled: false,
    },
});
