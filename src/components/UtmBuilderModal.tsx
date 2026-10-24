import React, { useState } from 'react';
import { ShortLink } from '../types/link';
import { copyToClipboard } from '../utils/social';
import {
  X,
  Target,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface UtmBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated: (link: ShortLink) => void;
  baseUrl: string;
}

export const UtmBuilderModal: React.FC<UtmBuilderModalProps> = ({
  isOpen,
  onClose,
  onLinkCreated,
  baseUrl,
}) => {
  if (!isOpen) return null;

  const [destinationUrl, setDestinationUrl] = useState('https://yoursite.com/launch');
  const [source, setSource] = useState('twitter');
  const [medium, setMedium] = useState('social');
  const [campaign, setCampaign] = useState('product_drop');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('cta_link');
  const [customSlug, setCustomSlug] = useState('');

  const [shortening, setShortening] = useState(false);
  const [resultLink, setResultLink] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { label: 'Twitter / X', source: 'twitter', medium: 'social', campaign: 'brand_post' },
    { label: 'Instagram Bio', source: 'instagram', medium: 'bio', campaign: 'profile_link' },
    { label: 'LinkedIn', source: 'linkedin', medium: 'social_b2b', campaign: 'founder_update' },
    { label: 'Email Newsletter', source: 'newsletter', medium: 'email', campaign: 'weekly_digest' },
    { label: 'YouTube Description', source: 'youtube', medium: 'video_desc', campaign: 'tutorial_demo' },
  ];

  const buildTaggedUrl = () => {
    try {
      let base = destinationUrl.trim();
      if (!base.startsWith('http://') && !base.startsWith('https://')) {
        base = 'https://' + base;
      }
      const u = new URL(base);
      if (source) u.searchParams.set('utm_source', source.trim());
      if (medium) u.searchParams.set('utm_medium', medium.trim());
      if (campaign) u.searchParams.set('utm_campaign', campaign.trim());
      if (term) u.searchParams.set('utm_term', term.trim());
      if (content) u.searchParams.set('utm_content', content.trim());
      return u.toString();
    } catch {
      return destinationUrl;
    }
  };

  const finalTaggedUrl = buildTaggedUrl();

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSource(p.source);
    setMedium(p.medium);
    setCampaign(p.campaign);
  };

  const handleCreateShortLink = async () => {
    setShortening(true);
    setError(null);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: finalTaggedUrl,
          customSlug: customSlug.trim() || undefined,
          tags: ['campaign', source, medium].filter(Boolean),
          utm: { source, medium, campaign, term, content },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign short link');

      setResultLink(data);
      onLinkCreated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setShortening(false);
    }
  };

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Campaign UTM Builder</h2>
              <p className="text-xs text-slate-500">Track source, medium, and campaign performance across analytics platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Channel Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Quick Channel Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Destination URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://yourbrand.com/landing"
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* UTM Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="twitter, google, fb"
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Medium <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="social, cpc, email"
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="spring_sale_2026"
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Term (Keywords)
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. running+shoes"
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Content (Variant/CTA)
              </label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g. logolink, top_cta"
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Custom Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Back-Half / Alias (Optional)
            </label>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="e.g. twitter-spring-promo"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Live Tagged URL Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Generated Destination URL
            </span>
            <div className="text-xs font-mono text-slate-800 break-all">
              {finalTaggedUrl}
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Result Shortened Link */}
          {resultLink && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-orange-900 block">
                  Short Campaign Link Created!
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 truncate block">
                  {baseUrl}/r/{resultLink.slug}
                </span>
              </div>
              <button
                onClick={() => handleCopy(`${baseUrl}/r/${resultLink.slug}`)}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
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
            onClick={handleCreateShortLink}
            disabled={shortening}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {shortening ? (
              <span>Building...</span>
            ) : (
              <>
                <span>Shorten &amp; Tag Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
