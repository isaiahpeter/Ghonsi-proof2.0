'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
// Image: /assets/reviewers-image/stephen-eriki.png;

// Background Blobs Component
const BackgroundBlobs = () => {
  const blobsRef = useRef([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    blobsRef.current.forEach((blob, i) => {
      const duration = [6, 8, 10][i] || 7;
      gsap.to(blob, {
        scale: 1.12,
        opacity: 0.28,
        duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5
      });
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div ref={el => blobsRef.current[0] = el} className="absolute top-10 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" style={{ opacity: 0.18, scale: 1 }} />
      <div ref={el => blobsRef.current[1] = el} className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" style={{ opacity: 0.18, scale: 1 }} />
      <div ref={el => blobsRef.current[2] = el} className="absolute top-1/2 left-1/3 w-72 h-72 bg-coral-500/20 rounded-full blur-3xl" style={{ opacity: 0.18, scale: 1, backgroundColor: 'rgba(255, 127, 80, 0.2)' }} />
    </div>
  );
};

// Custom hook for card tilt effect
const useCardTilt = (cardRef) => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardRef.current) return;

    const card = cardRef.current;
    let quickRotateX, quickRotateY, quickY;

    const handleMouseEnter = () => {
      quickRotateX = gsap.quickTo(card, 'rotateX', { duration: 0.3, ease: 'power2.out' });
      quickRotateY = gsap.quickTo(card, 'rotateY', { duration: 0.3, ease: 'power2.out' });
      quickY = gsap.quickTo(card, 'y', { duration: 0.3, ease: 'power2.out' });
      quickY(-10);
    };

    const handleMouseMove = (e) => {
      if (!quickRotateX || !quickRotateY) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      quickRotateX(rotateX);
      quickRotateY(rotateY);
    };

    const handleMouseLeave = () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.5, ease: 'power2.out' });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cardRef]);
};

// Review Card Component
const ReviewCard = ({ review, index }) => {
  const cardRef = useRef(null);
  const avatarRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

  useCardTilt(cardRef);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCursorPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion || !avatarRef.current) return;
    gsap.to(avatarRef.current, { scale: 1.08, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion || !avatarRef.current) return;
    gsap.to(avatarRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 60, rotateX: 15, scale: 0.92 }}
      whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay: index * 0.12
      }}
      className={`bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]/30 relative overflow-hidden ${index % 2 === 1 ? 'mt-6' : ''}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight gradient */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${cursorPos.x}% ${cursorPos.y}%, rgba(193, 154, 74, 0.15) 0%, transparent 50%)`
        }}
      />

      <div className="relative z-10">
        {/* Avatar with glow ring */}
        <div className="flex items-center gap-4 mb-4">
          <div ref={avatarRef} className="relative">
            <div className="absolute inset-0 bg-[#C19A4A]/30 rounded-full blur-md" />
            <img 
              src={review.avatar} 
              alt={review.name}
              className="w-12 h-12 rounded-full relative z-10"
            />
          </div>
          <div>
            <h4 className="font-bold text-white" style={{ fontSize: '15px' }}>{review.name}</h4>
            <p className="text-gray-400 text-xs">{review.role}</p>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 10,
                delay: index * 0.12 + i * 0.05
              }}
            >
              <Star 
                size={16} 
                className={i < review.rating ? 'fill-[#C19A4A] text-[#C19A4A]' : 'text-gray-600'}
              />
            </motion.div>
          ))}
        </div>

        {/* Review text */}
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="text-[#C19A4A] text-2xl leading-none">"</span>
          {review.review}
          <span className="text-[#C19A4A] text-2xl leading-none">"</span>
        </p>
      </div>
    </motion.div>
  );
};

// Marquee Strip Component
const MarqueeStrip = ({ reviews }) => {
  const marqueeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !marqueeRef.current) return;

    const marquee = marqueeRef.current;
    const totalWidth = marquee.scrollWidth / 2;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(marquee, {
      x: -totalWidth,
      duration: 30,
      ease: 'none'
    });

    if (isPaused) {
      tl.pause();
    } else {
      tl.play();
    }

    return () => tl.kill();
  }, [isPaused]);

  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div 
      className="mt-12 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div ref={marqueeRef} className="flex gap-4 w-max">
        {duplicatedReviews.map((review, i) => (
          <div 
            key={`${review.id}-${i}`}
            className="flex items-center gap-3 bg-[#151925] rounded-full px-4 py-2 border border-[#C19A4A]/20 whitespace-nowrap"
          >
            <img src={review.avatar} alt={review.name} className="w-8 h-8 rounded-full" />
            <span className="text-white text-sm font-semibold">{review.name}</span>
            <span className="text-gray-400 text-xs">—</span>
            <span className="text-gray-300 text-xs max-w-xs truncate">{review.review.slice(0, 60)}...</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Reviews Component
const Reviews = () => {
  const reviewsData = [
    {
      id: 1,
      name: 'Stephen Eriki',
      avatar: '/assets/reviewers-image/stephen-eriki.png',
      role: 'Community Manager',
      rating: 5,
      review: 'Smooth. Every step was easy. I did not have to look for a guide. It is a good way to store your proof and work experience onchain in one place. Super easy and the user experience for me was clear and simple'
    },
    {
      id: 2,
      name: 'Anonymous',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chukwuemeka',
      role: '3D Animator',
      rating: 5,
      review: 'Creating a profile and uploading a proof was easy as it automatically fills the details based on the image uploaded.'
    },
    {
      id: 3,
      name: 'Anonymous',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
      role: 'Content Creator',
      rating: 4,
      review: 'Uploading a proof to TikTok or X usually needs a really stable internet connection, yet these platforms only showcase end results but not the process or the skills behind it. Also I upload my certificates, testimonials on google drive but then only I can view it, If someone asks for my proof of work, I will have to send them a link to my drive which can be susceptible to corruption. But all these changes with Ghonsi, I can upload all my credentials, testimonials and results. It was very easy to use even with low network coverage. I also feel reassured knowing that everything I upload to Ghonsi is visible to others and safely anchored to the blockchain. With Ghonsi, recruiters can easily find me and I don’t have to worry over sending my TikTok link which is unprofessional. Ghonsi gives you the professionalism and visibility you need.'
    }
  ];

  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !isInView || !titleRef.current) return;

    const text = titleRef.current.textContent;
    titleRef.current.innerHTML = '';
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      titleRef.current.appendChild(span);
    });

    gsap.to(titleRef.current.children, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.03,
      ease: 'power2.out',
      delay: 0.2
    });
  }, [isInView]);

  return (
    <div ref={sectionRef} className="mb-12 relative">
      <BackgroundBlobs />
      
      <div className="relative z-10">
        <h2 ref={titleRef} className="text-2xl md:text-3xl font-bold font-[Inter] text-center mb-4">
          What people are saying
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsData.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>

        <MarqueeStrip reviews={reviewsData} />
      </div>
    </div>
  );
};

export default Reviews;
