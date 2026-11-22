import { useState } from 'react';
import { Download, Loader2, Layers } from 'lucide-react';
import { BulkListingVariation, PlumeFactoryResult } from '../types/factory';
import { buildCanvaEtsyCsv, downloadCanvaEtsyCsv } from '../utils/exportCsv';
import { CopyButton } from './CopyButton';

interface BulkVariationsSectionProps {
  data: PlumeFactoryResult;
}

export function BulkVariationsTable({
  variations,
}: {
  variations: BulkListingVariation[];
}) {
  return (
    <div className="border-t border-[#E5DDD0]">
      {variations.map((item) => {
        const titleValid = item.etsyTitle.length <= 140;
        return (
          <article
            key={item.index}
            className="py-5 border-b border-[#E5DDD0] grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
          >
            {/* Cover Data for Canva */}
            <div className="lg:col-span-4 space-y-1.5">
              <div className="flex items-center gap-2.5 text-xs text-[#78716C] font-mono tabular-nums">
                <span className="text-[#1C1917] font-medium">#{item.index}</span>
                <span aria-hidden="true">·</span>
                <span>{item.suggestedPrice}</span>
                <span aria-hidden="true">·</span>
                <span className="font-sans text-[#57534E] truncate">{item.angle}</span>
              </div>
              <div className="font-serif text-xl font-medium text-[#1C1917]">
                {item.coverTitle}
              </div>
              <div className="text-xs font-medium text-[#57534E]">
                {item.coverSubtitle} — <span className="font-normal">{item.keyHighlight}</span>
              </div>
            </div>

            {/* Etsy Title + 13 Tags */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs uppercase tracking-widest text-[#78716C]">
                  Etsy SEO Title
                </span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    titleValid ? 'text-[#14532D]' : 'text-[#9A3412]'
                  }`}
                >
                  {item.etsyTitle.length}/140
                </span>
              </div>
              <p className="text-sm font-medium text-[#1C1917] leading-snug">
                {item.etsyTitle}
              </p>
              <p className="text-xs text-[#57534E] leading-relaxed">
                <span className="text-[#78716C] uppercase tracking-wider mr-1.5">
                  13 Tags:
                </span>
                {item.etsyTags.join(', ')}
              </p>
            </div>

            {/* Copy Row Actions */}
            <div className="lg:col-span-2 flex lg:flex-col items-end justify-end gap-2 no-print">
              <CopyButton text={item.etsyTitle} label="Title" />
              <CopyButton text={item.etsyTags.join(', ')} label="13 Tags" />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function BulkVariationsSection({ data }: BulkVariationsSectionProps) {
  const [variations, setVariations] = useState<BulkListingVariation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateVariations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicheTitle: data.competitiveAngle.nicheTitle,
          nicheHook: data.competitiveAngle.nicheHook,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to generate 10 listing variations.');
      }

      setVariations(payload.variations as BulkListingVariation[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error while generating.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="block-multiplier" className="scroll-mt-24 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD0]">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
            1 Master Guide = 10 Etsy Listings · Canva Bulk Create
          </p>
          <h2 className="font-serif text-3xl font-medium text-[#1C1917]">
            10-Listing Chain Multiplier
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 no-print">
          {variations && variations.length > 0 && (
            <>
              <CopyButton
                text={buildCanvaEtsyCsv(variations)}
                label="Copy CSV Table"
                variant="secondary"
              />
              <button
                type="button"
                onClick={() => downloadCanvaEtsyCsv(variations, data.competitiveAngle.nicheTitle)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Download Canva + Etsy CSV</span>
              </button>
            </>
          )}

          {!variations && (
            <button
              type="button"
              onClick={handleGenerateVariations}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Building 10 Listings...</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Generate 10 Listings (Canva + Etsy)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!variations && !loading && !error && (
        <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-6 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h3 className="font-serif text-xl text-[#1C1917]">
              Multiply this Master Guide into 10 Targeted Etsy Listings
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Automatically split <span className="text-[#1C1917] font-medium">{data.competitiveAngle.nicheTitle}</span>{' '}
              into 10 micro-niche editions (Hourglass, Pear, Petite, Plus Size, Rectangle, Office,
              Weekend, Evening, Budget, and Mega Bundle) with cover copy for Canva Bulk Create,
              Etsy SEO titles (&le;140 chars), and 13 validated tags (&le;20 chars each).
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 p-4 bg-[#F6F2EC] border border-[#9A3412]/40 text-sm text-[#9A3412]"
        >
          <strong className="font-medium">Variations Notice:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#F6F2EC] border border-[#E5DDD0] animate-pulse" />
          ))}
        </div>
      )}

      {variations && variations.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#57534E]">
            <span>
              Import the CSV into <strong>Canva &rarr; Apps &rarr; Bulk Create</strong> to render
              10 covers in one pass, then duplicate your listing on Etsy.
            </span>
            <button
              type="button"
              onClick={handleGenerateVariations}
              disabled={loading}
              className="underline underline-offset-4 decoration-[#D6CEBE] hover:text-[#1C1917] hover:decoration-[#1C1917] cursor-pointer no-print"
            >
              Regenerate 10 Variations
            </button>
          </div>

          <BulkVariationsTable variations={variations} />
        </div>
      )}
    </section>
  );
}
