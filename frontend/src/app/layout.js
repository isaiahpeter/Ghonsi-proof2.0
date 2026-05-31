import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import Providers from '@/components/layout/Providers';
import Navbar from '@/components/layout/Navbar';
import FooterWrapper from '@/components/layout/FooterWrapper';

export const metadata = {
  title: 'Ghonsi proof — Your Marketing Expertise, Now Carried Forward Forever',
  description: 'Helping talents and hirers harness expert insights in their domain.',
  icons: {
    icon: 'favicon.png',
    shortcut: 'favicon.png',
    apple: 'favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B0F1B] font-sans antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
