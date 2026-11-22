import { BulkListingVariation } from '../types/factory';

function escapeCsvCell(value: string): string {
  const normalized = value.replace(/\r?\n/g, ' ').trim();
  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function buildCanvaEtsyCsv(variations: BulkListingVariation[]): string {
  const headers = [
    'Listing_Number',
    'Angle',
    'Cover_Title',
    'Cover_Subtitle',
    'Key_Highlight',
    'Suggested_Price',
    'Etsy_Title',
    'Etsy_Tags',
  ];

  const rows = variations.map((v) =>
    [
      v.index,
      v.angle,
      v.coverTitle,
      v.coverSubtitle,
      v.keyHighlight,
      v.suggestedPrice,
      v.etsyTitle,
      v.etsyTags.join(', '),
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCanvaEtsyCsv(
  variations: BulkListingVariation[],
  nicheSlug: string
): void {
  const csv = buildCanvaEtsyCsv(variations);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSlug = nicheSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'plume-style';

  link.href = url;
  link.download = `${safeSlug}-10-listings-canva-etsy.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
