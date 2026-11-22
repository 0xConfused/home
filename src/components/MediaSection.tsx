// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Eye } from 'lucide-react';
import { MEDIA_ASSETS, MediaAsset, MediaVariant } from '../data/properties';
import { createStoreZipBlob } from '../utils/zipBundle';
import { parseIcoFrames, IcoFrame } from '../utils/icoParser';

export const MediaSection: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [licenseTexts, setLicenseTexts] = useState<Record<string, string>>({});
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [icoFrames, setIcoFrames] = useState<IcoFrame[] | null>(null);
  const [bundling, setBundling] = useState(false);

  useEffect(() => {
    if (!activeAsset) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !bundling) {
        setActiveAsset(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeAsset, bundling]);

  const handleOpenPreview = async (asset: MediaAsset) => {
    setActiveAsset(asset);
    setLicenseError(null);
    if (asset.variants && asset.variants.length > 0) {
      const preferred = asset.variants[1] ?? asset.variants[0];
      setSelectedVariantId(preferred.id);
    } else {
      setSelectedVariantId(null);
    }

    if (asset.licenseHref && !licenseTexts[asset.licenseHref]) {
      const href = asset.licenseHref;
      try {
        const res = await fetch(href);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        setLicenseTexts((prev) => ({ ...prev, [href]: text }));
      } catch {
        setLicenseError(`Unable to load ${asset.licenseName} license text.`);
      }
    }

    if (asset.format === 'ICO' && icoFrames === null) {
      try {
        const res = await fetch(asset.href);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const buf = await res.arrayBuffer();
        const frames = parseIcoFrames(buf);
        setIcoFrames(frames);
      } catch {
        setIcoFrames([]);
      }
    }
  };

  const triggerAnchorDownload = (href: string, filename: string) => {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleDownloadBundle = async (asset: MediaAsset) => {
    if (bundling || !asset.bundleFilename) return;

    if (asset.kind === 'font' && asset.licenseHref) {
      setBundling(true);
      try {
        const [fontRes, oflRes] = await Promise.all([
          fetch(asset.href),
          fetch(asset.licenseHref),
        ]);
        if (!fontRes.ok || !oflRes.ok) {
          throw new Error('Asset fetch failed');
        }
        const [fontBuf, oflBuf] = await Promise.all([
          fontRes.arrayBuffer(),
          oflRes.arrayBuffer(),
        ]);
        const zipBlob = createStoreZipBlob([
          { name: asset.filename, data: new Uint8Array(fontBuf) },
          { name: 'OFL.txt', data: new Uint8Array(oflBuf) },
        ]);
        const objectUrl = URL.createObjectURL(zipBlob);
        triggerAnchorDownload(objectUrl, asset.bundleFilename);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } catch {
        triggerAnchorDownload(asset.href, asset.filename);
      } finally {
        setBundling(false);
        setActiveAsset(null);
      }
      return;
    }

    if (asset.variants && asset.variants.length > 0) {
      setBundling(true);
      try {
        const fetches = asset.variants.map((variant) => fetch(variant.href));
        if (asset.licenseHref) {
          fetches.push(fetch(asset.licenseHref));
        }
        const responses = await Promise.all(fetches);
        if (responses.some((res) => !res.ok)) {
          throw new Error('Variant fetch failed');
        }
        const buffers = await Promise.all(
          responses.map((res) => res.arrayBuffer())
        );
        const entries = asset.variants.map((variant, i) => ({
          name: variant.filename,
          data: new Uint8Array(buffers[i]),
        }));
        if (asset.licenseHref) {
          const licenseFilename = asset.licenseHref.split('/').pop() || 'LICENSE.txt';
          entries.push({
            name: licenseFilename,
            data: new Uint8Array(buffers[buffers.length - 1]),
          });
        }
        const zipBlob = createStoreZipBlob(entries);
        const objectUrl = URL.createObjectURL(zipBlob);
        triggerAnchorDownload(objectUrl, asset.bundleFilename);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } catch {
        const fallback = asset.variants[0];
        triggerAnchorDownload(fallback.href, fallback.filename);
      } finally {
        setBundling(false);
        setActiveAsset(null);
      }
    }
  };

  const handleDownloadSingle = (asset: MediaAsset, variant?: MediaVariant | null) => {
    if (bundling) return;
    if (variant) {
      triggerAnchorDownload(variant.href, variant.filename);
    } else {
      triggerAnchorDownload(asset.href, asset.filename);
    }
    setActiveAsset(null);
  };

  const activeVariant: MediaVariant | null =
    activeAsset?.variants && activeAsset.variants.length > 0
      ? activeAsset.variants.find((v) => v.id === selectedVariantId) ?? activeAsset.variants[0]
      : null;

  return (
    <section
      id="media"
      aria-labelledby="media-heading"
      className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20 scroll-mt-20"
    >
      <div className="scroll-reveal border border-[#383838] bg-[#141414]/88 backdrop-blur-[2px]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#c30800] via-[#c300bb] to-[#bbc300]" />
        <div className="p-6 backdrop-blur-sm bg-gradient-to-r from-[#c30800]/10 via-transparent to-transparent border-b border-[#2e2e2e]">
          <p className="font-mono text-xs text-[#8c8c8c] mb-1.5">
            Brand &amp; Visual Assets
          </p>
          <h2
            id="media-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0]"
          >
            05. Media Downloads
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {MEDIA_ASSETS.map((asset, idx) => (
            <div
              key={asset.id}
              className={`p-5 sm:p-6 bg-[#141414]/75 hover:bg-[#1a1a1a]/80 transition-colors flex items-center justify-between gap-4 border-[#2e2e2e] ${
                idx < MEDIA_ASSETS.length - 1 ? 'border-b' : ''
              } ${
                idx >= MEDIA_ASSETS.length - 2 ? 'md:border-b-0' : 'md:border-b'
              } ${idx % 2 === 0 ? 'md:border-r' : ''}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {asset.kind === 'image' ? (
                  <div className="w-14 h-14 bg-[#0d0d0d] border border-[#383838] p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={asset.href}
                      alt={asset.title}
                      loading="lazy"
                      className="w-full h-full object-contain select-none"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden="true"
                    className="w-14 h-14 bg-[#0d0d0d] border border-[#383838] flex items-center justify-center font-glitch text-xl text-[#c30800] shrink-0 select-none"
                  >
                    0x
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#f0f0f0] truncate">
                    {asset.title}
                  </h3>
                  <div className="font-mono text-xs text-[#8c8c8c] truncate mt-0.5">
                    {asset.filename}
                  </div>
                  <div className="font-mono text-[11px] text-[#737373] mt-1">
                    {asset.format} · {asset.dimensions} · {asset.sizeLabel}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenPreview(asset)}
                aria-label={`Preview ${asset.title}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-xs font-mono font-bold uppercase tracking-wider bg-[#0d0d0d] hover:bg-[#262626] text-[#f0f0f0] border border-[#383838] hover:border-[#c30800] rounded-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#c30800] shrink-0" />
                <span>Preview</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeAsset &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-preview-title"
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget && !bundling) {
                setActiveAsset(null);
              }
            }}
          >
            <div className="w-full max-w-2xl bg-[#141414] border border-[#383838] rounded-none overflow-hidden flex flex-col max-h-[90vh]">
              <div className="h-[2px] w-full bg-gradient-to-r from-[#c30800] via-[#c300bb] to-[#bbc300] shrink-0" />

              <div className="px-5 py-4 border-b border-[#2e2e2e] flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-[#8c8c8c] truncate">
                    {activeVariant ? activeVariant.filename : activeAsset.filename}
                  </div>
                  <h3
                    id="media-preview-title"
                    className="text-base sm:text-lg font-bold text-[#f0f0f0] truncate"
                  >
                    {activeAsset.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
                <div className="border border-[#2e2e2e] bg-[#0d0d0d] p-5 flex items-center justify-center min-h-[180px]">
                  {activeAsset.kind === 'image' ? (
                    activeAsset.format === 'ICO' && icoFrames && icoFrames.length > 0 ? (
                      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {icoFrames.map((frame) => (
                          <div
                            key={`${frame.width}x${frame.height}`}
                            className="border border-[#2e2e2e] bg-[#141414] p-3 flex flex-col items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-h-[136px] flex items-center justify-center">
                              <img
                                src={frame.dataUrl}
                                width={frame.width}
                                height={frame.height}
                                alt={`${activeAsset.title} ${frame.width}x${frame.height}`}
                                className="max-w-full h-auto shrink-0 select-none"
                              />
                            </div>
                            <div className="w-full pt-2 border-t border-[#2e2e2e] text-center font-mono">
                              <div className="text-xs font-bold text-[#f0f0f0]">
                                {frame.width}×{frame.height}
                              </div>
                              <div className="text-[10px] text-[#737373] mt-0.5">
                                {frame.bpp}bpp · {(frame.bytes / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <img
                        src={activeVariant ? activeVariant.href : activeAsset.href}
                        alt={
                          activeVariant
                            ? `${activeAsset.title} ${activeVariant.dimensions}`
                            : activeAsset.title
                        }
                        className="max-h-[38vh] w-auto max-w-full object-contain select-none"
                      />
                    )
                  ) : (
                    <div className="w-full text-center space-y-3 py-2 select-none">
                      <div className="font-glitch text-4xl sm:text-5xl tracking-[0.12em] text-[#c30800] leading-none">
                        0xCONFUSED
                      </div>
                      <div className="font-glitch text-lg sm:text-xl tracking-[0.1em] text-[#f0f0f0] break-words">
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                      </div>
                      <div className="font-glitch text-base sm:text-lg tracking-[0.12em] text-[#8c8c8c]">
                        0123456789 ./-_
                      </div>
                    </div>
                  )}
                </div>

                {activeAsset.variants && activeAsset.variants.length > 0 && (
                  <div
                    role="tablist"
                    aria-label="Select background resolution"
                    className="grid grid-cols-3 gap-1 bg-[#0d0d0d] p-1 border border-[#383838] rounded-none font-mono"
                  >
                    {activeAsset.variants.map((variant) => {
                      const isSelected = activeVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`p-2.5 text-left border rounded-none transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#262626] border-[#c30800] text-[#f0f0f0]'
                              : 'bg-[#141414] border-[#2e2e2e] text-[#8c8c8c] hover:text-[#f0f0f0] hover:bg-[#1a1a1a] hover:border-[#383838]'
                          }`}
                        >
                          <div className="text-xs font-bold">{variant.label}</div>
                          <div className="text-[11px] text-[#737373] mt-0.5">
                            {variant.dimensions} · {variant.sizeLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#2e2e2e] bg-[#0d0d0d] font-mono text-xs">
                  <div className="p-3 border-b sm:border-b-0 border-r border-[#2e2e2e]">
                    <div className="text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                      Format
                    </div>
                    <div className="text-[#f0f0f0] truncate">{activeAsset.format}</div>
                  </div>
                  <div className="p-3 border-b sm:border-b-0 sm:border-r border-[#2e2e2e]">
                    <div className="text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                      Specs
                    </div>
                    <div className="text-[#f0f0f0] truncate">
                      {activeVariant ? activeVariant.dimensions : activeAsset.dimensions}
                    </div>
                  </div>
                  <div className="p-3 border-r border-[#2e2e2e]">
                    <div className="text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                      Size
                    </div>
                    <div className="text-[#f0f0f0] truncate">
                      {activeVariant ? activeVariant.sizeLabel : activeAsset.sizeLabel}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                      License
                    </div>
                    <div className="text-[#f0f0f0] truncate">{activeAsset.licenseName}</div>
                  </div>
                </div>

                {activeAsset.licenseHref && (
                  <div className="border border-[#2e2e2e] bg-[#0d0d0d] p-3.5">
                    {licenseError ? (
                      <p className="font-mono text-xs text-[#c3005a]">{licenseError}</p>
                    ) : (
                      <pre className="font-mono text-[11px] leading-relaxed text-[#8c8c8c] max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap break-words m-0">
                        {licenseTexts[activeAsset.licenseHref] ?? `Loading ${activeAsset.licenseName}...`}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              <div className="px-5 py-3.5 border-t border-[#2e2e2e] bg-[#0d0d0d] flex flex-wrap items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!bundling) setActiveAsset(null);
                  }}
                  className="px-3.5 py-2 min-h-[38px] text-xs font-mono font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#262626] text-[#8c8c8c] hover:text-[#f0f0f0] border border-[#383838] rounded-none transition-colors cursor-pointer"
                >
                  Close
                </button>
                {activeAsset.variants && activeVariant ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(activeAsset, activeVariant)}
                      disabled={bundling}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-mono font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#262626] text-[#f0f0f0] border border-[#383838] hover:border-[#c30800] rounded-none transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c30800] shrink-0" />
                      <span>Download {activeVariant.label}</span>
                    </button>
                    {activeAsset.bundleFilename && (
                      <button
                        type="button"
                        onClick={() => handleDownloadBundle(activeAsset)}
                        disabled={bundling}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-mono font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#262626] text-[#f0f0f0] border border-[#c30800] rounded-none transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <Download className="w-3.5 h-3.5 text-[#c30800] shrink-0" />
                        <span>{bundling ? 'Bundling' : 'Download All ZIP'}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      activeAsset.bundleFilename
                        ? handleDownloadBundle(activeAsset)
                        : handleDownloadSingle(activeAsset)
                    }
                    disabled={bundling}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-mono font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#262626] text-[#f0f0f0] border border-[#c30800] rounded-none transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c30800] shrink-0" />
                    <span>
                      {bundling
                        ? 'Bundling'
                        : activeAsset.bundleFilename
                          ? 'Download ZIP'
                          : 'Download'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
