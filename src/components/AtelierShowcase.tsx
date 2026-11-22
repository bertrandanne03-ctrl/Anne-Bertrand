import { useState } from 'react';
import { Archive, Download, Eye, Layers, Loader2 } from 'lucide-react';
import { PLUME_18_PAGE_BLUEPRINT } from '../types/factory';

interface DeliverablePattern {
  id: string;
  title: string;
  subtitle: string;
  jpgUrl: string;
  jpgFilename: string;
  jpgSize: string;
  zipUrl: string;
  zipFilename: string;
  zipSize: string;
  previewUrl: string;
  previewFilename: string;
  seamStats: string;
  iccProfile: string;
  sourceNote: string;
  verdict: 'VALIDÉ' | 'VALIDÉ (AVEC RÉSERVE 100%)';
  verdictNote: string;
}

const DELIVERABLE_PATTERNS: DeliverablePattern[] = [
  {
    id: '01',
    title: '01 · Heritage Tartan Dark',
    subtitle: '3600×3600 px · 300 DPI · 12×12 in · sRGB ICC (588 B)',
    jpgUrl: '/assets/deliverables/PLUME_Heritage_Christmas_01_3600x3600_300DPI.jpg',
    jpgFilename: 'PLUME_Heritage_Christmas_01_3600x3600_300DPI.jpg',
    jpgSize: '5.13 Mo',
    zipUrl: '/assets/deliverables/PLUME_Heritage_Christmas_01_3600x3600_300DPI.zip',
    zipFilename: 'PLUME_Heritage_Christmas_01_3600x3600_300DPI.zip',
    zipSize: '4.82 Mo',
    previewUrl: '/assets/deliverables/PREVIEW_2x2_PLUME_Heritage_Christmas_01.jpg',
    previewFilename: 'PREVIEW_2x2_PLUME_Heritage_Christmas_01.jpg',
    seamStats: 'H/B 1.51% · G/D 1.67%',
    iccProfile: 'sRGB ICC 588 B · 1×1',
    sourceNote: 'Source agrandie (~3× IA)',
    verdict: 'VALIDÉ',
    verdictNote: 'CODE PLUME 300 — SEAMLESS VALIDÉ (impression physique non testée)',
  },
  {
    id: '02',
    title: '02 · Heritage Tartan Cream',
    subtitle: '3600×3600 px · 300 DPI · 12×12 in · sRGB ICC (588 B)',
    jpgUrl: '/assets/deliverables/PLUME_Heritage_Christmas_02_3600x3600_300DPI.jpg',
    jpgFilename: 'PLUME_Heritage_Christmas_02_3600x3600_300DPI.jpg',
    jpgSize: '4.69 Mo',
    zipUrl: '/assets/deliverables/PLUME_Heritage_Christmas_02_3600x3600_300DPI.zip',
    zipFilename: 'PLUME_Heritage_Christmas_02_3600x3600_300DPI.zip',
    zipSize: '4.69 Mo',
    previewUrl: '/assets/deliverables/PREVIEW_2x2_PLUME_Heritage_Christmas_02.jpg',
    previewFilename: 'PREVIEW_2x2_PLUME_Heritage_Christmas_02.jpg',
    seamStats: 'H/B 1.52% · G/D 1.22%',
    iccProfile: 'sRGB ICC 588 B · 1×1',
    sourceNote: 'Source agrandie (~3× IA)',
    verdict: 'VALIDÉ',
    verdictNote: 'CODE PLUME 300 — SEAMLESS VALIDÉ (micro-fondu twill invisible à l’œil, impression non testée)',
  },
  {
    id: '03',
    title: '03 · Camel Houndstooth Plaid',
    subtitle: '3600×3600 px · 300 DPI · 12×12 in · sRGB ICC (588 B)',
    jpgUrl: '/assets/deliverables/PLUME_Heritage_Christmas_03_3600x3600_300DPI.jpg',
    jpgFilename: 'PLUME_Heritage_Christmas_03_3600x3600_300DPI.jpg',
    jpgSize: '6.63 Mo',
    zipUrl: '/assets/deliverables/PLUME_Heritage_Christmas_03_3600x3600_300DPI.zip',
    zipFilename: 'PLUME_Heritage_Christmas_03_3600x3600_300DPI.zip',
    zipSize: '5.68 Mo',
    previewUrl: '/assets/deliverables/PREVIEW_2x2_PLUME_Heritage_Christmas_03.jpg',
    previewFilename: 'PREVIEW_2x2_PLUME_Heritage_Christmas_03.jpg',
    seamStats: 'H/B 2.83% · G/D 2.50%',
    iccProfile: 'sRGB ICC 588 B · 1×1',
    sourceNote: 'Reconstruit (zone saine) + agrandi',
    verdict: 'VALIDÉ (AVEC RÉSERVE 100%)',
    verdictNote: 'Raccord 2×2 propre ; léger adoucissement de trame visible uniquement à zoom 100% (impression non testée)',
  },
];

