// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HomeHeader } from './components/HomeHeader';
import { FullscreenHeroStage } from './components/FullscreenHeroStage';
import { PropertiesSection } from './components/PropertiesSection';
import { RouteIndexSection } from './components/RouteIndexSection';
import { FaqSection } from './components/FaqSection';
import { ResourcesSection } from './components/ResourcesSection';
import { MediaSection } from './components/MediaSection';
import { HomeFooter } from './components/HomeFooter';
import { CONFUSED_PROPERTIES, ConfusedProperty } from './data/properties';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  const clamped = clamp01(t);
  return 1 - Math.pow(1 - clamped, 3);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export default function App() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const headerWordmarkRef = useRef<HTMLSpanElement | null>(null);
  const floatingWordmarkRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRevealScrambleRef = useRef<boolean>(false);
  const introLogoPRef = useRef<number>(0);
  const introTextPRef = useRef<number>(0);

  const [headerVisible, setHeaderVisible] = useState(false);
  const [scrambleTrigger, setScrambleTrigger] = useState(0);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    CONFUSED_PROPERTIES[0].id
  );

  useEffect(() => {
    const resetScrollToTop = () => {
      try {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
        if (!window.location.hash || window.location.hash === '#top') {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      } catch {}
    };

    resetScrollToTop();

    let scrollRafId: number | null = null;
    let introRafId: number | null = null;
    let lastVisible = false;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const updateBrandMetrics = () => {
      const rootEl = rootRef.current;
      const headerTarget = headerWordmarkRef.current;
      const floatingTarget = floatingWordmarkRef.current;
      if (!rootEl || !headerTarget || !floatingTarget) return;

      const viewportW = window.innerWidth || 1;
      const viewportH = window.innerHeight || 1;

      const headerRect = headerTarget.getBoundingClientRect();
      const floatingWidth = floatingTarget.offsetWidth || headerRect.width || 1;

      const brandDx = headerRect.left + headerRect.width / 2 - viewportW / 2;
      const brandDy = headerRect.top + headerRect.height / 2 - viewportH / 2;
      const brandScale = Math.min(0.8, Math.max(0.2, headerRect.width / floatingWidth));

      const targetStartPx = Math.min(viewportW * 0.78, viewportH * 0.72);
      const startScale = Math.min(0.74, Math.max(0.32, targetStartPx / viewportH));

      rootEl.style.setProperty('--hero-s0', startScale.toFixed(4));
      rootEl.style.setProperty('--brand-dx', `${brandDx.toFixed(2)}px`);
      rootEl.style.setProperty('--brand-dy', `${brandDy.toFixed(2)}px`);
      rootEl.style.setProperty('--brand-scale', brandScale.toFixed(4));
    };

    const applyVisualState = () => {
      const rootEl = rootRef.current;
      const viewportH = window.innerHeight || 1;

      // Transfer 0xCONFUSED to header across the scroll from title page (0) to content (~62vh)
      const dockScrollDistance = Math.max(1, viewportH * 0.62);
      const scrollProgress = clamp01(window.scrollY / dockScrollDistance);
      const scrollOverride = clamp01(window.scrollY / 120);

      const logoP = prefersReducedMotion
        ? 1
        : Math.max(introLogoPRef.current, scrollOverride);
      const textInP = prefersReducedMotion
        ? 1
        : Math.max(introTextPRef.current, scrollOverride);
      const dockP = prefersReducedMotion
        ? scrollProgress >= 0.85
          ? 1
          : 0
        : smoothstep(0.0, 0.92, scrollProgress);

      const handoffFadeOut = 1 - clamp01((scrollProgress - 0.85) / 0.11);
      const wordmarkOpacity = prefersReducedMotion
        ? scrollProgress >= 0.85
          ? 0
          : 1
        : textInP * handoffFadeOut;

      if (rootEl) {
        rootEl.style.setProperty('--logo-p', logoP.toFixed(4));
        rootEl.style.setProperty('--text-in-p', textInP.toFixed(4));
        rootEl.style.setProperty('--dock-p', dockP.toFixed(4));
        rootEl.style.setProperty('--wordmark-opacity', wordmarkOpacity.toFixed(4));
        rootEl.style.setProperty('--scroll-cue-p', clamp01(window.scrollY / 140).toFixed(4));
      }

      if (textInP >= 0.15 && !hasTriggeredRevealScrambleRef.current) {
        hasTriggeredRevealScrambleRef.current = true;
        setScrambleTrigger((n) => n + 1);
      }

      const shouldShowHeader = scrollProgress >= 0.85;
      if (!shouldShowHeader && typeof document !== 'undefined') {
        const activeEl = document.activeElement;
        const headerEl = document.getElementById('home-header');
        if (
          activeEl instanceof HTMLElement &&
          headerEl?.contains(activeEl) &&
          !activeEl.matches(':focus-visible')
        ) {
          activeEl.blur();
        }
      }
      if (shouldShowHeader !== lastVisible) {
        lastVisible = shouldShowHeader;
        setHeaderVisible(shouldShowHeader);
      }
    };

    const onScroll = () => {
      if (scrollRafId === null) {
        scrollRafId = window.requestAnimationFrame(() => {
          scrollRafId = null;
          applyVisualState();
        });
      }
    };

    const onResize = () => {
      updateBrandMetrics();
      applyVisualState();
    };

    // Onload animation: start with centered fullscreen logo, then shift right & reveal 0xCONFUSED text
    const startTime = performance.now();
    const LOGO_DELAY_MS = 220;
    const LOGO_DURATION_MS = 950;
    const TEXT_DELAY_MS = 520;
    const TEXT_DURATION_MS = 720;

    const runIntroFrame = (now: number) => {
      const elapsed = now - startTime;

      if (prefersReducedMotion || window.scrollY > 120) {
        introLogoPRef.current = 1;
        introTextPRef.current = 1;
        applyVisualState();
        introRafId = null;
        return;
      }

      introLogoPRef.current = easeOutCubic((elapsed - LOGO_DELAY_MS) / LOGO_DURATION_MS);
      introTextPRef.current = easeOutCubic((elapsed - TEXT_DELAY_MS) / TEXT_DURATION_MS);
      applyVisualState();

      if (elapsed < Math.max(LOGO_DELAY_MS + LOGO_DURATION_MS, TEXT_DELAY_MS + TEXT_DURATION_MS)) {
        introRafId = window.requestAnimationFrame(runIntroFrame);
      } else {
        introLogoPRef.current = 1;
        introTextPRef.current = 1;
        applyVisualState();
        introRafId = null;
      }
    };

    updateBrandMetrics();
    applyVisualState();
    introRafId = window.requestAnimationFrame(runIntroFrame);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        updateBrandMetrics();
        applyVisualState();
      });
    }

    const onLoad = () => {
      resetScrollToTop();
      applyVisualState();
    };

    window.addEventListener('load', onLoad);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', applyVisualState, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (scrollRafId !== null) window.cancelAnimationFrame(scrollRafId);
      if (introRafId !== null) window.cancelAnimationFrame(introRafId);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', applyVisualState);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.scroll-reveal'));
    if (elements.length === 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleEnterContent = useCallback(() => {
    const target = document.getElementById('properties');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleScrollTop = useCallback(() => {
    const activeEl = document.activeElement;
    const headerEl = document.getElementById('home-header');
    if (activeEl instanceof HTMLElement && headerEl?.contains(activeEl)) {
      activeEl.blur();
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const handleSelectProperty = useCallback((property: ConfusedProperty) => {
    setSelectedPropertyId(property.id);
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[#0d0d0d] text-[#f0f0f0] flex flex-col relative"
    >
      <HomeHeader
        visible={headerVisible}
        onScrollTop={handleScrollTop}
        wordmarkRef={headerWordmarkRef}
      />

      <main className="flex-1 relative">
        <FullscreenHeroStage
          stageRef={heroStageRef}
          floatingWordmarkRef={floatingWordmarkRef}
          scrambleTrigger={scrambleTrigger}
          headerVisible={headerVisible}
          onEnterContent={handleEnterContent}
        />

        {/* Content sits directly below the 100vh title page */}
        <div className="relative z-10 bg-transparent border-t border-[#2e2e2e]/60">
          <PropertiesSection selectedPropertyId={selectedPropertyId} />

          <RouteIndexSection
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={handleSelectProperty}
          />

          <FaqSection />

          <ResourcesSection />

          <MediaSection />
        </div>
      </main>

      <HomeFooter onScrollTop={handleScrollTop} />
    </div>
  );
}
