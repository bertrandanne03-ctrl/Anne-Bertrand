import { PlumeFactoryResult } from '../types/factory';

export function formatBlock1Angle(data: PlumeFactoryResult): string {
  const { competitiveAngle } = data;
  const paletteLines = competitiveAngle.palette
    .map((c) => `- ${c.hex} (${c.name}) — ${c.role}`)
    .join('\n');

  return [
    `1. COMPETITIVE ANGLE`,
    `Niche: ${competitiveAngle.nicheTitle}`,
    `Subtitle: ${competitiveAngle.editorialSubtitle}`,
    `Hook: ${competitiveAngle.nicheHook}`,
    `Scale: ${competitiveAngle.pieceCount} Pieces -> ${competitiveAngle.outfitCount} Outfits (18-Page Lookbook)`,
    `Palette Colors:`,
    paletteLines,
  ].join('\n');
}

export function formatBlock2Pieces(data: PlumeFactoryResult): string {
  const lines = data.keyPieces.map(
    (p) => `${p.number}. ${p.name} [${p.category}] — ${p.fabricNotes}\n   Keywords: ${p.budgetKeywords}`
  );
  return [`2. THE KEY PIECES LIST (01–20)`, ...lines].join('\n');
}

export function formatBlock3Prompts(data: PlumeFactoryResult): string {
  const lines = data.imagePrompts.map(
    (img) => `[${img.slot} · ${img.boardTitle} (${img.aspectRatio})]\n${img.prompt}`
  );
  return [`3. PHOTOREALISTIC IMAGE PROMPTS (BATCH)`, ...lines].join('\n\n');
}

export function formatBlock4CalendarAndShapes(data: PlumeFactoryResult): string {
  const days = data.calendarDays
    .map((d) => `Day ${String(d.day).padStart(2, '0')}: ${d.lookTitle} — Pieces ${d.pieceNumbers.join(' + ')} (${d.occasion})`)
    .join('\n');
  const shapes = data.bodyShapes
    .map((b) => `- ${b.shape} (${b.silhouetteFocus}): ${b.tailoringTip}`)
    .join('\n');

  return [
    `4. 30-DAY CALENDAR + 5 BODY SHAPES MATRIX`,
    `30-Day Outfit Calendar:`,
    days,
    ``,
    `5 Distinct Body Shapes Matrix:`,
    shapes,
  ].join('\n');
}

export function formatBlock5EtsySeo(data: PlumeFactoryResult): string {
  const { etsySeo } = data;
  return [
    `5. ETSY SEO KIT`,
    `Title (${etsySeo.title.length}/140 chars):`,
    etsySeo.title,
    ``,
    `Description:`,
    etsySeo.description,
    ``,
    `13 Tags (<=20 chars each):`,
    etsySeo.tags.join(', '),
  ].join('\n');
}

export function formatCompleteFactoryOutput(data: PlumeFactoryResult): string {
  return [
    `PLUME STYLE — DIGITAL PRODUCT FACTORY`,
    `Niche Input: ${data.nicheInput}`,
    `============================================================`,
    formatBlock1Angle(data),
    ``,
    formatBlock2Pieces(data),
    ``,
    formatBlock3Prompts(data),
    ``,
    formatBlock4CalendarAndShapes(data),
    ``,
    formatBlock5EtsySeo(data),
  ].join('\n\n');
}
