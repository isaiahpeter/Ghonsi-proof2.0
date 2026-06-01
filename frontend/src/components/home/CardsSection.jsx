'use client';

// Stacked card images from the homepage
// Images live in public/assets/ghonsi-home-motion/
export default function CardsSection() {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <img
        src="/assets/ghonsi-home-motion/cards-1.png"
        alt="Portfolio card 1"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', marginTop: -65, padding: 0, verticalAlign: 'bottom' }}
      />
      <img
        src="/assets/ghonsi-home-motion/cards-2.png"
        alt="Portfolio card 2"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', marginTop: -180, padding: 0, verticalAlign: 'bottom' }}
      />
      <img
        src="/assets/ghonsi-home-motion/cards-3.png"
        alt="Portfolio card 3"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', marginTop: -180, padding: 0, verticalAlign: 'bottom' }}
      />
      <img
        src="/assets/ghonsi-home-motion/cards-4.png"
        alt="Portfolio card 4"
        className="w-full block"
        onContextMenu={(e) => e.preventDefault()}
        draggable="false"
        style={{ display: 'block', marginTop: -180, padding: 0, verticalAlign: 'bottom' }}
      />
    </div>
  );
}
