import Link from 'next/link';
import { getPets } from '@/services/pets';
import PetCard from '@/components/PetCard';
import SpeciesRow from '@/components/SpeciesRow';
import { Icon } from '@iconify/react';

// ── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '500+', label: 'Happy Families', icon: 'lucide:heart' },
  { value: '50+', label: 'Breeds Available', icon: 'lucide:paw-print' },
  { value: '5★', label: 'Customer Rating', icon: 'lucide:star' },
  { value: '24/7', label: 'Support', icon: 'lucide:headphones' },
];

const TESTIMONIALS = [
  {
    name: 'Rahima Khatun',
    location: 'Dhaka',
    text: 'Found the perfect golden retriever puppy. The whole process was smooth and the pup arrived healthy and happy!',
    avatar: '🧕',
  },
  {
    name: 'Arif Hossain',
    location: 'Chittagong',
    text: 'Pawsitive made it so easy to find an exotic parrot. Great communication from start to finish.',
    avatar: '👨‍💼',
  },
  {
    name: 'Nusrat Jahan',
    location: 'Sylhet',
    text: 'Bought a Persian cat and could not be happier. Highly recommend to anyone looking for a new companion.',
    avatar: '👩',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  let featuredPets: Awaited<ReturnType<typeof getPets>>['data'] = [];

  try {
    const res = await getPets({ per_page: 8, sort_by: 'created_at', sort_dir: 'desc' });
    featuredPets = res.data;
  } catch {
    // API not available during build — show empty gracefully
  }

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-base-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6 animate-fade-up">
            <span className="badge badge-primary badge-lg rounded-full px-4 py-2 font-medium w-fit">
              🐾 Bangladesh&apos;s Trusted Pet Shop
            </span>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight">
              Find Your <span className="text-primary">Perfect</span>
              <br />Pet Companion
            </h1>
            <p className="text-base-content/60 text-lg leading-relaxed max-w-md">
              Browse hundreds of healthy, well-cared-for pets from trusted breeders.
              Delivered safely to your door, across Bangladesh.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/pets" className="btn btn-primary btn-lg rounded-full gap-2">
                <Icon icon="lucide:search" width={18} /> Browse Pets
              </Link>
              <Link href="/track" className="btn btn-outline btn-lg rounded-full gap-2">
                <Icon icon="lucide:package" width={18} /> Track Order
              </Link>
            </div>

            {/* Mini trust pills */}
            <div className="flex flex-wrap gap-3 mt-2">
              {['COD Available', 'Safe Delivery', 'Verified Breeders'].map((t) => (
                <span key={t} className="flex items-center gap-1 text-sm text-base-content/50">
                  <Icon icon="lucide:check-circle" width={15} className="text-success" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative flex justify-center items-center">
            <div className="blob-bg w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
              <span className="text-[10rem] select-none">🐶</span>
            </div>

            {/* Floating cards */}
            <div className="absolute -bottom-4 -left-4 sm:left-4 card bg-base-100 shadow-xl p-3 flex flex-row items-center gap-3 rounded-2xl border border-base-300">
              <span className="text-2xl">🐱</span>
              <div>
                <p className="text-xs text-base-content/50">Available now</p>
                <p className="text-sm font-semibold">Persian Kitten</p>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 sm:right-4 card bg-primary text-primary-content shadow-xl p-3 flex flex-row items-center gap-3 rounded-2xl">
              <Icon icon="lucide:paw-print" width={20} />
              <div>
                <p className="text-xs opacity-80">New arrivals</p>
                <p className="text-sm font-bold">500+ Pets</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by Species ───────────────────────────────────────────────── */}
      <section className="bg-base-200 py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Shop by Pet</h2>
            <p className="text-base-content/50 mt-2">What kind of companion are you looking for?</p>
          </div>
          <SpeciesRow />
        </div>
      </section>

      {/* ── Featured Pets ─────────────────────────────────────────────────── */}
      <section className="bg-base-200 py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Pets</h2>
              <p className="text-base-content/50 mt-1">Our newest and most loved companions</p>
            </div>
            <Link href="/pets" className="btn btn-outline btn-sm rounded-full gap-1">
              View all <Icon icon="lucide:arrow-right" width={14} />
            </Link>
          </div>

          {featuredPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-base-content/40">
              <Icon icon="lucide:paw-print" width={48} className="mx-auto mb-4 opacity-30" />
              <p>No pets listed yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-neutral text-neutral-content py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="stats stats-vertical sm:stats-horizontal shadow-none bg-transparent w-full">
            {STATS.map(({ value, label, icon }) => (
              <div key={label} className="stat place-items-center">
                <div className="stat-figure text-primary">
                  <Icon icon={icon} width={32} />
                </div>
                <div className="stat-value text-white">{value}</div>
                <div className="stat-desc text-neutral-content/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-14 max-w-7xl mx-auto px-4 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>
          <p className="text-base-content/50 mt-2">Real stories from happy pet owners</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, location, text, avatar }) => (
            <div key={name} className="card bg-base-100 border border-base-300 card-hover">
              <div className="card-body gap-4">
                {/* Stars */}
                <div className="flex gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} icon="lucide:star" width={16} className="fill-current" />
                  ))}
                </div>
                <p className="text-sm text-base-content/70 leading-relaxed">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-base-300">
                  <div className="avatar placeholder">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center text-xl">
                      {avatar}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-base-content/40">{location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter CTA ────────────────────────────────────────────────── */}
      <section className="bg-primary py-14">
        <div className="max-w-2xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-primary-content">
            Get New Pet Alerts 🐾
          </h2>
          <p className="text-primary-content/80">
            Be the first to know when new pets arrive. No spam, just paws.
          </p>
          <div className="join w-full max-w-md shadow-lg">
            <input
              type="email"
              placeholder="your@email.com"
              className="input join-item flex-1 bg-white text-base-content"
            />
            <button className="btn join-item btn-neutral rounded-r-full">
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
