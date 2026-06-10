'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple password check — change this to your admin password
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ghonsi-admin-2024';

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminAuth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid password. Please try again.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0B1121] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C19A4A]/10 border border-[#C19A4A]/30 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-[#C19A4A]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Ghonsi Proof — Restricted Access</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#1A2332] rounded-2xl p-8 border border-gray-700">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Admin Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full bg-[#0B1121] border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C19A4A] text-black font-bold py-3 rounded-lg hover:bg-[#D4A854] transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
