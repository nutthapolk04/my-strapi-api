const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function main() {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    app.log.level = 'error';

    const count = await strapi.documents('api::car.car').count();
    console.log(`Total Cars in DB: ${count}`);

    const cars = await strapi.documents('api::car.car').findMany({
        status: 'draft', // Get drafts too to be sure
    });

    console.log('Cars found:', JSON.stringify(cars.map(c => ({
        id: c.documentId,
        name: c.Name,
        publishedAt: c.publishedAt
    })), null, 2));

    await app.destroy();
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
