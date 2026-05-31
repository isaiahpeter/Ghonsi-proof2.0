import { useQuery } from '@tanstack/react-query';
import { fetchAllProfilesWithProofs } from '@/utils/fetchAllProfilesWithProofs.js';
import { useMemo } from 'react';

// PAGE_SIZE = 20; // Not used for single client-side fetch

// Seeded random for deterministic jitter (fixes react-hooks/purity)
const seededRandom = (seed) => {
  return ((seed * 1103515245 + 12345) % 2147483647) / 2147483647;
};

/**
 * Professional filtered profiles hook for bubble search
 * Client-side filtering + bubble transformation using full dataset
 */
export const useFilteredProfiles = ({
  query = '',
  categories = [],
  skills = [],
  type = 'All'
} = {}) => {
  const queryKey = ['profiles', { query, categories: categories.sort().join(','), skills: skills.sort().join(','), type }];
  
  const query = useQuery({
    queryKey: ['allProfiles'],
    queryFn: fetchAllProfilesWithProofs,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000,
  });

  // Client-side filter raw profiles
  const filteredProfiles = useMemo(() => {
    if (!query.data?.profiles) return [];
    
    return query.data.profiles.filter(profile => {
      const matchesQuery = !query || 
        profile.display_name?.toLowerCase().includes(query.toLowerCase()) ||
        profile.name?.toLowerCase().includes(query.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(query.toLowerCase()) ||
        profile.role?.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = type === 'All' || profile.role === type || profile.type === type;
      const matchesCategories = categories.length === 0 || categories.some(cat => 
        profile.categories?.includes(cat) || profile.role === cat
      );
      const matchesSkills = skills.length === 0 || skills.some(skill => 
        profile.skills?.includes(skill)
      );
      
      return matchesQuery && matchesType && matchesCategories && matchesSkills;
    });
  }, [query.data, query, type, categories, skills]);

  // Transform filtered profiles → bubbles with positions/proof metadata
  const bubbles = useMemo(() => {
    const allProfiles = filteredProfiles;
    
    const basePositions = [
      { top: 18, left: 15, size: 45 }, { top: 15, left: 50, size: 55 }, { top: 20, left: 80, size: 40 },
      { top: 28, left: 30, size: 60 }, { top: 25, left: 65, size: 50 },
      { top: 40, left: 12, size: 40 }, { top: 42, left: 45, size: 70 }, { top: 38, left: 82, size: 45 },
      { top: 55, left: 25, size: 55 }, { top: 52, left: 60, size: 50 },
      { top: 68, left: 15, size: 45 }, { top: 70, left: 45, size: 65 }, { top: 65, left: 75, size: 50 },
      { top: 82, left: 30, size: 55 }, { top: 80, left: 65, size: 45 },
      { top: 86, left: 18, size: 40 }, { top: 88, left: 50, size: 50 }, { top: 85, left: 80, size: 45 },
      { top: 30, left: 82, size: 35 }, { top: 58, left: 82, size: 40 }, { top: 78, left: 10, size: 35 },
      { top: 48, left: 35, size: 40 }, { top: 62, left: 35, size: 35 }
    ];

    return allProfiles.slice(0, basePositions.length).map((profile, i) => {
      const pos = basePositions[i];
      const jitterTop = Math.max(12, Math.min(pos.top + (seededRandom(i) * 4 - 2), 88));
      const jitterLeft = Math.max(6, Math.min(pos.left + (seededRandom(i + 1) * 4 - 2), 86));
      
      const name = profile.display_name || profile.name || profile.full_name || 'Anonymous';
      const img = profile.avatar_url || profile.img || `https://i.pravatar.cc/150?img=${(i % 65) + 1}`;
      const role = profile.role || 'Web3 Professional';
      const skills = Array.isArray(profile.skills) ? profile.skills : (profile.skills ? profile.skills.split(',') : []);

      return {
        id: profile.user_id,
        userId: profile.user_id,
        top: `${jitterTop}%`,
        left: `${jitterLeft}%`,
        size: `${pos.size}px`,
        delay: `${seededRandom(i + 2) * 2}s`,
        duration: `${5 + seededRandom(i + 3) * 3}s`,
        img,
        name,
        bio: (profile.bio || 'Verified Web3 professional.').slice(0, 200) + '...',
        role,
        skills,
        location: profile.location || '',
        proofCount: profile.proofs?.length || 0,
        profileData: profile,
        wallet_address: profile.users?.wallet_address
      };
    });
  }, [infiniteQuery.data]);

  return {
    ...query,
    bubbles,
    filteredProfiles,
    totalCount: filteredProfiles.length
  };

};

