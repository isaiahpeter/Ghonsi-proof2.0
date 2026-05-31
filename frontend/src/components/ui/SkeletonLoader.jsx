'use client';
export default function SkeletonLoader({ type = 'page' }) {
  if (type === 'about') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-12">
        {/* Background elements */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10">
          {/* Mobile Skeleton */}
          <div className="md:hidden px-5">
            {/* About Us Section */}
            <div className="mb-16 animate-pulse text-center">
              <div className="h-10 bg-gray-700/50 rounded w-1/2 mx-auto mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                <div className="h-4 bg-gray-700/50 rounded w-5/6 mx-auto"></div>
                <div className="h-4 bg-gray-700/50 rounded w-4/5 mx-auto"></div>
                <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto"></div>
              </div>
            </div>

            {/* Name Origin Section */}
            <div className="mb-16 animate-pulse">
              <div className="h-8 bg-gray-700/50 rounded w-3/4 mx-auto mb-6"></div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full mb-4"></div>
                <div className="h-5 bg-gray-700/50 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-40"></div>
              </div>
            </div>

            {/* Our Story Section */}
            <div className="mb-16 animate-pulse">
              <div className="h-8 bg-gray-700/50 rounded w-1/2 mx-auto mb-8"></div>
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 bg-gray-700/50 rounded w-full"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-700/50 rounded-2xl"></div>
            </div>

            {/* Values Section */}
            <div className="mb-16 animate-pulse">
              <div className="h-8 bg-gray-700/50 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto mb-8"></div>
              <div className="h-72 bg-gray-700/50 rounded-2xl mb-4"></div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-2.5 h-2.5 bg-gray-700/50 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* Team Section */}
            <div className="mb-16 animate-pulse">
              <div className="h-8 bg-gray-700/50 rounded w-2/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700/50 rounded w-full mx-auto mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#0B0F19] border border-white/10 rounded-2xl p-4">
                    <div className="h-64 bg-gray-700/50 rounded-xl mb-4"></div>
                    <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Journey Section */}
            <div className="mb-16 animate-pulse">
              <div className="h-8 bg-gray-700/50 rounded w-1/2 mx-auto mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-4 bg-gray-700/50 rounded"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-700/50 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden md:block px-12 lg:px-20">
            <div className="max-w-6xl mx-auto">
              {/* About Us Section */}
              <div className="mb-20 animate-pulse text-center">
                <div className="h-12 bg-gray-700/50 rounded w-1/3 mx-auto mb-8"></div>
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Origin Section */}
              <div className="mb-20 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-1/2 mx-auto mb-8"></div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 mb-8">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-700/50 rounded-full mb-4"></div>
                  <div className="h-5 bg-gray-700/50 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-40"></div>
                </div>
              </div>

              {/* Our Story Section */}
              <div className="mb-20 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-1/3 mx-auto mb-12"></div>
                <div className="flex gap-8">
                  <div className="w-[45%] h-96 bg-gray-700/50 rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="h-4 bg-gray-700/50 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Discoverability Section */}
              <div className="mb-20 animate-pulse">
                <div className="flex items-center justify-between gap-12">
                  <div className="flex-1">
                    <div className="h-10 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-700/50 rounded-full w-48"></div>
                </div>
              </div>

              {/* Values Section */}
              <div className="mb-20 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/2 mx-auto mb-8"></div>
                <div className="h-72 bg-gray-700/50 rounded-2xl mb-4"></div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-gray-700/50 rounded-full"></div>
                  ))}
                </div>
              </div>

              {/* Team Section */}
              <div className="mb-20 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto mb-12"></div>
                <div className="grid grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-[#0B0F19] border border-white/10 rounded-2xl p-4">
                      <div className="h-48 bg-gray-700/50 rounded-xl mb-4"></div>
                      <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Journey Section */}
              <div className="mb-20 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-1/3 mx-auto mb-8"></div>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-20 h-4 bg-gray-700/50 rounded"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-700/50 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-12">
                  <div className="flex-1 h-12 bg-gray-700/50 rounded-xl"></div>
                  <div className="flex-1 h-12 bg-gray-700/50 rounded-xl"></div>
                </div>
              </div>

              {/* Partner Section */}
              <div className="mb-20 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-1/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#0B0F1B]/80 border border-white/10 rounded-2xl p-6">
                      <div className="w-12 h-12 bg-gray-700/50 rounded-xl mb-4"></div>
                      <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                    </div>
                  ))}
                </div>
                <div className="h-12 bg-gray-700/50 rounded-lg w-48 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    );
  }

  if (type === 'portfolio') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-28 px-5">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Skeleton */}
          <div className="lg:hidden">
            {/* Profile Card */}
            <div className="mb-8 animate-pulse">
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#151925] rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="h-8 bg-gray-700/50 rounded-md w-32"></div>
                    <div className="h-8 bg-gray-700/50 rounded-md w-28"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                    <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                    <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8 animate-pulse">
              <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]">
                <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
              </div>
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#151925] rounded-[14px] p-6">
                  <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-8 animate-pulse">
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#111625] rounded-xl p-5">
                  <div className="h-5 bg-gray-700/50 rounded w-32 mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-7 bg-gray-700/50 rounded-full w-20"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 animate-pulse">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-700/50 rounded-full w-24 flex-shrink-0"></div>
                ))}
              </div>
            </div>

            {/* Sort and Count */}
            <div className="flex flex-col gap-3 mb-6 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-48"></div>
              <div className="h-10 bg-gray-700/50 rounded w-full"></div>
            </div>

            {/* Proofs Grid */}
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#151925] rounded-2xl overflow-hidden border border-[#C19A4A]/20">
                  <div className="h-64 bg-gray-700/50"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-32 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-4"></div>
                    <div className="bg-[#0B0F1B] rounded-lg p-3 border border-[#C19A4A]/20">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_400px] lg:gap-6">
            {/* Left Column */}
            <div>
              {/* Profile Card */}
              <div className="mb-8 animate-pulse">
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                  <div className="bg-[#151925] rounded-2xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-7 bg-gray-700/50 rounded w-1/2 mb-2"></div>
                        <div className="h-5 bg-gray-700/50 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="h-8 bg-gray-700/50 rounded-md w-40"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-32"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]">
                  <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                </div>
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                  <div className="bg-[#151925] rounded-[14px] p-6">
                    <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="animate-pulse">
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                  <div className="bg-[#111625] rounded-xl p-5">
                    <div className="h-5 bg-gray-700/50 rounded w-32 mb-3"></div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-7 bg-gray-700/50 rounded-full w-20"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Proofs - Full width below */}
          <div className="mt-8">
            {/* Filter Tabs */}
            <div className="mb-6 animate-pulse">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-gray-700/50 rounded-full w-28 flex-shrink-0"></div>
                ))}
              </div>
            </div>

            {/* Sort and Count */}
            <div className="flex items-center justify-between mb-6 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-48"></div>
              <div className="h-10 bg-gray-700/50 rounded w-40"></div>
            </div>

            {/* Proofs Grid - 3 columns desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#151925] rounded-2xl overflow-hidden border border-[#C19A4A]/20">
                  <div className="h-64 bg-gray-700/50"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-32 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-4"></div>
                    <div className="bg-[#0B0F1B] rounded-lg p-3 border border-[#C19A4A]/20">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                          <div className="h-8 bg-gray-700/50 rounded w-8"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Action Bar */}
          <div className="fixed bottom-2 left-3 right-3 z-50 animate-pulse">
            <div className="w-full max-w-7xl mx-auto relative p-[2px] rounded-xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
              <div className="bg-[#1C1C1C]/95 backdrop-blur-md p-2 rounded-xl flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-700/50 rounded w-48 mb-1"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-64"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-700/50 rounded-lg w-32"></div>
                  <div className="h-9 bg-gray-700/50 rounded-lg w-32"></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Bot Button */}
          <div className="fixed bottom-24 right-6 z-50 animate-pulse">
            <div className="w-14 h-14 bg-gray-700/50 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] text-white pt-24 pb-12 px-5">
        <div className="max-w-4xl mx-auto">
          {/* Skeleton Header */}
          <div className="mb-12 animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded w-2/3 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-700/50 rounded w-full mb-3"></div>
            <div className="h-4 bg-gray-700/50 rounded w-5/6 mx-auto mb-3"></div>
            <div className="h-4 bg-gray-700/50 rounded w-4/5 mx-auto"></div>
          </div>

          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]/30 animate-pulse">
                <div className="h-32 bg-gray-700/50 rounded mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          {/* Skeleton Buttons */}
          <div className="flex gap-4 animate-pulse">
            <div className="h-12 bg-gray-700/50 rounded-xl flex-1"></div>
            <div className="h-12 bg-gray-700/50 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] text-white pt-24 pb-12 px-5">
        <div className="max-w-2xl mx-auto">
          {/* Skeleton Form Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto"></div>
          </div>

          {/* Skeleton Form Fields */}
          <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="mb-6">
                <div className="h-4 bg-gray-700/50 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-700/50 rounded w-full"></div>
              </div>
            ))}
            <div className="h-12 bg-gray-700/50 rounded w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-12">
        {/* Background elements */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10">
          {/* Mobile Skeleton */}
          <div className="lg:hidden px-5 py-6">
            {/* Profile Card */}
            <div className="mb-8 animate-pulse">
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#111625] rounded-2xl p-5 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full mb-3"></div>
                  <div className="h-5 bg-gray-700/50 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-48 mb-5"></div>
                  <div className="w-full space-y-2 mb-6">
                    <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                    <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                    <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                    <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                  </div>
                  <div className="h-12 bg-gray-700/50 rounded-xl w-full"></div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8 animate-pulse">
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
                <div className="bg-[#1A1F2E] rounded-xl p-4 text-center">
                  <div className="h-8 bg-gray-700/50 rounded w-12 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-20 mx-auto"></div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563]">
                <div className="bg-[#1A1F2E] rounded-xl p-4 text-center">
                  <div className="h-8 bg-gray-700/50 rounded w-12 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-20 mx-auto"></div>
                </div>
              </div>
            </div>

            {/* Recent Proofs */}
            <div className="mb-8 animate-pulse">
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 bg-gray-700/50 rounded w-28"></div>
                <div className="h-4 bg-gray-700/50 rounded w-16"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent">
                    <div className="bg-[#111625] rounded-xl p-4">
                      <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-3"></div>
                      <div className="h-6 bg-gray-700/50 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Mini-Me */}
            <div className="mb-8 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-28 mb-3"></div>
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-[#C19A4A] to-blue-500">
                <div className="bg-[#111625] rounded-2xl p-5">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-28 mb-3"></div>
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#111625] rounded-2xl p-5">
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-gray-700/50 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden lg:block px-5 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-[400px_1fr] gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Profile Card */}
                  <div className="animate-pulse">
                    <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                      <div className="bg-[#111625] rounded-2xl p-5 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full mb-3"></div>
                        <div className="h-5 bg-gray-700/50 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-48 mb-5"></div>
                        <div className="w-full space-y-2 mb-6">
                          <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                          <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                          <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                          <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                        </div>
                        <div className="h-12 bg-gray-700/50 rounded-xl w-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 animate-pulse">
                    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
                      <div className="bg-[#1A1F2E] rounded-xl p-4 text-center">
                        <div className="h-8 bg-gray-700/50 rounded w-12 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-20 mx-auto"></div>
                      </div>
                    </div>
                    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563]">
                      <div className="bg-[#1A1F2E] rounded-xl p-4 text-center">
                        <div className="h-8 bg-gray-700/50 rounded w-12 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-20 mx-auto"></div>
                      </div>
                    </div>
                  </div>

                  {/* My Mini-Me */}
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700/50 rounded w-28 mb-3"></div>
                    <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-[#C19A4A] to-blue-500">
                      <div className="bg-[#111625] rounded-2xl p-5">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gray-700/50 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                          </div>
                        </div>
                        <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Recent Proofs */}
                  <div className="animate-pulse">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 bg-gray-700/50 rounded w-28"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-16"></div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent">
                          <div className="bg-[#111625] rounded-xl p-4">
                            <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-3"></div>
                            <div className="h-6 bg-gray-700/50 rounded w-24"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700/50 rounded w-28 mb-3"></div>
                    <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
                      <div className="bg-[#111625] rounded-2xl p-5">
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-gray-700/50 rounded-xl"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    );
  }

  if (type === 'contact') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-12">
        <div className="relative z-10">
          {/* Mobile Skeleton */}
          <div className="lg:hidden px-5">
            {/* Header */}
            <div className="text-center mb-8 space-y-3 pt-4 animate-pulse">
              <div className="h-9 bg-gray-700/50 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700/50 rounded w-80 max-w-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-72 max-w-full mx-auto"></div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#131825] rounded-2xl p-6 border border-gray-800 shadow-xl mb-8 animate-pulse">
              <div className="h-6 bg-gray-700/50 rounded w-40 mb-6"></div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700/50 rounded w-16 mb-2"></div>
                  <div className="h-12 bg-gray-700/50 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700/50 rounded w-16 mb-2"></div>
                  <div className="h-12 bg-gray-700/50 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700/50 rounded w-20 mb-2"></div>
                  <div className="h-12 bg-gray-700/50 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700/50 rounded w-20 mb-2"></div>
                  <div className="h-32 bg-gray-700/50 rounded"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-24 ml-auto"></div>
                </div>
                <div className="h-12 bg-gray-700/50 rounded"></div>
              </div>
            </div>

            {/* Other Ways to Reach Us */}
            <div className="bg-[#131825] rounded-2xl p-6 border border-gray-800 shadow-xl mb-6 animate-pulse">
              <div className="h-6 bg-gray-700/50 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4">
                    <div className="w-9 h-9 bg-gray-700/50 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700/50 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Answers */}
            <div className="bg-[#1A1810] border border-[#C19A4A]/20 rounded-xl p-5 mb-5 animate-pulse">
              <div className="h-5 bg-gray-700/50 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-700/50 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-700/50 rounded w-24"></div>
            </div>
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden lg:block px-5">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 space-y-3 pt-4 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-96 max-w-full mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-80 max-w-full mx-auto"></div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Contact Form */}
                <div className="bg-[#131825] rounded-2xl p-8 border border-gray-800 shadow-xl animate-pulse">
                  <div className="h-6 bg-gray-700/50 rounded w-48 mb-6"></div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded w-16 mb-2"></div>
                      <div className="h-12 bg-gray-700/50 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded w-16 mb-2"></div>
                      <div className="h-12 bg-gray-700/50 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded w-20 mb-2"></div>
                      <div className="h-12 bg-gray-700/50 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded w-20 mb-2"></div>
                      <div className="h-32 bg-gray-700/50 rounded"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-28 ml-auto"></div>
                    </div>
                    <div className="h-12 bg-gray-700/50 rounded"></div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* Other Ways to Reach Us */}
                  <div className="bg-[#131825] rounded-2xl p-6 border border-gray-800 shadow-xl mb-6 animate-pulse">
                    <div className="h-6 bg-gray-700/50 rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4">
                          <div className="w-9 h-9 bg-gray-700/50 rounded-lg flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-700/50 rounded w-28 mb-2"></div>
                            <div className="h-3 bg-gray-700/50 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-700/50 rounded w-36"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Answers */}
                  <div className="bg-[#1A1810] border border-[#C19A4A]/20 rounded-xl p-5 animate-pulse">
                    <div className="h-5 bg-gray-700/50 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'faq') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)]">
        <main>
          <section className="mt-[115px] py-10 px-5 pb-20 animate-pulse">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="h-10 bg-gray-700/50 rounded w-96 max-w-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700/50 rounded w-80 max-w-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-72 max-w-full mx-auto"></div>
            </div>

            {/* FAQ Cards - Mobile: Single column, Desktop: Two columns */}
            <div className="max-w-[500px] lg:max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-[#131825] rounded-xl p-5 border border-gray-800">
                  <div className="h-5 bg-gray-700/50 rounded w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Bottom Cards - Two columns */}
            <div className="mt-[75px] mb-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="h-48 bg-gray-700/50 rounded-xl"></div>
              <div className="h-48 bg-gray-700/50 rounded-xl"></div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (type === 'upload') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
        {/* Background elements */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        </div>

        <main className="relative z-10 px-4 py-8 max-w-4xl lg:max-w-7xl mx-auto w-full mt-[105px]">
          {/* Header */}
          <div className="text-center mb-10 animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded w-80 max-w-full mx-auto mb-3"></div>
            <div className="h-4 bg-gray-700/50 rounded w-64 max-w-full mx-auto"></div>
          </div>

          {/* Desktop Two-Column Layout */}
          <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8">
            {/* Left Column - Form */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 shadow-2xl mb-10 lg:mb-0 animate-pulse">
              <div className="bg-[#111625] rounded-[14px] p-6 md:p-8">
                <div className="space-y-6">
                  {/* Proof Name */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700/50 rounded w-24 mb-2"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                  </div>

                  {/* Proof Type */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700/50 rounded w-20 mb-2"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                  </div>

                  {/* Smart Tags */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700/50 rounded w-20 mb-2"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                    <div className="h-2 bg-gray-700/50 rounded w-48 mt-1"></div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                    </div>
                    <div className="h-32 bg-gray-700/50 rounded-xl"></div>
                  </div>

                  {/* Reference Link */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700/50 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                    <div className="h-2 bg-gray-700/50 rounded w-64 mt-1"></div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="h-3 bg-gray-700/50 rounded w-36 mb-2"></div>
                    <div className="border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gray-700/50 rounded-2xl mb-4"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-48 mb-1"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-32"></div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
                    <div className="h-10 bg-gray-700/50 rounded w-20"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl w-40"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Requirements & Tips (Desktop Only) */}
            <div className="hidden lg:block space-y-6 animate-pulse">
              {/* Upload Requirements */}
              <div className="relative p-[1px] rounded-xl bg-gradient-to-br from-[#C19A4A]/60 to-[#C19A4A]/10">
                <div className="rounded-xl p-5 bg-[#0d1020]">
                  <div className="h-4 bg-gray-700/50 rounded w-40 mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-3 bg-gray-700/50 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="relative p-[1px] rounded-xl bg-gradient-to-br from-[#C19A4A]/60 to-[#C19A4A]/10">
                <div className="rounded-xl p-5 bg-[#0d1020]">
                  <div className="h-4 bg-gray-700/50 rounded w-24 mb-3"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-700/50 rounded w-full"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-5/6"></div>
                    <div className="bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-lg p-3">
                      <div className="h-2 bg-gray-700/50 rounded w-16 mb-2"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-700/50 rounded w-full"></div>
                        <div className="h-2 bg-gray-700/50 rounded w-full"></div>
                        <div className="h-2 bg-gray-700/50 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    );
  }

  if (type === 'miniThemControl') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
        <div className="max-w-6xl mx-auto px-5 py-8">
          {/* Back Button */}
          <div className="h-6 bg-gray-700/50 rounded w-32 mb-6 mt-[115px] animate-pulse"></div>

          {/* Header Card */}
          <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20 mb-6 animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full"></div>
                <div>
                  <div className="h-7 bg-gray-700/50 rounded w-64 mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-40"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-700/50 rounded-xl w-24"></div>
                <div className="h-10 bg-gray-700/50 rounded-xl w-28"></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-[#0B0F1B] rounded-xl p-4 text-center">
                  <div className="h-8 bg-gray-700/50 rounded w-12 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {/* Tasks Panel */}
            <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20">
              <div className="h-6 bg-gray-700/50 rounded w-56 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#0B0F1B] rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-5 bg-gray-700/50 rounded w-32"></div>
                      <div className="h-5 bg-gray-700/50 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-9 bg-gray-700/50 rounded-lg"></div>
                      <div className="flex-1 h-9 bg-gray-700/50 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-700/50 rounded w-48"></div>
                <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
              </div>
              <div className="bg-[#0B0F1B] rounded-xl p-4 mb-4 h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-700/50 rounded-full mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-48 mx-auto"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 bg-gray-700/50 rounded-xl"></div>
                <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'search') {
    return (
      <div className="min-h-screen bg-[#090b14] text-white font-sans selection:bg-[#C19A4A]/30 overflow-x-hidden relative">
        <main className="mx-auto px-4 md:px-8 pb-20 pt-8 max-w-4xl lg:max-w-full lg:px-12 xl:px-16">
          <section className="mb-6 animate-pulse">
            <div className="h-10 md:h-14 lg:h-16 bg-gray-700/50 rounded w-3/4 max-w-2xl mb-8 mt-[65px]"></div>

            <div className="h-14 bg-gray-700/50 rounded-xl mb-5"></div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-9 bg-gray-700/50 rounded-full w-24 flex-shrink-0"></div>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-7 bg-gray-700/50 rounded-full w-20 flex-shrink-0"></div>
              ))}
            </div>
          </section>

          <section className="relative w-full rounded-[1.5rem] overflow-hidden mb-12 flex flex-col items-center shadow-[0_0_30px_rgba(193,154,74,0.05)] animate-pulse" style={{ height: '800px' }}>
            <div className="absolute inset-0 p-[2px] rounded-[1.5rem] bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
              <div className="w-full h-full rounded-[1.4rem] bg-gradient-to-b from-[#0B0F1B] to-[#131825] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%%' height='100%%' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='network' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='1.5' fill='%23C19A4A'/%3E%3Cpath d='M50 50 L150 150 M50 50 L-50 150 M50 50 L150 -50 M50 50 L-50 -50' stroke='%234B5563' stroke-width='0.5' stroke-dasharray='4 4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%%' height='100%%' fill='url(%23network)'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'center',
                }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#C19A4A0A_0%,transparent_60%)] pointer-events-none" />

                <div className="relative z-10 pt-8 text-center px-6 flex flex-col items-center gap-4">
                  <div className="h-5 bg-gray-700/50 rounded w-64 mx-auto mb-1"></div>
                  <div className="h-5 bg-gray-700/50 rounded w-56 mx-auto"></div>
                  <div className="h-9 bg-gray-700/50 rounded-full w-40"></div>
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none mt-16">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        top: `${10 + (i * 7)}%`,
                        left: `${8 + (i * 8)}%`,
                        width: `${40 + (i % 3) * 15}px`,
                        height: `${40 + (i % 3) * 15}px`,
                      }}
                    >
                      <div className="relative w-full h-full p-[2px] rounded-full bg-gradient-to-br from-white/20 to-white/5">
                        <div className="w-full h-full rounded-full bg-[#0B0F1B]">
                          <div className="w-full h-full bg-gray-700/50 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="text-left mt-16 animate-pulse">
            <div className="h-10 md:h-12 lg:h-14 bg-gray-700/50 rounded w-full max-w-2xl mb-4"></div>
            <div className="h-10 md:h-12 lg:h-14 bg-gray-700/50 rounded w-5/6 max-w-xl mb-8"></div>
            <div className="space-y-6 text-gray-300">
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#C19A4A] flex-shrink-0" />
                    <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                  </li>
                ))}
              </ul>
              <div className="h-4 bg-gray-700/50 rounded w-4/5 pt-2"></div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (type === 'terms') {
    return (
      <main className="flex-grow px-4 pb-12 w-full max-w-[500px] lg:max-w-5xl mx-auto bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white min-h-screen">
        <div className="text-center mb-8 pt-4 animate-pulse">
          <div className="h-10 bg-gray-700/50 rounded w-64 mx-auto mb-4 mt-[105px]"></div>
          <div className="h-4 bg-gray-700/50 rounded w-96 max-w-full mx-auto mb-2"></div>
          <div className="h-4 bg-gray-700/50 rounded w-80 max-w-full mx-auto"></div>
        </div>

        <div className="mb-8 text-center animate-pulse">
          <div className="h-3 bg-gray-700/50 rounded w-48 mx-auto"></div>
        </div>

        {/* Accordion Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="border border-[#C19A4A]/30 rounded-lg overflow-hidden">
              <div className="bg-[#131825]/80 p-4 flex justify-between items-center">
                <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                <div className="w-5 h-5 bg-gray-700/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Notice */}
        <div className="mt-12 p-5 rounded-lg border border-[#C19A4A]/30 bg-[#C19A4A]/5 animate-pulse">
          <div className="flex gap-3 items-start">
            <div className="w-5 h-5 bg-gray-700/50 rounded flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700/50 rounded w-32 mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700/50 rounded w-full"></div>
                <div className="h-3 bg-gray-700/50 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (type === 'miniThemHandover') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
        <div className="max-w-2xl mx-auto px-5 py-12 animate-pulse">
          {/* Back Button */}
          <div className="h-5 bg-gray-700/50 rounded w-32 mb-8 mt-[115px]"></div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-700/50 mb-6 mx-auto"></div>
            <div className="h-10 bg-gray-700/50 rounded w-96 max-w-full mx-auto mb-4"></div>
            <div className="h-5 bg-gray-700/50 rounded w-full max-w-xl mx-auto mb-2"></div>
            <div className="h-5 bg-gray-700/50 rounded w-5/6 max-w-lg mx-auto"></div>
          </div>

          {/* Benefits Card */}
          <div className="bg-[#111625] rounded-2xl p-8 border border-[#C19A4A]/20 mb-8">
            <div className="h-6 bg-gray-700/50 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-700/50 rounded-full shrink-0 mt-0.5"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <div className="h-14 bg-gray-700/50 rounded-xl"></div>
            <div className="h-5 bg-gray-700/50 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'message') {
    return (
      <div className="min-h-screen bg-[#0B0F1B] text-white font-sans">
        <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
          {/* Back Button */}
          <div className="h-5 bg-gray-700/50 rounded w-32 mb-6 mt-[105px]"></div>

          {/* Page Title */}
          <div className="h-8 bg-gray-700/50 rounded w-32 mb-6"></div>

          {/* Message List */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#151925] rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                  <div className="w-2 h-2 bg-gray-700/50 rounded-full"></div>
                </div>
                <div className="h-3 bg-gray-700/50 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
