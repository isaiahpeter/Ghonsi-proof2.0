import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from './supabaseAuth';

/**
 * Wallet and Email Binding Management API
 * Handles adding, removing, and managing multiple wallets and emails per user
 */

/**
 * Bind a new wallet to the user's account
 * @param {string} walletAddress - Solana wallet address to bind
 * @param {string} walletName - Name/label for the wallet (optional)
 * @param {boolean} makePrimary - Whether to make this the primary wallet
 * @returns {Promise<Object>} Bound wallet record
 */
export const bindWallet = async (walletAddress, walletName = 'Connected Wallet', makePrimary = false) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Binding wallet:', { walletAddress, walletName, makePrimary });

    // If making primary, unset other primaries
    if (makePrimary) {
      await supabase
        .from('user_wallets')
        .update({ is_primary: false })
        .eq('user_id', user.id);
    }

    // Insert new wallet
    const { data, error } = await supabase
      .from('user_wallets')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        wallet_name: walletName,
        is_primary: makePrimary || false,
        is_verified: true, // Already verified by wallet connection
        added_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Wallet bound successfully:', data);
    return data;
  } catch (error) {
    console.error('Error binding wallet:', error);
    throw error;
  }
};

/**
 * Unbind a wallet from the user's account
 * @param {string} walletAddress - Solana wallet address to unbind
 * @returns {Promise<boolean>} True if successful
 */
export const unbindWallet = async (walletAddress) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Unbinding wallet:', walletAddress);

    // Check if user has other wallets
    const { data: wallets } = await supabase
      .from('user_wallets')
      .select('id')
      .eq('user_id', user.id)
      .neq('wallet_address', walletAddress);

    if (!wallets || wallets.length === 0) {
      throw new Error('Cannot unbind the only wallet. Add another wallet first.');
    }

    // Delete the wallet
    const { error } = await supabase
      .from('user_wallets')
      .delete()
      .eq('user_id', user.id)
      .eq('wallet_address', walletAddress);

    if (error) throw error;

    console.log('Wallet unbound successfully');
    return true;
  } catch (error) {
    console.error('Error unbinding wallet:', error);
    throw error;
  }
};

/**
 * Get all wallets for the current user
 * @returns {Promise<Array>} Array of wallet records
 */
export const getUserWallets = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('added_at', { ascending: false });

    if (error) throw error;

    console.log('Retrieved user wallets:', data);
    return data || [];
  } catch (error) {
    console.error('Error retrieving user wallets:', error);
    return [];
  }
};

/**
 * Set a wallet as primary
 * @param {string} walletAddress - Wallet address to set as primary
 * @returns {Promise<Object>} Updated wallet record
 */
export const setPrimaryWallet = async (walletAddress) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Setting primary wallet:', walletAddress);

    // Unset all primaries
    await supabase
      .from('user_wallets')
      .update({ is_primary: false })
      .eq('user_id', user.id);

    // Set this one as primary
    const { data, error } = await supabase
      .from('user_wallets')
      .update({ is_primary: true })
      .eq('user_id', user.id)
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;

    console.log('Primary wallet updated:', data);
    return data;
  } catch (error) {
    console.error('Error setting primary wallet:', error);
    throw error;
  }
};

/**
 * Update email for the user
 * @param {string} newEmail - New email address
 * @returns {Promise<Object>} Updated user record
 */
export const updateEmail = async (newEmail) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Updating email to:', newEmail);

    // Update user email in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (authError) throw authError;

    // Update profile email as well
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('user_id', user.id)
      .select()
      .single();

    if (profileError) throw profileError;

    console.log('Email updated successfully');
    return profileData;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

/**
 * Get all emails associated with user (from auth & profile)
 * @returns {Promise<Object>} Email information
 */
export const getUserEmails = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single();

    return {
      primaryEmail: user.email,
      profileEmail: profileData?.email,
      verified: user.email_confirmed_at ? true : false,
    };
  } catch (error) {
    console.error('Error retrieving user emails:', error);
    throw error;
  }
};

/**
 * Add email to user profile (for secondary emails)
 * @param {string} email - Email to add
 * @returns {Promise<Object>} Updated profile
 */
export const addSecondaryEmail = async (email) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Adding secondary email:', email);

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        email: email,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    console.log('Secondary email added');
    return data;
  } catch (error) {
    console.error('Error adding secondary email:', error);
    throw error;
  }
};

/**
 * Remove email from profile
 * @returns {Promise<Object>} Updated profile
 */
export const removeProfileEmail = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Removing profile email');

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        email: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    console.log('Profile email removed');
    return data;
  } catch (error) {
    console.error('Error removing profile email:', error);
    throw error;
  }
};
