// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  CONFUSED_PROPERTIES,
  ConfusedProperty,
  SUGGESTED_RESOURCES,
  SuggestedResource,
} from '../data/properties';

const AUTOSCROLL_INTERVAL_MS = 5500;

interface FeaturedSlide {
  id: string;
  index: string;
  modulePath: string;
  groupLabel: string;
  title: string;
  linkLabel: string;
  url: string;
  summary: string;
  detailsHeading: string;
  details: string[];
  actionLabel: string;
  comingSoon?: boolean;
  progressLabel: string;
}

function pickRandomDistinct<T>(items: T[], count: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function propertyToSlide(property: ConfusedProperty, indexLabel: string): FeaturedSlide {
  return {
    id: property.id,
    index: indexLabel,
    modulePath: property.modulePath,
    groupLabel: property.groupLabel,
    title: property.title,
    linkLabel: property.subdomain,
    url: property.url,
    summary: property.summary,
    detailsHeading: property.comingSoon ? 'Planned Coverage' : 'Core Capabilities',
    details: property.capabilities,
    actionLabel: `Open ${property.subdomain}`,
    comingSoon: property.comingSoon,
    progressLabel: property.subdomain,
  };
}

function resourceToSlide(resource: SuggestedResource, indexLabel: string): FeaturedSlide {
  const cleanDisplayUrl = resource.url
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');

  return {
    id: `featured-resource-${resource.index}`,
    index: indexLabel,
    modulePath: 'Suggested Resource',
    groupLabel: resource.category,
    title: resource.title,
    linkLabel: cleanDisplayUrl,
    url: resource.url,
    summary: resource.note,
    detailsHeading: 'Resource Details',
    details: [
      `Category: ${resource.category}`,
      ...resource.tags,
    ],
    actionLabel: `Open ${resource.domain}`,
    progressLabel: resource.domain,
  };
}

export const PropertiesSection: React.FC = () => {
  const [selection] = useState(() => {
    const liveApps = pickRandomDistinct(
      CONFUSED_PROPERTIES.filter((p) => !p.comingSoon),
      2
    );
    const resources = pickRandomDistinct(SUGGESTED_RESOURCES, 2);
    const comingSoonApp =
      CONFUSED_PROPERTIES.find((p) => Boolean(p.comingSoon)) ??
      CONFUSED_PROPERTIES[CONFUSED_PROPERTIES.length - 1];

    return { liveApps, resources, comingSoonApp };
  });

  const featuredSlides = useMemo<FeaturedSlide[]>(() => {
    const slides: FeaturedSlide[] = [];
    if (selection.liveApps[0]) {
      slides.push(propertyToSlide(selection.liveApps[0], '01'));
    }
    if (selection.resources[0]) {
      slides.push(resourceToSlide(selection.resources[0], '02'));
    }
    if (selection.liveApps[1]) {
      slides.push(propertyToSlide(selection.liveApps[1], '03'));
    }
    if (selection.resources[1]) {
      slides.push(resourceToSlide(selection.resources[1], '04'));
    }
    if (selection.comingSoonApp) {
      slides.push(propertyToSlide(selection.comingSoonApp, '05'));
    }
    return slides;
  }, [selection]);

  const [activeIndex, setActiveIndex] = useState<number>(0);
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

  const totalSlides = featuredSlides.length;

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
              0xconfused.com · Live Applications &amp; Curated Resources
            </p>
            <h2
              id="properties-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f0f0] text-balance"
            >
              01. Featured
            </h2>
          </div>
        </div>

        {/* Attached Application Carousel */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="0xCONFUSED Featured"
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
            {featuredSlides.map((slide, idx) => {
              const isSlideActive = idx === activeIndex;

              return (
                <article
                  key={slide.id}
                  aria-hidden={!isSlideActive}
                  className="w-full shrink-0 flex flex-col justify-between"
                >
                  {/* Standardized Internal Grid */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Primary Details */}
                    <div className="lg:col-span-7 flex flex-col">
                      {/* Standardized Unboxed Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs text-[#8c8c8c]">
                        <span className="text-[#737373]">{slide.index}</span>
                        <span className="text-[#f0f0f0] font-semibold">
                          {slide.modulePath}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#737373]">{slide.groupLabel}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0] mb-2 text-balance">
                        {slide.title}
                      </h3>

                      {slide.comingSoon ? (
                        <div className="inline-flex items-center font-mono text-sm text-[#8c8c8c] mb-4 w-fit">
                          <span>{slide.linkLabel}</span>
                        </div>
                      ) : (
                        <a
                          href={slide.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={isSlideActive ? 0 : -1}
                          className="inline-flex items-center gap-1.5 font-mono text-sm text-[#c30800] hover:text-[#f60a00] hover:underline underline-offset-4 mb-4 w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c30800]"
                        >
                          <span>{slide.linkLabel}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      )}

                      <p className="text-sm sm:text-base text-[#8c8c8c] leading-relaxed max-w-2xl">
                        {slide.summary}
                      </p>
                    </div>

                    {/* Right Standardized Capability / Resource Matrix */}
                    <div className="lg:col-span-5 lg:border-l lg:border-[#2e2e2e] lg:pl-8 pt-5 lg:pt-0 border-t lg:border-t-0 border-[#2e2e2e] w-full">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#737373] mb-3">
                        {slide.detailsHeading}
                      </div>
                      <ul className="space-y-2.5 font-mono text-xs text-[#f0f0f0]">
                        {slide.details.map((detail) => (
                          <li key={detail} className="flex items-center gap-2.5 min-w-0">
                            <span className="w-1.5 h-1.5 bg-[#c30800] shrink-0" />
                            <span className="truncate">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Standardized Action Footer */}
                  <div className="px-6 sm:px-8 py-4 bg-[#1a1a1a]/90 border-t border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3">
                    {slide.comingSoon ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-mono font-bold uppercase tracking-wider text-[#8c8c8c] bg-[#141414] border border-[#383838] whitespace-nowrap shrink-0">
                        <span>{slide.linkLabel} · Coming Soon</span>
                      </span>
                    ) : (
                      <a
                        href={slide.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={isSlideActive ? 0 : -1}
                        className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-mono font-bold uppercase tracking-wider text-[#f3f3f7] border border-[#c30800] hover:border-[#f60a00] transition-colors whitespace-nowrap shrink-0"
                        style={{ background: 'var(--gradient-accent)' }}
                      >
                        <span>{slide.actionLabel}</span>
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
          style={{ gridTemplateColumns: `repeat(${featuredSlides.length}, minmax(0, 1fr))` }}
        >
          {featuredSlides.map((item, idx) => {
            const isSlideActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}: ${item.progressLabel}`}
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
