import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPet, getPets } from '@/services/pets';
import { Icon } from '@iconify/react';
import ImageGallery from '@/components/ImageGallery';
import AddToCartPanel from '@/components/AddToCartPanel';
import PetCard from '@/components/PetCard';

// ── Types & Meta ─────────────────────────────────────────────────────────────

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { id } = await params;
        const { data: pet } = await getPet(id);
        return {
            title: `${pet.name} – ${pet.breed} | Pawsitive`,
            description: `Meet ${pet.name}, a lovely ${pet.age_months} month old ${pet.breed}. Available now on Pawsitive.`,
        };
    } catch {
        return { title: 'Pet Not Found' };
    }
}

// ── Pet Detail Page ──────────────────────────────────────────────────────────

export default async function PetDetailPage({ params }: Props) {
    const { id } = await params;

    let pet: Awaited<ReturnType<typeof getPet>>['data'];
    let relatedPets: Awaited<ReturnType<typeof getPets>>['data'] = [];

    try {
        const res = await getPet(id);
        pet = res.data;

        // Fetch related pets (same species)
        const relRes = await getPets({ species: pet.species, per_page: 4 });
        relatedPets = relRes.data.filter((p) => p.id !== pet.id).slice(0, 4);

    } catch (error: any) {
        if (error.message?.includes('404')) return notFound();
        throw error;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 min-h-screen">

            {/* ── Breadcrumbs ── */}
            <div className="breadcrumbs text-sm text-base-content/50 mb-6">
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/pets">Shop</Link></li>
                    <li className="capitalize"><Link href={`/pets?species=${pet.species}`}>{pet.species}</Link></li>
                    <li className="text-base-content font-medium">{pet.name}</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

                {/* ── Left col: Image Gallery ── */}
                <section className="flex flex-col gap-4">
                    <ImageGallery
                        images={pet.images}
                        thumbnailUrl={pet.thumbnail_url}
                        petName={pet.name}
                    />
                </section>

                {/* ── Right col: Details & Actions ── */}
                <section className="flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-1 tracking-tight">{pet.name}</h1>
                            <p className="text-lg text-base-content/60 font-medium">{pet.breed}</p>
                        </div>
                        {/* Share button */}
                        <button className="btn btn-ghost btn-circle shrink-0" aria-label="Share">
                            <Icon icon="lucide:share-2" width={22} />
                        </button>
                    </div>

                    <p className="text-base-content/80 leading-relaxed mb-8">
                        {pet.description || `Meet ${pet.name}, a lovely ${pet.age_months}-month-old ${pet.breed}. Looking for a loving home.`}
                    </p>

                    {/* Key Attributes Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <AttrCard icon="lucide:calendar" label="Age" value={`${pet.age_months} Months`} />
                        <AttrCard
                            icon={pet.gender === 'male' ? 'lucide:mars' : 'lucide:venus'}
                            label="Gender"
                            value={<span className="capitalize">{pet.gender}</span>}
                        />
                        <AttrCard icon="lucide:palette" label="Color" value={<span className="capitalize">{pet.color || 'N/A'}</span>} />
                        <AttrCard icon="lucide:scale" label="Size" value={<span className="capitalize">{pet.size.replace('_', ' ')}</span>} />
                    </div>

                    <div className="divider" />

                    {/* Details Accordion */}
                    <div className="join join-vertical w-full -mx-4 sm:mx-0 px-4 sm:px-0">

                        {/* Behaviours */}
                        {pet.behaviours?.length > 0 && (
                            <div className="collapse collapse-arrow join-item border-b border-base-300 rounded-none bg-transparent">
                                <input type="checkbox" defaultChecked />
                                <div className="collapse-title text-lg font-semibold px-0">Personality & Behaviour</div>
                                <div className="collapse-content px-0">
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {pet.behaviours.map((b) => (
                                            <span key={b.id || b.behaviour} className="badge badge-lg badge-outline gap-1 border-primary/30 bg-primary/5">
                                                {b.behaviour}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Health Records */}
                        {pet.health_records && (
                            <div className="collapse collapse-arrow join-item border-b border-base-300 rounded-none bg-transparent">
                                <input type="checkbox" />
                                <div className="collapse-title text-lg font-semibold px-0">Health Records</div>
                                <div className="collapse-content px-0">
                                    <p className="pt-2 text-base-content/80 whitespace-pre-wrap">{pet.health_records}</p>
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        {pet.location_name && (
                            <div className="collapse collapse-arrow join-item border-b border-base-300 rounded-none bg-transparent">
                                <input type="checkbox" defaultChecked />
                                <div className="collapse-title text-lg font-semibold px-0">Location</div>
                                <div className="collapse-content px-0">
                                    <div className="flex items-start gap-3 pt-2">
                                        <div className="bg-error/10 text-error p-2 rounded-full">
                                            <Icon icon="lucide:map-pin" width={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{pet.location_name}</p>
                                            <p className="text-sm text-base-content/50">Shipping available across BD</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="flex-1" /> {/* Spacer */}

                    {/* Floating/Sticky Cart Panel */}
                    <AddToCartPanel pet={pet} />

                </section>
            </div>

            {/* ── Related Pets ── */}
            {relatedPets.length > 0 && (
                <section className="mt-20 pt-10 border-t border-base-300">
                    <h2 className="text-2xl font-bold mb-6">More <span className="capitalize">{pet.species}s</span> You May Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {relatedPets.map(p => (
                            <PetCard key={p.id} pet={p} />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}

// ── Small UI Helper ──────────────────────────────────────────────────────────

function AttrCard({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
    return (
        <div className="bg-base-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
            <Icon icon={icon} width={24} className="text-primary/70" />
            <div>
                <p className="text-xs text-base-content/50 uppercase tracking-widest font-semibold">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}
