import React, { useState } from 'react';
import { ShortLink } from '../types/link';
import {
  X,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Share2,
  Zap,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';

interface AnalyticsModalProps {
  link: ShortLink | null;
  baseUrl: string;
  onClose: () => void;
  onSimulateClick: (id: string, referrer: string) => Promise<void>;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  link,
  baseUrl,
  onClose,
  onSimulateClick,
}) => {
  if (!link) return null;

  const [activeRange, setActiveRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedSimRef, setSelectedSimRef] = useState('Twitter / X');

  const fullShortUrl = `${baseUrl}/r/${link.slug}`;
  const clicksData = link.clicksData || [];

  // Group clicks by Referrer Category
  const referrerCounts: Record<string, number> = {};
  clicksData.forEach(c => {
    const cat = c.referrerCategory || 'Direct';
    referrerCounts[cat] = (referrerCounts[cat] || 0) + 1;
  });

  const sortedReferrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1]);

  // Group clicks by Device
  const deviceCounts: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
  clicksData.forEach(c => {
    const dev = c.device || 'Desktop';
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
  });

  // Group clicks by Country
  const countryCounts: Record<string, number> = {};
  clicksData.forEach(c => {
    const country = c.country || 'United States';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);

  // Build daily timeline for last 7 days
  const daysArray = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
    const count = clicksData.filter(c => c.timestamp.startsWith(dayStr)).length;
    return { dayStr, label, count };
  });

  const maxDailyCount = Math.max(...daysArray.map(d => d.count), 5);

  const handleTestClick = async () => {
    setIsSimulating(true);
    await onSimulateClick(link.id, selectedSimRef);
    setIsSimulating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">{link.title}</h2>
              <div className="flex items-center gap-2 text-xs font-mono text-orange-600">
                <span>{fullShortUrl}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-sans truncate max-w-xs">{link.originalUrl}</span>
              </div>
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
          {/* Key KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Total Clicks
              </span>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {link.clicks.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Top Referrer
              </span>
              <div className="text-sm font-bold text-slate-900 truncate">
                {sortedReferrers[0] ? sortedReferrers[0][0] : 'Direct'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Top Device
              </span>
              <div className="text-sm font-bold text-slate-900">
                {deviceCounts.Mobile >= deviceCounts.Desktop ? 'Mobile' : 'Desktop'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Top Region
              </span>
              <div className="text-sm font-bold text-slate-900 truncate">
                {sortedCountries[0] ? sortedCountries[0][0] : 'Global'}
              </div>
            </div>
          </div>

          {/* Interactive Traffic Simulation Station */}
          <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-900">Simulate Real Click Event</div>
                <div className="text-[11px] text-slate-500">Test how incoming traffic updates metrics in real-time</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSimRef}
                onChange={(e) => setSelectedSimRef(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="Twitter / X">Twitter / X</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram Bio</option>
                <option value="Reddit">Reddit</option>
                <option value="Email">Email Newsletter</option>
                <option value="Direct">Direct / Bookmark</option>
              </select>

              <button
                type="button"
                onClick={handleTestClick}
                disabled={isSimulating}
                className="px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <Zap className="w-3 h-3" />
                <span>{isSimulating ? 'Sending...' : 'Fire Click'}</span>
              </button>
            </div>
          </div>

          {/* Clicks Over Time Histogram */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Click Volume Trend (Last 7 Days)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {clicksData.length} sampled events
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 border-b border-slate-100">
              {daysArray.map((day, idx) => {
                const heightPercent = maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                      {day.count}
                    </span>
                    <div className="w-full max-w-[32px] bg-slate-100 rounded-t-md relative flex items-end overflow-hidden h-full">
                      <div
                        className="w-full bg-orange-500 hover:bg-orange-600 rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
                      {day.label.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown Grids: Referrers & Devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referrers */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Top Referrer Channels
              </h3>
              <div className="space-y-2.5">
                {sortedReferrers.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">No clicks logged yet</div>
                ) : (
                  sortedReferrers.slice(0, 5).map(([ref, count]) => {
                    const percent = Math.round((count / (clicksData.length || 1)) * 100);
                    return (
                      <div key={ref} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 font-medium">{ref}</span>
                          <span className="font-mono text-slate-500 tabular-nums">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Devices & Browsers */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Device Distribution
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Mobile</span>
                    </span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {deviceCounts.Mobile} ({Math.round((deviceCounts.Mobile / (clicksData.length || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${Math.round((deviceCounts.Mobile / (clicksData.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-slate-500" />
                      <span>Desktop</span>
                    </span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {deviceCounts.Desktop} ({Math.round((deviceCounts.Desktop / (clicksData.length || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${Math.round((deviceCounts.Desktop / (clicksData.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tablet</span>
                    </span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {deviceCounts.Tablet} ({Math.round((deviceCounts.Tablet / (clicksData.length || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: `${Math.round((deviceCounts.Tablet / (clicksData.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Click Log Stream */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Click Events Log
              </h3>
              <span className="text-[11px] text-slate-400">Latest 8 entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 font-medium">Timestamp</th>
                    <th className="pb-2 font-medium">Referrer</th>
                    <th className="pb-2 font-medium">Device</th>
                    <th className="pb-2 font-medium">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {clicksData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400 font-sans">
                        No click logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    clicksData.slice(0, 8).map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/50">
                        <td className="py-2 text-slate-500 tabular-nums">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2 font-sans font-medium text-slate-800">
                          {evt.referrer}
                        </td>
                        <td className="py-2 font-sans text-slate-600">
                          {evt.device}
                        </td>
                        <td className="py-2 font-sans text-slate-600">
                          {evt.country}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
