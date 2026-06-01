'use client';
import MiniMeChat from '@/components/shared/MiniMeChat';

// Thin client wrapper so MiniMeChat (which uses hooks)
// can be imported into the SSR page.js without breaking the server component.
export default function MiniMeChatWrapper() {
  return <MiniMeChat />;
}
