// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
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

  const heroDismissedRef = useRef<boolean>(false);
  const enteringRef = useRef<boolean>(false);
  const returningTopRef = useRef<boolean>(false);
  const contentLockPendingRef = useRef<boolean>(false);
  const initialTitleLockRef = useRef<boolean>(false);
  const introFramesDoneRef = useRef<boolean>(false);
  const scrambleDoneRef = useRef<boolean>(false);
  const autoEnterScheduledRef = useRef<boolean>(false);
  const autoEnterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyVisualStateRef = useRef<(() => void) | null>(null);
  const updateBrandMetricsRef = useRef<(() => void) | null>(null);
  const cancelEnterRef = useRef<(() => void) | null>(null);
  const enterContentRef = useRef<(() => void) | null>(null);
  const pendingDismissRef = useRef<{ prevScrollY: number; heroHeight: number } | null>(null);
  const pendingRestoreRef = useRef<{ prevScrollY: number; smooth: boolean } | null>(null);

  const [headerVisible, setHeaderVisible] = useState(false);
  const [heroDismissed, setHeroDismissed] = useState(false);
  const [scrambleTrigger, setScrambleTrigger] = useState(0);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    CONFUSED_PROPERTIES[0].id
  );

  const maybeScheduleAutoEnter = useCallback(() => {
    if (
      !initialTitleLockRef.current ||
      heroDismissedRef.current ||
      enteringRef.current ||
      autoEnterScheduledRef.current ||
      !introFramesDoneRef.current ||
      !scrambleDoneRef.current
    ) {
      return;
    }

    autoEnterScheduledRef.current = true;
    autoEnterTimerRef.current = setTimeout(() => {
      autoEnterTimerRef.current = null;
      if (initialTitleLockRef.current && !heroDismissedRef.current) {
        enterContentRef.current?.();
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const loadsToTitleCard =
      typeof window !== 'undefined' &&
      (!window.location.hash || window.location.hash === '#top');

    if (loadsToTitleCard) {
      initialTitleLockRef.current = true;
    }

    const resetScrollToTop = () => {
      try {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
        if (loadsToTitleCard) {
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

    const clearReturnGuard = () => {
      returningTopRef.current = false;
      if (returnFallbackTimerRef.current !== null) {
        clearTimeout(returnFallbackTimerRef.current);
        returnFallbackTimerRef.current = null;
      }
    };

    const dismissHeroFromScroll = (clampToTop: boolean) => {
      if (heroDismissedRef.current || returningTopRef.current || enteringRef.current) return;
      const heroHeight = heroStageRef.current?.offsetHeight || window.innerHeight || 0;
      if (heroHeight <= 0) return;

      contentLockPendingRef.current = false;
      if (dismissDebounceTimerRef.current !== null) {
        clearTimeout(dismissDebounceTimerRef.current);
        dismissDebounceTimerRef.current = null;
      }

      pendingDismissRef.current = {
        prevScrollY: clampToTop ? heroHeight : window.scrollY,
        heroHeight,
      };
      heroDismissedRef.current = true;
      setHeroDismissed(true);
    };

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

      if (heroDismissedRef.current) {
        if (rootEl) {
          rootEl.style.setProperty('--logo-p', '1.0000');
          rootEl.style.setProperty('--text-in-p', '1.0000');
          rootEl.style.setProperty('--dock-p', '1.0000');
          rootEl.style.setProperty('--wordmark-opacity', '0.0000');
          rootEl.style.setProperty('--scroll-cue-p', '1.0000');
        }
        if (!lastVisible) {
          lastVisible = true;
          setHeaderVisible(true);
        }
        return;
      }

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

    updateBrandMetricsRef.current = updateBrandMetrics;
    applyVisualStateRef.current = applyVisualState;

    const onScroll = () => {
      if (initialTitleLockRef.current && !enteringRef.current && !heroDismissedRef.current) {
        if (window.scrollY !== 0) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      } else if (returningTopRef.current) {
        if (window.scrollY <= 4) {
          clearReturnGuard();
        }
      } else if (!heroDismissedRef.current && !enteringRef.current) {
        const heroHeight = heroStageRef.current?.offsetHeight || window.innerHeight || 0;
        if (heroHeight > 0 && window.scrollY >= heroHeight - 2) {
          contentLockPendingRef.current = true;
          if (dismissDebounceTimerRef.current !== null) {
            clearTimeout(dismissDebounceTimerRef.current);
          }
          dismissDebounceTimerRef.current = setTimeout(() => {
            dismissDebounceTimerRef.current = null;
            if (
              contentLockPendingRef.current &&
              !heroDismissedRef.current &&
              !returningTopRef.current &&
              !enteringRef.current &&
              window.scrollY >= heroHeight - 2
            ) {
              dismissHeroFromScroll(false);
            }
          }, 120);
        } else if (contentLockPendingRef.current && heroHeight > 0 && window.scrollY < heroHeight - 2) {
          dismissHeroFromScroll(true);
        }
      }

      if (scrollRafId === null) {
        scrollRafId = window.requestAnimationFrame(() => {
          scrollRafId = null;
          applyVisualState();
        });
      }
    };

    const onScrollEnd = () => {
      applyVisualState();
      if (initialTitleLockRef.current && !enteringRef.current && !heroDismissedRef.current) {
        if (window.scrollY !== 0) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
        return;
      }
      if (returningTopRef.current) {
        if (window.scrollY <= 4) {
          clearReturnGuard();
        }
        return;
      }
      if (contentLockPendingRef.current && !heroDismissedRef.current && !enteringRef.current) {
        const heroHeight = heroStageRef.current?.offsetHeight || window.innerHeight || 0;
        if (heroHeight > 0 && window.scrollY >= heroHeight - 2) {
          dismissHeroFromScroll(false);
        }
      }
    };

    const onTitleLockWheel = (event: WheelEvent) => {
      if (initialTitleLockRef.current && !heroDismissedRef.current) {
        event.preventDefault();
        return;
      }
      if (returningTopRef.current && event.deltaY > 0) {
        clearReturnGuard();
      }
    };

    const onTitleLockTouchMove = (event: TouchEvent) => {
      if (initialTitleLockRef.current && !heroDismissedRef.current) {
        event.preventDefault();
      }
    };

    const onTitleLockKeyDown = (event: KeyboardEvent) => {
      if (!initialTitleLockRef.current || heroDismissedRef.current) return;

      const blockedKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
      if (!blockedKeys.includes(event.key)) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === ' ' && target?.getAttribute('role') === 'button') {
        return;
      }

      event.preventDefault();
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

      if (prefersReducedMotion || heroDismissedRef.current || window.scrollY > 120) {
        introLogoPRef.current = 1;
        introTextPRef.current = 1;
        applyVisualState();
        introRafId = null;
        introFramesDoneRef.current = true;
        maybeScheduleAutoEnter();
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
        introFramesDoneRef.current = true;
        maybeScheduleAutoEnter();
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
      if (!heroDismissedRef.current && !enteringRef.current) {
        resetScrollToTop();
      }
      applyVisualState();
    };

    window.addEventListener('load', onLoad);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScrollEnd, { passive: true });
    window.addEventListener('wheel', onTitleLockWheel, { passive: false });
    window.addEventListener('touchmove', onTitleLockTouchMove, { passive: false });
    window.addEventListener('keydown', onTitleLockKeyDown);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (scrollRafId !== null) window.cancelAnimationFrame(scrollRafId);
      if (introRafId !== null) window.cancelAnimationFrame(introRafId);
      if (dismissDebounceTimerRef.current !== null) {
        clearTimeout(dismissDebounceTimerRef.current);
      }
      if (autoEnterTimerRef.current !== null) {
        clearTimeout(autoEnterTimerRef.current);
        autoEnterTimerRef.current = null;
      }
      autoEnterScheduledRef.current = false;
      clearReturnGuard();
      cancelEnterRef.current?.();
      window.removeEventListener('load', onLoad);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('wheel', onTitleLockWheel);
      window.removeEventListener('touchmove', onTitleLockTouchMove);
      window.removeEventListener('keydown', onTitleLockKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [maybeScheduleAutoEnter]);

  useLayoutEffect(() => {
    heroDismissedRef.current = heroDismissed;

    if (heroDismissed && pendingDismissRef.current) {
      const { prevScrollY, heroHeight } = pendingDismissRef.current;
      pendingDismissRef.current = null;
      const nextScrollY = Math.max(0, prevScrollY - heroHeight);
      window.scrollTo({ top: nextScrollY, left: 0, behavior: 'auto' });
      applyVisualStateRef.current?.();
      return;
    }

    if (!heroDismissed && pendingRestoreRef.current) {
      const { prevScrollY, smooth } = pendingRestoreRef.current;
      pendingRestoreRef.current = null;
      if (!smooth) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        updateBrandMetricsRef.current?.();
        applyVisualStateRef.current?.();
        return;
      }
      const heroHeight = heroStageRef.current?.offsetHeight || window.innerHeight || 0;
      window.scrollTo({ top: prevScrollY + heroHeight, left: 0, behavior: 'auto' });
      updateBrandMetricsRef.current?.();
      applyVisualStateRef.current?.();
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      });
    }
  }, [heroDismissed]);

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
    if (heroDismissedRef.current) return;

    if (autoEnterTimerRef.current !== null) {
      clearTimeout(autoEnterTimerRef.current);
      autoEnterTimerRef.current = null;
    }

    cancelEnterRef.current?.();
    returningTopRef.current = false;
    contentLockPendingRef.current = false;
    if (dismissDebounceTimerRef.current !== null) {
      clearTimeout(dismissDebounceTimerRef.current);
      dismissDebounceTimerRef.current = null;
    }
    if (returnFallbackTimerRef.current !== null) {
      clearTimeout(returnFallbackTimerRef.current);
      returnFallbackTimerRef.current = null;
    }

    const heroHeight = heroStageRef.current?.offsetHeight || window.innerHeight || 0;
    const maxScrollable = Math.max(
      0,
      document.documentElement.scrollHeight - (window.innerHeight || 0)
    );
    const targetTop = Math.min(heroHeight, maxScrollable);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || targetTop <= 0) {
      initialTitleLockRef.current = false;
      pendingDismissRef.current = {
        prevScrollY: window.scrollY,
        heroHeight,
      };
      heroDismissedRef.current = true;
      setHeroDismissed(true);
      return;
    }

    enteringRef.current = true;
    let finished = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      enteringRef.current = false;
      if (fallbackTimer !== null) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      window.removeEventListener('wheel', preventUpwardWheel);
      window.removeEventListener('scroll', onEnterScroll);
      window.removeEventListener('scrollend', completeEnter);
      if (cancelEnterRef.current === cancel) {
        cancelEnterRef.current = null;
      }
    };

    const cancel = () => {
      finished = true;
      cleanup();
    };

    const completeEnter = () => {
      if (finished) return;
      finished = true;
      cleanup();
      initialTitleLockRef.current = false;
      const currentHeroHeight = heroStageRef.current?.offsetHeight || heroHeight;
      pendingDismissRef.current = {
        prevScrollY: window.scrollY,
        heroHeight: currentHeroHeight,
      };
      heroDismissedRef.current = true;
      setHeroDismissed(true);
    };

    const preventUpwardWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) {
        event.preventDefault();
      }
    };

    const onEnterScroll = () => {
      if (window.scrollY >= targetTop - 2) {
        completeEnter();
      }
    };

    cancelEnterRef.current = cancel;
    window.addEventListener('wheel', preventUpwardWheel, { passive: false });
    window.addEventListener('scroll', onEnterScroll, { passive: true });
    window.addEventListener('scrollend', completeEnter, { passive: true });
    fallbackTimer = setTimeout(completeEnter, 900);

    window.scrollTo({ top: targetTop, left: 0, behavior: 'smooth' });
  }, []);

  enterContentRef.current = handleEnterContent;

  const handleHeroScrambleComplete = useCallback(() => {
    scrambleDoneRef.current = true;
    maybeScheduleAutoEnter();
  }, [maybeScheduleAutoEnter]);

  const handleScrollTop = useCallback(() => {
    cancelEnterRef.current?.();
    initialTitleLockRef.current = false;
    if (autoEnterTimerRef.current !== null) {
      clearTimeout(autoEnterTimerRef.current);
      autoEnterTimerRef.current = null;
    }
    contentLockPendingRef.current = false;
    if (dismissDebounceTimerRef.current !== null) {
      clearTimeout(dismissDebounceTimerRef.current);
      dismissDebounceTimerRef.current = null;
    }

    const activeEl = document.activeElement;
    const headerEl = document.getElementById('home-header');
    if (activeEl instanceof HTMLElement && headerEl?.contains(activeEl)) {
      activeEl.blur();
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (returnFallbackTimerRef.current !== null) {
      clearTimeout(returnFallbackTimerRef.current);
      returnFallbackTimerRef.current = null;
    }

    if (heroDismissedRef.current) {
      returningTopRef.current = !prefersReducedMotion;
      if (!prefersReducedMotion) {
        returnFallbackTimerRef.current = setTimeout(() => {
          returningTopRef.current = false;
          returnFallbackTimerRef.current = null;
        }, 1800);
      }
      pendingRestoreRef.current = {
        prevScrollY: window.scrollY,
        smooth: !prefersReducedMotion,
      };
      heroDismissedRef.current = false;
      setHeroDismissed(false);
      return;
    }

    if (!prefersReducedMotion && window.scrollY > 4) {
      returningTopRef.current = true;
      returnFallbackTimerRef.current = setTimeout(() => {
        returningTopRef.current = false;
        returnFallbackTimerRef.current = null;
      }, 1800);
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
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
          heroDismissed={heroDismissed}
          onEnterContent={handleEnterContent}
          onScrambleComplete={handleHeroScrambleComplete}
        />

        {/* Content sits directly below the 100vh title page */}
        <div
          className={`relative z-10 bg-transparent ${
            heroDismissed ? '' : 'border-t border-[#2e2e2e]/60'
          }`}
        >
          <PropertiesSection />

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
