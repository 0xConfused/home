// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';
import { SkullLogo } from './SkullLogo';
import { ScrambleBrand } from './ScrambleBrand';

interface HomeHeaderProps {
  visible: boolean;
  onScrollTop: () => void;
  wordmarkRef: React.RefObject<HTMLSpanElement | null>;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  visible,
  onScrollTop,
  wordmarkRef,
}) => {
  return (
    <header
      id="home-header"
      style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
      className={`topbar z-50 transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [&:has(:focus-visible)]:opacity-100 [&:has(:focus-visible)]:pointer-events-auto ${
        visible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="topbar-inner">
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onScrollTop();
          }}
          className="brand cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c30800]"
          aria-label="0xCONFUSED — Return to top"
        >
          <span className="brand-logo-slot">
            <span className="hero-logo-inner" aria-hidden="true">
              <SkullLogo
                size={64}
                className="w-16 h-16 object-contain opacity-100"
              />
              <span
                className="skull-scanline-layer"
                style={{
                  WebkitMaskImage: 'url(./skull-logo.png)',
                  maskImage: 'url(./skull-logo.png)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              />
              <span
                className="skull-sweep-layer"
                style={{
                  WebkitMaskImage: 'url(./skull-logo.png)',
                  maskImage: 'url(./skull-logo.png)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              >
                <span className="skull-sweep-beam" />
              </span>
            </span>
          </span>

          <span className="brand-text-wrap">
            <span className="brand-title-row">
              <span ref={wordmarkRef} className="inline-flex items-center shrink-0">
                <ScrambleBrand
                  as="span"
                  className="brand-glitch-text whitespace-nowrap shrink-0"
                />
              </span>
              <span className="brand-mod font-mono">./home</span>
            </span>
          </span>
        </button>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-6 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[#8c8c8c]"
        >
          {[
            { id: 'properties', label: 'Applications' },
            { id: 'routes', label: 'Breakdown' },
            { id: 'faq', label: 'FAQ' },
            { id: 'resources', label: 'Resources' },
            { id: 'media', label: 'Media' },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.currentTarget.blur();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="hover:text-[#f0f0f0] hover:underline decoration-[#c30800] underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-2"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
