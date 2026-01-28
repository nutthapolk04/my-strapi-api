import Link from 'next/link';
import { fetchAPI } from '@/lib/strapi';

interface Article {
    documentId: string;
    title: string;
    slug: string;
    description: string;
    publishedAt: string;
}

async function getArticles() {
    const data = await fetchAPI('/articles', {}, { cache: 'no-store' });
    return data.data;
}

export default async function BlogPage() {
    const articles = await getArticles();

    return (
        <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Latest Articles</h1>
                    <p className="text-lg text-gray-600">Explore our latest blog posts seeded from Strapi.</p>
                </header>

                <div className="space-y-8">
                    {articles.map((article: Article) => (
                        <div key={article.documentId} className="border-b border-gray-100 pb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                                {article.title}
                            </h2>
                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {article.description}
                            </p>
                            <div className="text-sm text-gray-400 mb-4">
                                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                            <Link
                                href={`/blog/${article.slug}`}
                                className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700"
                            >
                                Read More
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-12">
                    <Link href="/" className="text-gray-500 hover:text-gray-700 font-medium">
                        ← Back to Inventory
                    </Link>
                </div>
            </div>
        </main>
    );
}
