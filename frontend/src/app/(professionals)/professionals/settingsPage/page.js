'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Shield, Moon, Download, Lock, Eye, Globe, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/utils/supabaseAuth';
import { getProfile } from '@/utils/profileApi';
import { supabase } from '@/lib/supabaseClient';

function SettingsPage() {
  const router = useRouter();
  const [emailNotifications] = useState(true);
  const [pushNotifications] = useState(true);
  const [profileVisibility] = useState('Public');
  const [language, setLanguage] = useState('English');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmInput, setShowConfirmInput] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getProfile(user.id);
          setUserName(profile?.display_name || 'User');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUserName();
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteInput !== `delete ${userName} account`) return;
    
    setIsDeleting(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not found');

      console.log('Deleting account for user:', user.id);

      // Delete storage files first
      try {
        const { data: storageFiles } = await supabase.storage
          .from('proof-files')
          .list(user.id);
        
        if (storageFiles && storageFiles.length > 0) {
          const filePaths = storageFiles.map(file => `${user.id}/${file.name}`);
          await supabase.storage.from('proof-files').remove(filePaths);
          console.log('Storage files deleted');
        }
      } catch (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete user record - CASCADE will handle related records
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('User deleted successfully');
      await logout();
      
      // Dispatch event to notify header and other components
      window.dispatchEvent(new Event('auth-state-changed'));
      
      // Navigate to home
      router.push('/', { replace: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const showComingSoonPopup = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
      
      <div className="max-w-full mx-auto px-4 py-8">
        <button onClick={() => router.push('/dashboard')} className="mt-[85px] inline-flex items-center text-[#C19A4A] text-sm mb-6 hover:underline gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[Inter] mb-2">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your account preferences and application settings</p>
        </div>

        {/* Notifications Section */}
        <div className="rounded-xl p-5 mb-4 border bg-[#111625] border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex-1">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive updates including proof verifications and portfolio request via email</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); showComingSoonPopup(); }}
                className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-[#C19A4A]' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex-1">
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-gray-400">Receive browser push notifications</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); showComingSoonPopup(); }}
                className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors ${pushNotifications ? 'bg-[#C19A4A]' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="rounded-xl p-5 mb-4 border bg-[#111625] border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Privacy & Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Profile Visibility</p>
                  <p className="text-xs text-gray-400">Control who can see your profile</p>
                </div>
              </div>
              <select
                value={profileVisibility}
                onChange={(e) => { e.preventDefault(); showComingSoonPopup(); }}
                className="text-sm px-3 py-1.5 rounded border outline-none bg-[#0B0F1B] text-white border-white/10"
              >
                <option>Public</option>
                <option>Private</option>
                <option>Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-400">Add an extra layer of security</p>
                </div>
              </div>
              <button 
                onClick={showComingSoonPopup}
                className="text-xs px-3 py-1.5 rounded border transition-colors bg-[#0B0F1B] text-white border-white/10 hover:bg-[#1A1F2E]"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="rounded-xl p-5 mb-4 border bg-[#111625] border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Moon size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Language</p>
                  <p className="text-xs text-gray-400">Select your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => { 
                  if (e.target.value === 'Other') {
                    e.preventDefault();
                    showComingSoonPopup();
                    setLanguage('English');
                  } else {
                    setLanguage(e.target.value);
                  }
                }}
                className="text-sm px-3 py-1.5 rounded border outline-none bg-[#0B0F1B] text-white border-white/10"
              >
                <option>English</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-gray-400">Choose your preferred theme</p>
                </div>
              </div>
              <select
                value="Dark"
                onChange={() => {}}
                className="text-sm px-3 py-1.5 rounded border outline-none bg-[#0B0F1B] text-white border-white/10"
              >
                <option>Dark</option>
                <option>Light</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="rounded-xl p-5 mb-4 border bg-[#111625] border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Download size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Download size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Export Your Data</p>
                  <p className="text-xs text-gray-400">Download a copy of all your data</p>
                </div>
              </div>
              <button 
                onClick={showComingSoonPopup}
                className="text-xs px-3 py-1.5 rounded border transition-colors flex items-center gap-1 bg-[#0B0F1B] text-white border-white/10 hover:bg-[#1A1F2E]"
              >
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-500">Delete Account</p>
                  <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {showComingSoon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="px-8 py-4 rounded-xl bg-[#111625] shadow-2xl">
            <p className="text-lg font-semibold">Coming soon!</p>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full rounded-xl p-6 bg-[#111625]">
            {!showConfirmInput ? (
              <>
                <h3 className="text-xl font-bold mb-4 text-red-500">Delete Account</h3>
                <p className="mb-6 text-sm text-gray-300">
                  Are you sure you want to delete your account? This step cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmInput(true)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 rounded-lg transition-colors font-semibold bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4 text-red-500">Final Confirmation</h3>
                <p className="mb-4 text-sm text-gray-300">
                  Type the following to confirm: <span className="font-bold">delete {userName} account</span>
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder={`delete ${userName} account`}
                  className="w-full px-4 py-2 rounded-lg mb-4 outline-none bg-[#0B0F1B] text-white border border-white/10"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== `delete ${userName} account` || isDeleting}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmInput(false);
                      setShowDeleteModal(false);
                      setDeleteInput('');
                    }}
                    disabled={isDeleting}
                    className="flex-1 py-2 rounded-lg transition-colors font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}

export default SettingsPage;
