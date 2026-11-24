// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';
import { ScrambleBrand } from './ScrambleBrand';

interface FullscreenHeroStageProps {
  stageRef: React.RefObject<HTMLDivElement | null>;
  floatingWordmarkRef: React.RefObject<HTMLDivElement | null>;
  scrambleTrigger: number;
  headerVisible: boolean;
  heroDismissed: boolean;
  onEnterContent: () => void;
  onScrambleComplete?: () => void;
}

export const FullscreenHeroStage: React.FC<FullscreenHeroStageProps> = ({
  stageRef,
  floatingWordmarkRef,
  scrambleTrigger,
  headerVisible,
  heroDismissed,
  onEnterContent,
  onScrambleComplete,
}) => {
  const canInteractWordmark = !heroDismissed && !headerVisible;

  return (
    <>
      {/* Persistent Fixed Background Logo (10x10kpx.png):
          Onload starts centered fullscreen, then moves to the right side (+50vw -> 50% off right edge)
          spanning 100vh from top of page to bottom of page at 24% atmospheric opacity. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden z-[1]"
      >
        <div className="hero-bg-logo-transform absolute top-1/2 left-1/2 w-[100vh] h-[100vh] -ml-[50vh] -mt-[50vh]">
          <div className="hero-logo-inner w-full h-full drop-shadow-[0_0_28px_rgba(195,8,0,0.20)]">
            <img
              src="./10x10kpx.png"
              alt=""
              referrerPolicy="no-referrer"
              className="hero-logo-scanlines w-full h-full object-contain select-none"
              loading="eager"
            />
            <div
              className="skull-sweep-layer"
              style={{
                WebkitMaskImage: 'url(./10x10kpx.png)',
                maskImage: 'url(./10x10kpx.png)',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
            >
              <div className="skull-sweep-beam" />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Floating 0xCONFUSED Wordmark Layer:
          Appears onload as the logo moves to the right side,
          then transfers upward into the header wordmark slot as user scrolls to content. */}
      <div
        aria-hidden={!canInteractWordmark}
        className="fixed inset-0 overflow-hidden z-[45] flex items-center justify-center pointer-events-none"
      >
        <div
          ref={floatingWordmarkRef}
          onClick={canInteractWordmark ? onEnterContent : undefined}
          onKeyDown={
            canInteractWordmark
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEnterContent();
                  }
                }
              : undefined
          }
          role={canInteractWordmark ? 'button' : undefined}
          tabIndex={canInteractWordmark ? 0 : -1}
          aria-label={canInteractWordmark ? '0xCONFUSED — Enter applications' : undefined}
          className={`hero-wordmark-transfer inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#c30800] ${
            canInteractWordmark ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
          }`}
        >
          <ScrambleBrand
            as="h1"
            triggerKey={scrambleTrigger}
            cooldownMs={5000}
            deferUntilTrigger
            onScrambleComplete={onScrambleComplete}
            className="text-[clamp(2.5rem,7vw,5.25rem)] tracking-[0.14em] leading-none text-[#c30800] whitespace-nowrap drop-shadow-[0_0_16px_rgba(195,8,0,0.40)]"
            textClassName="inline-block"
          />
        </div>
      </div>

      {/* 100vh Title Page — collapsed once dismissed via 0xCONFUSED click until user clicks a top link */}
      {!heroDismissed && (
        <section
          id="top"
          ref={stageRef}
          aria-label="0xCONFUSED Title Page"
          className="hero-scroll-stage relative h-[100dvh] min-h-screen w-full bg-transparent z-[5] pointer-events-none"
        >
          {/* Ambient horizon diffusion strictly <= 6% opacity */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 h-[55vh] z-0"
            style={{
              background:
                'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(195, 8, 0, 0.06) 0%, transparent 75%)',
            }}
          />

          {/* Subtle bottom hairline cue that fades immediately on scroll */}
          <div
            aria-hidden="true"
            className="hero-scroll-cue pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
          >
            <span className="w-px h-8 bg-gradient-to-b from-[#c30800] to-transparent" />
          </div>
        </section>
      )}
    </>
  );
};
