'use client';
import MobileCarousel from './MobileCarousel';

const EverythingYouNeedSection = () => {
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

  return (
    <>
      {/* Laptop and above: Grid view */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {cards.map((card) => (
          <div key={card.title} className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
            <div className="w-12 h-12 bg-[#C19A4A] rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
                <path d={card.icon} />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
            <p className="text-gray-300 text-base leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Mobile and Tablet: Carousel view */}
      <div className="lg:hidden">
        <MobileCarousel />
      </div>
    </>
  );
};

export default EverythingYouNeedSection;
