import React, { useState } from 'react';
import { ShortLink } from '../types/link';
import { copyToClipboard } from '../utils/social';
import {
  Link as LinkIcon,
  Copy,
  Check,
  QrCode,
  Share2,
  Sliders,
  ExternalLink,
  Lock,
  Tag,
  Eye,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ShortenHeroProps {
  onLinkCreated: (link: ShortLink) => void;
  onOpenShareModal: (link: ShortLink) => void;
  onOpenQrModal: (link: ShortLink) => void;
  onOpenCardPreview: (link: ShortLink) => void;
  baseUrl: string;
}

export const ShortenHero: React.FC<ShortenHeroProps> = ({
  onLinkCreated,
  onOpenShareModal,
  onOpenQrModal,
  onOpenCardPreview,
  baseUrl,
}) => {
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('snip.link');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setLongUrl(text);
    } catch {
      // ignore clipboard permission error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      setError('Please enter a destination URL to shorten.');
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const payload: any = {
      originalUrl: longUrl.trim(),
      customSlug: customSlug.trim() || undefined,
      title: title.trim() || undefined,
      tags,
      isPasswordProtected,
      password: isPasswordProtected ? password : '',
      expiresAt: expiresAt || undefined,
      utm: (utmSource || utmMedium || utmCampaign) ? {
        source: utmSource.trim() || undefined,
        medium: utmMedium.trim() || undefined,
        campaign: utmCampaign.trim() || undefined,
      } : undefined,
    };

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create short link');
      }

      setLastCreated(data);
      onLinkCreated(data);
      setLongUrl('');
      setCustomSlug('');
      setTitle('');
      setTagsInput('');
      setIsPasswordProtected(false);
      setPassword('');
      setExpiresAt('');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setShowAdvanced(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (slug: string) => {
    const fullUrl = `${baseUrl}/r/${slug}`;
    const ok = await copyToClipboard(fullUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-orange-100/50 via-slate-100/30 to-transparent -z-10 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Editorial lead badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-orange-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>The Next-Generation Link Management Platform</span>
        </div>

        {/* Display Hero Headline with text-wrap balance */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-5 [text-wrap:balance]">
          Short links you can share anywhere
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 [text-wrap:balance]">
          Create branded links, generate vector QR codes, customize social share previews, and track real-time click metrics across every channel.
        </p>

        {/* URL Shortening Box */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-4 sm:p-6 text-left transition-all">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="Paste your long link here (e.g. https://yoursite.com/product/summer-special)..."
                  className="w-full pl-10 pr-20 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute inset-y-1.5 right-1.5 px-3 flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Paste
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Shortening...</span>
                  </>
                ) : (
                  <>
                    <span>Shorten URL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* Customization Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide Customization Options' : 'Customize Back-Half, UTM, & Protection'}</span>
              </button>

              <div className="text-xs text-slate-400 hidden sm:block">
                Auto-generates clean 6-character alias if empty
              </div>
            </div>

            {/* Advanced Settings Drawer */}
            {showAdvanced && (
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Branded Domain & Custom Back-Half
                    </label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
                      <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="bg-transparent text-xs text-slate-600 px-2.5 py-2 border-r border-slate-200 focus:outline-none"
                      >
                        <option value="snip.link">snip.link /</option>
                        <option value="share.to">share.to /</option>
                        <option value="go.link">go.link /</option>
                      </select>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="e.g. launch-2026"
                        className="flex-1 px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none placeholder:text-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Link Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Q3 Investor Update"
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Tags & Expiration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>Tags (comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. social, marketing, twitter"
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Link Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Password Protection */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPasswordProtected}
                        onChange={(e) => setIsPasswordProtected(e.target.checked)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Password Protect this Link</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Visitors must enter password to unlock</span>
                  </div>

                  {isPasswordProtected && (
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set access password (e.g. confidential2026)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  )}
                </div>

                {/* Integrated UTM Builder */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-xs font-semibold text-slate-800 mb-2">
                    Marketing UTM Campaign Tracking (Optional)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Source</span>
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="e.g. twitter, newsletter"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Medium</span>
                      <input
                        type="text"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        placeholder="e.g. social, email, cpc"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Campaign</span>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        placeholder="e.g. summer_promo"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Generated Link Result Ribbon */}
          {lastCreated && (
            <div className="mt-6 pt-5 border-t border-slate-100 bg-orange-50/50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 sm:p-6 rounded-b-2xl border-t border-orange-100">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-800 mb-1">
                    <Check className="w-3.5 h-3.5 text-orange-600" />
                    <span>Link Shortened Successfully!</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-mono tracking-tight truncate">
                      {baseUrl}/r/{lastCreated.slug}
                    </span>
                    <a
                      href={`/r/${lastCreated.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    Destination: {lastCreated.originalUrl}
                  </div>
                </div>

                {/* Instant Actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => handleCopyLink(lastCreated.slug)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Link!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => onOpenShareModal(lastCreated)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share on Social</span>
                  </button>

                  <button
                    onClick={() => onOpenQrModal(lastCreated)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>QR Code</span>
                  </button>

                  <button
                    onClick={() => onOpenCardPreview(lastCreated)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Card Preview</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature KPI strip below hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 text-left">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">100%</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Reliable Redirection</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">&lt;50ms</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Edge Latency</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">9+</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Social Share Targets</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">Live</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Click Stream Analytics</div>
          </div>
        </div>
      </div>
    </section>
  );
};
