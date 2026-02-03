const fs = require('fs');
const path = require('path');

const API_URL = 'https://my-strapi-api-0fz5.onrender.com/api';
const TOKEN = 'b7e43dec291c56b914d37f2e2509fdd2de789076d7ce83698d03d974490755f3ab78cf68e55035ed215c52b9032348bc8a0f3bc361f85dccf8dd679f3601a040b9facf688ea574da76682cfca9c5dcd6ddbc96dd192cf4e48917b5b2e17d357db95652c3c8fdc5a43fad647da485e6c4be12e58291be476bbf5d69017feb408c';

async function request(endpoint, method = 'GET', body = null, isUpload = false) {
    const headers = {
        'Authorization': `Bearer ${TOKEN}`,
    };
    if (!isUpload) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = isUpload ? body : JSON.stringify({ data: body });
    }

    const response = await fetch(`${isUpload ? 'https://my-strapi-api-0fz5.onrender.com' : API_URL}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) {
        console.error(`Error on ${endpoint}:`, data);
        throw new Error(data.error?.message || 'Request failed');
    }
    return data;
}

async function uploadFile(fileName) {
    const filePath = path.join(__dirname, '..', 'data', 'uploads', fileName);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return null;
    }

    const stats = fs.statSync(filePath);
    const formData = new FormData();

    // In Node.js environment with Fetch API, we can use Blob or a similar Buffer-based approach
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    formData.append('files', blob, fileName);

    console.log(`Uploading ${fileName}...`);
    const data = await request('/api/upload', 'POST', formData, true);
    return data[0];
}

async function main() {
    const { categories, authors, articles, global, about } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'data.json'), 'utf8'));

    // 1. Upload Media
    const mediaMap = {};
    const filesToUpload = [
        'coffee-art.jpg', 'coffee-beans.jpg', 'coffee-shadow.jpg',
        'daviddoe@strapi.io.jpg', 'sarahbaker@strapi.io.jpg',
        'default-image.png', 'favicon.png'
    ];

    for (const file of filesToUpload) {
        try {
            const uploaded = await uploadFile(file);
            if (uploaded) mediaMap[file] = uploaded.id;
        } catch (e) {
            console.error(`Failed to upload ${file}`);
        }
    }

    // 2. Categories
    const categoryMap = {};
    console.log('Seeding categories...');
    for (const cat of categories) {
        const created = await request('/categories', 'POST', cat);
        categoryMap[cat.name] = created.data.id;
    }

    // 3. Authors
    const authorMap = {};
    console.log('Seeding authors...');
    for (const author of authors) {
        const data = { ...author };
        if (author.avatar && mediaMap[author.avatar]) {
            data.avatar = mediaMap[author.avatar];
        }
        const created = await request('/authors', 'POST', data);
        authorMap[author.email] = created.data.id;
    }

    // 4. Articles
    console.log('Seeding articles...');
    for (const article of articles) {
        const data = { ...article };
        // Map category
        const catName = categories.find(c => c.id === article.category.id)?.name;
        if (catName) data.category = categoryMap[catName];

        // Map author
        const authorEmail = authors.find(a => a.id === article.author.id)?.email;
        if (authorEmail) data.author = authorMap[authorEmail];

        // Map blocks media
        if (data.blocks) {
            data.blocks = data.blocks.map(block => {
                if (block.__component === 'shared.media' && block.file) {
                    return { ...block, file: mediaMap[block.file] };
                }
                if (block.__component === 'shared.slider' && block.files) {
                    return { ...block, files: block.files.map(f => mediaMap[f]).filter(id => id) };
                }
                return block;
            });
        }

        // Add cover if exists
        const coverFile = `${article.slug}.jpg`;
        if (mediaMap[coverFile]) {
            data.cover = mediaMap[coverFile];
        } else if (mediaMap['coffee-art.jpg']) {
            data.cover = mediaMap['coffee-art.jpg']; // Fallback
        }

        data.publishedAt = new Date().toISOString();
        await request('/articles', 'POST', data);
    }

    // 5. Global & About
    console.log('Seeding Global and About...');
    if (global) {
        const globalData = { ...global };
        if (mediaMap['favicon.png']) globalData.favicon = mediaMap['favicon.png'];
        if (globalData.defaultSeo?.shareImage && mediaMap['default-image.png']) {
            globalData.defaultSeo.shareImage = mediaMap['default-image.png'];
        }
        globalData.publishedAt = new Date().toISOString();
        await request('/global', 'PUT', globalData);
    }

    if (about) {
        const aboutData = { ...about };
        if (aboutData.blocks) {
            aboutData.blocks = aboutData.blocks.map(block => {
                if (block.__component === 'shared.media' && block.file) {
                    return { ...block, file: mediaMap[block.file] };
                }
                return block;
            });
        }
        aboutData.publishedAt = new Date().toISOString();
        await request('/about', 'PUT', aboutData);
    }

    console.log('Seeding completed successfully!');
}

main().catch(console.error);
