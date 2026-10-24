import React, { useState, useEffect } from 'react';
import { ShortLink, BioProfile } from '../types/link';
import { copyToClipboard } from '../utils/social';
import {
  X,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Share2,
  User,
  Palette
} from 'lucide-react';

interface BioPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: ShortLink[];
  baseUrl: string;
}

export const BioPageModal: React.FC<BioPageModalProps> = ({
  isOpen,
  onClose,
  links,
  baseUrl,
}) => {
  if (!isOpen) return null;

  const [bioProfile, setBioProfile] = useState<BioProfile>({
    username: 'alex',
    displayName: 'Alex Morgan',
    bio: 'Product Designer & Developer. Sharing software drops, curated links, and project breakdowns.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    theme: 'slate',
    socialLinks: [
      { platform: 'twitter', url: 'https://x.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'github', url: 'https://github.com' },
    ],
    linkIds: links.slice(0, 3).map(l => l.id),
  });

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/bio')
      .then(res => res.json())
      .then(data => {
        if (data && data.username) {
          setBioProfile(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      await fetch('/api/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bioProfile),
      });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const bioLinkUrl = `${baseUrl}/bio/${bioProfile.username}`;

  const handleCopyBio = async () => {
    const ok = await copyToClipboard(bioLinkUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleLinkId = (id: string) => {
    const current = bioProfile.linkIds || [];
    if (current.includes(id)) {
      setBioProfile({ ...bioProfile, linkIds: current.filter(i => i !== id) });
    } else {
      setBioProfile({ ...bioProfile, linkIds: [...current, id] });
    }
  };

  // Theme styling definitions for phone mockup
  const themeStyles = {
    slate: 'bg-slate-900 text-white',
    minimal: 'bg-white text-slate-900',
    sunset: 'bg-gradient-to-b from-orange-500 to-amber-600 text-white',
    emerald: 'bg-gradient-to-b from-emerald-800 to-slate-950 text-white',
    indigo: 'bg-gradient-to-b from-indigo-900 to-slate-950 text-white',
  };

  const selectedLinks = links.filter(l => (bioProfile.linkIds || []).includes(l.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Link-in-Bio Mobile Page</h2>
              <p className="text-xs text-slate-500">Create a personalized landing page for Instagram, TikTok, and Twitter bios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Editor on Left, Live Phone Mockup on Right */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Shareable Link Bar */}
            <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider block">
                  Your Bio Link for Social Media
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 truncate block">
                  {bioLinkUrl}
                </span>
              </div>
              <button
                onClick={handleCopyBio}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Profile Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={bioProfile.displayName}
                    onChange={(e) => setBioProfile({ ...bioProfile, displayName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Bio Username / Handle
                  </label>
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    <span className="text-xs text-slate-500 px-2.5 py-1.5 bg-slate-100 border-r border-slate-200">
                      bio/
                    </span>
                    <input
                      type="text"
                      value={bioProfile.username}
                      onChange={(e) => setBioProfile({ ...bioProfile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bio Description
                </label>
                <textarea
                  rows={2}
                  value={bioProfile.bio}
                  onChange={(e) => setBioProfile({ ...bioProfile, bio: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={bioProfile.avatarUrl}
                  onChange={(e) => setBioProfile({ ...bioProfile, avatarUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Theme Picker */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Page Theme
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'slate', label: 'Dark Slate' },
                  { id: 'minimal', label: 'Clean Light' },
                  { id: 'sunset', label: 'Sunset' },
                  { id: 'emerald', label: 'Emerald' },
                  { id: 'indigo', label: 'Deep Indigo' },
                ].map(th => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setBioProfile({ ...bioProfile, theme: th.id as any })}
                    className={`py-2 px-1 text-[11px] font-medium rounded-lg border text-center transition-colors ${
                      bioProfile.theme === th.id
                        ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Links to Feature */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Featured Short Links on Bio Page
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {links.map(l => {
                  const isChecked = (bioProfile.linkIds || []).includes(l.id);
                  return (
                    <label
                      key={l.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-orange-50/40 border-orange-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLinkId(l.id)}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 truncate">{l.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">/{l.slug}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {l.clicks} clicks
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Phone Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-[280px] h-[520px] rounded-[38px] border-[7px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative bg-slate-900">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto z-10 shrink-0" />

              {/* Scrollable Screen Content */}
              <div
                className={`flex-1 overflow-y-auto p-4 text-center ${themeStyles[bioProfile.theme || 'slate']}`}
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-2 border-white/20 shadow-md">
                  <img
                    src={bioProfile.avatarUrl}
                    alt={bioProfile.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Name & Bio */}
                <h4 className="text-sm font-bold mb-0.5">{bioProfile.displayName}</h4>
                <p className="text-[10px] opacity-80 max-w-[200px] mx-auto leading-relaxed mb-3">
                  {bioProfile.bio}
                </p>

                {/* Social Quick Bar */}
                <div className="flex items-center justify-center gap-3 mb-4 opacity-90 text-xs">
                  <span>𝕏</span>
                  <span>in</span>
                  <span>GH</span>
                  <span>YT</span>
                </div>

                {/* Links Stack */}
                <div className="space-y-2">
                  {selectedLinks.length === 0 ? (
                    <div className="text-[11px] opacity-60 py-6">
                      Select links on the left to display them here
                    </div>
                  ) : (
                    selectedLinks.map(l => (
                      <a
                        key={l.id}
                        href={`${baseUrl}/r/${l.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`block p-2.5 rounded-xl text-xs font-semibold shadow-xs transition-transform active:scale-95 ${
                          bioProfile.theme === 'minimal'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                            : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs border border-white/10'
                        }`}
                      >
                        <div className="truncate">{l.title}</div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="h-4 bg-transparent flex items-center justify-center shrink-0">
                <div className="w-20 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveBio}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save & Publish Bio'}
          </button>
        </div>
      </div>
    </div>
  );
};
