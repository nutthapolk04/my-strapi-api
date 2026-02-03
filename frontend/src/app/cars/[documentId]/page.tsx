
import Link from 'next/link';
import { fetchAPI, getStrapiMedia } from '@/lib/strapi';
import { notFound } from 'next/navigation';

async function getCar(documentId: string) {
    try {
        const data = await fetchAPI(`/cars/${documentId}`, { populate: '*' }, { cache: 'no-store' });
        return data.data;
    } catch (err) {
        return null;
    }
}

export default async function CarPage({ params }: { params: Promise<{ documentId: string }> }) {
    const { documentId } = await params;
    const car = await getCar(documentId);

    if (!car) {
        notFound();
    }

    const imageUrl = getStrapiMedia(car.CoverImage?.url);

    // Basic Helper to render rich text blocks
    const renderRichText = (blocks: any[]) => {
        return blocks.map((block, index) => {
            if (block.type === 'paragraph') {
                return (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {block.children.map((child: any) => child.text).join('')}
                    </p>
                );
            }
            if (block.type === 'heading') {
                const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
                return (
                    <Tag key={index} className="font-bold text-gray-900 mt-8 mb-4 text-2xl">
                        {block.children.map((child: any) => child.text).join('')}
                    </Tag>
                );
            }
            if (block.type === 'list') {
                const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
                return (
                    <ListTag key={index} className="list-disc pl-5 mb-4 text-gray-700">
                        {block.children.map((child: any, i: number) => (
                            <li key={i}>{child.children.map((c: any) => c.text).join('')}</li>
                        ))}
                    </ListTag>
                );
            }
            return null;
        });
    };

    return (
        <main className="min-h-screen bg-white pb-20 font-sans">
            {/* Hero Section */}
            <div className="relative h-[65vh] bg-gray-900 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={car.Name}
                        className="w-full h-full object-cover opacity-90"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-black uppercase">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

                <div className="absolute top-0 left-0 w-full p-6">
                    <Link href="/" className="inline-flex items-center px-4 py-2 rounded-full bg-black/30 text-white backdrop-blur hover:bg-white hover:text-black transition-all font-medium text-sm">
                        &larr; Back to Inventory
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-white uppercase bg-indigo-600 rounded-md shadow-lg">{car.Brand}</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">{car.Name}</h1>
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                            <span className="text-gray-300 text-sm font-semibold uppercase mr-3">Price</span>
                            <span className="text-3xl font-bold text-emerald-400">
                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(car.Price)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 py-20">
                <div className="bg-white">
                    <div className="flex items-baseline justify-between border-b border-gray-100 pb-8 mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">Vehicle Details</h2>
                        <span className="text-sm text-gray-500">Document ID: {car.documentId}</span>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="text-2xl text-gray-800 font-light leading-relaxed mb-10">{car.Description}</p>

                        <div className="rich-text-content">
                            {car.Details ? renderRichText(car.Details) : <p className="text-gray-400 italic">No detailed description available.</p>}
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col items-center">
                        <p className="text-gray-500 mb-6 text-center">Interested in this {car.Brand} {car.Name}?</p>
                        <button className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-12 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95">
                            Contact Dealer Now
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
