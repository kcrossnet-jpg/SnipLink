import React, { useState } from 'react';
import { ShortLink } from '../types/link';
import { copyToClipboard } from '../utils/social';
import {
  X,
  Layers,
  Copy,
  Check,
  Download,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface BulkShortenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinksCreated: (links: ShortLink[]) => void;
  baseUrl: string;
}

export const BulkShortenModal: React.FC<BulkShortenModalProps> = ({
  isOpen,
  onClose,
  onLinksCreated,
  baseUrl,
}) => {
  if (!isOpen) return null;

  const [inputUrls, setInputUrls] = useState(
    'https://github.com/trending\nhttps://news.ycombinator.com\nhttps://producthunt.com'
  );
  const [processing, setProcessing] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<ShortLink[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleBulkSubmit = async () => {
    const urls = inputUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) return;

    setProcessing(true);
    const results: ShortLink[] = [];

    for (const rawUrl of urls) {
      try {
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalUrl: rawUrl,
            tags: ['bulk'],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          results.push(data);
        }
      } catch (err) {
        console.error('Failed to shorten url:', rawUrl, err);
      }
    }

    setCreatedLinks(results);
    onLinksCreated(results);
    setProcessing(false);
  };

  const handleCopyAll = async () => {
    const text = createdLinks.map(l => `${baseUrl}/r/${l.slug}`).join('\n');
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleExportCsv = () => {
    if (createdLinks.length === 0) return;
    const header = 'Original URL,Short URL,Slug,Title,Created At\n';
    const rows = createdLinks.map(l => 
      `"${l.originalUrl}","${baseUrl}/r/${l.slug}","${l.slug}","${l.title.replace(/"/g, '""')}","${l.createdAt}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sniplink-bulk-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bulk Link Shortener</h2>
              <p className="text-xs text-slate-500">Shorten multiple destination links at once &amp; export CSV</p>
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
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste URLs (One URL per line, up to 20 links)
            </label>
            <textarea
              rows={5}
              value={inputUrls}
              onChange={(e) => setInputUrls(e.target.value)}
              placeholder="https://example.com/link1&#10;https://example.com/link2&#10;https://example.com/link3"
              className="w-full p-3 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleBulkSubmit}
              disabled={processing}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {processing ? (
                <span>Generating Short Links...</span>
              ) : (
                <>
                  <span>Shorten All Links</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Results Table */}
          {createdLinks.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  {createdLinks.length} Links Shortened Successfully
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1"
                  >
                    {copiedAll ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 rounded-lg text-white flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {createdLinks.map(l => (
                  <div key={l.id} className="p-2.5 flex items-center justify-between text-xs bg-white hover:bg-slate-50">
                    <div className="min-w-0 pr-2">
                      <div className="font-mono font-semibold text-orange-600 truncate">
                        {baseUrl}/r/{l.slug}
                      </div>
                      <div className="text-slate-400 truncate text-[11px]">
                        {l.originalUrl}
                      </div>
                    </div>
                    <a
                      href={`${baseUrl}/r/${l.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
