import React, { useState, useEffect, useRef } from 'react';
import { ShortLink } from '../types/link';
import { generateQrDataUrl, generateQrSvg, copyToClipboard } from '../utils/social';
import {
  X,
  Download,
  Copy,
  Check,
  Palette,
  QrCode as QrIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface QrModalProps {
  link: ShortLink | null;
  baseUrl: string;
  onClose: () => void;
  onUpdateLink?: (id: string, updates: any) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  link,
  baseUrl,
  onClose,
  onUpdateLink,
}) => {
  if (!link) return null;

  const fullShortUrl = `${baseUrl}/r/${link.slug}`;
  const [color, setColor] = useState(link.qrConfig?.dotColor || '#0f172a');
  const [bgColor, setBgColor] = useState(link.qrConfig?.bgColor || '#ffffff');
  const [logo, setLogo] = useState<string>(link.qrConfig?.logo || 'link');
  const [margin, setMargin] = useState<number>(link.qrConfig?.margin ?? 2);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colorPresets = [
    { label: 'Obsidian', hex: '#0f172a' },
    { label: 'Amber Orange', hex: '#ea580c' },
    { label: 'Royal Indigo', hex: '#4f46e5' },
    { label: 'Emerald Forest', hex: '#059669' },
    { label: 'Crimson Red', hex: '#dc2626' },
    { label: 'Midnight Blue', hex: '#0284c7' },
  ];

  useEffect(() => {
    generateQrDataUrl(fullShortUrl, { color, bgColor, margin, width: 800 }).then(data => {
      setQrDataUrl(data);
    });
  }, [fullShortUrl, color, bgColor, margin]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${link.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = async () => {
    const svgStr = await generateQrSvg(fullShortUrl, { color, bgColor, margin });
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${link.slug}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = () => {
    if (onUpdateLink) {
      onUpdateLink(link.id, {
        qrConfig: { dotColor: color, bgColor, logo, margin }
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <QrIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">QR Code Studio</h2>
              <p className="text-xs text-slate-500">Design, customize, and export high-res vector QR codes</p>
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
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Interactive Preview Frame */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="relative p-4 rounded-xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
                {qrDataUrl ? (
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="w-full h-full object-contain"
                    />
                    {/* Embedded Center Icon */}
                    {logo !== 'none' && (
                      <div className="absolute w-12 h-12 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center p-2">
                        {logo === 'link' && <div className="text-orange-600 font-bold text-xs">LINK</div>}
                        {logo === 'twitter' && <div className="font-bold text-black text-sm">𝕏</div>}
                        {logo === 'instagram' && <div className="text-pink-600 font-bold text-xs">IG</div>}
                        {logo === 'youtube' && <div className="text-red-600 font-bold text-xs">YT</div>}
                        {logo === 'globe' && <div className="text-blue-600 font-bold text-xs">WEB</div>}
                        {logo === 'star' && <Sparkles className="w-5 h-5 text-amber-500" />}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                    Generating QR code...
                  </div>
                )}
              </div>

              {/* Scannable Target Verification */}
              <div className="mt-4 text-center">
                <span className="text-xs font-mono text-slate-600 truncate block max-w-xs">
                  {fullShortUrl}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Scannable by any mobile camera or scanner app
                </span>
              </div>
            </div>

            {/* Right: Customization Controls */}
            <div className="space-y-5">
              {/* Foreground Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Pattern / Foreground Color
                </label>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {colorPresets.map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setColor(preset.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === preset.hex ? 'border-orange-500 scale-110 shadow-sm' : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.label}
                    />
                  ))}
                  <div className="flex items-center gap-1.5 ml-1">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600 uppercase">{color}</span>
                  </div>
                </div>
              </div>

              {/* Background Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBgColor('#ffffff')}
                    className={`px-3 py-1.5 text-xs rounded-lg border ${
                      bgColor === '#ffffff' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Pure White
                  </button>
                  <button
                    onClick={() => setBgColor('#f8fafc')}
                    className={`px-3 py-1.5 text-xs rounded-lg border ${
                      bgColor === '#f8fafc' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Off-White
                  </button>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Center Logo Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Center Logo Badge
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'link', label: 'Link' },
                    { id: 'twitter', label: 'Twitter/X' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'youtube', label: 'YouTube' },
                    { id: 'globe', label: 'Web' },
                    { id: 'star', label: 'Star' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLogo(item.id)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                        logo === item.id
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin / Quiet Zone Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Quiet Zone Margin</span>
                  <span className="font-mono text-slate-500">{margin} blocks</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG (1024px)</span>
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download SVG</span>
            </button>
          </div>

          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition-colors"
          >
            Apply &amp; Done
          </button>
        </div>
      </div>
    </div>
  );
};
