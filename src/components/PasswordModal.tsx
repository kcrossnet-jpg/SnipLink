import React, { useState, useEffect } from 'react';
import { ShortLink } from '../types/link';
import { copyToClipboard } from '../utils/social';
import {
  X,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface PasswordModalProps {
  link: ShortLink | null;
  baseUrl: string;
  onClose: () => void;
  onUpdateLink: (id: string, updates: any) => Promise<void>;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  link,
  baseUrl,
  onClose,
  onUpdateLink,
}) => {
  if (!link) return null;

  const fullShortUrl = `${baseUrl}/r/${link.slug}`;
  const [isProtected, setIsProtected] = useState<boolean>(link.isPasswordProtected);
  const [password, setPassword] = useState<string>(link.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setIsProtected(link.isPasswordProtected);
    setPassword(link.password || '');
    setSavedSuccess(false);
  }, [link]);

  // Generate clean readable passcode
  const handleGeneratePasscode = () => {
    const words = ['alpha', 'vault', 'secure', 'cloud', 'summit', 'prime', 'shield', 'vector'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPass = `${randomWord}-${randomNum}`;
    setPassword(newPass);
    setIsProtected(true);
  };

  const handleSave = async () => {
    if (isProtected && !password.trim()) {
      alert('Please enter a password or disable password protection.');
      return;
    }

    setSaving(true);
    await onUpdateLink(link.id, {
      isPasswordProtected: isProtected,
      password: isProtected ? password.trim() : '',
    });
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    const ok = await copyToClipboard(password);
    if (ok) {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleCopyShareNote = async () => {
    const note = `🔒 Protected Link:\n${fullShortUrl}\n\n🔑 Passcode: ${password}\n(This short link requires the passcode to unlock and access the destination).`;
    const ok = await copyToClipboard(note);
    if (ok) {
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  // Compute simple password strength
  const getStrength = (pwd: string) => {
    if (!pwd) return { label: 'Empty', color: 'bg-slate-200', width: '0%' };
    if (pwd.length < 6) return { label: 'Short', color: 'bg-amber-500', width: '33%' };
    if (pwd.length >= 6 && /[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) {
      return { label: 'Strong', color: 'bg-emerald-600', width: '100%' };
    }
    return { label: 'Good', color: 'bg-blue-500', width: '66%' };
  };

  const strength = getStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isProtected ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {isProtected ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Password Protection
              </h2>
              <p className="text-xs text-slate-500">
                Gate destination access behind a security passcode
              </p>
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
          {/* Link Reference */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">
              {link.title}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-600">
              <span className="truncate">{fullShortUrl}</span>
              <a
                href={fullShortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-600 shrink-0"
                title="Test short link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Enable / Disable Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isProtected ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Password Protection Required
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {isProtected
                    ? 'Only users with the passcode can access the destination'
                    : 'Link is open for anyone to click'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Password Settings when Enabled */}
          {isProtected && (
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Access Passcode / Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePasscode}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Passcode</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set passcode (e.g. vault-2026)"
                    className="w-full pl-3 pr-20 py-2.5 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {password && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors mr-1"
                        title="Copy password only"
                      >
                        {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Passcode Strength</span>
                      <span className="font-medium text-slate-700">{strength.label}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ready-to-Send Protected Share Bundle */}
              {password && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Ready-to-Send Access Message
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyShareNote}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-md text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      {copiedNote ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNote ? 'Copied Note' : 'Copy Message'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 whitespace-pre-wrap select-all">
{`🔒 Protected Link:
${fullShortUrl}

🔑 Passcode: ${password}`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Share this snippet via Slack, WhatsApp, Twitter DM, or Email so only intended recipients can unlock the URL.
                  </p>
                </div>
              )}
            </div>
          )}

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password protection settings updated successfully!</span>
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
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
