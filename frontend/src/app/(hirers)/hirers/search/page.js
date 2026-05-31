'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';;
import { Search, Menu, X, Sparkles, ArrowRight, Bell, Wallet, MapPin, Building2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { logout } from '@/utils/supabaseAuth';
import { getUnreadCount } from '@/utils/messagesApi';
import { useWallet } from '@/hooks/useWallet';
import { fetchProfiles } from '@/utils/profileApi';
import { PROFESSION_CATEGORIES } from './CATEGORY_FILTERS';
import { generateInitialsAvatar, generateDefaultAvatar } from '@/utils/avatarUtils';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
// Image moved to public: /assets/ghonsi-proof-logos/transparent-png-logo/4.png;

// ─── Static search data ────────────────────────────────────────────────────────
const STATIC_DATA = [
  { id: 's1', type: 'People', name: 'Dev B', title: 'Motion Designer', description: 'Passionate Web3 developer with 5+ years of experience building decentralized applications on Solana. Specialized in DeFi protocols, smart contract security, and full-stack dApp development.', location: 'Lagos, Lagos State, Nigeria', avatar: generateDefaultAvatar() },
  { id: 's2', type: 'People', name: 'Sarah Chen', title: 'Frontend Developer', description: 'Expert React and Vue.js developer specializing in Web3 interfaces. Built responsive dApps for major DeFi protocols with focus on user experience and accessibility.', location: 'San Francisco, California, USA', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah1' },
  { id: 's3', type: 'People', name: 'Marcus Johnson', title: 'Smart Contract Developer', description: 'Solidity and Rust expert with 4+ years auditing and developing secure smart contracts. Specialized in DeFi protocols, NFT marketplaces, and DAO governance systems.', location: 'London, United Kingdom', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus1' },
  { id: 's4', type: 'People', name: 'Aisha Okonkwo', title: 'UI/UX Designer', description: 'Creative designer focused on Web3 user experiences. Designed interfaces for crypto wallets, NFT platforms, and DeFi dashboards. Expert in Figma and user research.', location: 'Abuja, Nigeria', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha1' },
  { id: 's5', type: 'People', name: 'Raj Patel', title: 'Backend Developer', description: 'Full-stack blockchain engineer specializing in Node.js, Python, and Rust. Built scalable APIs for Web3 applications, indexing services, and off-chain data solutions.', location: 'Mumbai, Maharashtra, India', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj1' },
  { id: 's6', type: 'People', name: 'Elena Rodriguez', title: 'Blockchain Architect', description: 'Senior architect designing scalable blockchain solutions. Led development of cross-chain bridges, Layer 2 solutions, and enterprise blockchain implementations.', location: 'Barcelona, Spain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena1' },
  { id: 's7', type: 'People', name: 'Kevin Wu', title: 'DevOps Engineer', description: 'Infrastructure specialist for blockchain projects. Manages node deployments, CI/CD pipelines, and monitoring systems for Web3 applications.', location: 'Singapore', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin1' },
  { id: 's8', type: 'People', name: 'Fatima Al-Rashid', title: 'Security Auditor', description: 'Blockchain security expert conducting smart contract audits and penetration testing. Identified critical vulnerabilities in major DeFi protocols.', location: 'Dubai, UAE', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima1' },
  { id: 's9', type: 'People', name: 'Tom Anderson', title: 'Product Manager', description: 'Web3 product leader with track record of launching successful DeFi and NFT products. Bridges technical and business teams to deliver user-centric blockchain solutions.', location: 'Austin, Texas, USA', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom1' },
  { id: 's10', type: 'People', name: 'Yuki Tanaka', title: 'Game Developer', description: 'Unity and Unreal Engine developer creating blockchain-based games. Integrated NFTs, play-to-earn mechanics, and Web3 wallets into immersive gaming experiences.', location: 'Tokyo, Japan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki1' },
  { id: 's11', type: 'Companies', name: 'Solana Labs', title: 'Blockchain Infrastructure', description: 'Leading blockchain company building high-performance infrastructure for decentralized applications. Developing tools, SDKs, and protocols for the Solana ecosystem.', location: 'San Francisco, California, USA', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SolanaLabs' },
  { id: 's12', type: 'Companies', name: 'MetaPlex Studios', title: 'NFT Platform', description: 'Premier NFT infrastructure provider on Solana. Building tools and standards for creators, artists, and developers to launch NFT projects.', location: 'Remote', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MetaPlex' },
  { id: 's13', type: 'Companies', name: 'Serum DEX', title: 'Decentralized Exchange', description: 'High-speed decentralized exchange built on Solana. Providing on-chain order books and cross-chain trading capabilities.', location: 'Global', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Serum' },
  { id: 's14', type: 'Companies', name: 'Magic Eden', title: 'NFT Marketplace', description: 'Leading NFT marketplace for Solana. Connecting creators and collectors with innovative features and community-driven approach.', location: 'Austin, Texas, USA', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MagicEden' },
  { id: 's15', type: 'Locations', name: 'Lagos, Nigeria', title: 'Tech Hub', description: 'Emerging Web3 hub in Africa with growing blockchain community. Home to numerous crypto startups and talented developers.', location: 'Lagos, Nigeria', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Lagos' },
  { id: 's16', type: 'Locations', name: 'San Francisco, USA', title: 'Crypto Capital', description: 'Global center for blockchain innovation and venture capital. Headquarters for major crypto companies and Web3 projects.', location: 'San Francisco, California, USA', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SF' },
  { id: 's17', type: 'Locations', name: 'Singapore', title: 'Crypto-Friendly Hub', description: 'Asia-Pacific blockchain hub with supportive regulations. Major destination for crypto exchanges and DeFi projects.', location: 'Singapore', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Singapore' },
];

const SUGGESTIONS = [
  { id: 'sg1', name: 'EHO', title: 'Web3 Finance Analyst', description: 'Passionate Web3 developer with 5+ years building decentralized apps on Solana. Specialized in DeFi protocols and smart contract security.', location: 'Lagos, Lagos State, Nigeria', avatar: generateDefaultAvatar() },
  { id: 'sg2', name: 'Carlos Martinez', title: 'Solana Developer', description: 'Rust and Anchor framework specialist building high-performance dApps on Solana. Created NFT marketplaces, DeFi protocols, and gaming platforms.', location: 'Mexico City, Mexico', avatar: generateDefaultAvatar() },
  { id: 'sg3', name: 'Priya Sharma', title: 'Data Analyst', description: 'Blockchain data specialist analyzing on-chain metrics and user behavior. Creates dashboards and reports for DeFi protocols using Dune Analytics.', location: 'Bangalore, Karnataka, India', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya1' },
  { id: 'sg4', name: 'James Wilson', title: 'Community Manager', description: 'Web3 community builder with proven track record growing engaged communities. Manages Discord servers, Twitter campaigns, and ambassador programs.', location: 'Toronto, Ontario, Canada', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James1' },
  { id: 'sg5', name: 'Amara Nwosu', title: 'Content Writer', description: 'Technical writer specializing in blockchain and cryptocurrency content. Creates documentation, whitepapers, blog posts, and educational materials.', location: 'Port Harcourt, Rivers State, Nigeria', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara1' },
  { id: 'sg6', name: 'Li Wei', title: 'Mobile Developer', description: 'React Native and Flutter developer building mobile-first Web3 applications. Integrated wallet connections and biometric authentication for crypto apps.', location: 'Shanghai, China', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiWei1' },
];

const TYPE_ICON = { People: Users, Companies: Building2, Locations: MapPin };

// ─── Search Overlay ────────────────────────────────────────────────────────────
// FIX #1: Removed the useEffect that synced `initialQuery` into state synchronously.
// Instead, `SearchOverlay` is rendered with a `key` prop (see Home's JSX) that
// causes React to remount the component whenever the overlay opens or its initial
// query changes. This means `useState(initialQuery || '')` always starts fresh
// with the correct value — no effect needed, no cascading render.
function SearchOverlay({ isOpen, onClose, initialQuery, liveProfiles }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [activeFilters, setActiveFilters] = useState(['All']);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  const allData = useMemo(() => {
    const profileItems = liveProfiles.map((p) => ({
      id: `live-${p.id}`,
      type: 'People',
      name: p.name,
      title: p.role,
      description: p.bio,
      location: p.location,
      avatar: p.img || generateDefaultAvatar(),
      userId: p.userId,
    }));
    // Return only live profiles, no static mock data
    return profileItems;
  }, [liveProfiles]);

  // Auto-focus when overlay opens (no setState here, only DOM side-effect)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleFilter = (filter) => {
    setShowAll(false);
    if (filter === 'All') {
      setActiveFilters(['All']);
      return;
    }
    setActiveFilters((prev) => {
      const next = prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev.filter((f) => f !== 'All'), filter];
      return next.length === 0 ? ['All'] : next;
    });
  };

  const filteredByTab = activeFilters.includes('All')
    ? allData
    : allData.filter((item) => activeFilters.includes(item.type));

  const searchResults = filteredByTab.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q)
    );
  });

  const MAX_INITIAL = 5;
  const displayedResults = showAll
    ? searchResults
    : searchResults.slice(0, MAX_INITIAL);
  const isQuerying = searchQuery.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: 'rgba(9,11,20,0.97)', backdropFilter: 'blur(20px)' }}
    >
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-[#C19A4A]/20 px-4 md:px-8 py-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C19A4A] w-4 h-4" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAll(false);
            }}
            placeholder="Search creators, skills, locations or partners..."
            className="w-full bg-[#111424] border border-[#C19A4A]/30 focus:border-[#C19A4A] rounded-xl py-3 pl-10 pr-4 text-gray-200 text-sm focus:outline-none placeholder-gray-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2.5 rounded-xl bg-[#151925] border border-[#2A2E3D] text-gray-400 hover:text-white hover:border-[#C19A4A]/40 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex-shrink-0 px-4 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-white/5">
        {['All', 'People', 'Companies', 'Locations'].map((tab) => {
          const Icon = TYPE_ICON[tab];
          return (
            <button
              key={tab}
              onClick={() => toggleFilter(tab)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                activeFilters.includes(tab)
                  ? 'bg-[#C19A4A] text-[#090b14] border-[#C19A4A]'
                  : 'bg-transparent border-[#2A2E3D] text-gray-300 hover:border-[#C19A4A]/40'
              }`}
            >
              {Icon && <Icon size={13} />}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div
        ref={overlayRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-3xl mx-auto w-full"
      >
        {isQuerying && (
          <p className="text-xs text-gray-500 mb-4">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}{' '}
            for
            <span className="text-[#C19A4A] ml-1">"{searchQuery}"</span>
          </p>
        )}

        {isQuerying || activeFilters[0] !== 'All' ? (
          <>
            <div className="space-y-3 mb-4">
              {displayedResults.length > 0 ? (
                displayedResults.map((result) => (
                  <ResultCard key={result.id} item={result} onClose={onClose} />
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-400 text-base">
                    No results for "{searchQuery}"
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Try a different name, skill, or location
                  </p>
                </div>
              )}
            </div>

            {searchResults.length > MAX_INITIAL && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full bg-[#C19A4A] text-[#0B0F1B] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors mb-8"
              >
                Show all ({searchResults.length} results)
                <ArrowRight size={18} />
              </button>
            )}
          </>
        ) : null}

        {!isQuerying && activeFilters[0] === 'All' && (
          <>
            <h2 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Sparkles size={15} className="text-[#C19A4A]" fill="#C19A4A" />
              Suggested Profiles
            </h2>
            <div className="space-y-3 mb-6">
              {SUGGESTIONS.map((s) => (
                <ResultCard key={s.id} item={s} onClose={onClose} />
              ))}
            </div>
          </>
        )}

        {!isQuerying && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
              Trending searches
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Solana developer',
                'Smart contracts',
                'DeFi',
                'Lagos Nigeria',
                'NFT designer',
                'Rust',
                'React',
                'Security auditor',
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1.5 rounded-full text-xs border border-[#2A2E3D] text-gray-400 hover:border-[#C19A4A]/40 hover:text-[#d9b563] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ item, onClose }) {
  const router = useRouter();
  const Icon = TYPE_ICON[item.type] || Users;

  const handleClick = () => {
    if (item.userId) {
      router.push(`/request?id=${item.userId}`);
      onClose();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-[#111424] rounded-xl p-4 border border-[#C19A4A]/15 hover:border-[#C19A4A]/50 transition-all ${
        item.userId ? 'cursor-pointer' : 'cursor-default'
      } group`}
    >
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-[#1A2235] flex-shrink-0 overflow-hidden ring-1 ring-[#C19A4A]/20 group-hover:ring-[#C19A4A]/50 transition-all">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-gray-500 bg-[#1A2235] px-1.5 py-0.5 rounded-full">
              <Icon size={9} />
              {item.type}
            </span>
          </div>
          <p className="text-[#C19A4A] text-xs mb-1.5 font-medium">{item.title}</p>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
            {item.description}
          </p>
          {item.location && (
            <p className="text-gray-600 text-[11px] mt-1.5 flex items-center gap-1">
              <MapPin size={9} /> {item.location}
            </p>
          )}
        </div>
        {item.userId && (
          <ArrowRight
            size={15}
            className="flex-shrink-0 text-gray-600 group-hover:text-[#C19A4A] group-hover:translate-x-0.5 transition-all self-center"
          />
        )}
      </div>
    </div>
  );
}



// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFilters, setActiveFilters] = useState(['All']);
  const [activeSubFilters, setActiveSubFilters] = useState([]);
  const [activeSkillFilters, setActiveSkillFilters] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);

  // FIX #3: `searchQuery` read is used in the bubble filter; `setSearchQuery`
  // was unused because the visible search bar is readOnly and just opens the
  // overlay. Keeping the state but the setter is intentionally not wired to the
  // readOnly input — it's only consumed by the bubble-filter logic below.
  const [searchQuery, setSearchQuery] = useState('');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  const openSearch = useCallback((query = '') => {
    setSearchInitialQuery(query);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const [bubbles, setBubbles] = useState([]);
  const [isLoadingBubbles, setIsLoadingBubbles] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0 });
  const [isPinned, setIsPinned] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectedBubble &&
        !isPinned &&
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !event.target.closest('.bubble-item')
      ) {
        setSelectedBubble(null);
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selectedBubble, isPinned]);

  const loadProfiles = useCallback(async () => {
    setIsLoadingBubbles(true);
    setFetchError(null);
    try {
      const profiles = await fetchProfiles();
      if (profiles.length === 0) {
        setBubbles([]);
        return;
      }
      
      // Generate dynamic positions for all profiles
      const generatePositions = (count) => {
        const positions = [];
        const isMobileView = window.innerWidth < 768;
        const maxAttempts = 150; // Maximum attempts to find non-overlapping position
        
        // Calculate bubble size first
        const getBubbleSize = (index) => {
          const profile = profiles[index];
          const proofCount = profile.proof_count || 0;
          let bubbleSize;
          if (proofCount === 0) bubbleSize = 30;
          else if (proofCount === 1) bubbleSize = 35;
          else if (proofCount === 2) bubbleSize = 42;
          else if (proofCount === 3) bubbleSize = 50;
          else if (proofCount === 4) bubbleSize = 58;
          else if (proofCount === 5) bubbleSize = 66;
          else if (proofCount === 6) bubbleSize = 74;
          else if (proofCount >= 7 && proofCount <= 9) bubbleSize = 74 + ((proofCount - 6) * 2);
          else bubbleSize = 80;
          return bubbleSize;
        };
        
        // Helper function to check if position overlaps with existing positions
        const hasOverlap = (newPos, newSize, existingPositions) => {
          return existingPositions.some(existing => {
            // Calculate actual pixel positions based on container size
            // Assuming container is roughly 800px wide and 800px tall
            const containerWidth = isMobileView ? 350 : 1000;
            const containerHeight = isMobileView ? 600 : 800;
            
            const newX = (newPos.left / 100) * containerWidth;
            const newY = (newPos.top / 100) * containerHeight;
            const existingX = (existing.left / 100) * containerWidth;
            const existingY = (existing.top / 100) * containerHeight;
            
            const dx = newX - existingX;
            const dy = newY - existingY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Minimum distance is sum of radii plus a buffer (10px)
            const newRadius = newSize / 2;
            const existingRadius = existing.size / 2;
            const minRequired = newRadius + existingRadius + 10;
            
            return distance < minRequired;
          });
        };
        
        for (let i = 0; i < count; i++) {
          const bubbleSize = getBubbleSize(i);
          let position = null;
          let attempts = 0;
          
          // Define safe zones based on bubble size to prevent edge clipping
          const radiusPercent = (bubbleSize / 2) / (isMobileView ? 350 : 1000) * 100;
          const containerHeight = isMobileView ? 600 : 800;
          const bottomBufferPercent = (5 / containerHeight) * 100; // 5px buffer from bottom
          const minTop = 8 + radiusPercent;
          const maxTop = 92 - radiusPercent - bottomBufferPercent;
          const minLeft = 6 + radiusPercent;
          const maxLeft = 94 - radiusPercent;
          
          while (!position && attempts < maxAttempts) {
            // Use more distributed random placement
            const top = minTop + Math.random() * (maxTop - minTop);
            const left = minLeft + Math.random() * (maxLeft - minLeft);
            const candidate = { top, left, size: bubbleSize };
            
            if (!hasOverlap(candidate, bubbleSize, positions)) {
              position = candidate;
            }
            attempts++;
          }
          
          // If we couldn't find a non-overlapping position after max attempts,
          // use a grid-based fallback with spacing
          if (!position) {
            const cols = Math.ceil(Math.sqrt(count));
            const row = Math.floor(i / cols);
            const col = i % cols;
            const spacing = isMobileView ? 20 : 15;
            position = {
              top: minTop + (row * spacing),
              left: minLeft + (col * spacing),
              size: bubbleSize
            };
          }
          
          positions.push(position);
        }
        return positions;
      };
      
      const positions = generatePositions(profiles.length);
      
      const formatted = profiles.map((profile, i) => {
        const pos = positions[i];
        const proofCount = profile.proof_count || 0;
        const bubbleSize = pos.size; // Use size from position calculation
        const name = profile.display_name || profile.name || profile.full_name || 'Anonymous';
        const bio = profile.bio || profile.description || 'Verified Web3 professional.';
        // Use default user icon if no profile image, otherwise use initials avatar
        const hasProfileImage = profile.avatar_url || profile.img;
        const img = hasProfileImage ? (profile.avatar_url || profile.img) : generateDefaultAvatar();
        const role = profile.role || profile.profession || 'Web3 Professional';
        const skills = profile.skills
          ? Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',')
          : ['Web3', 'Blockchain'];
        return {
          id: profile.user_id, userId: profile.user_id,
          top: `${pos.top}%`, left: `${pos.left}%`,
          size: `${bubbleSize}px`,
          proofCount,
          delay: `${Math.random() * 2}s`, duration: `${5 + Math.random() * 3}s`,
          img, name,
          bio: bio.length > 200 ? bio.slice(0, 200) + '...' : bio,
          role, skills, location: profile.location || '',
          profileData: profile,
        };
      });
      setBubbles(formatted);
    } catch {
      setFetchError('Failed to load profiles. Using demo data.');
      setBubbles([]);
    } finally {
      setIsLoadingBubbles(false);
    }
  }, []);

  // FIX #4: Wrap the `loadProfiles()` call inside `startTransition` so React
  // knows the resulting state updates are non-urgent. This satisfies the
  // `set-state-in-effect` rule by deferring the setState chain out of the
  // synchronous effect body.
  useEffect(() => {
    startTransition(() => { loadProfiles(); });
    const interval = setInterval(
      () => startTransition(() => { loadProfiles(); }),
      30000,
    );
    return () => clearInterval(interval);
  }, [loadProfiles]);

  const handleBubbleClick = (bubble, event) => {
    event.stopPropagation();
    setIsPinned(true);
    if (isMobile) {
      setSelectedBubble(bubble);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.bubbles-section');
    const containerRect = container.getBoundingClientRect();
    const popupWidth = 320;
    const popupHeight = bubble.bio.length > 100 ? 380 : 200;
    const bubbleCenterX = rect.left - containerRect.left + rect.width / 2;
    const bubbleBottom = rect.bottom - containerRect.top;
    let leftPosition = Math.max(
      10,
      Math.min(bubbleCenterX - popupWidth / 2, containerRect.width - popupWidth - 10),
    );
    let topPosition = bubbleBottom + 15;
    if (topPosition + popupHeight > containerRect.height)
      topPosition = rect.top - containerRect.top - popupHeight - 15;
    setCardPos({ top: topPosition, left: leftPosition });
    setSelectedBubble(bubble);
  };

  const handleBubbleHover = (bubble, event) => {
    if (isMobile || isPinned) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.bubbles-section');
    const containerRect = container.getBoundingClientRect();
    const popupWidth = 320;
    const popupHeight = bubble.bio.length > 100 ? 380 : 200;
    const bubbleCenterX = rect.left - containerRect.left + rect.width / 2;
    const bubbleBottom = rect.bottom - containerRect.top;
    let leftPosition = Math.max(
      10,
      Math.min(bubbleCenterX - popupWidth / 2, containerRect.width - popupWidth - 10),
    );
    let topPosition = bubbleBottom + 15;
    if (topPosition + popupHeight > containerRect.height)
      topPosition = rect.top - containerRect.top - popupHeight - 15;
    setCardPos({ top: topPosition, left: leftPosition });
    setSelectedBubble(bubble);
  };

  const toggleFilter = useCallback((filter) => {
    setSelectedBubble(null);
    setShowAllResults(false);
    if (filter === 'All') {
      setActiveFilters(['All']);
      setActiveSubFilters([]);
      return;
    }
    setActiveFilters([filter]);
    setActiveSubFilters([]);
  }, []);

  const toggleSubFilter = useCallback((subFilter) => {
    setSelectedBubble(null);
    setShowAllResults(false);
    setActiveSubFilters((prev) =>
      prev.includes(subFilter) ? prev.filter((s) => s !== subFilter) : [...prev, subFilter],
    );
  }, []);

  const toggleSkillFilter = useCallback((skill) => {
    setSelectedBubble(null);
    setShowAllResults(false);
    setActiveSkillFilters((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }, []);

  const allSkills = useMemo(() => {
    const skillCount = {};
    bubbles.forEach((b) =>
      (b.skills || []).forEach((s) => {
        const t = s.trim();
        // Filter out 'Web3' and 'Blockchain' from skill filters
        if (t && t.toLowerCase() !== 'web3' && t.toLowerCase() !== 'blockchain') {
          skillCount[t] = (skillCount[t] || 0) + 1;
        }
      }),
    );
    return Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([s]) => s);
  }, [bubbles]);

  const filteredBubbles = useMemo(() => {
    const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return bubbles.filter((bubble) => {
      // Category filter
      if (!activeFilters.includes('All')) {
        const selectedCategory = activeFilters[0];
        
        if (selectedCategory === 'Others') {
          // For "Others" category, show profiles that don't match any profession category
          const bubbleRole = bubble.role.toLowerCase();
          const matchesAnyCategory = Object.values(PROFESSION_CATEGORIES).some(categoryRoles => {
            return categoryRoles.some(role => {
              const keywords = role.toLowerCase().split(/[\s\/\(\)]+/).filter(word => 
                word.length > 2 && !['and', 'the', 'web3', 'general'].includes(word)
              );
              return keywords.some(keyword => bubbleRole.includes(keyword));
            });
          });
          if (matchesAnyCategory) return false;
        } else {
          // Regular category filtering
          const categoryRoles = PROFESSION_CATEGORIES[selectedCategory] || [];
          const bubbleRole = bubble.role.toLowerCase();
          
          const matchesCategory = categoryRoles.some(role => {
            const keywords = role.toLowerCase().split(/[\s\/\(\)]+/).filter(word => 
              word.length > 2 && !['and', 'the', 'web3', 'general'].includes(word)
            );
            return keywords.some(keyword => bubbleRole.includes(keyword));
          });
          
          if (!matchesCategory) return false;
          
          // Sub-category filter
          if (activeSubFilters.length > 0) {
            const matchesSubFilter = activeSubFilters.some(subFilter => {
              const subKeywords = subFilter.toLowerCase().split(/[\s\/\(\)]+/).filter(word => 
                word.length > 2 && !['and', 'the', 'web3', 'general'].includes(word)
              );
              return subKeywords.some(keyword => bubbleRole.includes(keyword));
            });
            if (!matchesSubFilter) return false;
          }
        }
      }
      
      // Skill filter
      if (activeSkillFilters.length > 0) {
        const bs = (bubble.skills || []).map((s) => s.toLowerCase().trim());
        if (!activeSkillFilters.some((s) => bs.includes(s.toLowerCase().trim())))
          return false;
      }
      
      // Search query filter
      if (terms.length === 0) return true;
      const idx = [bubble.name, bubble.role, bubble.bio, bubble.location, ...(bubble.skills || [])].join(' ').toLowerCase();
      return terms.every((t) => idx.includes(t));
    });
  }, [bubbles, activeFilters, activeSubFilters, activeSkillFilters, searchQuery]);

  const isSearching =
    searchQuery.trim().length > 0 || activeSkillFilters.length > 0 || activeSubFilters.length > 0;
  const MAX_INITIAL_BUBBLES = 9;
  const displayedBubbles =
    isSearching && !showAllResults
      ? filteredBubbles.slice(0, MAX_INITIAL_BUBBLES)
      : filteredBubbles;
  
  // Dynamic height calculation for mobile when crowded
  const bubbleContainerHeight = useMemo(() => {
    const isMobileView = window.innerWidth < 768;
    if (!isMobileView) return 800; // Desktop reduced height
    
    const bubbleCount = displayedBubbles.length;
    if (bubbleCount <= 6) return 600;
    if (bubbleCount <= 12) return 750;
    if (bubbleCount <= 18) return 900;
    return 1050; // Very crowded
  }, [displayedBubbles.length]);

  const filters = useMemo(
    () => ['All', ...Object.keys(PROFESSION_CATEGORIES), 'Others'],
    [],
  );

  if (isLoadingBubbles && bubbles.length === 0) {
    return <SkeletonLoader type="search" />;
  }

  return (
    <div className="min-h-screen bg-[#090b14] text-white font-sans selection:bg-[#C19A4A]/30 overflow-x-hidden relative">

      {/*
        FIX #1 (continued): The `key` prop forces SearchOverlay to fully remount
        whenever the overlay opens or `searchInitialQuery` changes. This replaces
        the old `useEffect(() => { setSearchQuery(initialQuery) }, [isOpen])` —
        now `useState(initialQuery || '')` initialises correctly on every mount
        with no synchronous setState inside an effect.
      */}
      <SearchOverlay
        key={isSearchOpen ? `open-${searchInitialQuery}` : 'closed'}
        isOpen={isSearchOpen}
        onClose={closeSearch}
        initialQuery={searchInitialQuery}
        liveProfiles={bubbles}
      />

      <main className="mx-auto px-4 md:px-8 pb-20 pt-8 max-w-4xl lg:max-w-full lg:px-12 xl:px-16">
        <section className="mb-6">
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-gray-200 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent font-bold font-[Inter] mb-8 mt-[65px]">
            Explore Verifiable Talent
          </h2>

          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-[18px] h-[18px]" />
            <input
              type="text"
              readOnly
              onClick={() => openSearch('')}
              placeholder="Search creators, skills, locations or partners..."
              className="w-full bg-[#111424]/60 border border-[#2A2E3D] rounded-xl py-3.5 pl-11 pr-4 text-gray-200 text-sm focus:outline-none focus:border-[#C19A4A]/50 placeholder-gray-500 transition-colors cursor-pointer hover:border-[#C19A4A]/30"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-600 bg-[#1A2235] px-2 py-0.5 rounded border border-[#2A2E3D] hidden md:block">
              ⌘K
            </span>
          </div>

          <CmdKListener onOpen={openSearch} />

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFilters.includes(filter)
                    ? 'bg-[#d9b563] text-[#090b14]'
                    : 'bg-transparent border border-[#2A2E3D] text-gray-300 hover:border-gray-500'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Sub-category filters */}
          {!activeFilters.includes('All') && !activeFilters.includes('Others') && PROFESSION_CATEGORIES[activeFilters[0]] && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-3">
              {PROFESSION_CATEGORIES[activeFilters[0]].map((subFilter) => (
                <button
                  key={subFilter}
                  onClick={() => toggleSubFilter(subFilter)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeSubFilters.includes(subFilter)
                      ? 'bg-[#C19A4A]/25 border border-[#C19A4A]/60 text-[#d9b563]'
                      : 'bg-transparent border border-[#2A2E3D]/70 text-gray-400 hover:border-[#C19A4A]/30 hover:text-gray-200'
                  }`}
                >
                  {subFilter}
                </button>
              ))}
            </div>
          )}

          {allSkills.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {activeSkillFilters.length > 0 && (
                <button
                  onClick={() => {
                    setActiveSkillFilters([]);
                    setShowAllResults(false);
                  }}
                  className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#C19A4A]/20 border border-[#C19A4A]/40 text-[#C19A4A] hover:bg-[#C19A4A]/30 transition-all"
                >
                  <X size={11} /> Clear skills
                </button>
              )}
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkillFilter(skill)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeSkillFilters.includes(skill)
                      ? 'bg-[#C19A4A]/25 border border-[#C19A4A]/60 text-[#d9b563]'
                      : 'bg-transparent border border-[#2A2E3D]/70 text-gray-400 hover:border-[#C19A4A]/30 hover:text-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}

          {isSearching && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>
                {filteredBubbles.length} result
                {filteredBubbles.length !== 1 ? 's' : ''}
              </span>
              {(activeSkillFilters.length > 0 || activeSubFilters.length > 0) && (
                <span className="text-[#C19A4A]/70">
                  · filtered by {[...activeSubFilters, ...activeSkillFilters].join(', ')}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Bubble explorer */}
        <section className="relative w-full rounded-[1.5rem] overflow-hidden mb-12 flex flex-col items-center bubbles-section shadow-[0_0_30px_rgba(193,154,74,0.05)]" style={{ height: `${bubbleContainerHeight}px` }}>
          <div className="absolute inset-0 p-[2px] rounded-[1.5rem] bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
            <div className="w-full h-full rounded-[1.4rem] bg-gradient-to-b from-[#0B0F1B] to-[#131825] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%%' height='100%%' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='network' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='1.5' fill='%23C19A4A'/%3E%3Cpath d='M50 50 L150 150 M50 50 L-50 150 M50 50 L150 -50 M50 50 L-50 -50' stroke='%234B5563' stroke-width='0.5' stroke-dasharray='4 4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%%' height='100%%' fill='url(%23network)'/%3E%3C/svg%3E")`,
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#C19A4A0A_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 pt-8 text-center px-6 flex flex-col items-center gap-4">
            <p className="text-[#d9b563] text-sm md:text-base font-medium leading-relaxed tracking-wide">
              Click on any bubble to explore verified
              <br />
              Web3 professionals
            </p>
            <button
              onClick={loadProfiles}
              disabled={isLoadingBubbles}
              className="group relative px-4 py-2 text-xs bg-white/10 border border-white/20 rounded-full font-medium text-white hover:bg-white/20 hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>🔄 Refresh Profiles</span>
              {isLoadingBubbles && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {!isLoadingBubbles && (
                <span className="group-hover:translate-x-0.5 transition-transform text-xs">↻</span>
              )}
            </button>
            {fetchError && (
              <p className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
                {fetchError}
              </p>
            )}
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none mt-16">
            {displayedBubbles.map((bubble) => (
              <div
                key={bubble.id}
                className="absolute animate-float cursor-pointer pointer-events-auto hover:z-20 group bubble-item"
                style={{
                  top: bubble.top,
                  left: bubble.left,
                  width: bubble.size,
                  height: bubble.size,
                  animationDelay: bubble.delay,
                  animationDuration: bubble.duration,
                }}
                onClick={(e) => handleBubbleClick(bubble, e)}
                onMouseEnter={(e) => handleBubbleHover(bubble, e)}
                onMouseLeave={() => !isMobile && !isPinned && setSelectedBubble(null)}
              >
                <div
                  className={`relative w-full h-full p-[2px] rounded-full bg-gradient-to-br transition-all duration-300 ${
                    selectedBubble?.id === bubble.id
                      ? 'from-[#C19A4A] to-[#d9b563] scale-110 shadow-[0_0_20px_rgba(193,154,74,0.4)]'
                      : 'from-white/20 to-white/5 hover:scale-110 hover:from-[#C19A4A]/50 hover:to-[#d9b563]/50'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0F1B]">
                    <img
                      src={bubble.img}
                      alt="Verified Professional"
                      className="w-full h-full object-cover transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ))}
            {filteredBubbles.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1">
                    {isSearching
                      ? `No profiles match "${searchQuery || activeSkillFilters.join(', ')}"`
                      : 'No profiles found.'}
                  </p>
                  {isSearching && (
                    <p className="text-gray-600 text-xs">
                      Try a different skill or clear filters
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {isSearching && !showAllResults && filteredBubbles.length > MAX_INITIAL_BUBBLES && (
            <button
              onClick={() => setShowAllResults(true)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 bg-[#d9b563] text-[#090b14] rounded-full text-sm font-bold hover:bg-[#C19A4A] transition-colors shadow-lg pointer-events-auto"
            >
              Show all ({filteredBubbles.length} results) <ArrowRight size={16} />
            </button>
          )}

          {selectedBubble && (
            <>
              {isMobile && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[1001] animate-fade-in"
                  onClick={() => setSelectedBubble(null)}
                />
              )}
              <div
                ref={popupRef}
                className={`profile-popup-card z-[1002] ${
                  isMobile
                    ? 'fixed bottom-4 left-4 right-4 animate-slide-up'
                    : 'absolute w-[340px] animate-fade-in-up'
                }`}
                style={!isMobile ? { top: cardPos.top, left: cardPos.left } : {}}
              >
                <div className="relative p-[1.5px] rounded-[24px] bg-gradient-to-br from-[#C19A4A] via-[#1A2235] to-[#2563EB]">
                  <div className="relative rounded-[23px] bg-[#111623] px-5 py-6 shadow-2xl flex flex-col max-h-[80vh] md:max-h-none overflow-hidden">
                    <button
                      onClick={() => setSelectedBubble(null)}
                      className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex items-center gap-4 mb-4 mt-1">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-[#C19A4A] rounded-full blur-[10px] opacity-40 scale-110" />
                        <div className="relative w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-br from-[#C19A4A] to-white/20">
                          <img
                            src={selectedBubble.img}
                            className="w-full h-full rounded-full object-cover bg-[#0B0F1B]"
                            alt={selectedBubble.name}
                          />
                        </div>
                      </div>
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-[17px] text-white leading-tight mb-1">
                          {selectedBubble.name}
                        </h3>
                        <div className="text-[#d9b563] text-[11px] uppercase font-bold tracking-wide flex items-center gap-1.5">
                          <Sparkles size={12} fill="#d9b563" /> {selectedBubble.role}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 mb-5 pr-1">
                      <p className="text-[#9CA3AF] text-[14px] leading-relaxed">
                        {selectedBubble.bio}
                      </p>
                      {selectedBubble.location && (
                        <p className="text-gray-500 text-[12px] mt-2">
                          📍 {selectedBubble.location}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/request?id=${selectedBubble.userId}`}
                      className="relative group flex items-center justify-center gap-2 w-full py-2.5 md:py-3 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(193,154,74,0.4)] text-sm md:text-base"
                    >
                      <span className="relative z-10">View Full Profile</span>
                      <ArrowRight
                        size={16}
                        className="relative z-10 group-hover:translate-x-1 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
            </div>
          </div>
        </section>

        <section className="text-left mt-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-[1.15] tracking-tight">
            Bubbles aren't just fun, they're opportunities.
          </h1>
          <div className="space-y-6 text-gray-300 text-[15px] md:text-lg leading-relaxed">
            <ul className="space-y-4">
              {[
                'Explore verifiable portfolios with real proofs',
                'Find the right creators, marketers, or business developers',
                'Connect with people who can help bring your ideas to life',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#C19A4A] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="pt-2">
              Search by skills, location, or expertise and start discovering today.
            </p>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes float { 0%{transform:translateY(0px) translateX(0px)} 33%{transform:translateY(-8px) translateX(4px)} 66%{transform:translateY(6px) translateX(-2px)} 100%{transform:translateY(0px) translateX(0px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .animate-float{animation:float infinite ease-in-out}
        .animate-fade-in-up{animation:fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards}
        .animate-slide-up{animation:slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards}
        .animate-fade-in{animation:fadeIn 0.2s ease-out forwards}
        .scrollbar-hide::-webkit-scrollbar{display:none} .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        .custom-scrollbar::-webkit-scrollbar{width:4px} .custom-scrollbar::-webkit-scrollbar-track{background:transparent} .custom-scrollbar::-webkit-scrollbar-thumb{background:#374151;border-radius:4px}
      `}</style>
    </div>
  );
}

// ─── Cmd+K listener ───────────────────────────────────────────────────────────
// FIX #5: Removed the unused `// eslint-disable-next-line` directive that was
// previously at the JSX call site of this component.
function CmdKListener({ onOpen }) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpen]);
  return null;
}