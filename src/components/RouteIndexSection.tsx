// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CONFUSED_PROPERTIES, ConfusedProperty } from '../data/properties';

interface RouteIndexSectionProps {
  selectedPropertyId: string;
  onSelectProperty: (property: ConfusedProperty) => void;
}

export const RouteIndexSection: React.FC<RouteIndexSectionProps> = ({
  selectedPropertyId,
  onSelectProperty,
}) => {
  const activeSpec = useMemo(() => {
    return (
      CONFUSED_PROPERTIES.find((p) => p.id === selectedPropertyId) ||
      CONFUSED_PROPERTIES[0]
    );
  }, [selectedPropertyId]);

  return (
    <section
      id="routes"
      aria-labelledby="routes-heading"
      className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-10 scroll-mt-20"
    >
      <div className="scroll-reveal border border-[#383838] bg-[#141414]/88 backdrop-blur-[2px]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#c30800] via-[#c300bb] to-[#bbc300]" />

        {/* Section Header */}
        <div className="p-6 backdrop-blur-sm bg-gradient-to-r from-[#c30800]/10 via-transparent to-transparent border-b border-[#2e2e2e] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-[#8c8c8c] mb-1.5">
              Architecture &amp; Capabilities Breakdown
            </p>
            <h2
              id="routes-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0]"
            >
              02. Applications
            </h2>
          </div>
        </div>

        {/* Interactive Split: Left Selector Rail + Right Technical Breakdown Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Selector Rail */}
          <div
            role="tablist"
            aria-label="0xCONFUSED Applications"
            className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#2e2e2e] divide-y divide-[#2e2e2e]"
          >
            {CONFUSED_PROPERTIES.map((item) => {
              const isSelected = activeSpec.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectProperty(item)}
                  className={`w-full text-left p-5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#262626]/90'
                      : 'bg-transparent hover:bg-[#1a1a1a]/90'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono text-xs mb-1.5">
                      <span className="text-[#737373]">{item.index}</span>
                      <span className="text-[#f0f0f0] font-bold truncate">
                        {item.modulePath}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-[#c30800] truncate">
                      {item.subdomain}
                    </div>
                    <div className="text-sm font-semibold text-[#f0f0f0] mt-1 line-clamp-1">
                      {item.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Technical Specification Sheet */}
          <div
            role="tabpanel"
            className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between gap-6"
          >
            <div>
              {/* Top Title & Direct Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2e2e2e]">
                <div>
                  <h3 className="text-xl font-bold text-[#f0f0f0]">
                    {activeSpec.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeSpec.comingSoon ? (
                    <span className="inline-flex items-center px-4 py-2 min-h-[40px] text-xs font-mono font-bold uppercase tracking-wider text-[#8c8c8c] bg-[#141414] border border-[#383838] whitespace-nowrap">
                      Coming Soon
                    </span>
                  ) : (
                    <a
                      href={activeSpec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-mono font-bold uppercase tracking-wider text-[#f3f3f7] border border-[#c30800] hover:border-[#f60a00] transition-colors whitespace-nowrap"
                      style={{ background: 'var(--gradient-accent)' }}
                    >
                      <span>Launch</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Execution Workflow (3 Real Steps) */}
              <div className="pt-5">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#737373] mb-4">
                  {activeSpec.comingSoon ? 'Planned Scope' : 'Execution Workflow'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {activeSpec.workflowSteps.map((ws) => (
                    <div key={ws.step} className="space-y-1.5">
                      <div className="font-mono text-xs font-bold text-[#c30800]">
                        {ws.step}.
                      </div>
                      <div className="text-sm font-semibold text-[#f0f0f0]">
                        {ws.title}
                      </div>
                      <p className="text-xs text-[#8c8c8c] leading-relaxed">
                        {ws.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
