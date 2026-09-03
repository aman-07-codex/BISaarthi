import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

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
      <body className="antialiased bg-[#F7F5EF] dark:bg-[#0E1815] text-[#18211D] dark:text-[#F7F5EF] min-h-screen transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
