import { ChangeEvent, useEffect, useState } from 'react';
import { Check, Download, Images, Loader2, RefreshCw } from 'lucide-react';
import { loadImageFromUrlOrFile } from '../utils/tumblerWrap';
import {
  BundleCoverResult,
  generateBundle12CoverMockup,
  generateSingleTumblerMockups,
  MockupBundleTile,
  TumblerMockupResult,
} from '../utils/tumblerMockup';
import { CopyButton } from './CopyButton';

const INITIAL_PRESET_URLS = [
  {
    id: '01',
    label: '01 · Heritage Tartan Dark',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_01_3600x3600_300DPI.jpg',
  },
  {
    id: '02',
    label: '02 · Heritage Tartan Cream',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_02_3600x3600_300DPI.jpg',
  },
  {
    id: '03',
    label: '03 · Camel Houndstooth Plaid',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_03_3600x3600_300DPI.jpg',
  },
  {
    id: '12',
    label: '12 · Heritage Argyle V2 (Clean)',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_12_3600x3600_300DPI.jpg',
  },
];

const CHATGPT_LIFESTYLE_BACKDROP_PROMPT = `Square 1:1 luxury e-commerce tabletop background scene for holiday drinkware photography, EMPTY center wooden walnut table surface in warm soft daylight, subtle out-of-focus Christmas pine branches with warm fairy lights and matte burgundy velvet ribbon on the far top corners, cozy quiet-luxury editorial aesthetic, solid uncluttered center space to composite product mockups later. ZERO tumblers, ZERO cups, ZERO bottles, ZERO text, ZERO logos.`;

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeThumbDataUrl(img: HTMLImageElement): string {
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 160;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(img, 0, 0, 160, 160);
  return c.toDataURL('image/jpeg', 0.82);
}

