import React from 'react';
import { Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: 'shortener' | 'links' | 'qr' | 'utm';
  onSelectTab: (tab: 'shortener' | 'links' | 'qr' | 'utm') => void;
  onOpenCreate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onOpenCreate }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('shortener')}
          className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            S
          </span>
          <span className="font-extrabold tracking-tight">SnipLink</span>
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('shortener')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'shortener'
                ? 'text-orange-600 border-orange-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Shortener
          </button>
          <button
            onClick={() => onSelectTab('links')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'links'
                ? 'text-orange-600 border-orange-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            My Links
          </button>
          <button
            onClick={() => onSelectTab('qr')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'qr'
                ? 'text-orange-600 border-orange-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            QR Studio
          </button>
          <button
            onClick={() => onSelectTab('utm')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'utm'
                ? 'text-orange-600 border-orange-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Campaigns
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Link</span>
          </button>
        </div>
      </div>
    </header>
  );
};