interface EditorialPlate {
  src: string;
  fig: string;
  title: string;
  caption: string;
  aspectClass: string;
}

const EDITORIAL_PLATES: EditorialPlate[] = [
  {
    src: '/src/assets/images/plume_cover_editorial_1794778108509.jpg',
    fig: 'Fig. 01',
    title: 'Cover Lifestyle Flat-Lay',
    caption: 'Solid #F6F2EC studio ground · Tailored camel wool, silk camisole, ivory pleats',
    aspectClass: 'aspect-[3/4]',
  },
  {
    src: '/src/assets/images/plume_flatlay_tailoring_1794778108888.jpg',
    fig: 'Fig. 02',
    title: 'Tailoring & Knitwear Board',
    caption: 'Tactile cashmere weave, crisp cotton poplin, espresso leather accents · Zero logos',
    aspectClass: 'aspect-[4/3]',
  },
  {
    src: '/src/assets/images/plume_flatlay_accessories_1794778109159.jpg',
    fig: 'Fig. 03',
    title: 'Silk & Accessories Collage',
    caption: 'Champagne bias satin, oat merino knit, woven leather clutch · Zero neck tags',
    aspectClass: 'aspect-[4/3]',
  },
];

function StudioPlateCard({ plate }: { plate: EditorialPlate }) {
  const [imgError, setImgError] = useState(false);

  return (
    <figure className="flex flex-col">
      <div
        className={`w-full ${plate.aspectClass} bg-[#F6F2EC] border border-[#E5DDD0] overflow-hidden relative`}
      >
        {!imgError ? (
          <img
            src={plate.src}
            alt={`${plate.title} — ${plate.caption}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.015]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F6F2EC] text-[#57534E]">
            <Layers className="w-6 h-6 mb-2 text-[#8C8275]" aria-hidden="true" />
            <span className="font-serif text-lg text-[#1C1917]">{plate.title}</span>
            <span className="text-xs mt-1 text-[#78716C]">{plate.caption}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 flex flex-col gap-0.5">
        <div className="flex items-center gap-2 text-xs text-[#78716C] uppercase tracking-widest">
          <span>{plate.fig}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#1C1917] font-medium">{plate.title}</span>
        </div>
        <p className="text-xs text-[#57534E] leading-relaxed">{plate.caption}</p>
      </figcaption>
    </figure>
  );
}

export function AtelierShowcase() {
  const [preview2x2, setPreview2x2] = useState(true);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadBinary = async (
    key: string,
    url: string,
    filename: string,
    expectedKind: 'image' | 'zip'
  ) => {
    setDownloadingKey(key);
    setDownloadError(null);
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      if (expectedKind === 'image' && (!blob.type.startsWith('image/') || blob.size < 100000)) {
        throw new Error('Réponse binaire image invalide.');
      }
      if (expectedKind === 'zip' && blob.size < 100000) {
        throw new Error('Archive ZIP invalide.');
      }
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Échec du téléchargement.';
      setDownloadError(`Impossible de télécharger ${filename} (${msg}).`);
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <div className="space-y-20">
      {/* CODE PLUME 300 — Deliverables & Control Section */}
      <section id="corrected-patterns" className="pt-10 border-t border-[#E5DDD0]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-2">
              CODE PLUME 300 · Livrables Heritage Christmas
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1C1917] tracking-tight">
              Motifs Seamless 3600×3600 · 300 DPI · sRGB ICC
            </h2>
          </div>

          <div className="inline-flex items-center border border-[#D6CEBE] bg-[#F6F2EC] p-1 self-start">
            <button
              type="button"
              onClick={() => setPreview2x2(true)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                preview2x2
                  ? 'bg-[#2C2520] text-[#FAF6F0]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Aperçu Répétition 2×2
            </button>
            <button
              type="button"
              onClick={() => setPreview2x2(false)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !preview2x2
                  ? 'bg-[#2C2520] text-[#FAF6F0]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Tuile 1×1
            </button>
          </div>
        </div>

        {downloadError && (
          <div
            role="alert"
            className="mb-6 p-4 bg-[#F6F2EC] border border-[#9A3412]/40 text-sm text-[#9A3412]"
          >
            {downloadError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DELIVERABLE_PATTERNS.map((pattern) => {
            const loadingJpg = downloadingKey === `${pattern.id}-jpg`;
            const loadingZip = downloadingKey === `${pattern.id}-zip`;
            const loadingPrev = downloadingKey === `${pattern.id}-prev`;

            return (
              <article
                key={pattern.id}
                className="bg-[#F6F2EC] border border-[#E5DDD0] flex flex-col justify-between"
              >
                <div
                  className="w-full aspect-square border-b border-[#E5DDD0]"
                  style={{
                    backgroundImage: `url(${pattern.jpgUrl})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: preview2x2 ? '50% 50%' : '100% 100%',
                  }}
                  role="img"
                  aria-label={`${pattern.title} seamless pattern preview`}
                />

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                      {pattern.title}
                    </h3>
                    <p className="text-xs text-[#57534E] mt-1">{pattern.subtitle}</p>
                    <p className="font-mono text-[11px] text-[#78716C] mt-1 tabular-nums">
                      {pattern.seamStats} · {pattern.verdict}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={downloadingKey !== null}
                      onClick={() =>
                        handleDownloadBinary(
                          `${pattern.id}-jpg`,
                          pattern.jpgUrl,
                          pattern.jpgFilename,
                          'image'
                        )
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                    >
                      {loadingJpg ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                          <span>Téléchargement JPG...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>JPG Final ({pattern.jpgSize})</span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadBinary(
                            `${pattern.id}-zip`,
                            pattern.zipUrl,
                            pattern.zipFilename,
                            'zip'
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                      >
                        {loadingZip ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>ZIP ({pattern.zipSize})</span>
                      </button>

                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadBinary(
                            `${pattern.id}-prev`,
                            pattern.previewUrl,
                            pattern.previewFilename,
                            'image'
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                      >
                        {loadingPrev ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>Aperçu 2×2</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CODE PLUME 300 Control Table */}
        <div className="mt-10 border border-[#E5DDD0] bg-[#F6F2EC] overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5DDD0] text-[#78716C] uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Fichier Final</th>
                <th className="py-3 px-4 font-medium">Format &amp; ICC</th>
                <th className="py-3 px-4 font-medium">Test 2×2 (7200 px)</th>
                <th className="py-3 px-4 font-medium">ZIP Testé</th>
                <th className="py-3 px-4 font-medium">Origine &amp; Verdict Honnête</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0] text-[#292524]">
              {DELIVERABLE_PATTERNS.map((p) => (
                <tr key={p.id}>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#1C1917]">
                    {p.jpgFilename}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    3600×3600 · 300 DPI · {p.iccProfile}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums">{p.seamStats}</td>
                  <td className="py-3.5 px-4 tabular-nums">OK ({p.zipSize} &lt; 20 Mo)</td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#1C1917]">{p.sourceNote}</span> —{' '}
                    {p.verdictNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Studio Visual Standard */}
      <section id="visual-standard" className="pt-10 border-t border-[#E5DDD0]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-2">
              Studio Visual Standard
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1C1917] tracking-tight">
              Photorealistic Flat-Lay Architecture
            </h2>
          </div>
          <p className="text-sm text-[#57534E] max-w-md leading-relaxed">
            Every generated lookbook enforces unbranded tactile fabrics on solid{' '}
            <span className="font-mono text-xs text-[#1C1917]">#F6F2EC</span> backgrounds—zero
            logos, zero neck tags, and zero text overlays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {EDITORIAL_PLATES.map((plate) => (
            <StudioPlateCard key={plate.fig} plate={plate} />
          ))}
        </div>
      </section>

      {/* Fixed 18-Page Lookbook Blueprint */}
      <section id="blueprint" className="pt-10 border-t border-[#E5DDD0]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-2">
              Fixed Template Structure
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#1C1917] tracking-tight mb-4">
              18-Page Etsy PDF Blueprint
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Every niche generated through Plume Style maps automatically into our proven
              18-page digital lookbook cadence—combining real-life wearability, 5 distinct body
              shape adjustments, a 30-day outfit calendar, and budget retail search keywords.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-[#E5DDD0]">
              {PLUME_18_PAGE_BLUEPRINT.map((item) => (
                <div
                  key={item.page}
                  className="grid grid-cols-12 gap-4 py-3.5 border-b border-[#E5DDD0] items-baseline"
                >
                  <div className="col-span-2 sm:col-span-2 font-mono text-xs tabular-nums text-[#78716C]">
                    P. {item.page}
                  </div>
                  <div className="col-span-10 sm:col-span-4 text-sm font-medium text-[#1C1917]">
                    {item.title}
                  </div>
                  <div className="col-span-12 sm:col-span-6 text-sm text-[#57534E] sm:pl-0 pl-0">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
