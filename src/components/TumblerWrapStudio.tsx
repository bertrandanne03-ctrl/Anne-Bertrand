import { ChangeEvent, useEffect, useState } from 'react';
import { Archive, Check, Download, Loader2, RefreshCw, Upload } from 'lucide-react';
import {
  CrestOverlayMode,
  generateMultiProductFormatPng,
  generateTumblerWrap20oz,
  HorizontalRepeats,
  loadImageFromUrlOrFile,
  MULTI_PRODUCT_FORMATS,
  MultiProductFormatId,
  TumblerConversionResult,
} from '../utils/tumblerWrap';
import {
  fetchAndDownloadDeliverable,
  triggerBlobDownload,
} from '../utils/deliverableDownload';
import { CopyButton } from './CopyButton';

interface PresetTile {
  id: string;
  label: string;
  url: string;
  baseName: string;
}

const PRESET_TILES: PresetTile[] = [
  {
    id: '01',
    label: '01 · Heritage Tartan Dark',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_01_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_01',
  },
  {
    id: '02',
    label: '02 · Heritage Tartan Cream',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_02_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_02',
  },
  {
    id: '03',
    label: '03 · Camel Houndstooth Plaid',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_03_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_03',
  },
  {
    id: '12',
    label: '12 · Heritage Argyle V2 (Clean)',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_12_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_12',
  },
  {
    id: '04',
    label: '04 · Crimson Estate Plaid',
    url: '/assets/aistudio/PLUME_Heritage_Christmas_04_3600x3600_300DPI_20oz_Straight_2790x2460_300DPI_355e29c6.png',
    baseName: 'PLUME_Heritage_Christmas_04',
  },
  {
    id: '05',
    label: '05 · Royal Holiday Tartan',
    url: '/assets/aistudio/PLUME_Heritage_Christmas_05_3600x3600_300DPI_20oz_Straight_2790x2460_300DPI_45b79550.png',
    baseName: 'PLUME_Heritage_Christmas_05',
  },
  {
    id: '06',
    label: '06 · Forest & Navy Check',
    url: '/assets/aistudio/PLUME_Heritage_Christmas_06_3600x3600_300DPI_20oz_Straight_2790x2460_300DPI_29214b0f.png',
    baseName: 'PLUME_Heritage_Christmas_06',
  },
  {
    id: '07',
    label: '07 · Ivory Evergreen Plaid',
    url: '/assets/aistudio/PLUME_Heritage_Christmas_07_3600x3600_300DPI_FINAL_20oz_Straight_2790x2460_300DPI_5a0aeda5.png',
    baseName: 'PLUME_Heritage_Christmas_07',
  },
  {
    id: '11',
    label: '11 · Heritage Ticking Stripe V2 (Clean)',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_11_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_11',
  },
  {
    id: '08',
    label: '08 · Heritage Diagonal Tartan V2 (Clean)',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_08_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_08',
  },
  {
    id: '09',
    label: '09 · Navy Houndstooth Overcheck V2 (Clean)',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_09_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_09',
  },
  {
    id: '10',
    label: '10 · Forest Gingham Overcheck V2 (Clean)',
    url: '/assets/deliverables/PLUME_Heritage_Christmas_10_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Heritage_Christmas_10',
  },
  {
    id: 'SL-01',
    label: 'SL-01 · Chalet Chairlift Sketch (Ski Lodge)',
    url: '/assets/deliverables/PLUME_Ski_Lodge_01_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Ski_Lodge_01',
  },
  {
    id: 'SL-02',
    label: 'SL-02 · Navy Ski Toile de Jouy (Ski Lodge)',
    url: '/assets/deliverables/PLUME_Ski_Lodge_02_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Ski_Lodge_02',
  },
  {
    id: 'SL-03',
    label: 'SL-03 · Sepia Ski Toile de Jouy (Ski Lodge)',
    url: '/assets/deliverables/PLUME_Ski_Lodge_03_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Ski_Lodge_03',
  },
  {
    id: 'SL-04',
    label: 'SL-04 · Skiing Penguins & Lodge (Ski Lodge)',
    url: '/assets/deliverables/PLUME_Ski_Lodge_04_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Ski_Lodge_04',
  },
  {
    id: 'SL-05',
    label: 'SL-05 · Alpine Village & Skaters (Ski Lodge)',
    url: '/assets/deliverables/PLUME_Ski_Lodge_05_3600x3600_300DPI.jpg',
    baseName: 'PLUME_Ski_Lodge_05',
  },
];

const CHATGPT_TUMBLER_MASTER_PROMPT = `Tu es mon directeur artistique sublimation et technicien PAO sous protocole STRICT « CODE PLUME 300 — TUMBLER WRAP 20 OZ ».
À chaque motif que je te demande (ou chaque image carrée seamless que je t'envoie), exécute directement ces étapes sans demander de confirmation :

ÉTAPE 1 — GÉNÉRATION (si je te donne un nouveau thème)
- Génère un visuel en vue à plat sans texte, sans logo, sans marque déposée, sans mockup de gobelet, couvrant 100 % du cadre jusqu'aux 4 bords avec continuité gauche/droite pour un enroulement à 360°.

ÉTAPE 2 — TRAITEMENT PYTHON « TUMBLER WRAP 20 OZ (300 DPI) »
Lance immédiatement Python (PIL / numpy) pour produire les 2 fichiers PNG 300 DPI prêts pour la sublimation (9.3 × 8.2 pouces = 2790 × 2460 px) :
1. Vérifie et corrige si besoin la jonction Gauche/Droite (wrap horizontal sans couture à l'arrière du gobelet, nombre entier de répétitions horizontales si tuile carrée).
2. Exporte le fichier STRAIGHT :
   - Dimensions exactes : 2790 × 2460 px
   - Format : PNG RGBA/RGB haute qualité, sRGB, dpi=(300, 300)
   - Nom : PLUME_[Collection]_[Numero]_20oz_Straight_2790x2460_300DPI.png
3. Exporte le fichier TAPERED (projection conique 20 oz skinny : largeur haut 2790 px -> largeur bas 2610 px, flèche d'arc conique 24 px, bords propres anti-aliasés sur fond transparent RGBA) :
   - Dimensions exactes : 2790 × 2460 px, transparent PNG, dpi=(300, 300)
   - Nom : PLUME_[Collection]_[Numero]_20oz_Tapered_2790x2460_300DPI.png
4. Construis une image de contrôle de la couture arrière (450 px bord droit + 450 px bord gauche accolés) et inspecte-la visuellement pour prouver l'absence de cassure à l'arrière du tumbler.
5. Crée un ZIP < 20 Mo contenant Straight + Tapered, testé avec zipfile.testzip().

ÉTAPE 3 — LIVRAISON & VERDICT HONNÊTE
Fournis les liens (Straight PNG, Tapered PNG, ZIP testé) et précise : dimensions, 300 DPI vérifié après réouverture, raccord arrière validé ou non, et que la sublimation physique sur presse n'est pas testée.`;

const SKI_LODGE_ETSY_TITLE =
  'Ski Lodge 20oz Skinny Tumbler Wrap PNG Bundle, 5 Apres Ski Winter Cabin Sublimation Designs, Seamless Straight Tapered, Digital Download';

const SKI_LODGE_ETSY_TAGS = [
  'ski tumbler wrap',
  'skiing tumbler wrap',
  'ski tumbler png',
  'ski lodge png',
  'apres ski tumbler',
  'winter tumbler wrap',
  '20oz tumbler wrap',
  'skinny tumbler wrap',
  'tumbler wrap png',
  'sublimation design',
  'mountain tumbler',
  'toile de jouy png',
  'commercial use png',
];

