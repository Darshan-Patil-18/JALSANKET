import type { Metadata } from 'next';
import './globals.css';
import BackgroundVideo from '@/components/BackgroundVideo';
import { LanguageProvider } from '@/lib/LanguageContext';

export const metadata: Metadata = {
  title: 'JalSanket | Real-time Coastal AQI, Weather & PFZ Intelligence',
  description:
    'Precision oceanographic, AQI, and atmospheric intelligence for coastal safety, maritime navigation, and potential fishing zones.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative min-h-screen font-sans bg-sky-100 text-slate-800 flex flex-col">
        {/* Full-page looping background video with very-light overlay */}
        <BackgroundVideo />

        {/* Navbar (logo + tabs) rendered from page.tsx so it can hold tab state */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

