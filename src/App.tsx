import { FormEvent, useState } from 'react';
import { ArrowRight, Download, Loader2, RotateCcw } from 'lucide-react';
import { AtelierShowcase } from './components/AtelierShowcase';
import { BulkVariationsTable } from './components/BulkVariationsSection';
import { CopyButton } from './components/CopyButton';
import { EtsyPlaybookStudio } from './components/EtsyPlaybookStudio';
import { FactoryOutput } from './components/FactoryOutput';
import { ProjectBackupStudio } from './components/ProjectBackupStudio';
import { TumblerMockupStudio } from './components/TumblerMockupStudio';
import { TumblerWrapStudio } from './components/TumblerWrapStudio';
import { BulkListingVariation, CURATED_NICHES, PlumeFactoryResult } from './types/factory';
import { buildCanvaEtsyCsv, downloadCanvaEtsyCsv } from './utils/exportCsv';
import { formatCompleteFactoryOutput } from './utils/formatFactoryOutput';

type StudioMode = 'factory' | 'multiplier' | 'tumbler' | 'mockups' | 'playbook' | 'backup';

export default function App() {
  const [mode, setMode] = useState<StudioMode>('factory');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlumeFactoryResult | null>(null);
  const [directVariations, setDirectVariations] = useState<BulkListingVariation[] | null>(null);

  const runFactory = async (nicheValue: string, targetMode: StudioMode = mode) => {
    const trimmed = nicheValue.trim();
    if (!trimmed) {
      setError('Enter a fashion micro-niche, link, or TikTok trend to generate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (targetMode === 'factory') {
        const response = await fetch('/api/generate-factory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche: trimmed }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to generate factory output.');
        }

        setResult(payload as PlumeFactoryResult);
        setDirectVariations(null);
      } else {
        const response = await fetch('/api/generate-variations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nicheTitle: trimmed,
            nicheHook: `10 targeted Etsy capsule variations for ${trimmed}`,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to generate 10 listings.');
        }

        setDirectVariations(payload.variations as BulkListingVariation[]);
        setResult(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error while generating.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runFactory(niche, mode);
  };

  const handlePresetClick = (preset: string) => {
    setNiche(preset);
    runFactory(preset, mode);
  };

  const handleReset = () => {
    setResult(null);
    setDirectVariations(null);
    setError(null);
    setNiche('');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1C1917] flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="border-b border-[#E5DDD0] bg-[#FAF6F0]/95 backdrop-blur-sm sticky top-0 z-30 no-print">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              if (result || directVariations) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="font-serif text-xl font-semibold tracking-wider text-[#1C1917] whitespace-nowrap shrink-0"
          >
            PLUME STYLE
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#57534E]">
            {result ? (
              <>
                <a
                  href="#block-angle"
                  className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  01 Angle
                </a>
                <a
                  href="#block-pieces"
                  className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  02 Pieces
                </a>
                <a
                  href="#block-prompts"
                  className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  03 ChatGPT
                </a>
                <a
                  href="#block-seo"
                  className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  05 Etsy SEO
                </a>
                <a
                  href="#block-multiplier"
                  className="text-[#1C1917] font-semibold hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  x10 CSV
                </a>
              </>
            ) : (
              <>
                <a
                  href="#studio-input"
                  className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  Product Factory
                </a>
                <a
                  href="#visual-standard"
                  className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  Visual Standard
                </a>
                <a
                  href="#blueprint"
                  className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  18-Page Blueprint
                </a>
              </>
            )}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center shrink-0">
            {result ? (
              <CopyButton
                text={formatCompleteFactoryOutput(result)}
                label="Copy All 5 Blocks"
                copiedLabel="All 5 Copied"
                variant="primary"
              />
            ) : directVariations ? (
              <button
                type="button"
                onClick={() => downloadCanvaEtsyCsv(directVariations, niche || 'plume-style')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Download CSV</span>
              </button>
            ) : (
              <a
                href="#blueprint"
                className="px-4 py-2 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors whitespace-nowrap shrink-0"
              >
                View Blueprint
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 md:py-16">
        {/* Hero & Niche Input Focal Anchor */}
        <section id="studio-input" className="max-w-3xl mx-auto text-center space-y-6 pb-12">
          <p className="text-xs uppercase tracking-widest text-[#78716C]">
            Plume Digital Shop · Etsy Lookbook Atelier
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-medium text-[#1C1917] tracking-tight leading-[1.1] [text-wrap:balance]">
            Turn Any Micro-Niche Into an 18-Page Editorial Lookbook
          </h1>

          <p className="text-sm md:text-base text-[#57534E] max-w-xl mx-auto leading-relaxed">
            Generate your complete 5-block Etsy lookbook with ChatGPT flat-lay prompts, or
            multiply any niche into 10 Canva Bulk Create &amp; Etsy listings.
          </p>

          {/* Studio Mode Selector */}
          <div className="inline-flex flex-wrap items-center justify-center border border-[#D6CEBE] bg-[#F6F2EC] p-1 no-print">
            <button
              type="button"
              onClick={() => setMode('factory')}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'factory'
                  ? 'bg-[#2C2520] text-[#FAF6F0]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              5-Block Lookbook Factory
            </button>
            <button
              type="button"
              onClick={() => setMode('multiplier')}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'multiplier'
                  ? 'bg-[#2C2520] text-[#FAF6F0]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              10-Listing CSV (Canva + Etsy)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('tumbler');
                setError(null);
              }}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'tumbler'
                  ? 'bg-[#2C2520] text-[#FAF6F0]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Tumbler Wrap 20 oz (300 DPI)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('mockups');
                setError(null);
              }}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'mockups'
                  ? 'bg-[#2C2520] text-[#FAF6F0]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Mockups Etsy 3D
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('playbook');
                setError(null);
              }}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'playbook'
                  ? 'bg-[#7A1621] text-[#FAF6F0]'
                  : 'text-[#7A1621] hover:text-[#1C1917]'
              }`}
            >
              Playbook Stratégie
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('backup');
                setError(null);
              }}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'backup'
                  ? 'bg-[#1B3B5A] text-[#FAF6F0]'
                  : 'text-[#1B3B5A] hover:text-[#1C1917]'
              }`}
            >
              Sauvegarde (.zip)
            </button>
          </div>

          {/* Primary Input Form (hidden in Tumbler, Mockups, Playbook, and Backup modes) */}
          {mode !== 'tumbler' &&
            mode !== 'mockups' &&
            mode !== 'playbook' &&
            mode !== 'backup' && (
            <form
              onSubmit={handleSubmit}
              className="pt-1 flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl mx-auto no-print"
            >
            <label htmlFor="fashion-niche-input" className="sr-only">
              Fashion micro-niche, link, or TikTok trend
            </label>
            <input
              id="fashion-niche-input"
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={
                mode === 'factory'
                  ? 'e.g. Quiet Luxury Parisian Autumn, Preppy Holiday, or TikTok trend...'
                  : 'e.g. Christmas Capsule Wardrobe, Heritage Tartan, or Preppy Edit...'
              }
              disabled={loading}
              className="flex-1 min-h-[48px] px-4 py-3 text-sm bg-[#F6F2EC] border border-[#D6CEBE] text-[#1C1917] placeholder:text-[#8C8275] focus:outline-none focus:border-[#1C1917] transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="min-h-[48px] px-6 py-3 bg-[#2C2520] text-[#FAF6F0] text-sm font-medium hover:bg-[#1C1917] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'factory' ? 'Generate Factory' : 'Generate 10 Listings'}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
            </form>
          )}

          {/* Clean Unboxed Curated Niche Suggestions */}
          {mode !== 'tumbler' &&
            mode !== 'mockups' &&
            mode !== 'playbook' &&
            mode !== 'backup' && (
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-[#78716C] no-print">
              <span>Try:</span>
              {CURATED_NICHES.map((item, idx) => (
                <span key={item} className="inline-flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handlePresetClick(item)}
                    className="text-[#57534E] hover:text-[#1C1917] underline underline-offset-4 decoration-[#D6CEBE] hover:decoration-[#1C1917] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {item}
                  </button>
                  {idx < CURATED_NICHES.length - 1 && <span aria-hidden="true">·</span>}
                </span>
              ))}
            </div>
          )}

          {/* Error Feedback */}
          {error && (
            <div
              role="alert"
              className="max-w-2xl mx-auto p-4 bg-[#F6F2EC] border border-[#9A3412]/40 text-sm text-[#9A3412] text-left"
            >
              <strong className="font-medium">Generation Notice:</strong> {error}
            </div>
          )}

          {/* Reset Action when viewing generated output */}
          {(result || directVariations) && !loading && (
            <div className="pt-1 flex justify-center no-print">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear &amp; Return to Studio Blueprint</span>
              </button>
            </div>
          )}
        </section>

        {/* Loading Editorial Skeleton */}
        {loading && (
          <section
            aria-live="polite"
            className="border-t border-[#E5DDD0] pt-12 space-y-10 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-40 bg-[#EDE6DA] animate-pulse" />
                <div className="h-8 w-80 bg-[#EDE6DA] animate-pulse" />
              </div>
              <span className="text-xs font-mono text-[#78716C]">
                {mode === 'factory'
                  ? 'Structuring 5 Factory Blocks...'
                  : 'Building 10 Canva & Etsy Listings...'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-3"
                >
                  <div className="h-3 w-24 bg-[#EDE6DA] animate-pulse" />
                  <div className="h-4 w-full bg-[#EDE6DA] animate-pulse" />
                  <div className="h-4 w-3/4 bg-[#EDE6DA] animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Output, Direct Multiplier Output, Tumbler Studio, Mockup Studio, Playbook, or Studio Showcase */}
        {!loading &&
          (mode === 'tumbler' ? (
            <TumblerWrapStudio />
          ) : mode === 'mockups' ? (
            <TumblerMockupStudio />
          ) : mode === 'playbook' ? (
            <EtsyPlaybookStudio />
          ) : mode === 'backup' ? (
            <ProjectBackupStudio />
          ) : result ? (
            <FactoryOutput data={result} />
          ) : directVariations ? (
            <section className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD0]">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
                    Canva Bulk Create &amp; Etsy Duplication Kit
                  </p>
                  <h2 className="font-serif text-3xl font-medium text-[#1C1917]">
                    10 Targeted Listings — {niche}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 no-print">
                  <CopyButton
                    text={buildCanvaEtsyCsv(directVariations)}
                    label="Copy CSV Table"
                  />
                  <button
                    type="button"
                    onClick={() => downloadCanvaEtsyCsv(directVariations, niche || 'plume-style')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Download Canva + Etsy CSV</span>
                  </button>
                </div>
              </div>
              <BulkVariationsTable variations={directVariations} />
            </section>
          ) : (
            <AtelierShowcase />
          ))}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E5DDD0] py-8 mt-16 no-print">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <span>Plume Style · Plume Digital Shop</span>
          <span>#FAF6F0 Editorial Canvas · #F6F2EC Studio Flat-Lay Standard</span>
        </div>
      </footer>
    </div>
  );
}
