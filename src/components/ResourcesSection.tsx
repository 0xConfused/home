// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { SUGGESTED_RESOURCES, ResourceCategory } from '../data/properties';

const FILTER_OPTIONS: Array<'All' | ResourceCategory> = [
  'All',
  'Web & Payloads',
  'Detection & Recon',
  'x86 & Shellcode',
  'Hardware & Embedded',
  'Utilities',
];

function compileSearchRegex(raw: string): { regex: RegExp | null; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { regex: null, error: null };
  }

  try {
    const literalMatch = trimmed.match(/^\/(.+)\/([dgimsuvy]*)$/);
    if (literalMatch) {
      const safeFlags = literalMatch[2].replace(/[gy]/g, '');
      return { regex: new RegExp(literalMatch[1], safeFlags), error: null };
    }
    return { regex: new RegExp(trimmed, 'i'), error: null };
  } catch {
    return { regex: null, error: 'Invalid regex' };
  }
}

export const ResourcesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ResourceCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { regex, error: regexError } = useMemo(
    () => compileSearchRegex(searchQuery),
    [searchQuery]
  );

  const filteredResources = useMemo(() => {
    return SUGGESTED_RESOURCES.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (!regex) {
        return true;
      }
      return (
        regex.test(item.title) ||
        regex.test(item.domain) ||
        regex.test(item.url) ||
        regex.test(item.category) ||
        regex.test(item.note)
      );
    });
  }, [selectedCategory, regex]);

  const hasOddTail = filteredResources.length % 2 === 1;

  return (
    <section
      id="resources"
      aria-labelledby="resources-heading"
      className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 scroll-mt-20"
    >
      <div className="scroll-reveal border border-[#383838] bg-[#141414]/88 backdrop-blur-[2px]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#c30800] via-[#c300bb] to-[#bbc300]" />

        <div className="p-6 backdrop-blur-sm bg-gradient-to-r from-[#c30800]/10 via-transparent to-transparent border-b border-[#2e2e2e]">
          <p className="font-mono text-xs text-[#8c8c8c] mb-1.5">
            External Tooling &amp; Documentation
          </p>
          <h2
            id="resources-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0]"
          >
            04. Suggested Resources
          </h2>
        </div>

        <div className="px-6 py-3.5 border-b border-[#2e2e2e] bg-[#0d0d0d]/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter suggested resources"
            className="flex flex-wrap items-center gap-1.5"
          >
            {FILTER_OPTIONS.map((option) => {
              const isActive = selectedCategory === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(option)}
                  className={`px-2.5 py-1.5 min-h-[34px] rounded-none text-[11px] font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#262626] border-[#c30800] text-[#f0f0f0]'
                      : 'bg-[#141414] border-[#2e2e2e] text-[#8c8c8c] hover:text-[#f0f0f0] hover:bg-[#1a1a1a] hover:border-[#383838]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="w-full lg:w-72 xl:w-80 shrink-0">
            <div
              className={`flex items-center bg-[#141414] border rounded-none transition-colors ${
                regexError
                  ? 'border-[#c3005a]'
                  : 'border-[#383838] focus-within:border-[#c30800]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#737373] ml-2.5 shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search resources"
                aria-invalid={Boolean(regexError)}
                placeholder="Search resources"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent px-2.5 py-1.5 min-h-[34px] text-xs font-mono text-[#f0f0f0] focus:outline-none rounded-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="px-2 min-h-[34px] flex items-center justify-center text-[#8c8c8c] hover:text-[#f0f0f0] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {regexError && (
              <div className="font-mono text-[11px] text-[#c3005a] mt-1">
                {regexError}
              </div>
            )}
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="p-8 text-center bg-[#141414]/75">
            <p className="font-mono text-xs text-[#8c8c8c]">
              No resources match the current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0d0d0d] hover:bg-[#262626] text-[#f0f0f0] border border-[#383838] hover:border-[#c30800] rounded-none transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {filteredResources.map((resource, idx) => {
              const isLast = idx === filteredResources.length - 1;
              const isBottomRowDesktop =
                idx >= filteredResources.length - (hasOddTail ? 1 : 2);
              const isLeftColumn = idx % 2 === 0;
              const spanFullRow = hasOddTail && isLast;

              return (
                <a
                  key={resource.index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group p-5 bg-[#141414]/75 hover:bg-[#1a1a1a]/90 transition-colors flex items-start justify-between gap-4 border-[#2e2e2e] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#c30800] ${
                    !isLast ? 'border-b' : ''
                  } ${!isBottomRowDesktop ? 'md:border-b' : 'md:border-b-0'} ${
                    isLeftColumn && !spanFullRow ? 'md:border-r' : ''
                  } ${spanFullRow ? 'md:col-span-2' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-1.5">
                      <span className="text-[#737373] font-bold">{resource.index}.</span>
                      <span className="text-[#c30800] truncate">{resource.domain}</span>
                      <span aria-hidden="true" className="text-[#383838]">·</span>
                      <span className="text-[#737373] text-[11px]">{resource.category}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#f0f0f0] group-hover:text-[#ffffff] transition-colors">
                      {resource.title}
                    </h3>

                    <p className="text-xs text-[#8c8c8c] leading-relaxed mt-1">
                      {resource.note}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#0d0d0d] border border-[#383838] group-hover:border-[#c30800] group-hover:bg-[#262626] text-[#8c8c8c] group-hover:text-[#f0f0f0] transition-colors mt-0.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
