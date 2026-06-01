'use client';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function DiscoverabilityButton({ fullWidth = false }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/hirers/search')}
      className={`flex items-center gap-2 bg-transparent border-2 border-[#C19A4A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all duration-300 ${fullWidth ? 'w-full justify-center' : ''}`}
    >
      Explore Proofs
      <ArrowRight size={20} />
    </button>
  );
}
