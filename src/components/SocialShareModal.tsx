import React, { useState } from 'react';
import { ShortLink } from '../types/link';
import { generateSocialShareUrls, copyToClipboard } from '../utils/social';
import {
  X,
  Copy,
  Check,
  Send,
  ExternalLink,
  MessageCircle,
  Share2,
  Code2,
  Mail,
  Smartphone
} from 'lucide-react';

interface SocialShareModalProps {
  link: ShortLink | null;
  baseUrl: string;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  link,
  baseUrl,
  onClose,
}) => {
  if (!link) return null;

  const fullShortUrl = `${baseUrl}/r/${link.slug}`;
  const [customText, setCustomText] = useState(link.title || '');
  const [hashtags, setHashtags] = useState<string[]>(
    link.tags && link.tags.length > 0 ? link.tags : ['tech', 'link']
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const shareUrls = generateSocialShareUrls({
    url: fullShortUrl,
    title: link.title,
    text: customText,
    hashtags: hashtags,
  });

  const handleCopy = async (text: string, type: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const clean = newTagInput.trim().replace(/^#/, '');
      if (!hashtags.includes(clean)) {
        setHashtags([...hashtags, clean]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  const markdownSnippet = `[${link.title}](${fullShortUrl})`;
  const htmlSnippet = `<a href="${fullShortUrl}" target="_blank" rel="noopener noreferrer">${link.title}</a>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share to Social Media</h2>
              <p className="text-xs text-slate-500">Post or send this short link across any network</p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Link Quick Copy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Link
            </label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
              <input
                type="text"
                readOnly
                value={fullShortUrl}
                className="flex-1 px-3.5 py-2 text-xs font-mono text-slate-900 bg-transparent focus:outline-none"
              />
              <button
                onClick={() => handleCopy(fullShortUrl, 'url')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copiedType === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'url' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Custom Message & Hashtags */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Custom Post Caption
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {customText.length} chars
                </span>
              </div>
              <textarea
                rows={2}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Write the message that accompanies your short link..."
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Included Hashtags
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {hashtags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-white border border-slate-300 rounded text-slate-700 font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-red-500 font-bold ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag (Press Enter)"
                  className="px-2 py-0.5 text-xs bg-white border border-dashed border-slate-300 rounded text-slate-700 focus:outline-none focus:border-orange-500 w-36"
                />
              </div>
            </div>
          </div>

          {/* One-Click Social Share Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-3">
              One-Click Direct Share
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Twitter / X */}
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-black hover:bg-slate-50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                  𝕏
                </div>
                <span>Twitter / X</span>
              </a>

              {/* WhatsApp */}
              <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-700 hover:bg-sky-50/50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0077b5] text-white flex items-center justify-center font-bold text-xs">
                  in
                </div>
                <span>LinkedIn</span>
              </a>

              {/* Facebook */}
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-[#1877f2] text-white flex items-center justify-center font-bold text-xs">
                  f
                </div>
                <span>Facebook</span>
              </a>

              {/* Telegram */}
              <a
                href={shareUrls.telegram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-500 hover:bg-sky-50/50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-[#229ED9] text-white flex items-center justify-center">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <span>Telegram</span>
              </a>

              {/* Reddit */}
              <a
                href={shareUrls.reddit}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-orange-600 hover:bg-orange-50/50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF4500] text-white flex items-center justify-center font-bold text-xs">
                  r/
                </div>
                <span>Reddit</span>
              </a>

              {/* Threads */}
              <a
                href={shareUrls.threads}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-800 hover:bg-slate-50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-serif font-bold text-xs">
                  @
                </div>
                <span>Threads</span>
              </a>

              {/* Email */}
              <a
                href={shareUrls.email}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>Email Mailto</span>
              </a>

              {/* SMS Intent */}
              <a
                href={`sms:?&body=${encodeURIComponent(`${customText} ${fullShortUrl}`)}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all text-xs font-medium text-slate-900"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <span>Direct SMS</span>
              </a>
            </div>
          </div>

          {/* Developer / Creator Embed Formats */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Embed & Markdown Snippets
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div className="truncate font-mono text-slate-700 mr-2">
                  {markdownSnippet}
                </div>
                <button
                  onClick={() => handleCopy(markdownSnippet, 'markdown')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 flex items-center gap-1 shrink-0"
                >
                  {copiedType === 'markdown' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'markdown' ? 'Copied' : 'Copy Markdown'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div className="truncate font-mono text-slate-700 mr-2">
                  {htmlSnippet}
                </div>
                <button
                  onClick={() => handleCopy(htmlSnippet, 'html')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 flex items-center gap-1 shrink-0"
                >
                  {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-600" /> : <Code2 className="w-3 h-3" />}
                  <span>{copiedType === 'html' ? 'Copied' : 'Copy HTML'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