const SKI_LODGE_ETSY_DESCRIPTION = `*** INSTANT DIGITAL DOWNLOAD ONLY — NO PHYSICAL ITEM WILL BE SHIPPED ***

Bring classic alpine charm to your winter drinkware lineup with the Ski Lodge Mini-Pack 1 by Plume Digital Shop! This curated 5-design collection blends painterly watercolor ski scenes, vintage French Toile de Jouy engravings, and cozy holiday cabin illustrations—each formatted for crisp 300 DPI sublimation with verified 360° seamless horizontal alignment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU WILL RECEIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Upon purchase, you will receive 1 Instant Download PDF containing a direct clickable button/link to your Google Drive folder with all 10 high-resolution PNG files (5 Straight + 5 Tapered):

• SL-01: Watercolor Ski Chairlift & Snowy Pines (Cream Linen)
• SL-02: Navy Ski Toile de Jouy (Classic Engraved Alpine Scene)
• SL-03: Sepia Ski Toile de Jouy (Vintage Mountain Lodge Sketch)
• SL-04: Skiing Penguins, Cozy Cabin & Green Wagon (Festive Woodland)
• SL-05: Alpine Village, Ice Skaters & Red Gondola

Each design includes BOTH formats:
✔ 5 Straight 20 oz Skinny Tumbler Wraps — 2790 x 2460 px (9.3" x 8.2")
✔ 5 Tapered 20 oz Skinny Tumbler Wraps — 2790 x 2460 px (Transparent conical fit, 2610 px base width, 24 px arc curve)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Resolution: 300 DPI (Print-ready crispness verified digitally)
• Color Profile: Vivid sRGB for rich sublimation transfers
• Alignment: Seamless 360° horizontal repeat (minimized visible back seam)
• Format: High-quality PNG files (transparent background around Tapered edges)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO ACCESS YOUR FILES (3 EASY STEPS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Complete checkout on Etsy.
2. Download the attached receipt PDF (PLUME_Ski_Lodge_MiniPack1_DOWNLOAD_LINK.pdf).
3. Click the "OPEN GOOGLE DRIVE FOLDER" button inside the PDF to download all 10 PNGs directly to your computer or tablet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMERCIAL LICENSE (SMALL BUSINESS INCLUDED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ ALLOWED (UNLIMITED): Print and press these wraps onto physical end products (20 oz skinny tumblers, giftware, craft fair stock, made-to-order physical shop items) that you sell.
✘ NOT PERMITTED: You may NOT resell, share, gift, claim as your own, alter slightly to resell as digital files, or upload these PNGs to print-on-demand websites.

Note: Physical sublimation pressing results are not pre-tested on physical blanks here; please verify measurements against your blank tumbler before pressing and print at 100% scale (no auto-fit resize). Colors may vary slightly depending on monitor, sublimation ink, paper, and heat press settings.

Questions or need help opening your Google Drive link? Message Plume Digital Shop anytime — we are always happy to help!`;

const SKI_SEAMLESS_ETSY_TITLE =
  'Ski Seamless Pattern Bundle, 5 Apres Ski Lodge Digital Paper 12x12, Winter Alpine Fabric Design Toile de Jouy, 300 DPI, Digital Download';

const SKI_SEAMLESS_ETSY_TAGS = [
  'ski seamless pattern',
  'seamless pattern',
  'digital paper',
  'winter digital paper',
  'winter seamless',
  'ski lodge pattern',
  'apres ski pattern',
  'surface pattern',
  'repeat pattern',
  'scrapbook paper',
  'winter fabric',
  'commercial use',
  'toile de jouy',
];

const SKI_SEAMLESS_ETSY_DESCRIPTION = `*** INSTANT DIGITAL DOWNLOAD ONLY — NO PHYSICAL ITEM WILL BE SHIPPED ***

Create standout winter fabrics, gift wrap, stationery, and craft products with the Ski Lodge Seamless Pattern Bundle by Plume Digital Shop! This 5-design set pairs watercolor alpine chairlift scenes and engraved French Toile de Jouy prints with festive winter chalet illustrations—engineered at 300 DPI for crisp infinite edge-to-edge tiling.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU WILL RECEIVE (DIRECT ETSY DOWNLOAD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No Google Drive or archive extraction needed—all 5 high-resolution JPG files are ready for direct download right after Etsy checkout:

• SL-01: Watercolor Ski Chairlift & Snowy Pines (Cream Linen) — 3600 x 3600 px
• SL-02: Navy Ski Toile de Jouy (Classic Engraved Alpine Scene) — 3600 x 3600 px
• SL-03: Sepia Ski Toile de Jouy (Vintage Mountain Lodge Sketch) — 3600 x 3600 px
• SL-04: Skiing Penguins, Cozy Cabin & Green Wagon — 3600 x 3600 px
• SL-05: Alpine Village, Ice Skaters & Red Gondola — 3600 x 3600 px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Canvas Size: 3600 x 3600 px (12" x 12" tileable square)
• Resolution: 300 DPI (verified digitally for sharp fabric & paper printing)
• Color Mode: Vivid sRGB JPG format
• Seamless Alignment: 360° L/R & T/B edge-to-edge verified repeat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDEAL CREATIVE PROJECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ Custom printed cotton, jersey, minky & fleece fabric
✔ Holiday wrapping paper, tissue & boutique packaging
✔ Scrapbooking, cardmaking, planner & journal covers
✔ Sublimation blanks, stickers, wallpaper samples & pillows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMERCIAL LICENSE (SMALL BUSINESS INCLUDED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ ALLOWED (UNLIMITED): Print and manufacture unlimited physical products for sale (fabric yardage, pillows, apparel, wrapping paper, drinkware, craft fair goods).
✘ NOT PERMITTED: You may NOT resell, share, gift, or redistribute these digital JPG files (or minor edits) as digital downloads, nor upload raw files to print-on-demand hubs for digital resale.

Note: Colors may vary slightly depending on monitor, ink, and printing substrate. Need help or a custom tile scale? Message Plume Digital Shop anytime!`;

const SKI_CAMPMUG_ETSY_TITLE =
  'Ski Lodge Enamel Camping Mug Wrap PNG Bundle, 5 Apres Ski 12oz Campfire Mug Sublimation Designs, 8.5x3.25 Winter Wrap, Digital Download';

const SKI_CAMPMUG_ETSY_TAGS = [
  'enamel mug wrap',
  'camping mug wrap',
  'campfire mug wrap',
  'camping mug png',
  'enamel camping mug',
  '12oz mug wrap',
  'ski mug wrap',
  'apres ski mug',
  'winter mug wrap',
  'mug sublimation',
  'mug wrap png',
  'ski lodge png',
  'commercial use png',
];

const SKI_CAMPMUG_ETSY_DESCRIPTION = `*** INSTANT DIGITAL DOWNLOAD ONLY — NO PHYSICAL ITEM WILL BE SHIPPED ***

Outfit your winter drinkware shop with the Ski Lodge Enamel Camping Mug Wrap Bundle by Plume Digital Shop! Each of these 5 seamless alpine illustrations is precision-formatted for 11–12 oz enamel campfire mugs, leaving clean spacing around the handle and rolled black rim.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU WILL RECEIVE (DIRECT ETSY DOWNLOAD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All 5 high-resolution PNG files are attached directly to your Etsy order—no Google Drive or archive unzipping required:

• SL-01: Watercolor Ski Chairlift & Snowy Pines — 2550 x 975 px
• SL-02: Navy Ski Toile de Jouy — 2550 x 975 px
• SL-03: Sepia Ski Toile de Jouy — 2550 x 975 px
• SL-04: Skiing Penguins, Cozy Cabin & Green Wagon — 2550 x 975 px
• SL-05: Alpine Village, Ice Skaters & Red Gondola — 2550 x 975 px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Dimensions: 2550 x 975 px (8.5" x 3.25")
• Fit: Tailored for 11–12 oz Enamel Camping Mugs (below black lip rim)
• Resolution: 300 DPI (verified digitally for crisp sublimation printing)
• Color Profile: Vivid sRGB PNG format

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMERCIAL LICENSE (SMALL BUSINESS INCLUDED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ ALLOWED (UNLIMITED): Print and sublimate onto unlimited physical enamel camping mugs & giftware that you sell in your shop or at craft fairs.
✘ NOT PERMITTED: You may NOT resell, share, gift, or redistribute these PNG files as digital downloads or upload them to print-on-demand hubs for digital file resale.

Note: Physical sublimation pressing results are not pre-tested on physical blanks here; please measure your blank enamel mug before pressing and print at 100% scale (no auto-fit resize). Colors may vary slightly depending on monitor, ink, and heat press settings.

Questions? Message Plume Digital Shop anytime — we are happy to help!`;

