import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { KeyPiece, PlumeFactoryResult } from '../types/factory';
import { formatBlock1Angle, formatBlock2Pieces, formatBlock3Prompts, formatBlock4CalendarAndShapes, formatBlock5EtsySeo } from '../utils/formatFactoryOutput';
import { BulkVariationsSection } from './BulkVariationsSection';
import { CopyButton } from './CopyButton';

interface FactoryOutputProps {
  data: PlumeFactoryResult;
}

const PIECE_FILTERS: Array<'All' | KeyPiece['category']> = [
  'All',
  'Tops & Knits',
  'Bottoms',
  'Outerwear',
  'Dresses & Sets',
  'Shoes & Bags',
  'Accessories',
];

const WEEK_FILTERS = [
  { id: 'all', label: 'All 30 Days', min: 1, max: 30 },
  { id: 'w1', label: 'Days 1–7', min: 1, max: 7 },
  { id: 'w2', label: 'Days 8–14', min: 8, max: 14 },
  { id: 'w3', label: 'Days 15–21', min: 15, max: 21 },
  { id: 'w4', label: 'Days 22–30', min: 22, max: 30 },
] as const;

export function FactoryOutput({ data }: FactoryOutputProps) {
  const [pieceFilter, setPieceFilter] = useState<'All' | KeyPiece['category']>('All');
  const [weekFilter, setWeekFilter] = useState<(typeof WEEK_FILTERS)[number]['id']>('all');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const filteredPieces = useMemo(() => {
    if (pieceFilter === 'All') return data.keyPieces;
    return data.keyPieces.filter((p) => p.category === pieceFilter);
  }, [data.keyPieces, pieceFilter]);

  const filteredDays = useMemo(() => {
    const active = WEEK_FILTERS.find((w) => w.id === weekFilter) ?? WEEK_FILTERS[0];
    return data.calendarDays.filter((d) => d.day >= active.min && d.day <= active.max);
  }, [data.calendarDays, weekFilter]);

  const handleCopyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => setCopiedHex(null), 1500);
    } catch {
      // Ignore clipboard failures
    }
  };

  const titleLen = data.etsySeo.title.length;
  const endsWithDigitalDownload = /Digital Download$/i.test(data.etsySeo.title.trim());

  return (
    <div className="space-y-16 pt-6">
      {/* Editorial Brief Summary Strip */}
      <div className="border-y border-[#E5DDD0] py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#57534E]">
          <span className="uppercase tracking-widest text-[#1C1917] font-medium">
            Active Brief
          </span>
          <span aria-hidden="true">·</span>
          <span>{data.competitiveAngle.nicheTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {data.competitiveAngle.pieceCount} Pieces to {data.competitiveAngle.outfitCount} Outfits
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">18-Page PDF Blueprint</span>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#1C1917] bg-[#F6F2EC] border border-[#DFD6C7] hover:bg-[#EDE6DA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Print Brief</span>
          </button>
        </div>
      </div>

      {/* BLOCK 1: COMPETITIVE ANGLE */}
      <section id="block-angle" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD0]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
              Block 01 · Strategy & Color System
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#1C1917]">
              01. Competitive Angle
            </h2>
          </div>
          <div className="no-print">
            <CopyButton text={formatBlock1Angle(data)} label="Copy Block 01" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h3 className="font-serif text-2xl text-[#1C1917] leading-snug">
                {data.competitiveAngle.nicheTitle}
              </h3>
              <p className="text-sm text-[#78716C] mt-1">
                {data.competitiveAngle.editorialSubtitle}
              </p>
            </div>

            <p className="text-base text-[#292524] leading-relaxed max-w-2xl">
              {data.competitiveAngle.nicheHook}
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#E5DDD0]">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#78716C]">
                  Key Pieces
                </div>
                <div className="font-serif text-3xl text-[#1C1917] tabular-nums mt-1">
                  {data.competitiveAngle.pieceCount}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#78716C]">
                  Outfit Looks
                </div>
                <div className="font-serif text-3xl text-[#1C1917] tabular-nums mt-1">
                  {data.competitiveAngle.outfitCount}+
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#78716C]">
                  Lookbook PDF
                </div>
                <div className="font-serif text-3xl text-[#1C1917] tabular-nums mt-1">
                  18 Pages
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="text-xs uppercase tracking-widest text-[#78716C] mb-4">
              Adapted 5-Color Palette
            </div>
            <div className="border-t border-[#E5DDD0]">
              {data.competitiveAngle.palette.map((color) => (
                <div
                  key={`${color.hex}-${color.name}`}
                  className="flex items-center justify-between gap-4 py-3 border-b border-[#E5DDD0]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleCopyHex(color.hex)}
                      title={`Copy ${color.hex}`}
                      className="w-9 h-9 shrink-0 border border-[#D6CEBE] cursor-pointer transition-transform duration-150 hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Copy color hex ${color.hex}`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#1C1917] truncate">
                        {color.name}
                      </div>
                      <div className="text-xs text-[#57534E] truncate">{color.role}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHex(color.hex)}
                    className="font-mono text-xs tabular-nums text-[#57534E] hover:text-[#1C1917] shrink-0 cursor-pointer"
                  >
                    {copiedHex === color.hex ? 'Copied' : color.hex.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BLOCK 2: THE KEY PIECES LIST */}
      <section id="block-pieces" className="scroll-mt-24 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD0]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
              Block 02 · Wardrobe Inventory & Sourcing
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#1C1917]">
              02. The Key Pieces List (01–20)
            </h2>
          </div>
          <div className="no-print">
            <CopyButton text={formatBlock2Pieces(data)} label="Copy Block 02" />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 py-4 border-b border-[#E5DDD0] no-print">
          {PIECE_FILTERS.map((cat) => {
            const active = pieceFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setPieceFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#2C2520] text-[#FAF6F0]'
                    : 'bg-[#F6F2EC] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE6DA]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {filteredPieces.map((piece) => (
            <div
              key={piece.number}
              className="py-4 border-b border-[#E5DDD0] flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono text-xs tabular-nums text-[#78716C] shrink-0">
                      {piece.number}
                    </span>
                    <h3 className="text-base font-medium text-[#1C1917] truncate">
                      {piece.name}
                    </h3>
                  </div>
                  <span className="text-xs text-[#78716C] whitespace-nowrap shrink-0">
                    {piece.category}
                  </span>
                </div>
                <p className="text-xs text-[#57534E] mt-1 pl-7 leading-relaxed">
                  {piece.fabricNotes}
                </p>
              </div>

              <div className="pl-7 flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-[#1C1917] font-mono truncate">
                  {piece.budgetKeywords}
                </p>
                <div className="no-print shrink-0">
                  <CopyButton
                    text={piece.budgetKeywords}
                    label="Keywords"
                    variant="ghost"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOCK 3: PHOTOREALISTIC IMAGE PROMPTS */}
      <section id="block-prompts" className="scroll-mt-24 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD0]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
              Block 03 · ChatGPT Image Prompts (Solid #F6F2EC)
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#1C1917]">
              03. ChatGPT Photorealistic Prompts
            </h2>
          </div>
          <div className="no-print">
            <CopyButton text={formatBlock3Prompts(data)} label="Copy All 6 Prompts" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          {data.imagePrompts.map((item) => (
            <article
              key={`${item.slot}-${item.boardTitle}`}
              className="bg-[#F6F2EC] border border-[#E5DDD0] p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#78716C] uppercase tracking-widest">
                    <span className="font-mono tabular-nums text-[#1C1917] font-medium">
                      {item.slot}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.aspectRatio}</span>
                  </div>
                  <span className="text-xs text-[#57534E]">Zero Text · Zero Logos</span>
                </div>

                <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                  {item.boardTitle}
                </h3>

                <p className="text-sm text-[#292524] leading-relaxed">{item.prompt}</p>
              </div>

              <div className="pt-3 border-t border-[#E5DDD0] flex items-center justify-between no-print">
                <span className="text-xs font-mono text-[#78716C]">#F6F2EC Studio Flat-Lay</span>
                <CopyButton text={item.prompt} label="Copy Prompt" variant="secondary" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BLOCK 4: 30-DAY CALENDAR + 5 BODY SHAPES MATRIX */}
      <section id="block-calendar" className="scroll-mt-24 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD0]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
              Block 04 · Decision-Free Dressing & Fit Tailoring
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#1C1917]">
              04. 30-Day Calendar & 5 Body Shapes Matrix
            </h2>
          </div>
          <div className="no-print">
            <CopyButton
              text={formatBlock4CalendarAndShapes(data)}
              label="Copy Block 04"
            />
          </div>
        </div>

        {/* 5 Distinct Body Shapes Matrix */}
        <div className="pt-8 pb-10 border-b border-[#E5DDD0]">
          <h3 className="text-xs uppercase tracking-widest text-[#78716C] mb-5">
            5 Distinct Body Shapes Tailoring Matrix (Page 15)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {data.bodyShapes.map((shape) => (
              <div
                key={shape.shape}
                className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="font-serif text-xl font-medium text-[#1C1917]">
                    {shape.shape}
                  </div>
                  <div className="text-xs text-[#78716C] mt-1">{shape.silhouetteFocus}</div>
                </div>
                <p className="text-xs text-[#292524] leading-relaxed pt-3 border-t border-[#E5DDD0]">
                  {shape.tailoringTip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Outfit Calendar */}
        <div className="pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xs uppercase tracking-widest text-[#78716C]">
              30-Day Outfit Calendar (Page 16)
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 no-print">
              {WEEK_FILTERS.map((w) => {
                const active = weekFilter === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWeekFilter(w.id)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#2C2520] text-[#FAF6F0]'
                        : 'bg-[#F6F2EC] text-[#57534E] hover:text-[#1C1917] hover:bg-[#EDE6DA]'
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {filteredDays.map((day) => (
              <div
                key={day.day}
                className="py-3.5 border-b border-[#E5DDD0] flex flex-col gap-1.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs tabular-nums text-[#78716C]">
                    DAY {String(day.day).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-[#78716C] truncate">{day.occasion}</span>
                </div>
                <div className="text-sm font-medium text-[#1C1917]">{day.lookTitle}</div>
                <div className="text-xs font-mono tabular-nums text-[#57534E]">
                  Pieces {day.pieceNumbers.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCK 5: ETSY SEO KIT */}
      <section id="block-seo" className="scroll-mt-24 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD0]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
              Block 05 · Plume Digital Shop Listing Assets
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#1C1917]">
              05. Etsy SEO Kit
            </h2>
          </div>
          <div className="no-print">
            <CopyButton text={formatBlock5EtsySeo(data)} label="Copy Complete SEO Kit" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
          {/* Title & Description */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-widest text-[#78716C]">
                  Listing Title
                </span>
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className={titleLen <= 140 ? 'text-[#14532D]' : 'text-[#9A3412]'}>
                    {titleLen}/140 chars
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={endsWithDigitalDownload ? 'text-[#14532D]' : 'text-[#9A3412]'}>
                    {endsWithDigitalDownload ? 'Ends w/ Digital Download' : 'Check Suffix'}
                  </span>
                </div>
              </div>
              <p className="text-base font-medium text-[#1C1917] leading-relaxed">
                {data.etsySeo.title}
              </p>
              <div className="pt-2 flex justify-end no-print">
                <CopyButton text={data.etsySeo.title} label="Copy Title" />
              </div>
            </div>

            <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-widest text-[#78716C]">
                  Listing Description (18-Page Breakdown + Digital Notice)
                </span>
                <div className="no-print">
                  <CopyButton text={data.etsySeo.description} label="Copy Description" />
                </div>
              </div>
              <div className="text-sm text-[#292524] leading-relaxed whitespace-pre-line">
                {data.etsySeo.description}
              </div>
            </div>
          </div>

          {/* 13 Tags */}
          <div className="lg:col-span-5">
            <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#E5DDD0]">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#78716C]">
                    13 Etsy Tags
                  </span>
                  <p className="text-xs text-[#57534E] mt-0.5 tabular-nums">
                    Strictly &le; 20 characters per tag
                  </p>
                </div>
                <div className="no-print">
                  <CopyButton
                    text={data.etsySeo.tags.join(', ')}
                    label="Copy 13 Tags"
                    variant="primary"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#E5DDD0]">
                {data.etsySeo.tags.map((tag, idx) => {
                  const valid = tag.length <= 20;
                  return (
                    <div
                      key={`${idx}-${tag}`}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="font-mono text-xs tabular-nums text-[#78716C] shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-[#1C1917] truncate">{tag}</span>
                      </div>
                      <span
                        className={`font-mono text-xs tabular-nums shrink-0 ${
                          valid ? 'text-[#57534E]' : 'text-[#9A3412]'
                        }`}
                      >
                        {tag.length}/20
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <BulkVariationsSection data={data} />
    </div>
  );
}
