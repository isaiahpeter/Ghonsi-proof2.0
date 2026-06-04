'use client';
import { useState, useEffect } from 'react';
import { Eye, Users, Lightbulb, Accessibility } from 'lucide-react';

const valuesData = [
  { icon: Eye, title: 'Transparency', desc: 'We keep every proof and every Mini Me action permanently true and verifiable' },
  { icon: Users, title: 'Accessibility', desc: 'Building tools that empower professionals and hirers at every stage.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Merging real human work with a personal AI agent to multiply impact while keeping trust at the core.' },
  { icon: Accessibility, title: 'Inclusion', desc: 'Creating lasting opportunities for professionals across domains and career stages.' },
];

export default function ValuesCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % valuesData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="values" className="py-16 px-5 text-center rounded-lg m-4 relative max-w-5xl mx-auto">
      <div>
        <h2 className="text-white text-3xl mb-4 font-[Inter] font-bold">Our Values</h2>
        <h2 className="text-white/70 mb-4 font-[Inter]">These guide everything we build</h2>
      </div>

      <div
        className="relative max-w-[25rem] mx-auto h-72 cursor-pointer mt-[-25px]"
        onClick={() => setActiveSlide((prev) => (prev + 1) % valuesData.length)}
        role="region"
        aria-label="Company values carousel"
      >
        {valuesData.map((value, index) => {
          const Icon = value.icon;
          return (
            <div
              key={value.title}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
                activeSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-6">
                <div className="bg-[#0B0F1B] rounded-2xl p-4 text-[#C19A4A]">
                  <Icon size={32} />
                </div>
              </div>
              <h3 className="text-white text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-gray-400 text-sm max-w-[300px]">{value.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Values navigation">
        {valuesData.map((value, i) => (
          <button
            key={value.title}
            onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              activeSlide === i ? 'bg-[#C19A4A] w-8' : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Show ${value.title} value`}
            aria-current={activeSlide === i ? 'true' : 'false'}
            role="tab"
          />
        ))}
      </div>
    </section>
  );
}