const SKI_PIN1_TITLE =
  'Ski Lodge Enamel Camping Mug Wrap PNG Bundle | 5 Apres Ski 12oz Sublimation Designs (Digital Download)';

const SKI_PIN1_DESC =
  'Create cozy winter campfire mugs in minutes! This 5-design Ski Lodge Enamel Camping Mug Wrap PNG Bundle features watercolor chairlifts, alpine cabins, and French Toile de Jouy ski scenes sized at 2550 x 975 px (8.5" x 3.25", 300 DPI sRGB). Fits 11-12 oz enamel mugs cleanly below the rim. Instant digital download on Etsy — small-business commercial use included for physical mugs. No physical mug shipped.';

const SKI_PIN2_TITLE =
  '5 Ski Lodge 20oz Skinny Tumbler Wrap PNGs | Apres Ski Watercolor & Toile de Jouy Sublimation Bundle';

const SKI_PIN2_DESC =
  'Upgrade your winter drinkware lineup with 5 seamless 360° Ski Lodge 20 oz skinny tumbler wraps! Includes both Straight & Tapered PNGs (2790 x 2460 px, 300 DPI sRGB) featuring snowy chairlifts, vintage navy & sepia ski engravings, and alpine villages. Instant digital download with small-business commercial license for physical tumblers. No physical item shipped.';

const SKI_PIN3_TITLE =
  'Ski Lodge Seamless Pattern Bundle | 5 Apres Ski Digital Paper 12x12 Tiles (300 DPI Fabric & Sublimation)';

const SKI_PIN3_DESC =
  'Zero visible seams for custom winter fabric, wrapping paper, stationery, and sublimation projects! Get 5 high-res 3600 x 3600 px (12" x 12", 300 DPI sRGB) Ski Lodge seamless repeat JPGs direct from Etsy with no ZIP unzipping required. Includes commercial license for physical end products.';

const SKI_TIKTOK_OVERLAY_SCRIPT = `SLIDE 1 (Cover 1.5s): 5 Ski Lodge Sublimation Wraps I just dropped for winter crafters ⛷️❄️
SLIDE 2 (SL-01): 1. Watercolor Chairlift & Snowy Pines
SLIDE 3 (SL-02): 2. Classic Navy Ski Toile de Jouy
SLIDE 4 (SL-03): 3. Vintage Sepia Mountain Lodge
SLIDE 5 (SL-04): 4. Skiing Penguins & Cozy Cabin
SLIDE 6 (SL-05): 5. Alpine Village & Ice Skaters
SLIDE 7 (CTA 2s): Which one would you press first — 1, 2, 3, 4 or 5? 👇 Comment your pick! (Link in bio — Instant Download on Etsy · Plume Digital Shop)`;

const SKI_TIKTOK_CAPTION = `Which one is your favorite: 1, 2, 3, 4 or 5? ⛷️✨ Five cozy Ski Lodge sublimation designs ready in 300 DPI for 12 oz enamel camping mugs, 20 oz skinny tumblers & seamless 12x12 fabric tiles. Instant digital download (no physical item shipped) with small-business commercial use included! 🔗 Link in bio → Plume Digital Shop on Etsy

#sublimation #sublimationdesigns #campingmug #tumblerwrap #apresski #skilodge #toiledejouy #craftbusiness #etsyseller #smallbusinessfinds #wintercrafts #digitaldownload`;

function downloadBlob(blob: Blob, filename: string): void {
  triggerBlobDownload(blob, filename);
}

