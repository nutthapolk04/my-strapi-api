const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function setPermissions() {
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
    });

    if (!publicRole) {
        console.error('Public role not found');
        return;
    }

    const actions = ['api::car.car.find', 'api::car.car.findOne'];

    for (const action of actions) {
        const existing = await strapi.query('plugin::users-permissions.permission').findOne({
            where: {
                action,
                role: publicRole.id,
            },
        });

        if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
                data: {
                    action,
                    role: publicRole.id,
                },
            });
            console.log(`Enabled permission: ${action}`);
        } else {
            console.log(`Permission already enabled: ${action}`);
        }
    }
}

async function main() {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    app.log.level = 'error';

    await setPermissions();

    await app.destroy();
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
