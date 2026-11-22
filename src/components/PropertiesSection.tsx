// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CONFUSED_PROPERTIES } from '../data/properties';

const AUTOSCROLL_INTERVAL_MS = 5500;

interface PropertiesSectionProps {
  selectedPropertyId: string;
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  selectedPropertyId,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = CONFUSED_PROPERTIES.findIndex((p) => p.id === selectedPropertyId);
    return idx >= 0 ? idx : 0;
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState !== 'visible' : false
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
      : false
  );
  const touchStartXRef = useRef<number | null>(null);

  const totalSlides = CONFUSED_PROPERTIES.length;

  const goToSlide = useCallback(
    (index: number) => {
      const normalized = ((index % totalSlides) + totalSlides) % totalSlides;
      setActiveIndex(normalized);
    },
    [totalSlides]
  );

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.visibilityState !== 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      setPrefersReducedMotion(Boolean(media?.matches));
    };
    media?.addEventListener?.('change', handleMotionChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      media?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(activeIndex + 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        goToSlide(activeIndex + 1);
      } else {
        goToSlide(activeIndex - 1);
      }
    }
  };

  return (
    <section
      id="properties"
      aria-labelledby="properties-heading"
      className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12 scroll-mt-0"
    >
      {/* Unified Title Header & Attached Carousel */}
      <div className="scroll-reveal group border border-[#383838] bg-[#141414]/88 backdrop-blur-[2px] overflow-hidden">
        {/* Standardized Top Hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#c30800] via-[#c300bb] to-[#bbc300] hover-accent-hue" />

        {/* Section Title Header */}
        <div className="p-6 sm:p-7 backdrop-blur-sm bg-gradient-to-r from-[#c30800]/10 via-transparent to-transparent border-b border-[#2e2e2e] flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="font-mono text-xs text-[#8c8c8c] mb-2">
              0xconfused.com · Live Web Applications
            </p>
            <h2
              id="properties-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f0f0] text-balance"
            >
              01. Applications
            </h2>
          </div>
        </div>

        {/* Attached Application Carousel */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="0xCONFUSED Applications"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setIsPaused(false);
            }
          }}
          className="focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#c30800]"
        >
          {/* Sliding Track Viewport */}
          <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
          >
            {CONFUSED_PROPERTIES.map((property, idx) => {
              const isSlideActive = idx === activeIndex;

              return (
                <article
                  key={property.id}
                  aria-hidden={!isSlideActive}
                  className="w-full shrink-0 flex flex-col justify-between"
                >
                  {/* Standardized Internal Grid */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Primary Details */}
                    <div className="lg:col-span-7 flex flex-col">
                      {/* Standardized Unboxed Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs text-[#8c8c8c]">
                        <span className="text-[#737373]">{property.index}</span>
                        <span className="text-[#f0f0f0] font-semibold">
                          {property.modulePath}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#737373]">{property.groupLabel}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0] mb-2 text-balance">
                        {property.title}
                      </h3>

                      {property.comingSoon ? (
                        <div className="inline-flex items-center font-mono text-sm text-[#8c8c8c] mb-4 w-fit">
                          <span>{property.subdomain}</span>
                        </div>
                      ) : (
                        <a
                          href={property.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={isSlideActive ? 0 : -1}
                          className="inline-flex items-center gap-1.5 font-mono text-sm text-[#c30800] hover:text-[#f60a00] hover:underline underline-offset-4 mb-4 w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c30800]"
                        >
                          <span>{property.subdomain}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      )}

                      <p className="text-sm sm:text-base text-[#8c8c8c] leading-relaxed max-w-2xl">
                        {property.summary}
                      </p>
                    </div>

                    {/* Right Standardized Capability Matrix */}
                    <div className="lg:col-span-5 lg:border-l lg:border-[#2e2e2e] lg:pl-8 pt-5 lg:pt-0 border-t lg:border-t-0 border-[#2e2e2e] w-full">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#737373] mb-3">
                        {property.comingSoon ? 'Planned Coverage' : 'Core Capabilities'}
                      </div>
                      <ul className="space-y-2.5 font-mono text-xs text-[#f0f0f0]">
                        {property.capabilities.map((cap) => (
                          <li key={cap} className="flex items-center gap-2.5 min-w-0">
                            <span className="w-1.5 h-1.5 bg-[#c30800] shrink-0" />
                            <span className="truncate">{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Standardized Action Footer */}
                  <div className="px-6 sm:px-8 py-4 bg-[#1a1a1a]/90 border-t border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3">
                    {property.comingSoon ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-mono font-bold uppercase tracking-wider text-[#8c8c8c] bg-[#141414] border border-[#383838] whitespace-nowrap shrink-0">
                        <span>{property.subdomain} · Coming Soon</span>
                      </span>
                    ) : (
                      <a
                        href={property.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={isSlideActive ? 0 : -1}
                        className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-mono font-bold uppercase tracking-wider text-[#f3f3f7] border border-[#c30800] hover:border-[#f60a00] transition-colors whitespace-nowrap shrink-0"
                        style={{ background: 'var(--gradient-accent)' }}
                      >
                        <span>Open {property.subdomain}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Sharp Industrial Slide Progress Indicators */}
        <div
          className="grid border-t border-[#2e2e2e] bg-[#0d0d0d]"
          style={{ gridTemplateColumns: `repeat(${CONFUSED_PROPERTIES.length}, minmax(0, 1fr))` }}
        >
          {CONFUSED_PROPERTIES.map((item, idx) => {
            const isSlideActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}: ${item.subdomain}`}
                onClick={() => goToSlide(idx)}
                className={`relative h-2.5 overflow-hidden transition-colors cursor-pointer border-r last:border-r-0 border-[#2e2e2e] ${
                  isSlideActive
                    ? 'bg-[#262626]'
                    : 'bg-[#141414] hover:bg-[#262626]'
                }`}
              >
                {isSlideActive && (
                  <span
                    key={`progress-${activeIndex}`}
                    onAnimationEnd={() => {
                      if (!prefersReducedMotion && totalSlides > 1) {
                        setActiveIndex((prev) => (prev + 1) % totalSlides);
                      }
                    }}
                    className="carousel-segment-fill block h-full w-full bg-[#c30800]"
                    style={
                      prefersReducedMotion || totalSlides <= 1
                        ? undefined
                        : {
                            animationDuration: `${AUTOSCROLL_INTERVAL_MS}ms`,
                            animationPlayState:
                              isPaused || isTabHidden ? 'paused' : 'running',
                          }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
};
