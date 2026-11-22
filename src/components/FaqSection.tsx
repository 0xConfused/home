// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQ_ITEMS } from '../data/properties';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(FAQ_ITEMS[0]?.index ?? null);

  const toggleItem = (index: string) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 scroll-mt-20"
    >
      <div className="scroll-reveal border border-[#383838] bg-[#141414]/88 backdrop-blur-[2px]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#c30800] via-[#c300bb] to-[#bbc300]" />
        <div className="p-6 backdrop-blur-sm bg-gradient-to-r from-[#c30800]/10 via-transparent to-transparent border-b border-[#2e2e2e]">
          <p className="font-mono text-xs text-[#8c8c8c] mb-1.5">
            Frequently Asked Questions
          </p>
          <h2
            id="faq-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0]"
          >
            03. FAQ
          </h2>
        </div>

        <div className="divide-y divide-[#2e2e2e]">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openIndex === item.index;
            const panelId = `faq-panel-${item.index}`;
            const buttonId = `faq-trigger-${item.index}`;

            return (
              <div
                key={item.index}
                className={`transition-colors ${
                  isOpen ? 'bg-[#1a1a1a]/90' : 'bg-[#141414]/75 hover:bg-[#1a1a1a]/60'
                }`}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#c30800]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`shrink-0 font-mono text-xs font-bold ${
                        isOpen ? 'text-[#c30800]' : 'text-[#737373]'
                      }`}
                    >
                      {item.index}.
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#f0f0f0]">
                      {item.question}
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className={`w-7 h-7 shrink-0 flex items-center justify-center bg-[#0d0d0d] border transition-colors ${
                      isOpen
                        ? 'border-[#c30800] text-[#f0f0f0]'
                        : 'border-[#383838] text-[#8c8c8c]'
                    }`}
                  >
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-6 pb-5 pt-0 sm:pl-[3.5rem]"
                  >
                    <p className="text-sm text-[#8c8c8c] leading-relaxed max-w-3xl">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
