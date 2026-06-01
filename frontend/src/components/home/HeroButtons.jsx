'use client';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function HeroButtons() {
  const router = useRouter();
  return (
    <>
      <button
        onClick={() => router.push('/login')}
        className="w-full bg-[#C19A4A] text-[#0B0F1B] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors"
      >
        Start For Free
        <ArrowRight size={20} />
      </button>
      <button
        onClick={() => router.push('/hirers/search')}
        className="w-full bg-transparent border-2 border-white text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
      >
        Hire Smarter
      </button>
    </>
  );
}
