/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShortLink } from './types/link';
import { Navbar } from './components/Navbar';
import { ShortenHero } from './components/ShortenHero';
import { LinkList } from './components/LinkList';
import { SocialShareModal } from './components/SocialShareModal';
import { SocialCardSimulatorModal } from './components/SocialCardSimulatorModal';
import { QrModal } from './components/QrModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { UtmBuilderModal } from './components/UtmBuilderModal';
import { BioPageModal } from './components/BioPageModal';
import { BulkShortenModal } from './components/BulkShortenModal';
import { PasswordModal } from './components/PasswordModal';
import {
  Share2,
  QrCode,
  Target,
  Smartphone,
  Layers,
  Sparkles,
  ShieldCheck,
  Check,
  BarChart3,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';

export default function App() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shortener' | 'links' | 'qr' | 'utm' | 'bio'>('shortener');

  // Modals state
  const [activeShareLink, setActiveShareLink] = useState<ShortLink | null>(null);
  const [activeQrLink, setActiveQrLink] = useState<ShortLink | null>(null);
  const [activePreviewLink, setActivePreviewLink] = useState<ShortLink | null>(null);
  const [activeAnalyticsLink, setActiveAnalyticsLink] = useState<ShortLink | null>(null);
  const [activePasswordLink, setActivePasswordLink] = useState<ShortLink | null>(null);
  const [isUtmModalOpen, setIsUtmModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Quick feedback toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Load links from API
  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (err) {
      console.error('Failed to load links:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleLinkCreated = (newLink: ShortLink) => {
    setLinks(prev => [newLink, ...prev]);
    showToast(`Created short link: /r/${newLink.slug}`);
  };

  const handleBulkLinksCreated = (newLinks: ShortLink[]) => {
    setLinks(prev => [...newLinks, ...prev]);
    showToast(`Created ${newLinks.length} short links in batch`);
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== id));
        showToast('Link removed successfully');
      }
    } catch {
      showToast('Error deleting link');
    }
  };

  const handleUpdateLink = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setLinks(prev => prev.map(l => (l.id === id ? updated : l)));
        showToast('Link configuration updated');
      }
    } catch {
      showToast('Error updating link');
    }
  };

  const handleSimulateClick = async (id: string, referrer: string) => {
    try {
      const res = await fetch(`/api/links/${id}/simulate-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinks(prev => prev.map(l => (l.id === id ? data.link : l)));
        if (activeAnalyticsLink && activeAnalyticsLink.id === id) {
          setActiveAnalyticsLink(data.link);
        }
        showToast(`Logged test click from ${referrer}!`);
      }
    } catch {
      showToast('Failed to simulate click');
    }
  };

  // Quick stats
  const totalClicks = links.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'qr') {
            if (links.length > 0) setActiveQrLink(links[0]);
            else showToast('Please create a short link first to open QR studio.');
          } else if (tab === 'utm') {
            setIsUtmModalOpen(true);
          } else if (tab === 'bio') {
            setIsBioModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenCreate={() => {
          setActiveTab('shortener');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {activeTab === 'shortener' && (
          <div className="space-y-12">
            {/* Hero & Instant Shortener */}
            <ShortenHero
              onLinkCreated={handleLinkCreated}
              onOpenShareModal={(l) => setActiveShareLink(l)}
              onOpenQrModal={(l) => setActiveQrLink(l)}
              onOpenCardPreview={(l) => setActivePreviewLink(l)}
              onOpenPasswordModal={(l) => setActivePasswordLink(l)}
              baseUrl={baseUrl}
            />

            {/* Quick Action Tools Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all text-left group shadow-2xs"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Bulk Link Shortener</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Batch paste up to 20 links at once and export formatted CSV.
                </p>
              </button>

              <button
                onClick={() => setIsUtmModalOpen(true)}
                className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all text-left group shadow-2xs"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Campaign UTM Builder</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate Google Analytics tags for Twitter, LinkedIn, and email drops.
                </p>
              </button>

              <button
                onClick={() => setIsBioModalOpen(true)}
                className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all text-left group shadow-2xs"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Link-in-Bio Page</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create a unified mobile landing page for Instagram and TikTok bio links.
                </p>
              </button>
            </div>

            {/* Active Links Section Header */}
            <div className="pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Short Links &amp; Analytics</h2>
                  <p className="text-xs text-slate-500">Track clicks, share across networks, and manage destinations</p>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  <span className="font-semibold text-slate-900 tabular-nums">{links.length}</span> links ·{' '}
                  <span className="font-semibold text-slate-900 tabular-nums">{totalClicks.toLocaleString()}</span> clicks
                </div>
              </div>

              {/* Links Management Feed */}
              <LinkList
                links={links}
                baseUrl={baseUrl}
                onOpenAnalytics={(l) => setActiveAnalyticsLink(l)}
                onOpenShare={(l) => setActiveShareLink(l)}
                onOpenQr={(l) => setActiveQrLink(l)}
                onOpenPreview={(l) => setActivePreviewLink(l)}
                onOpenPassword={(l) => setActivePasswordLink(l)}
                onDeleteLink={handleDeleteLink}
                onSimulateClick={handleSimulateClick}
              />
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Short Links</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage active redirects, filter campaigns, and review engagement metrics.
                </p>
              </div>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Bulk Import</span>
              </button>
            </div>

            <LinkList
              links={links}
              baseUrl={baseUrl}
              onOpenAnalytics={(l) => setActiveAnalyticsLink(l)}
              onOpenShare={(l) => setActiveShareLink(l)}
              onOpenQr={(l) => setActiveQrLink(l)}
              onOpenPreview={(l) => setActivePreviewLink(l)}
              onOpenPassword={(l) => setActivePasswordLink(l)}
              onDeleteLink={handleDeleteLink}
              onSimulateClick={handleSimulateClick}
            />
          </div>
        )}
      </main>

      {/* Social Media Share Modal */}
      <SocialShareModal
        link={activeShareLink}
        baseUrl={baseUrl}
        onClose={() => setActiveShareLink(null)}
      />

      {/* Social Card Simulator (OpenGraph Preview) */}
      <SocialCardSimulatorModal
        link={activePreviewLink}
        baseUrl={baseUrl}
        onClose={() => setActivePreviewLink(null)}
      />

      {/* QR Code Design Studio Modal */}
      <QrModal
        link={activeQrLink}
        baseUrl={baseUrl}
        onClose={() => setActiveQrLink(null)}
        onUpdateLink={handleUpdateLink}
      />

      {/* Password Protection Modal */}
      <PasswordModal
        link={activePasswordLink}
        baseUrl={baseUrl}
        onClose={() => setActivePasswordLink(null)}
        onUpdateLink={handleUpdateLink}
      />

      {/* Deep Dive Analytics Modal */}
      <AnalyticsModal
        link={activeAnalyticsLink}
        baseUrl={baseUrl}
        onClose={() => setActiveAnalyticsLink(null)}
        onSimulateClick={handleSimulateClick}
      />

      {/* UTM Campaign Builder Modal */}
      <UtmBuilderModal
        isOpen={isUtmModalOpen}
        onClose={() => setIsUtmModalOpen(false)}
        onLinkCreated={handleLinkCreated}
        baseUrl={baseUrl}
      />

      {/* Link-in-Bio Profile Modal */}
      <BioPageModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        links={links}
        baseUrl={baseUrl}
      />

      {/* Bulk Shortener Modal */}
      <BulkShortenModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onLinksCreated={handleBulkLinksCreated}
        baseUrl={baseUrl}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SnipLink</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span aria-hidden="true">·</span>
            <span>Short links you can share anywhere</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsUtmModalOpen(true)} className="hover:text-slate-900 transition-colors">
              UTM Builder
            </button>
            <button onClick={() => setIsBioModalOpen(true)} className="hover:text-slate-900 transition-colors">
              Link-in-Bio
            </button>
            <button onClick={() => setIsBulkModalOpen(true)} className="hover:text-slate-900 transition-colors">
              Bulk Shortener
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
