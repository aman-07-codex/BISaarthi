'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { DisclaimerFooter } from '../common/DisclaimerFooter';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      {/* Persistent Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200">
        {/* Persistent 64px Header */}
        <AppHeader onMobileMenuToggle={() => setIsMobileNavOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Regulatory Disclaimer Footer */}
        <DisclaimerFooter />
      </div>
    </div>
  );
};
