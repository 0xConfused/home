// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect, useRef, useCallback } from 'react';

const BRAND_NAME = '0xCONFUSED';
const SCRAMBLE_CHARS = '!@#$%^&*<>[]_01';

interface ScrambleBrandProps {
  className?: string;
  textClassName?: string;
  as?: 'h1' | 'span';
  ariaLabel?: string;
  triggerKey?: number;
  cooldownMs?: number;
  deferUntilTrigger?: boolean;
  onScrambleComplete?: () => void;
}

export const ScrambleBrand: React.FC<ScrambleBrandProps> = ({
  className = '',
  textClassName = '',
  as = 'span',
  ariaLabel = '0xCONFUSED',
  triggerKey = 0,
  cooldownMs = 2000,
  deferUntilTrigger = false,
  onScrambleComplete,
}) => {
  const [scrambleText, setScrambleText] = useState<string>(BRAND_NAME);
  const lastScrambleAtRef = useRef<number>(0);
  const scrambleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onScrambleCompleteRef = useRef<(() => void) | undefined>(onScrambleComplete);

  useEffect(() => {
    onScrambleCompleteRef.current = onScrambleComplete;
  }, [onScrambleComplete]);

  const runScramble = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setScrambleText(BRAND_NAME);
      onScrambleCompleteRef.current?.();
      return;
    }

    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
    }

    let iteration = 0;
    scrambleIntervalRef.current = setInterval(() => {
      setScrambleText(
        BRAND_NAME.split('')
          .map((_char, index) => {
            if (index < iteration) {
              return BRAND_NAME[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('')
      );

      if (iteration >= BRAND_NAME.length) {
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
          scrambleIntervalRef.current = null;
        }
        setScrambleText(BRAND_NAME);
        onScrambleCompleteRef.current?.();
      }
      iteration += 1 / 3;
    }, 30);
  }, []);

  const tryRunScramble = useCallback(() => {
    const now = Date.now();
    if (now - lastScrambleAtRef.current < cooldownMs) {
      return;
    }
    lastScrambleAtRef.current = now;
    runScramble();
  }, [cooldownMs, runScramble]);

  const handleMouseEnter = useCallback(() => {
    tryRunScramble();
  }, [tryRunScramble]);

  useEffect(() => {
    if (deferUntilTrigger && triggerKey === 0) {
      return;
    }
    tryRunScramble();
  }, [deferUntilTrigger, triggerKey, tryRunScramble]);

  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    };
  }, []);

  const Tag = as;

  return (
    <Tag
      className={`font-glitch select-none ${className}`}
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
    >
      <span className={`brand-title brand-scanline-title ${textClassName}`}>{scrambleText}</span>
    </Tag>
  );
};
