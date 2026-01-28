
const fix = async () => {
    const { createStrapi, compileStrapi } = require('@strapi/strapi');
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();

    try {
        const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
            where: { type: 'public' },
        });

        const controllers = ['article', 'car', 'category', 'author', 'global', 'about'];

        for (const controller of controllers) {
            const uid = `api::${controller}.${controller}`;
            console.log(`Setting permissions for ${controller}...`);
            const actions = ['find', 'findOne'];
            for (const action of actions) {
                const actionName = `${uid}.${action}`;
                const existing = await strapi.query('plugin::users-permissions.permission').findOne({
                    where: { action: actionName, role: publicRole.id },
                });

                if (!existing) {
                    await strapi.query('plugin::users-permissions.permission').create({
                        data: {
                            action: actionName,
                            role: publicRole.id,
                        },
                    });
                }
            }

            console.log(`Publishing all entries for ${controller}...`);
            // In Strapi v5, we use the document service
            const entries = await strapi.documents(uid).findMany({
                status: 'draft',
            });

            console.log(`Found ${entries.length} drafts for ${controller}`);

            for (const entry of entries) {
                try {
                    // Try publish method if it exists, otherwise use update
                    if (typeof strapi.documents(uid).publish === 'function') {
                        await strapi.documents(uid).publish({
                            documentId: entry.documentId,
                        });
                    } else {
                        await strapi.documents(uid).update({
                            documentId: entry.documentId,
                            data: { publishedAt: new Date() }
                        });
                    }
                } catch (e) {
                    console.error(`Failed to publish ${entry.documentId}: ${e.message}`);
                }
            }
        }

        console.log('All permissions fixed and content published!');
    } catch (err) {
        console.error(err);
    } finally {
        await app.destroy();
        process.exit(0);
    }
};

fix();