async function triggerAssetDownload(
  blob: Blob | null | undefined,
  fallbackDataUrl: string | undefined,
  rawFilename: string
): Promise<void> {
  const safeName = sanitizeFilename(rawFilename) || 'PLUME_Mockup.jpg';
  let finalBlob = blob && blob.size > 500 ? blob : null;

  if (!finalBlob && fallbackDataUrl) {
    const resp = await fetch(fallbackDataUrl);
    finalBlob = await resp.blob();
  }

  if (!finalBlob || finalBlob.size < 100) {
    throw new Error('Image mockup vide ou indisponible.');
  }

  const url = URL.createObjectURL(finalBlob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }, 1000);
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function TumblerMockupStudio() {
  const [tiles, setTiles] = useState<MockupBundleTile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string>('01');
  const [collectionTitle, setCollectionTitle] = useState('Heritage Christmas');
  const [repeats, setRepeats] = useState<1 | 2 | 3 | 4>(2);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [renderingCover, setRenderingCover] = useState(false);
  const [renderingSingle, setRenderingSingle] = useState(false);
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bundleCover, setBundleCover] = useState<BundleCoverResult | null>(null);
  const [singleMockups, setSingleMockups] = useState<TumblerMockupResult | null>(null);

  const handleDownload = async (
    key: string,
    blob: Blob | null | undefined,
    fallbackDataUrl: string | undefined,
    filename: string
  ) => {
    setError(null);
    try {
      await triggerAssetDownload(blob, fallbackDataUrl, filename);
      setDownloadedKey(key);
      window.setTimeout(() => {
        setDownloadedKey((prev) => (prev === key ? null : prev));
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Échec du téléchargement mockup.');
    }
  };

  useEffect(() => {
    let active = true;
    setLoadingPresets(true);
    (async () => {
      try {
        const loaded = await Promise.all(
          INITIAL_PRESET_URLS.map(async (p) => {
            const img = await loadImageFromUrlOrFile(p.url);
            return {
              id: p.id,
              label: p.label,
              img,
              thumbUrl: makeThumbDataUrl(img),
            };
          })
        );
        if (!active) return;
        setTiles(loaded);
        setSelectedTileId(loaded[0].id);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erreur chargement presets.');
      } finally {
        if (active) setLoadingPresets(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const renderCover = async (
    targetTiles: MockupBundleTile[],
    targetRepeats: 1 | 2 | 3 | 4,
    targetTitle: string
  ) => {
    if (targetTiles.length === 0) return;
    setRenderingCover(true);
    setError(null);
    try {
      const res = await generateBundle12CoverMockup(
        targetTiles,
        targetRepeats,
        targetTitle.trim() || 'Heritage Christmas'
      );
      setBundleCover(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur rendu couverture.');
    } finally {
      setRenderingCover(false);
    }
  };

  const renderSingle = async (tile: MockupBundleTile, targetRepeats: 1 | 2 | 3 | 4) => {
    setRenderingSingle(true);
    setError(null);
    try {
      const res = await generateSingleTumblerMockups(tile.img, targetRepeats);
      setSingleMockups(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur rendu mockup 3D.');
    } finally {
      setRenderingSingle(false);
    }
  };

  useEffect(() => {
    if (tiles.length === 0) return;
    renderCover(tiles, repeats, collectionTitle);
    const activeTile = tiles.find((t) => t.id === selectedTileId) ?? tiles[0];
    renderSingle(activeTile, repeats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, repeats]);

  const handleSelectTile = (tile: MockupBundleTile) => {
    setSelectedTileId(tile.id);
    renderSingle(tile, repeats);
  };

  const handleMultiUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setError(null);

    try {
      const sortedFiles = Array.from(fileList)
        .slice(0, 12)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      const loaded: MockupBundleTile[] = await Promise.all(
        sortedFiles.map(async (file, idx) => {
          const img = await loadImageFromUrlOrFile(file);
          return {
            id: String(idx + 1).padStart(2, '0'),
            label: `${String(idx + 1).padStart(2, '0')} · ${file.name.replace(/\.[^.]+$/, '')}`,
            img,
            thumbUrl: makeThumbDataUrl(img),
          };
        })
      );

      setTiles(loaded);
      setSelectedTileId(loaded[0].id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les motifs.');
    }
  };

  const activeTile = tiles.find((t) => t.id === selectedTileId) ?? tiles[0];

  return (
    <section className="space-y-14 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5DDD0]">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
            PLUME Digital Shop · Studio Mockups 3D Etsy
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1C1917] tracking-tight">
            Mockups 3D Gobelets 20 oz &amp; Couverture Bundle 12
          </h2>
          <p className="text-sm text-[#57534E] mt-2 max-w-2xl leading-relaxed">
            Importez jusqu’à <strong>12 motifs en une seule sélection</strong> pour générer
            instantanément votre couverture Etsy 12 gobelets, la preuve{' '}
            <strong>Face + Dos 360° sans couture</strong> et vos gobelets détourés PNG.
          </p>
        </div>

        <CopyButton
          text={CHATGPT_LIFESTYLE_BACKDROP_PROMPT}
          label="Copier Prompt Fond Noël ChatGPT"
          copiedLabel="Prompt Fond Copié"
          variant="secondary"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 bg-[#F6F2EC] border border-[#9A3412]/40 text-sm text-[#9A3412]"
        >
          {error}
        </div>
      )}

      {/* Batch Upload & Global Settings Bar */}
      <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#78716C] block">
            1. Importer vos motifs (1 à 12 fichiers JPG/PNG)
          </span>
          <label className="flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors cursor-pointer">
            <Images className="w-4 h-4" aria-hidden="true" />
            <span>
              Sélectionner jusqu’à 12 motifs ({tiles.length} chargé{tiles.length > 1 ? 's' : ''})
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleMultiUpload}
              className="sr-only"
            />
          </label>
        </div>

        <div className="lg:col-span-4 space-y-2">
          <label
            htmlFor="mockup-collection-title"
            className="text-xs uppercase tracking-widest text-[#78716C] block"
          >
            2. Titre sur la Couverture
          </label>
          <div className="flex gap-2">
            <input
              id="mockup-collection-title"
              type="text"
              value={collectionTitle}
              onChange={(e) => setCollectionTitle(e.target.value)}
              className="flex-1 px-3 py-2.5 text-xs bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
            />
            <button
              type="button"
              disabled={renderingCover}
              onClick={() => renderCover(tiles, repeats, collectionTitle)}
              className="px-3.5 py-2.5 text-xs font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
              title="Mettre à jour la couverture"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${renderingCover ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#78716C] block">
            3. Échelle du motif
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {([1, 2, 3, 4] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRepeats(r)}
                className={`py-2.5 text-xs font-mono border transition-colors cursor-pointer ${
                  repeats === r
                    ? 'bg-[#2C2520] text-[#FAF6F0] border-[#2C2520]'
                    : 'bg-[#FAF6F0] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EDE6DA]'
                }`}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Part A: Photo 1 — Bundle Cover (2000x2000) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#78716C]">
                Photo #1 Etsy · Couverture Catalogue
              </p>
              <h3 className="font-serif text-2xl font-medium text-[#1C1917]">
                Planche Bundle ({tiles.length} Gobelet{tiles.length > 1 ? 's' : ''} 3D · 2000×2000 px)
              </h3>
            </div>
            {renderingCover && <Loader2 className="w-4 h-4 animate-spin text-[#57534E]" />}
          </div>

          {(loadingPresets || (renderingCover && !bundleCover)) && (
            <div className="aspect-square border border-[#E5DDD0] bg-[#FAF6F0] flex flex-col items-center justify-center gap-3 text-xs text-[#57534E]">
              <Loader2 className="w-5 h-5 animate-spin text-[#7A1621]" />
              <span>Chargement et rendu 3D des gobelets...</span>
            </div>
          )}

          {bundleCover && (
            <>
              <div className="border border-[#E5DDD0] bg-[#FAF6F0]">
                <img
                  src={bundleCover.coverUrl}
                  alt="Couverture Bundle Tumbler Wrap 20 oz"
                  className="w-full h-auto block"
                />
              </div>
              <button
                type="button"
                disabled={renderingCover}
                onClick={() =>
                  handleDownload(
                    'cover',
                    bundleCover.coverBlob,
                    bundleCover.coverUrl,
                    `PLUME_${collectionTitle}_Tumbler_Cover_2000x2000.jpg`
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadedKey === 'cover' ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Couverture téléchargée !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      Télécharger Photo #1 Couverture Etsy (2000×2000 JPG ·{' '}
                      {(bundleCover.coverBlob.size / 1048576).toFixed(2)} Mo)
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Right: Single Tile Selector + 3 Mockup Exports */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-3">
            <div className="text-xs uppercase tracking-widest text-[#78716C]">
              Inspecter un motif en gros plan ({tiles.length} disponible{tiles.length > 1 ? 's' : ''})
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {tiles.map((t) => {
                const selected = t.id === activeTile?.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTile(t)}
                    className={`p-1 border transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#7A1621] bg-[#2C2520] text-[#FAF6F0]'
                        : 'border-[#D6CEBE] bg-[#FAF6F0] text-[#1C1917] hover:border-[#1C1917]'
                    }`}
                  >
                    <div
                      className="w-full aspect-square bg-cover bg-center"
                      style={{ backgroundImage: `url(${t.thumbUrl || t.img.src})` }}
                    />
                    <div className="font-mono text-[10px] text-center pt-1">{t.id}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {renderingSingle && (
            <div className="p-6 bg-[#F6F2EC] border border-[#E5DDD0] flex items-center gap-3 text-xs text-[#57534E]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Rendu des 3 mockups 3D pour le motif {activeTile?.id}...</span>
            </div>
          )}

          {singleMockups && activeTile && !renderingSingle && (
            <div className="space-y-4">
              {/* Photo #2: Front + Back 360 Proof */}
              <article className="bg-[#F6F2EC] border border-[#E5DDD0] p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-serif text-lg font-medium text-[#1C1917]">
                    Photo #2 · Preuve 360° Face + Dos
                  </h4>
                  <span className="font-mono text-[11px] text-[#57534E]">2000×2000 JPG</span>
                </div>
                <img
                  src={singleMockups.frontBackUrl}
                  alt="Mockup Face et Dos 360 sans couture"
                  className="w-full h-auto border border-[#E5DDD0]"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      'frontBack',
                      singleMockups.frontBackBlob,
                      singleMockups.frontBackUrl,
                      `MOCKUP_360_FrontBack_${activeTile.id}_2000x2000.jpg`
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors cursor-pointer"
                >
                  {downloadedKey === 'frontBack' ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Preuve 360° téléchargée !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Télécharger Preuve 360° Face + Dos</span>
                    </>
                  )}
                </button>
              </article>

              {/* Solo Studio + Transparent Cutout */}
              <div className="grid grid-cols-2 gap-4">
                <article className="bg-[#F6F2EC] border border-[#E5DDD0] p-3.5 space-y-2.5">
                  <div className="text-xs font-medium text-[#1C1917]">Solo Studio (2000²)</div>
                  <img
                    src={singleMockups.soloStudioUrl}
                    alt="Mockup Solo Studio"
                    className="w-full h-auto border border-[#E5DDD0]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        'soloStudio',
                        singleMockups.soloStudioBlob,
                        singleMockups.soloStudioUrl,
                        `MOCKUP_Solo_Studio_${activeTile.id}_2000x2000.jpg`
                      )
                    }
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] cursor-pointer"
                  >
                    {downloadedKey === 'soloStudio' ? (
                      <>
                        <Check className="w-3 h-3" aria-hidden="true" />
                        <span>Téléchargé !</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" aria-hidden="true" />
                        <span>JPG Studio</span>
                      </>
                    )}
                  </button>
                </article>

                <article className="bg-[#F6F2EC] border border-[#E5DDD0] p-3.5 space-y-2.5">
                  <div className="text-xs font-medium text-[#1C1917]">Détouré Transparent</div>
                  <div
                    className="border border-[#E5DDD0]"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #EAE3D6 25%, transparent 25%), linear-gradient(-45deg, #EAE3D6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EAE3D6 75%), linear-gradient(-45deg, transparent 75%, #EAE3D6 75%)',
                      backgroundSize: '12px 12px',
                      backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                    }}
                  >
                    <img
                      src={singleMockups.soloTransparentUrl}
                      alt="Gobelet 3D détouré transparent"
                      className="w-full aspect-square object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        'soloTransp',
                        singleMockups.soloTransparentBlob,
                        singleMockups.soloTransparentUrl,
                        `MOCKUP_Transparent_${activeTile.id}_1200x1800.png`
                      )
                    }
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] cursor-pointer"
                  >
                    {downloadedKey === 'soloTransp' ? (
                      <>
                        <Check className="w-3 h-3" aria-hidden="true" />
                        <span>Téléchargé !</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" aria-hidden="true" />
                        <span>PNG Détouré</span>
                      </>
                    )}
                  </button>
                </article>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
