import React, { useState } from 'react';
import { ShortLink } from '../types/link';
import { copyToClipboard } from '../utils/social';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Share2,
  QrCode,
  Lock,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';

interface LinkListProps {
  links: ShortLink[];
  baseUrl: string;
  onOpenAnalytics: (link: ShortLink) => void;
  onOpenShare: (link: ShortLink) => void;
  onOpenQr: (link: ShortLink) => void;
  onOpenPreview: (link: ShortLink) => void;
  onDeleteLink: (id: string) => void;
  onSimulateClick: (id: string, referrer: string) => void;
}

export const LinkList: React.FC<LinkListProps> = ({
  links,
  baseUrl,
  onOpenAnalytics,
  onOpenShare,
  onOpenQr,
  onOpenPreview,
  onDeleteLink,
  onSimulateClick,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Extract all distinct tags
  const allTags = Array.from(
    new Set(links.flatMap(l => l.tags || []))
  ).filter(Boolean);

  const filteredLinks = links.filter(l => {
    const matchesSearch =
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.originalUrl.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      selectedTag === 'all' || (l.tags && l.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const handleCopy = async (link: ShortLink) => {
    const fullUrl = `${baseUrl}/r/${link.slug}`;
    const ok = await copyToClipboard(fullUrl);
    if (ok) {
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSimulate = async (id: string, ref: string) => {
    setSimulatingId(id);
    await onSimulateClick(id, ref);
    setTimeout(() => setSimulatingId(null), 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search + Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links by title, slug, or destination..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Filter Tabs (Interactive segmented control) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedTag === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Links ({links.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize whitespace-nowrap shrink-0 ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">No short links found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'Try adjusting your search criteria or tag filter.' : 'Shorten your first link using the box above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => {
            const shortUrl = `${baseUrl}/r/${link.slug}`;
            const isCopied = copiedId === link.id;
            const isSimulating = simulatingId === link.id;

            return (
              <div
                key={link.id}
                className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Link Information & Clean Metadata */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                        {link.title}
                      </h3>
                      {link.isPasswordProtected && (
                        <span title="Password Protected" className="text-amber-600 inline-flex items-center text-xs">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {link.expiresAt && (
                        <span title={`Expires ${new Date(link.expiresAt).toLocaleDateString()}`} className="text-slate-400 inline-flex items-center text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Short Link Line with Copy Button */}
                    <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 hover:text-orange-700 font-semibold hover:underline inline-flex items-center gap-1 truncate"
                      >
                        <span>{shortUrl}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      <button
                        onClick={() => handleCopy(link)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                        title="Copy short link"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Destination URL */}
                    <div className="text-xs text-slate-500 truncate max-w-xl">
                      {link.originalUrl}
                    </div>

                    {/* Unboxed Metadata Line (Constitution compliance: no pill capsules for metadata) */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 flex-wrap">
                      <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {link.clicks.toLocaleString()} clicks
                      </span>
                      {link.tags && link.tags.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize text-slate-600">
                            {link.tags.join(' / ')}
                          </span>
                        </>
                      )}
                      {link.utm?.campaign && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600">
                            Campaign: {link.utm.campaign}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Deep Analytics */}
                    <button
                      onClick={() => onOpenAnalytics(link)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Analytics</span>
                    </button>

                    {/* Social Share Suite */}
                    <button
                      onClick={() => onOpenShare(link)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Share</span>
                    </button>

                    {/* QR Code */}
                    <button
                      onClick={() => onOpenQr(link)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-600" />
                      <span>QR</span>
                    </button>

                    {/* Social Card Preview */}
                    <button
                      onClick={() => onOpenPreview(link)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Social Media Card Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Simulate Traffic click for quick testing */}
                    <button
                      onClick={() => handleSimulate(link.id, 'Twitter / X')}
                      disabled={isSimulating}
                      className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Simulate click to test live analytics"
                    >
                      <Zap className={`w-4 h-4 ${isSimulating ? 'animate-bounce text-orange-500' : ''}`} />
                    </button>

                    {/* Delete Link */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete short link "${link.slug}"?`)) {
                          onDeleteLink(link.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
