'use client';
import { useRouter } from 'next/navigation';

export default function MiniMeVideoSection() {
  const router = useRouter();
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <h2 className="text-2xl font-bold font-[Inter] text-center mb-4">
          Meet Mini Me — Your Personal Marketing Expert
        </h2>
        <p className="text-gray-300 text-center text-base mb-4">
          A domain-trained AI that learns your unique strategies, instincts, and decision-making.
          Your private consultant that thinks like a 10-year marketing veteran.
        </p>
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden mb-10">
          <div className="bg-[#151925] rounded-2xl overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              onContextMenu={(e) => e.preventDefault()}
              controlsList="nodownload"
              disablePictureInPicture
              className="w-full h-full"
            >
              <source src="/assets/ghonsi-home-motion/Minimechat.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="p-6">
          <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden">
            <button
              onClick={() => router.push('/professionals/mini-them')}
              className="w-full bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors"
            >
              Claim yours now
            </button>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-12 md:items-center">
        <div className="text-left">
          <h2 className="text-3xl lg:text-4xl font-bold font-[Inter] mb-6">
            Meet Mini Me — Your Personal Marketing Expert
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            A domain-trained AI that learns your unique strategies, instincts, and decision-making.
            Your private consultant that thinks like a 10-year marketing veteran.
          </p>
          <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors"
            >
              Claim yours now
            </button>
          </div>
        </div>

        <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden">
          <div className="bg-[#151925] rounded-2xl overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              onContextMenu={(e) => e.preventDefault()}
              controlsList="nodownload"
              disablePictureInPicture
              className="w-full h-full"
            >
              <source src="/assets/ghonsi-home-motion/Minimechat.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </>
  );
}
