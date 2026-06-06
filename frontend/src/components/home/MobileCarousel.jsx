'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MobileCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    {
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z',
      title: 'Your Best Work Becomes Your Living Portfolio',
      desc: 'Every insight and campaign mini me helps you create is captured as a shareable proof that tells your story 24/7, even when you are off-line.',
    },
    {
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      title: 'Turn Every Project Into Deeper Expertise',
      desc: 'Run marketing assessments, test your instincts, get personalized skill gap analysis, and receive targeted lessons drawn from real campaigns and expert frameworks.',
    },
    {
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
      title: "Stop Guessing What You Don't Know",
      desc: "Mini-Me surfaces the gaps you didn't know existed, then fills them with curated lessons from real campaigns. Start mastering what actually moves the needle.",
    },
  ];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="mb-12">
      <div className="relative">
        {/* Card */}
        <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
          <div className="w-12 h-12 bg-[#C19A4A] rounded-lg flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
              <path d={cards[currentIndex].icon} />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">{cards[currentIndex].title}</h3>
          <p className="text-gray-300 text-base leading-relaxed">{cards[currentIndex].desc}</p>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-[#0B0F1B] rounded-full flex items-center justify-center hover:bg-[#C19A4A] transition-colors shadow-lg group"
          aria-label="Previous card"
        >
          <ChevronLeft size={20} className="text-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-[#0B0F1B] rounded-full flex items-center justify-center hover:bg-[#C19A4A] transition-colors shadow-lg group"
          aria-label="Next card"
        >
          <ChevronRight size={20} className="text-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-[#C19A4A]'
                : 'w-2 bg-gray-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileCarousel;
