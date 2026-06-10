import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import Providers from '@/components/layout/Providers';
import NavbarWrapper from '@/components/layout/NavbarWrapper';
import FooterWrapper from '@/components/layout/FooterWrapper';

export const metadata = {
  metadataBase: new URL('https://ghonsi-proof2.vercel.app'),
  title: {
    default: 'Ghonsi proof - Gain deeper insights into the Nigerian market',
    template: '%s | Ghonsi Proof',
  },
  description: 'Understand Nigerian consumers better. Make smarter marketing decisions. Built for marketers, business owners, founders, and hirers who want to perform at a higher level.',
  keywords: [
    'Mini Me AI Agent',
    'AI Agent for Nigerians',
    'Proof of work',
    'Talent discovery platform',
    'AI co-pilot for freelancers',
  ],
  icons: {
    icon: 'favicon.png',
    shortcut: 'favicon.png',
    apple: 'favicon.png',
  },
};

export const viewport = {
  themeColor: '#C19A4A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B0F1B] font-sans antialiased">
        <Providers>
          <NavbarWrapper />
          <main>{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
