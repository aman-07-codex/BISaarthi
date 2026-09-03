import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BISaarthi — Your AI Guide to Indian Standards & BIS Compliance',
  description: 'AI-powered guidance platform for Indian Standards (IS), testing procedures, and BIS certification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
