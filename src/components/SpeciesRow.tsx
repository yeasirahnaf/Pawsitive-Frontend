import Link from 'next/link';

const SPECIES = [
    { slug: 'dog', label: 'Dogs', emoji: '🐶' },
    { slug: 'cat', label: 'Cats', emoji: '🐱' },
    { slug: 'bird', label: 'Birds', emoji: '🦜' },
    { slug: 'rabbit', label: 'Rabbits', emoji: '🐰' },
    { slug: 'fish', label: 'Fish', emoji: '🐠' },
    { slug: 'turtle', label: 'Turtles', emoji: '🐢' },
];

export default function SpeciesRow() {
    return (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {SPECIES.map(({ slug, label, emoji }) => (
                <Link
                    key={slug}
                    href={`/pets?species=${slug}`}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-base-200 border-2 border-transparent group-hover:border-primary group-hover:bg-primary/10 flex items-center justify-center text-3xl sm:text-4xl transition-all duration-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-1">
                        {emoji}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-base-content/70 group-hover:text-primary transition-colors">
                        {label}
                    </span>
                </Link>
            ))}
        </div>
    );
}
