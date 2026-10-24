import React, { useState, useEffect } from 'react';
import { ShortLink } from '../types/link';
import { X, ExternalLink, Globe, Smartphone, Monitor } from 'lucide-react';

interface SocialCardSimulatorModalProps {
  link: ShortLink | null;
  baseUrl: string;
  onClose: () => void;
}

export const SocialCardSimulatorModal: React.FC<SocialCardSimulatorModalProps> = ({
  link,
  baseUrl,
  onClose,
}) => {
  if (!link) return null;

  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'whatsapp' | 'facebook'>('twitter');
  const [meta, setMeta] = useState<any>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const fullShortUrl = `${baseUrl}/r/${link.slug}`;

  // Fetch or extract domain metadata
  useEffect(() => {
    let isMounted = true;
    setLoadingMeta(true);
    fetch('/api/preview-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: link.originalUrl }),
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setMeta(data);
          setLoadingMeta(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingMeta(false);
      });

    return () => {
      isMounted = false;
    };
  }, [link.originalUrl]);

  let displayDomain = 'yoursite.com';
  try {
    const u = new URL(link.originalUrl);
    displayDomain = u.hostname;
  } catch {}

  const cardTitle = link.title || meta?.title || 'Shared Content Headline';
  const cardDesc = link.description || meta?.description || `Click to explore this link and learn more about ${displayDomain}.`;

  // Representative illustration for social card preview
  const previewImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              OG
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Social Media Card Simulator</h2>
              <p className="text-xs text-slate-500">Preview OpenGraph rich link cards before posting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-600 mr-2">Preview Platform:</span>
          <button
            onClick={() => setPlatform('twitter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              platform === 'twitter'
                ? 'bg-black text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Twitter / X Card
          </button>
          <button
            onClick={() => setPlatform('linkedin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              platform === 'linkedin'
                ? 'bg-[#0077b5] text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            LinkedIn Feed
          </button>
          <button
            onClick={() => setPlatform('whatsapp')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              platform === 'whatsapp'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            WhatsApp Message
          </button>
          <button
            onClick={() => setPlatform('facebook')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              platform === 'facebook'
                ? 'bg-[#1877f2] text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Facebook Post
          </button>
        </div>

        {/* Preview Frame */}
        <div className="p-6 overflow-y-auto bg-slate-100/70 flex items-center justify-center min-h-[380px]">
          {/* TWITTER / X CARD SIMULATION */}
          {platform === 'twitter' && (
            <div className="w-full max-w-lg bg-black text-white p-4 rounded-2xl shadow-xl font-sans">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                  U
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <span>Creator Account</span>
                    <span className="text-slate-400 font-normal text-xs">@handle · 2m</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Sharing the link: <span className="text-sky-400">{fullShortUrl}</span>
                  </div>
                </div>
              </div>

              {/* Card Container */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
                <div className="aspect-video w-full bg-slate-800 relative overflow-hidden">
                  <img
                    src={previewImage}
                    alt="OpenGraph Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[11px] text-slate-200 font-mono">
                    {displayDomain}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                    {displayDomain}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
                    {cardTitle}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {cardDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LINKEDIN FEED SIMULATION */}
          {platform === 'linkedin' && (
            <div className="w-full max-w-lg bg-white p-4 rounded-xl border border-slate-200 shadow-xl font-sans text-slate-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                  AM
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Alex Morgan</div>
                  <div className="text-[11px] text-slate-500">VP Product &amp; Founder · 1st</div>
                  <div className="text-[10px] text-slate-400">Just now · 🌐</div>
                </div>
              </div>
              <p className="text-xs text-slate-800 mb-3">
                Excited to share this link with my professional network: {fullShortUrl}
              </p>

              {/* LinkedIn Rich Link Banner */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <div className="aspect-video w-full bg-slate-200 overflow-hidden">
                  <img
                    src={previewImage}
                    alt="LinkedIn preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-slate-900 mb-0.5 line-clamp-1">
                    {cardTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {displayDomain}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WHATSAPP CHAT BUBBLE SIMULATION */}
          {platform === 'whatsapp' && (
            <div className="w-full max-w-md bg-[#e5ddd5] p-5 rounded-2xl shadow-inner font-sans">
              <div className="bg-white rounded-xl rounded-tl-none p-2 shadow-sm border border-slate-200/60 max-w-sm ml-auto space-y-1.5">
                <div className="rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                  <div className="h-32 w-full overflow-hidden bg-slate-200">
                    <img
                      src={previewImage}
                      alt="WhatsApp preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-2">
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{cardTitle}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{cardDesc}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">{displayDomain}</span>
                  </div>
                </div>
                <div className="text-xs text-emerald-700 font-mono underline break-all px-1">
                  {fullShortUrl}
                </div>
                <div className="text-[10px] text-slate-400 text-right pr-1">
                  10:42 AM · ✓✓
                </div>
              </div>
            </div>
          )}

          {/* FACEBOOK POST SIMULATION */}
          {platform === 'facebook' && (
            <div className="w-full max-w-lg bg-white p-4 rounded-xl border border-slate-200 shadow-xl font-sans text-slate-900">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  f
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Community Channel</div>
                  <div className="text-[10px] text-slate-400">1 hr · 🌎</div>
                </div>
              </div>
              <p className="text-xs text-slate-800 mb-3">Check this out! {fullShortUrl}</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="aspect-video w-full bg-slate-200">
                  <img
                    src={previewImage}
                    alt="Facebook Card"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 bg-slate-50">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold font-mono block mb-0.5">
                    {displayDomain}
                  </span>
                  <div className="text-sm font-bold text-slate-900 line-clamp-1">{cardTitle}</div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{cardDesc}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            OpenGraph Title &amp; description will render automatically when pasted.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