export function TumblerWrapStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('01');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [horizontalRepeats, setHorizontalRepeats] = useState<HorizontalRepeats>(2);
  const [crestOverlay, setCrestOverlay] = useState<CrestOverlayMode>('none');
  const [converting, setConverting] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);
  const [exportingFormatId, setExportingFormatId] = useState<MultiProductFormatId | null>(null);
  const [exportedFormatId, setExportedFormatId] = useState<MultiProductFormatId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<TumblerConversionResult | null>(null);

  const markDownloaded = (key: string) => {
    setDownloadedKey(key);
    window.setTimeout(() => {
      setDownloadedKey((curr) => (curr === key ? null : curr));
    }, 2500);
  };

  const handleDownloadDeliverable = async (filename: string, key: string) => {
    setError(null);
    setDownloadingKey(key);
    try {
      await fetchAndDownloadDeliverable(filename);
      markDownloaded(key);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : `Erreur lors du téléchargement de ${filename}.`;
      setError(msg);
    } finally {
      setDownloadingKey((curr) => (curr === key ? null : curr));
    }
  };

  const handleDownloadPdf = (filename: string, key: string) =>
    handleDownloadDeliverable(filename, key);

  const activePreset =
    PRESET_TILES.find((p) => p.id === selectedPresetId) ?? PRESET_TILES[0];

  const runConversion = async (
    fileOverride?: File | null,
    presetOverride?: PresetTile,
    repeatsOverride?: HorizontalRepeats,
    crestOverride?: CrestOverlayMode
  ) => {
    setConverting(true);
    setError(null);
    try {
      const targetFile = fileOverride !== undefined ? fileOverride : uploadedFile;
      const targetPreset = presetOverride ?? activePreset;
      const targetRepeats = repeatsOverride ?? horizontalRepeats;
      const targetCrest = crestOverride ?? crestOverlay;

      const source = targetFile ?? targetPreset.url;
      const baseFilename = targetFile ? targetFile.name : targetPreset.baseName;

      const img = await loadImageFromUrlOrFile(source);
      const res = await generateTumblerWrap20oz(img, {
        horizontalRepeats: targetRepeats,
        crestOverlay: targetCrest,
        baseFilename,
      });
      setOutput(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la conversion.';
      setError(msg);
    } finally {
      setConverting(false);
    }
  };

  const handleExportMultiProduct = async (formatId: MultiProductFormatId) => {
    setExportingFormatId(formatId);
    setError(null);
    try {
      const source = uploadedFile ?? activePreset.url;
      const baseFilename = uploadedFile ? uploadedFile.name : activePreset.baseName;
      const img = await loadImageFromUrlOrFile(source);
      const res = await generateMultiProductFormatPng(
        img,
        formatId,
        horizontalRepeats,
        baseFilename
      );
      downloadBlob(res.blob, res.filename);
      setExportedFormatId(formatId);
      window.setTimeout(() => {
        setExportedFormatId((prev) => (prev === formatId ? null : prev));
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur export multi-produits.';
      setError(msg);
    } finally {
      setExportingFormatId(null);
    }
  };

  useEffect(() => {
    runConversion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    runConversion(file, activePreset, horizontalRepeats, crestOverlay);
  };

  const handleSelectPreset = (preset: PresetTile) => {
    setUploadedFile(null);
    setSelectedPresetId(preset.id);
    runConversion(null, preset, horizontalRepeats, crestOverlay);
  };

  const handleRepeatsChange = (rep: HorizontalRepeats) => {
    setHorizontalRepeats(rep);
    runConversion(uploadedFile, activePreset, rep, crestOverlay);
  };

  const handleCrestChange = (mode: CrestOverlayMode) => {
    setCrestOverlay(mode);
    runConversion(uploadedFile, activePreset, horizontalRepeats, mode);
  };

  return (
    <section className="space-y-12 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5DDD0]">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
            CODE PLUME 300 · Convertisseur Sublimation 20 oz
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1C1917] tracking-tight">
            Seamless &rarr; Tumbler Wrap 20 oz (PNG 300 DPI)
          </h2>
          <p className="text-sm text-[#57534E] mt-2 max-w-2xl leading-relaxed">
            Transformez n’importe laquelle de vos 12 tuiles seamless en fichiers{' '}
            <span className="font-mono text-xs text-[#1C1917]">2790×2460 px</span> (9.3×8.2 po ·
            300 DPI · sRGB) prêts pour Etsy : version <strong>Straight</strong> et version{' '}
            <strong>Tapered</strong> conique transparente, avec contrôle de couture arrière.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              handleDownloadPdf('PLUME_Heritage_4Designs_20oz_Tumbler_DOWNLOAD_LINK.pdf', 'hdr-mp1')
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors whitespace-nowrap cursor-pointer"
          >
            {downloadedKey === 'hdr-mp1' ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{downloadedKey === 'hdr-mp1' ? 'Téléchargé !' : 'PDF Mini-Pack #1'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDownloadPdf('PLUME_Heritage_MiniPack2_04_07_DOWNLOAD_LINK.pdf', 'hdr-mp2')
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors whitespace-nowrap cursor-pointer"
          >
            {downloadedKey === 'hdr-mp2' ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{downloadedKey === 'hdr-mp2' ? 'Téléchargé !' : 'PDF Mini-Pack #2'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDownloadPdf('PLUME_Heritage_MiniPack3_08_11_DOWNLOAD_LINK.pdf', 'hdr-mp3')
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors whitespace-nowrap cursor-pointer"
          >
            {downloadedKey === 'hdr-mp3' ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{downloadedKey === 'hdr-mp3' ? 'Téléchargé !' : 'PDF Mini-Pack #3'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDownloadPdf(
                'PLUME_Heritage_Christmas_20oz_Tumbler_Bundle_DOWNLOAD_LINK.pdf',
                'hdr-b12'
              )
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors whitespace-nowrap cursor-pointer"
          >
            {downloadedKey === 'hdr-b12' ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{downloadedKey === 'hdr-b12' ? 'Téléchargé !' : 'PDF Bundle 12'}</span>
          </button>

          <button
            type="button"
            disabled={downloadingKey !== null}
            onClick={() =>
              handleDownloadPdf('PLUME_Ski_Lodge_MiniPack1_DOWNLOAD_LINK.pdf', 'hdr-sl1')
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#1B3B5A] text-[#FAF6F0] hover:bg-[#122940] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            {downloadingKey === 'hdr-sl1' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : downloadedKey === 'hdr-sl1' ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>
              {downloadingKey === 'hdr-sl1'
                ? 'Chargement...'
                : downloadedKey === 'hdr-sl1'
                  ? 'Téléchargé !'
                  : 'PDF Ski Lodge #1'}
            </span>
          </button>

          <CopyButton
            text={CHATGPT_TUMBLER_MASTER_PROMPT}
            label="Copier Prompt Maître ChatGPT Tumbler"
            copiedLabel="Prompt Tumbler Copié"
            variant="primary"
          />
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-5 bg-[#F6F2EC] border border-[#E5DDD0] p-6 space-y-6">
          {/* Source Selector */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-[#78716C]">
              1. Choisir un motif source (ou importer vos tuiles 04–12)
            </div>

            <div className="space-y-1.5">
              {PRESET_TILES.map((preset) => {
                const isActive = !uploadedFile && selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={converting}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-medium border transition-colors cursor-pointer disabled:opacity-60 ${
                      isActive
                        ? 'bg-[#2C2520] text-[#FAF6F0] border-[#2C2520]'
                        : 'bg-[#FAF6F0] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EDE6DA]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <label className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-medium bg-[#FAF6F0] border border-dashed border-[#8C8275] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {uploadedFile
                  ? `Importé : ${uploadedFile.name}`
                  : 'Importer une tuile JPG/PNG (ex. 04 à 12)'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Horizontal Repeats (Garantie zéro couture) */}
          <div className="space-y-2.5 pt-4 border-t border-[#E5DDD0]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-[#78716C]">
                2. Échelle autour du tumbler
              </span>
              <span className="font-mono text-[11px] text-[#57534E]">
                Répétition entière = 0 couture
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as HorizontalRepeats[]).map((rep) => (
                <button
                  key={rep}
                  type="button"
                  disabled={converting}
                  onClick={() => handleRepeatsChange(rep)}
                  className={`py-2 text-xs font-mono border transition-colors cursor-pointer disabled:opacity-60 ${
                    horizontalRepeats === rep
                      ? 'bg-[#2C2520] text-[#FAF6F0] border-[#2C2520]'
                      : 'bg-[#FAF6F0] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EDE6DA]'
                  }`}
                >
                  {rep}× tour
                </button>
              ))}
            </div>
          </div>

          {/* Crest Overlay */}
          <div className="space-y-2.5 pt-4 border-t border-[#E5DDD0]">
            <div className="text-xs uppercase tracking-widest text-[#78716C]">
              3. Option Cadre Personnalisable (Monogramme / Prénom)
            </div>
            <div className="space-y-1.5">
              {(
                [
                  { id: 'none', label: 'Motif pur 360° (sans écusson)' },
                  { id: 'cream-gold', label: 'Écusson ovale Crème & Or (vierge)' },
                  { id: 'burgundy-ribbon', label: 'Ruban Velours Bordeaux + Écusson Crème' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={converting}
                  onClick={() => handleCrestChange(opt.id)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium border transition-colors cursor-pointer disabled:opacity-60 ${
                    crestOverlay === opt.id
                      ? 'bg-[#2C2520] text-[#FAF6F0] border-[#2C2520]'
                      : 'bg-[#FAF6F0] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EDE6DA]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={converting}
            onClick={() => runConversion()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
          >
            {converting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Calcul 2790×2460 px (300 DPI)...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Recalculer les fichiers 300 DPI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Previews & Downloads */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div
              role="alert"
              className="p-4 bg-[#F6F2EC] border border-[#9A3412]/40 text-sm text-[#9A3412]"
            >
              {error}
            </div>
          )}

          {output && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Straight Card */}
                <article className="bg-[#F6F2EC] border border-[#E5DDD0] p-4 space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                      Straight 20 oz
                    </h3>
                    <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                      {output.width}×{output.height} · {output.dpi} DPI
                    </span>
                  </div>
                  <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-2">
                    <img
                      src={output.straightPreviewUrl}
                      alt="Aperçu Tumbler Wrap Straight 20 oz"
                      className="w-full h-auto block"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadBlob(output.straightBlob, output.straightFilename)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      Télécharger Straight PNG ({(output.straightBlob.size / 1048576).toFixed(2)} Mo)
                    </span>
                  </button>
                </article>

                {/* Tapered Card */}
                <article className="bg-[#F6F2EC] border border-[#E5DDD0] p-4 space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                      Tapered 20 oz
                    </h3>
                    <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                      {output.width}×{output.height} · Transparent PNG
                    </span>
                  </div>
                  <div
                    className="border border-[#E5DDD0] p-2"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #EAE3D6 25%, transparent 25%), linear-gradient(-45deg, #EAE3D6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EAE3D6 75%), linear-gradient(-45deg, transparent 75%, #EAE3D6 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  >
                    <img
                      src={output.taperedPreviewUrl}
                      alt="Aperçu Tumbler Wrap Tapered 20 oz"
                      className="w-full h-auto block"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadBlob(output.taperedBlob, output.taperedFilename)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      Télécharger Tapered PNG ({(output.taperedBlob.size / 1048576).toFixed(2)} Mo)
                    </span>
                  </button>
                </article>
              </div>

              {/* Back Seam QC Strip */}
              <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 shrink-0 border border-[#D6CEBE] overflow-hidden relative">
                  <img
                    src={output.backSeamPreviewUrl}
                    alt="Contrôle jonction arrière Gauche/Droite à 100%"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-y-0 left-1/2 w-px bg-[#FAF6F0]/60 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-1.5 text-xs text-[#57534E]">
                  <div className="uppercase tracking-widest text-[#1C1917] font-medium">
                    Contrôle Couture Arrière (Jonction Bord Droit + Bord Gauche)
                  </div>
                  <p className="leading-relaxed">
                    Aperçu réel de la ligne de fermeture à l’arrière du gobelet (360 px droit + 360
                    px gauche). Les métadonnées PNG{' '}
                    <span className="font-mono text-[#1C1917]">pHYs (300×300 DPI)</span> et{' '}
                    <span className="font-mono text-[#1C1917]">sRGB</span> sont injectées directement
                    dans les deux fichiers exportés.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Verified Mini-Pack < 20 MB ZIP Exports + Clean Motif 12 V2 */}
          <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#78716C]">
                  Mini-Pack 4 Motifs (01, 02, 03, 12 V2) · Sans défaut
                </p>
                <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                  Archives ZIP Etsy &lt; 20 Mo &amp; Nouveau Motif 12 Argyle
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                27.86 Mo total &rarr; 2 ZIPs Etsy
              </span>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              Le motif <strong>12 (Argyle)</strong> a été entièrement régénéré à neuf sans aucune
              bande floue et avec raccord périodique exact (tissage sergé 45° · 300 DPI · sRGB).
              Téléchargez ci-dessous le <strong>PDF cliquable complet (Straight + Tapered)</strong>{' '}
              ou les 2 archives ZIP Straight (&lt; 20 Mo).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleDownloadPdf(
                    'PLUME_Heritage_4Designs_20oz_Tumbler_DOWNLOAD_LINK.pdf',
                    'card-mp1'
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer"
              >
                {downloadedKey === 'card-mp1' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadedKey === 'card-mp1'
                    ? 'Mini-Pack #1 OK !'
                    : 'PDF Mini-Pack #1 (01–03, 12)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadPdf(
                    'PLUME_Heritage_MiniPack2_04_07_DOWNLOAD_LINK.pdf',
                    'card-mp2'
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer"
              >
                {downloadedKey === 'card-mp2' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadedKey === 'card-mp2'
                    ? 'Mini-Pack #2 OK !'
                    : 'PDF Mini-Pack #2 (04–07)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadPdf(
                    'PLUME_Heritage_MiniPack3_08_11_DOWNLOAD_LINK.pdf',
                    'card-mp3'
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer"
              >
                {downloadedKey === 'card-mp3' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadedKey === 'card-mp3'
                    ? 'Mini-Pack #3 OK !'
                    : 'PDF Mini-Pack #3 (08–11)'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable('PLUME_MiniPack4_Straight_Part1_01_02.zip', 'part1')
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'part1' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'part1' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'part1'
                    ? 'Téléchargement...'
                    : downloadedKey === 'part1'
                      ? 'ZIP Part 1 Téléchargé !'
                      : 'ZIP Part 1 · 01 & 02 (13.12 Mo)'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable('PLUME_MiniPack4_Straight_Part2_03_12.zip', 'part2')
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'part2' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'part2' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'part2'
                    ? 'Téléchargement...'
                    : downloadedKey === 'part2'
                      ? 'ZIP Part 2 Téléchargé !'
                      : 'ZIP Part 2 · 03 & 12 V2 (14.74 Mo)'}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#E5DDD0] space-y-2">
              {[
                {
                  num: '12',
                  title:
                    'Fichiers individuels Motif 12 V2 (pour mise à jour Google Drive Bundle 12)',
                  jpgLabel: '12 JPG 3600² (4.82 Mo)',
                  strLabel: '12 Straight PNG (6.78 Mo)',
                  tapLabel: '12 Tapered PNG (12.52 Mo)',
                },
                {
                  num: '11',
                  title: 'Motif 11 V2 Corrigé (Rayures Oxford · Zéro couture miroir)',
                  jpgLabel: '11 JPG 3600² (300 DPI)',
                  strLabel: '11 Straight PNG (300 DPI)',
                  tapLabel: '11 Tapered PNG (300 DPI)',
                },
                {
                  num: '08',
                  title: 'Motif 08 V2 Corrigé (Tartan Diagonal Héritage · Zéro couture miroir)',
                  jpgLabel: '08 JPG 3600² (300 DPI)',
                  strLabel: '08 Straight PNG (300 DPI)',
                  tapLabel: '08 Tapered PNG (300 DPI)',
                },
                {
                  num: '09',
                  title: 'Motif 09 V2 Corrigé (Pied-de-Poule Marine & Carmin/Vert/Or · Zéro couture)',
                  jpgLabel: '09 JPG 3600² (300 DPI)',
                  strLabel: '09 Straight PNG (300 DPI)',
                  tapLabel: '09 Tapered PNG (300 DPI)',
                },
                {
                  num: '10',
                  title: 'Motif 10 V2 Corrigé (Vichy Forêt & Double Trait Carmin/Camel · Zéro couture)',
                  jpgLabel: '10 JPG 3600² (300 DPI)',
                  strLabel: '10 Straight PNG (300 DPI)',
                  tapLabel: '10 Tapered PNG (300 DPI)',
                },
              ].map((m) => {
                const base = `PLUME_Heritage_Christmas_${m.num}`;
                const jpgKey = `${m.num}-jpg`;
                const strKey = `${m.num}-str`;
                const tapKey = `${m.num}-tap`;
                return (
                  <div key={m.num} className={m.num === '12' ? 'space-y-2' : 'pt-2 space-y-2'}>
                    <div className="text-[11px] uppercase tracking-widest text-[#78716C]">
                      {m.title}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadDeliverable(`${base}_3600x3600_300DPI.jpg`, jpgKey)
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {downloadingKey === jpgKey ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : downloadedKey === jpgKey ? (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Download className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>
                          {downloadingKey === jpgKey
                            ? 'Chargement...'
                            : downloadedKey === jpgKey
                              ? 'Téléchargé !'
                              : m.jpgLabel}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadDeliverable(
                            `${base}_20oz_Straight_2790x2460_300DPI.png`,
                            strKey
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {downloadingKey === strKey ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : downloadedKey === strKey ? (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Download className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>
                          {downloadingKey === strKey
                            ? 'Chargement...'
                            : downloadedKey === strKey
                              ? 'Téléchargé !'
                              : m.strLabel}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadDeliverable(
                            `${base}_20oz_Tapered_2790x2460_300DPI.png`,
                            tapKey
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {downloadingKey === tapKey ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : downloadedKey === tapKey ? (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Download className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>
                          {downloadingKey === tapKey
                            ? 'Chargement...'
                            : downloadedKey === tapKey
                              ? 'Téléchargé !'
                              : m.tapLabel}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collection 2: Ski Lodge Mini-Pack 1 (SL-01 to SL-05) */}
          <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#78716C]">
                  Collection 2 · Ski Lodge Mini-Pack 1 (SL-01 à SL-05)
                </p>
                <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                  5 Motifs Ski &amp; Après-Ski 300 DPI · Couture Corrigée (sRGB)
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                15 fichiers · 1:1 Répétition 2×
              </span>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              Chaque motif a reçu une jonction dynamique L/R &amp; T/B sans couture visible et sans
              déformation (<span className="font-mono">1395×1395</span> tuile 1:1 en{' '}
              <span className="font-mono">2×2</span> recadrée{' '}
              <span className="font-mono">2790×2460</span> à <strong>300 DPI</strong>). Le PDF
              cliquable client est prêt avec votre lien Google Drive vérifié.
            </p>

            <button
              type="button"
              disabled={downloadingKey !== null}
              onClick={() =>
                handleDownloadPdf('PLUME_Ski_Lodge_MiniPack1_DOWNLOAD_LINK.pdf', 'card-sl1')
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium bg-[#1B3B5A] text-[#FAF6F0] hover:bg-[#122940] transition-colors cursor-pointer disabled:opacity-60"
            >
              {downloadingKey === 'card-sl1' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : downloadedKey === 'card-sl1' ? (
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>
                {downloadingKey === 'card-sl1'
                  ? 'Téléchargement du PDF...'
                  : downloadedKey === 'card-sl1'
                    ? 'PDF Ski Lodge Mini-Pack 1 Téléchargé !'
                    : 'Télécharger PDF Cliquable Ski Lodge Mini-Pack 1 (483 Ko · Lien Drive)'}
              </span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_MiniPack1_Slide2_All5Designs_2000x2000.jpg',
                    'sl-slide2'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'sl-slide2' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'sl-slide2' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'sl-slide2'
                    ? 'Chargement Photo #2...'
                    : downloadedKey === 'sl-slide2'
                      ? 'Photo #2 Téléchargée !'
                      : 'Photo #2 Etsy · Grille 5 Motifs (2000×2000)'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_MiniPack1_Slide4_DeliveryLicense_2000x2000.jpg',
                    'sl-slide4'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'sl-slide4' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'sl-slide4' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'sl-slide4'
                    ? 'Chargement Photo #4...'
                    : downloadedKey === 'sl-slide4'
                      ? 'Photo #4 Téléchargée !'
                      : 'Photo #4 Etsy · Livraison & Licence (2000×2000)'}
                </span>
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  num: '01',
                  title: 'SL-01 · Télésiège Aquarelle & Sapins Enneigés',
                },
                {
                  num: '02',
                  title: 'SL-02 · Toile de Jouy Ski Bleu Marine',
                },
                {
                  num: '03',
                  title: 'SL-03 · Toile de Jouy Ski Sépia Vintage',
                },
                {
                  num: '04',
                  title: 'SL-04 · Pingouins Skieurs, Chalet & Voiture Verte',
                },
                {
                  num: '05',
                  title: 'SL-05 · Village Alpin, Patineurs & Télécabine Rouge',
                },
              ].map((item) => {
                const base = `PLUME_Ski_Lodge_${item.num}`;
                const jpgKey = `sl${item.num}-jpg`;
                const strKey = `sl${item.num}-str`;
                const tapKey = `sl${item.num}-tap`;
                return (
                  <div key={item.num} className="pt-2 border-t border-[#E5DDD0]/80 space-y-2">
                    <div className="text-[11px] uppercase tracking-widest text-[#78716C]">
                      {item.title}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadDeliverable(`${base}_3600x3600_300DPI.jpg`, jpgKey)
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {downloadingKey === jpgKey ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : downloadedKey === jpgKey ? (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Download className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>
                          {downloadingKey === jpgKey
                            ? 'Chargement...'
                            : downloadedKey === jpgKey
                              ? 'Téléchargé !'
                              : `SL-${item.num} JPG 3600²`}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadDeliverable(
                            `${base}_20oz_Straight_2790x2460_300DPI.png`,
                            strKey
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {downloadingKey === strKey ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : downloadedKey === strKey ? (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Download className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>
                          {downloadingKey === strKey
                            ? 'Chargement...'
                            : downloadedKey === strKey
                              ? 'Téléchargé !'
                              : `SL-${item.num} Straight PNG`}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingKey !== null}
                        onClick={() =>
                          handleDownloadDeliverable(
                            `${base}_20oz_Tapered_2790x2460_300DPI.png`,
                            tapKey
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {downloadingKey === tapKey ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : downloadedKey === tapKey ? (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Download className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>
                          {downloadingKey === tapKey
                            ? 'Chargement...'
                            : downloadedKey === tapKey
                              ? 'Téléchargé !'
                              : `SL-${item.num} Tapered PNG`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Copy-Ready Etsy Listing SEO Kit for Collection 2 */}
            <div className="pt-4 mt-2 border-t border-[#D6CEBE] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#7A1621] font-medium">
                    Fiche Etsy Prête à Copier · SEO SaleSamurai (0 Marque Déposée)
                  </p>
                  <p className="text-[11px] text-[#57534E]">
                    Prix conseillé : <strong>$4.90</strong> (promo -30% : <strong>$3.43</strong>) ·
                    Catégorie : Craft Supplies &amp; Tools &rarr; Patterns &amp; Blueprints ·
                    Section : <span className="font-mono">Winter &amp; Après-Ski PNG</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    Titre Etsy ({SKI_LODGE_ETSY_TITLE.length}/140 car.)
                  </span>
                  <CopyButton text={SKI_LODGE_ETSY_TITLE} label="Copier Titre" copiedLabel="Titre Copié" />
                </div>
                <p className="text-xs font-medium text-[#1C1917] leading-relaxed select-all">
                  {SKI_LODGE_ETSY_TITLE}
                </p>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    13 Tags Etsy (&le;20 car. chacun · Copiables d’un clic)
                  </span>
                  <CopyButton
                    text={SKI_LODGE_ETSY_TAGS.join(', ')}
                    label="Copier 13 Tags"
                    copiedLabel="13 Tags Copiés"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SKI_LODGE_ETSY_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-[11px] font-mono bg-[#F6F2EC] border border-[#D6CEBE] text-[#1C1917]"
                    >
                      {tag} <span className="text-[#78716C]">({tag.length})</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    Description Complète Etsy (EN · Prête à Coller)
                  </span>
                  <CopyButton
                    text={SKI_LODGE_ETSY_DESCRIPTION}
                    label="Copier Description"
                    copiedLabel="Description Copiée"
                  />
                </div>
                <pre className="text-[11px] text-[#2C2520] whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto bg-[#F6F2EC] p-3 border border-[#E5DDD0]">
                  {SKI_LODGE_ETSY_DESCRIPTION}
                </pre>
              </div>
            </div>
          </div>

          {/* Collection 2B: Ski Lodge Seamless Pattern Pack (3600x3600 Digital Paper / Fabric) */}
          <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#1B3B5A] font-medium">
                  Collection 2B · Pack Seamless Patterns (SL-01 à SL-05) · Upload Direct Etsy
                </p>
                <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                  5 Patrons Seamless 12×12&Prime; (3600×3600 · 300 DPI · sRGB)
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                5 JPG &le; 5 Mo chacun · Zéro Drive requis
              </span>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              Chaque JPG pèse entre <strong>3.4 Mo et 5.0 Mo</strong> : tu peux téléverser{' '}
              <strong>les 5 fichiers directement dans Etsy</strong> (5 emplacements max, &lt; 20 Mo
              par fichier). Niche <strong>SaleSamurai : Competition 334</strong> · prix moyen{' '}
              <strong>$5.53</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_Seamless_Slide1_Cover_2000x2000.jpg',
                    'sl-sm-slide1'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#1B3B5A] text-[#FAF6F0] hover:bg-[#122940] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'sl-sm-slide1' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'sl-sm-slide1' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'sl-sm-slide1'
                    ? 'Chargement...'
                    : downloadedKey === 'sl-sm-slide1'
                      ? 'Photo #1 OK !'
                      : 'Photo #1 Cover Seamless'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_Seamless_Slide2_All5Designs_2000x2000.jpg',
                    'sl-sm-slide2'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'sl-sm-slide2' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'sl-sm-slide2' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'sl-sm-slide2'
                    ? 'Chargement...'
                    : downloadedKey === 'sl-sm-slide2'
                      ? 'Photo #2 OK !'
                      : 'Photo #2 Preuve 2×2'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_Seamless_Slide3_SpecsLicense_2000x2000.jpg',
                    'sl-sm-slide3'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'sl-sm-slide3' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'sl-sm-slide3' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'sl-sm-slide3'
                    ? 'Chargement...'
                    : downloadedKey === 'sl-sm-slide3'
                      ? 'Photo #3 OK !'
                      : 'Photo #3 Specs & Licence'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { num: '01', size: '3.8 Mo' },
                { num: '02', size: '5.0 Mo' },
                { num: '03', size: '4.5 Mo' },
                { num: '04', size: '3.6 Mo' },
                { num: '05', size: '3.4 Mo' },
              ].map((tile) => {
                const key = `sm-tile-${tile.num}`;
                return (
                  <button
                    key={tile.num}
                    type="button"
                    disabled={downloadingKey !== null}
                    onClick={() =>
                      handleDownloadDeliverable(
                        `PLUME_Ski_Lodge_${tile.num}_3600x3600_300DPI.jpg`,
                        key
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {downloadingKey === key ? (
                      <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                    ) : downloadedKey === key ? (
                      <Check className="w-3 h-3" aria-hidden="true" />
                    ) : (
                      <Download className="w-3 h-3" aria-hidden="true" />
                    )}
                    <span>
                      {downloadedKey === key ? 'OK !' : `SL-${tile.num} (${tile.size})`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Copy-Ready Etsy Listing SEO Kit for Seamless Pack */}
            <div className="pt-4 mt-2 border-t border-[#D6CEBE] space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[#7A1621] font-medium">
                  Fiche Etsy Seamless Prête à Copier · SEO SaleSamurai (0 Marque Déposée)
                </p>
                <p className="text-[11px] text-[#57534E]">
                  Prix conseillé : <strong>$6.90</strong> (promo -25% : <strong>$5.18</strong> · ou{' '}
                  <strong>$5.90</strong> / -25% <strong>$4.43</strong>) · Catégorie : Craft Supplies
                  &amp; Tools &rarr; Patterns &amp; Blueprints · Section :{' '}
                  <span className="font-mono">Seamless &amp; Printables</span>
                </p>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    Titre Etsy Seamless ({SKI_SEAMLESS_ETSY_TITLE.length}/140 car.)
                  </span>
                  <CopyButton
                    text={SKI_SEAMLESS_ETSY_TITLE}
                    label="Copier Titre"
                    copiedLabel="Titre Copié"
                  />
                </div>
                <p className="text-xs font-medium text-[#1C1917] leading-relaxed select-all">
                  {SKI_SEAMLESS_ETSY_TITLE}
                </p>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    13 Tags Seamless (&le;20 car. chacun · Exact-Match SaleSamurai)
                  </span>
                  <CopyButton
                    text={SKI_SEAMLESS_ETSY_TAGS.join(', ')}
                    label="Copier 13 Tags"
                    copiedLabel="13 Tags Copiés"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SKI_SEAMLESS_ETSY_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-[11px] font-mono bg-[#F6F2EC] border border-[#D6CEBE] text-[#1C1917]"
                    >
                      {tag} <span className="text-[#78716C]">({tag.length})</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    Description Complète Seamless (EN · Prête à Coller)
                  </span>
                  <CopyButton
                    text={SKI_SEAMLESS_ETSY_DESCRIPTION}
                    label="Copier Description"
                    copiedLabel="Description Copiée"
                  />
                </div>
                <pre className="text-[11px] text-[#2C2520] whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto bg-[#F6F2EC] p-3 border border-[#E5DDD0]">
                  {SKI_SEAMLESS_ETSY_DESCRIPTION}
                </pre>
              </div>
            </div>
          </div>

          {/* Collection 2C: Enamel Camping Mug Wraps (SL-01 to SL-05) */}
          <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#1B3B5A] font-medium">
                  Collection 2C · Enamel Camping Mug Wraps (SL-01 à SL-05) · Upload Direct Etsy
                </p>
                <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                  5 Wraps Mug Émaillé 12 oz (2550×975 px · 8.5×3.25&Prime; · 300 DPI PNG)
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                5 PNG &lt; 2 Mo chacun · Zéro Drive requis
              </span>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              Calculés en proportion exacte <strong>1:1</strong> sans déformation pour les{' '}
              <strong>Enamel Camping Mugs 12 oz</strong> (marge nette sous le bord noir et autour de
              l’anse). Les <strong>5 PNGs pèsent 1.5 à 1.9 Mo</strong> chacun : upload direct sur
              Etsy possible, plus tes <strong>2 visuels galerie photoréalistes</strong> réalisés sur
              ton propre mug !
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_CampMug_Slide1_Cover_2000x2000.jpg',
                    'sl-cm-slide1'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#1B3B5A] text-[#FAF6F0] hover:bg-[#122940] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'sl-cm-slide1' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'sl-cm-slide1' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'sl-cm-slide1'
                    ? 'Chargement...'
                    : downloadedKey === 'sl-cm-slide1'
                      ? 'Photo #1 OK !'
                      : 'Photo #1 Cover · 5 Mugs Émaillés (2000×2000)'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_CampMug_Slide2_SpecsWraps_2000x2000.jpg',
                    'sl-cm-slide2'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'sl-cm-slide2' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'sl-cm-slide2' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'sl-cm-slide2'
                    ? 'Chargement...'
                    : downloadedKey === 'sl-cm-slide2'
                      ? 'Photo #2 OK !'
                      : 'Photo #2 · 5 Wraps à Plat, Specs & Licence'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { num: '01', size: '1.72 Mo' },
                { num: '02', size: '1.94 Mo' },
                { num: '03', size: '1.85 Mo' },
                { num: '04', size: '1.68 Mo' },
                { num: '05', size: '1.52 Mo' },
              ].map((cm) => {
                const key = `cm-png-${cm.num}`;
                return (
                  <button
                    key={cm.num}
                    type="button"
                    disabled={downloadingKey !== null}
                    onClick={() =>
                      handleDownloadDeliverable(
                        `PLUME_Ski_Lodge_${cm.num}_CampMug_2550x975_300DPI.png`,
                        key
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-medium bg-[#FAF6F0] border border-[#D6CEBE] text-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {downloadingKey === key ? (
                      <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                    ) : downloadedKey === key ? (
                      <Check className="w-3 h-3" aria-hidden="true" />
                    ) : (
                      <Download className="w-3 h-3" aria-hidden="true" />
                    )}
                    <span>
                      {downloadedKey === key ? 'OK !' : `SL-${cm.num} (${cm.size})`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Copy-Ready Etsy Listing SEO Kit for Enamel Camping Mug */}
            <div className="pt-4 mt-2 border-t border-[#D6CEBE] space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[#7A1621] font-medium">
                  Fiche Etsy Mug Émaillé Prête à Copier · 0 Marque Déposée
                </p>
                <p className="text-[11px] text-[#57534E]">
                  Prix conseillé : <strong>$4.90</strong> (promo -30% : <strong>$3.43</strong>) ·
                  Catégorie : Craft Supplies &amp; Tools &rarr; Patterns &amp; Blueprints · Section :{' '}
                  <span className="font-mono">11 oz &amp; 15 oz Mug Wraps</span>
                </p>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    Titre Etsy Camp Mug ({SKI_CAMPMUG_ETSY_TITLE.length}/140 car.)
                  </span>
                  <CopyButton
                    text={SKI_CAMPMUG_ETSY_TITLE}
                    label="Copier Titre"
                    copiedLabel="Titre Copié"
                  />
                </div>
                <p className="text-xs font-medium text-[#1C1917] leading-relaxed select-all">
                  {SKI_CAMPMUG_ETSY_TITLE}
                </p>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    13 Tags Camp Mug (&le;20 car. chacun)
                  </span>
                  <CopyButton
                    text={SKI_CAMPMUG_ETSY_TAGS.join(', ')}
                    label="Copier 13 Tags"
                    copiedLabel="13 Tags Copiés"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SKI_CAMPMUG_ETSY_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-[11px] font-mono bg-[#F6F2EC] border border-[#D6CEBE] text-[#1C1917]"
                    >
                      {tag} <span className="text-[#78716C]">({tag.length})</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                    Description Complète Camp Mug (EN · Prête à Coller)
                  </span>
                  <CopyButton
                    text={SKI_CAMPMUG_ETSY_DESCRIPTION}
                    label="Copier Description"
                    copiedLabel="Description Copiée"
                  />
                </div>
                <pre className="text-[11px] text-[#2C2520] whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto bg-[#F6F2EC] p-3 border border-[#E5DDD0]">
                  {SKI_CAMPMUG_ETSY_DESCRIPTION}
                </pre>
              </div>
            </div>
          </div>

          {/* Kit Marketing Ce Soir · Pinterest (2:3) & TikTok */}
          <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#7A1621] font-medium">
                  Kit Marketing Ce Soir · Collection Ski Lodge (0 Marque Déposée)
                </p>
                <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                  Pinterest (3 Épingles 1000×1500 · Ratio 2:3) &amp; TikTok / Reels
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                300 DPI sRGB · Prêt à publier
              </span>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              Télécharge tes <strong>3 épingles verticales Pinterest 2:3</strong> vérifiées sans
              chevauchement, génère ton lien <strong>Etsy Share &amp; Save</strong> (pour économiser
              4&nbsp;% de frais Etsy sur chaque vente sociale), puis copie les titres, descriptions
              et légendes TikTok ci-dessous.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_Pin1_CampMug_1000x1500.jpg',
                    'pin-1-campmug'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#1B3B5A] text-[#FAF6F0] hover:bg-[#122940] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'pin-1-campmug' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'pin-1-campmug' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'pin-1-campmug'
                    ? 'Chargement...'
                    : downloadedKey === 'pin-1-campmug'
                      ? 'Pin #1 OK !'
                      : 'Pin #1 · Mug Émaillé (1000×1500)'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_Pin2_Tumbler20oz_1000x1500.jpg',
                    'pin-2-tumbler'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#2C2520] text-[#FAF6F0] hover:bg-[#1C1917] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'pin-2-tumbler' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'pin-2-tumbler' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'pin-2-tumbler'
                    ? 'Chargement...'
                    : downloadedKey === 'pin-2-tumbler'
                      ? 'Pin #2 OK !'
                      : 'Pin #2 · Tumbler 20 oz (1000×1500)'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingKey !== null}
                onClick={() =>
                  handleDownloadDeliverable(
                    'PLUME_Ski_Lodge_Pin3_Seamless_1000x1500.jpg',
                    'pin-3-seamless'
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingKey === 'pin-3-seamless' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : downloadedKey === 'pin-3-seamless' ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {downloadingKey === 'pin-3-seamless'
                    ? 'Chargement...'
                    : downloadedKey === 'pin-3-seamless'
                      ? 'Pin #3 OK !'
                      : 'Pin #3 · Seamless Pattern (1000×1500)'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-[#D6CEBE]">
              {[
                {
                  id: 'pin1',
                  badge: 'Pin #1 · Camp Mug 12 oz · Tableau suggéré : Camping Mug Sublimation Wraps',
                  title: SKI_PIN1_TITLE,
                  desc: SKI_PIN1_DESC,
                },
                {
                  id: 'pin2',
                  badge: 'Pin #2 · Tumbler 20 oz · Tableau suggéré : 20oz Skinny Tumbler Sublimation Wraps',
                  title: SKI_PIN2_TITLE,
                  desc: SKI_PIN2_DESC,
                },
                {
                  id: 'pin3',
                  badge: 'Pin #3 · Seamless Pattern · Tableau suggéré : Winter Seamless Patterns & Digital Paper',
                  title: SKI_PIN3_TITLE,
                  desc: SKI_PIN3_DESC,
                },
              ].map((pin) => (
                <div key={pin.id} className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2.5">
                  <p className="text-[11px] uppercase tracking-widest text-[#1B3B5A] font-medium">
                    {pin.badge}
                  </p>
                  <div className="flex items-start justify-between gap-2 bg-[#F6F2EC] p-2.5 border border-[#E5DDD0]">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-[#78716C] mb-0.5">
                        Pin Title (EN)
                      </span>
                      <p className="text-xs font-medium text-[#1C1917] select-all">{pin.title}</p>
                    </div>
                    <CopyButton text={pin.title} label="Copier Titre" copiedLabel="Copié" />
                  </div>
                  <div className="flex items-start justify-between gap-2 bg-[#F6F2EC] p-2.5 border border-[#E5DDD0]">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-[#78716C] mb-0.5">
                        Pin Description (EN)
                      </span>
                      <p className="text-[11px] text-[#2C2520] leading-relaxed select-all">
                        {pin.desc}
                      </p>
                    </div>
                    <CopyButton text={pin.desc} label="Copier Desc." copiedLabel="Copiée" />
                  </div>
                </div>
              ))}

              <div className="bg-[#FAF6F0] border border-[#E5DDD0] p-3.5 space-y-2.5">
                <p className="text-[11px] uppercase tracking-widest text-[#7A1621] font-medium">
                  TikTok &amp; Reels · Carrousel Photo 7 Slides (« Which one: 1–5? »)
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                      Textes à afficher sur chaque slide TikTok (EN)
                    </span>
                    <CopyButton
                      text={SKI_TIKTOK_OVERLAY_SCRIPT}
                      label="Copier Script"
                      copiedLabel="Script Copié"
                    />
                  </div>
                  <pre className="text-[11px] text-[#2C2520] whitespace-pre-wrap font-sans leading-relaxed bg-[#F6F2EC] p-3 border border-[#E5DDD0]">
                    {SKI_TIKTOK_OVERLAY_SCRIPT}
                  </pre>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-[#78716C] font-medium">
                      Légende &amp; Hashtags TikTok / Instagram Reels (EN)
                    </span>
                    <CopyButton
                      text={SKI_TIKTOK_CAPTION}
                      label="Copier Légende"
                      copiedLabel="Légende Copiée"
                    />
                  </div>
                  <pre className="text-[11px] text-[#2C2520] whitespace-pre-wrap font-sans leading-relaxed bg-[#F6F2EC] p-3 border border-[#E5DDD0]">
                    {SKI_TIKTOK_CAPTION}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Product 8 Etsy Formats Exporter (300 DPI PNG) */}
          <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#78716C]">
                  Stratégie 10 Listings/Jour · Même motif, 8 nouveaux produits
                </p>
                <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                  Convertisseur Multi-Produits Etsy (PNG 300 DPI · sRGB)
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                Motif actif · Échelle {horizontalRepeats}×
              </span>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              Transformez instantanément votre motif actif (<strong>{uploadedFile ? uploadedFile.name : activePreset.label}</strong>)
              en 8 autres formats Etsy 300 DPI sans recréer de visuel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MULTI_PRODUCT_FORMATS.map((fmt) => {
                const isExporting = exportingFormatId === fmt.id;
                const isDone = exportedFormatId === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    disabled={exportingFormatId !== null}
                    onClick={() => handleExportMultiProduct(fmt.id)}
                    className="text-left p-3 bg-[#FAF6F0] border border-[#D6CEBE] hover:border-[#1C1917] hover:bg-[#EDE6DA] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#1C1917] truncate">
                        {fmt.label}
                      </div>
                      <div className="font-mono text-[10px] text-[#78716C] truncate mt-0.5">
                        {fmt.dimensionsLabel} · {fmt.recommendedPrice}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 bg-[#2C2520] text-[#FAF6F0]">
                      {isExporting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      ) : isDone ? (
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
