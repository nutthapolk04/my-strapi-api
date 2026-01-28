const { createStrapi, compileStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

async function uploadFile(fileName) {
    const filePath = path.join('data', 'uploads', fileName);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return null;
    }

    const stats = fs.statSync(filePath);
    const name = path.parse(fileName).name;

    // Check if file already exists to avoid duplicates
    const existingFiles = await strapi.plugin('upload').service('upload').findMany({
        filters: { name: fileName }
    });

    if (existingFiles.length > 0) {
        console.log(`File matched in DB: ${fileName}, reusing...`);
        return existingFiles[0];
    }

    // Determine mime type
    const mimetype = mime.lookup(filePath) || 'application/octet-stream';

    const fileData = {
        filepath: filePath,
        originalFileName: fileName,
        mimetype: mimetype,
        size: stats.size,
    };

    const [file] = await strapi.plugin('upload').service('upload').upload({
        files: fileData,
        data: {
            fileInfo: {
                name: fileName,
                caption: name,
                alternativeText: name,
            },
        },
    });

    return file;
}

async function seedCars() {
    console.log('Seeding cars...');

    // Clear existing cars to ensure clean state
    const existingCars = await strapi.documents('api::car.car').findMany();
    if (existingCars.length > 0) {
        console.log(`Found ${existingCars.length} existing cars, deleting...`);
        for (const car of existingCars) {
            await strapi.documents('api::car.car').delete({ documentId: car.documentId });
        }
    }

    const cars = [
        {
            Name: 'Toyota Camry',
            Brand: 'Toyota',
            Price: 1500000,
            Description: 'Reliable family sedan.',
            ImageFile: 'toyota.png',
            Details: [
                {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'The Toyota Camry is known for its reliability and comfort. Perfect for city driving and long road trips.' }]
                }
            ]
        },
        {
            Name: 'Honda CR-V',
            Brand: 'Honda',
            Price: 1700000,
            Description: 'Versatile SUV.',
            ImageFile: 'honda.png',
            Details: [
                {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'The Honda CR-V offers spacious interior and advanced safety features, making it an ideal family SUV.' }]
                }
            ]
        },
        {
            Name: 'Tesla Model 3',
            Brand: 'Tesla',
            Price: 1800000,
            Description: 'Electric performance.',
            ImageFile: 'tesla.png',
            Details: [
                {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Experience the future of driving with the Tesla Model 3. Creating zero emissions without compromising on performance.' }]
                }
            ]
        }
    ];

    for (const car of cars) {
        try {
            let coverImageId = null;
            if (car.ImageFile) {
                console.log(`Processing image for ${car.Name}...`);
                const uploadedFile = await uploadFile(car.ImageFile);
                if (uploadedFile) {
                    coverImageId = uploadedFile.id;
                }
            }

            await strapi.documents('api::car.car').create({
                data: {
                    Name: car.Name,
                    Brand: car.Brand,
                    Price: car.Price,
                    Description: car.Description,
                    CoverImage: coverImageId,
                    Details: car.Details,
                },
                status: 'published'
            });
            console.log(`Created and published car: ${car.Name}`);
        } catch (e) {
            console.error(`Failed to create car: ${car.Name}`, e);
        }
    }
}

async function main() {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    app.log.level = 'error';

    await seedCars();

    await app.destroy();
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
