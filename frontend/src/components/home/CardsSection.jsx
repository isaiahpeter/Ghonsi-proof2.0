'use client';

import { useEffect, useRef, useState } from 'react';

// Stacked card images from the homepage
// Images live in public/assets/ghonsi-home-motion/
export default function CardsSection() {
  const imgRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [opacities, setOpacities] = useState([1, 1, 1, 1]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const newOpacities = imgRefs.map(ref => {
        if (!ref.current) return 1;
        
        const rect = ref.current.getBoundingClientRect();
        const fadeStart = windowHeight * 0.7;
        const fadeEnd = -100;
        
        if (rect.top < fadeStart && rect.top > fadeEnd) {
          return Math.max(0, Math.min(1, (rect.top - fadeEnd) / (fadeStart - fadeEnd)));
        }
        return rect.top >= fadeStart ? 1 : 0;
      });
      
      setOpacities(newOpacities);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cardMargin = isMobile ? -150 : -350;

  return (
    <div className="mb-8 w-screen md:w-auto md:mx-auto md:max-w-4xl -ml-5 md:ml-0" style={{ lineHeight: 0 }}>
      <img
        ref={imgRefs[0]}
        src="/assets/ghonsi-home-motion/cards-1.png"
        alt="Portfolio card 1"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', marginTop: 0, marginBottom: cardMargin, padding: 0, opacity: opacities[0], transition: 'opacity 0.1s ease-out' }}
      />
      <img
        ref={imgRefs[1]}
        src="/assets/ghonsi-home-motion/cards-2.png"
        alt="Portfolio card 2"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', marginBottom: cardMargin, padding: 0, opacity: opacities[1], transition: 'opacity 0.1s ease-out' }}
      />
      <img
        ref={imgRefs[2]}
        src="/assets/ghonsi-home-motion/cards-3.png"
        alt="Portfolio card 3"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', marginBottom: cardMargin, padding: 0, opacity: opacities[2], transition: 'opacity 0.1s ease-out' }}
      />
      <img
        ref={imgRefs[3]}
        src="/assets/ghonsi-home-motion/cards-4.png"
        alt="Portfolio card 4"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', padding: 0, opacity: opacities[3], transition: 'opacity 0.1s ease-out' }}
      />
    </div>
  );
}
