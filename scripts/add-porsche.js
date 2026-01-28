
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const fs = require('fs');
const mime = require('mime-types');

async function main() {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();

    try {
        const imagePath = '/Users/oatflower/.gemini/antigravity/brain/2b48a867-b8da-412d-a5cc-e76c4f97846c/porsche_911_gt3_1767778078843.png';
        const fileName = 'porsche_911_gt3.png';

        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image not found at ${imagePath}`);
        }

        const stats = fs.statSync(imagePath);
        const mimetype = mime.lookup(imagePath) || 'image/png';

        // Match specific structure required by Strapi Upload Service
        const fileData = {
            path: imagePath, // Standard fs path
            name: fileName,
            type: mimetype,
            size: stats.size,
            // IMPORTANT: In some versions, 'filepath' key is expected instead of or in addition to 'path'
            filepath: imagePath
        };

        console.log(`Uploading ${fileName}...`);

        const [uploadedImage] = await app.plugin('upload').service('upload').upload({
            data: {
                fileInfo: {
                    name: fileName,
                    caption: 'porsche_911',
                    alternativeText: 'porsche_911'
                }
            },
            files: fileData
        });

        if (!uploadedImage) {
            throw new Error('Failed to upload image');
        }
        console.log('Image uploaded with ID:', uploadedImage.id);

        console.log('Creating Porsche 911 entry...');
        const entry = await app.documents('api::car.car').create({
            data: {
                Name: 'Porsche 911 GT3 (992)',
                Brand: 'Porsche',
                Price: 18900000,
                Description: 'The 911 GT3 with Touring Package. The 4.0-liter high-revving naturally aspirated engine delivers 502 hp.',
                CoverImage: uploadedImage.id,
                Details: [
                    {
                        type: 'paragraph',
                        children: [
                            { type: 'text', text: 'Performance that speaks for itself. 0-100 km/h in 3.4 seconds.' }
                        ]
                    }
                ],
                publishedAt: new Date(),
            },
            status: 'published'
        });

        console.log('Successfully created car:', entry.Name);
        console.log('Document ID:', entry.documentId);

    } catch (error) {
        console.error('Error:', error);
    }

    await app.destroy();
    process.exit(0);
}

main();
