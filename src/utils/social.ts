import QRCode from 'qrcode';

export interface SocialShareOptions {
  url: string;
  title?: string;
  text?: string;
  hashtags?: string[];
  via?: string;
}

export function generateSocialShareUrls(opts: SocialShareOptions) {
  const encUrl = encodeURIComponent(opts.url);
  const textContent = opts.text || opts.title || '';
  const encText = encodeURIComponent(textContent);
  const tagsStr = opts.hashtags && opts.hashtags.length > 0 ? opts.hashtags.join(',') : '';

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}${tagsStr ? `&hashtags=${encodeURIComponent(tagsStr)}` : ''}${opts.via ? `&via=${encodeURIComponent(opts.via)}` : ''}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${textContent ? textContent + ' ' : ''}${opts.url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    telegram: `https://t.me/share/url?url=${encUrl}&text=${encText}`,
    reddit: `https://reddit.com/submit?url=${encUrl}&title=${encText}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${textContent ? textContent + ' ' : ''}${opts.url}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encUrl}&description=${encText}`,
    email: `mailto:?subject=${encodeURIComponent(opts.title || 'Check out this link')}&body=${encodeURIComponent(`${textContent ? textContent + '\n\n' : ''}${opts.url}`)}`,
  };
}

export async function generateQrDataUrl(
  text: string,
  options?: { color?: string; bgColor?: string; margin?: number; width?: number }
): Promise<string> {
  const color = options?.color || '#0f172a';
  const bgColor = options?.bgColor || '#ffffff';
  const margin = options?.margin ?? 2;
  const width = options?.width || 512;

  try {
    return await QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: color,
        light: bgColor,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export async function generateQrSvg(
  text: string,
  options?: { color?: string; bgColor?: string; margin?: number }
): Promise<string> {
  const color = options?.color || '#0f172a';
  const bgColor = options?.bgColor || '#ffffff';
  const margin = options?.margin ?? 2;

  try {
    return await QRCode.toString(text, {
      type: 'svg',
      margin,
      color: {
        dark: color,
        light: bgColor,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return '';
  }
}

export function formatUrlForDisplay(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname !== '/' ? u.pathname : ''}`;
  } catch {
    return url;
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve(success);
  } catch {
    return Promise.resolve(false);
  }
}
