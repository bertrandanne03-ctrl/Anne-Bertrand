export interface PaletteColor {
  hex: string;
  name: string;
  role: string;
}

export interface CompetitiveAngle {
  nicheTitle: string;
  editorialSubtitle: string;
  nicheHook: string;
  pieceCount: number;
  outfitCount: number;
  palette: PaletteColor[];
}

export interface KeyPiece {
  number: string;
  name: string;
  category: 'Tops & Knits' | 'Bottoms' | 'Outerwear' | 'Dresses & Sets' | 'Shoes & Bags' | 'Accessories';
  fabricNotes: string;
  budgetKeywords: string;
}

export interface ImagePrompt {
  slot: string;
  boardTitle: string;
  aspectRatio: string;
  prompt: string;
}

export interface CalendarDay {
  day: number;
  lookTitle: string;
  pieceNumbers: string[];
  occasion: string;
}

export interface BodyShapeTip {
  shape: 'Hourglass' | 'Pear' | 'Rectangle' | 'Inverted Triangle' | 'Apple';
  silhouetteFocus: string;
  tailoringTip: string;
}

export interface EtsySeoKit {
  title: string;
  description: string;
  tags: string[];
}

export interface BulkListingVariation {
  index: string;
  angle: string;
  coverTitle: string;
  coverSubtitle: string;
  keyHighlight: string;
  suggestedPrice: string;
  etsyTitle: string;
  etsyTags: string[];
}

export interface PlumeFactoryResult {
  nicheInput: string;
  competitiveAngle: CompetitiveAngle;
  keyPieces: KeyPiece[];
  imagePrompts: ImagePrompt[];
  calendarDays: CalendarDay[];
  bodyShapes: BodyShapeTip[];
  etsySeo: EtsySeoKit;
}

export const PLUME_18_PAGE_BLUEPRINT = [
  { page: '01', title: 'Cover', detail: 'Luxury editorial cover flat-lay on #FAF6F0 cream canvas with serif masthead' },
  { page: '02', title: 'Welcome & Exact TOC', detail: 'Editorial letter, capsule philosophy, and complete pages 02–18 index' },
  { page: '03', title: 'Adapted Color Palette', detail: '5 cohesive hex tones with primary, neutral, and accent pairing ratios' },
  { page: '04', title: '20 Key Pieces Inventory', detail: 'Numbered wardrobe matrix (01–20) with fabric and silhouette specs' },
  { page: '05', title: 'The Plume Pairing Method', detail: 'Modular layering formula converting 20 pieces into 45+ wearable looks' },
  { page: '06–14', title: 'Curated Outfit Looks', detail: '9 visual lookbook spreads featuring real-life wearability and styling notes' },
  { page: '15', title: '5 Body Shapes Fit Guide', detail: 'Tailoring adjustments for Hourglass, Pear, Rectangle, Inverted Triangle, Apple' },
  { page: '16', title: '30-Day Outfit Calendar', detail: 'Day 1–30 mapped combinations eliminating morning decision fatigue' },
  { page: '17', title: 'Checklist & Budget Keywords', detail: 'Printable closet audit plus Amazon, Zara, and Uniqlo search terms' },
  { page: '18', title: 'Brand Outro', detail: 'Plume Digital Shop care guide, digital notes, and collection credit' },
] as const;

export const CURATED_NICHES = [
  'Quiet Luxury Parisian Autumn',
  'Coastal Grandmother Linen',
  'Dark Academia Tailored Wool',
  'Old Money Riviera Resort',
] as const;
