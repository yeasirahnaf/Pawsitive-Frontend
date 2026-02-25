'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: { id: string; url: string; is_thumbnail: boolean }[];
    thumbnailUrl: string | null;
    petName: string;
}

export default function ImageGallery({ images, thumbnailUrl, petName }: ImageGalleryProps) {
    // Build a complete list of images, putting the thumbnail first if it exists
    const allImages = [...images];
    if (thumbnailUrl && !allImages.some(img => img.url === thumbnailUrl)) {
        allImages.unshift({ id: 'thumb', url: thumbnailUrl, is_thumbnail: true });
    }

    // Fallback to placeholder if no images exist
    const hasImages = allImages.length > 0;

    const [activeIndex, setActiveIndex] = useState(0);

    if (!hasImages) {
        return (
            <div className="aspect-square w-full rounded-2xl bg-base-200 flex items-center justify-center border border-base-300">
                <span className="text-6xl opacity-30">🐾</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full rounded-2xl bg-base-200 overflow-hidden border border-base-300">
                <Image
                    src={allImages[activeIndex].url}
                    alt={`${petName} image ${activeIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                />
            </div>

            {/* Thumbnails Strip */}
            {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
                    {allImages.map((img, idx) => (
                        <button
                            key={img.id || idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative h-20 w-20 shrink-0 rounded-xl overflow-hidden snap-start transition-all border-2 ${activeIndex === idx ? 'border-primary shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={img.url}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover bg-base-200"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
