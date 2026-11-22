import { useState } from 'react';
import { Calendar, Check, Download, ExternalLink, FileText, Loader2, ShieldAlert } from 'lucide-react';
import { fetchAndDownloadDeliverable } from '../utils/deliverableDownload';
import { CopyButton } from './CopyButton';

const CHECKLIST_ROWS = [
  {
    step: 'Titre SEO (EN)',
    rule: 'Max 140 caractères · Terminer par « Digital Download »',
    verify: 'Mot-clé fort au tout début (ex: Heritage Tartan 11oz Mug Wrap...)',
  },
  {
    step: '13 Tags Etsy (EN)',
    rule: 'Exactement 13 tags · Chacun <= 20 caractères',
    verify: 'Varier les produits, usages & styles · Aucun doublon pluriel',
  },
  {
    step: 'Qualité & Poids',
    rule: '300 DPI + sRGB · < 20 Mo/fichier (max 5 fichiers Etsy)',
    verify: 'Si total > 20 Mo : 1 PDF Cliquable + lien Google Drive',
  },
  {
    step: 'Visuels Listing',
    rule: '1ère photo Mockup lumineux + 3 à 5 slides + Vidéo 5-15s',
    verify: 'Produit fini en 1ère image + grille motifs + guide dimensions',
  },
  {
    step: 'Sécurité Marques',
    rule: 'Zéro marque protégée (titres, tags, description, mockups)',
    verify: 'Jamais Burberry, Ralph Lauren, Polo, Stanley, Libbey, Yeti, Cricut',
  },
  {
    step: 'Transparence',
    rule: 'Mentionner « Digital File Only · No Physical Item »',
    verify: 'Résolution 300 DPI vérifiée numériquement (pas de test presse)',
  },
];

const PRODUCT_MATRIX_ROWS = [
  {
    product: '20 oz Tumbler Wrap (Straight + Tapered)',
    size: '2790×2460 px (9.3×8.2 in)',
    price: '$3.90 – $4.90',
    keyword: '20oz Skinny Tumbler Wrap Sublimation',
    tags: '20oz tumbler wrap, skinny tumbler png, sublimation wrap',
    tool: 'Tumbler Wrap 20 oz',
  },
  {
    product: '11 oz Mug Wrap',
    size: '2550×1050 px (8.5×3.5 in)',
    price: '$3.90 – $5.90',
    keyword: '11oz Mug Wrap Sublimation Template',
    tags: '11oz mug wrap, coffee mug png, mug sublimation',
    tool: 'Multi-Produits Etsy',
  },
  {
    product: '15 oz Mug Wrap',
    size: '2700×1200 px (9.0×4.0 in)',
    price: '$3.90 – $5.90',
    keyword: '15oz Coffee Mug Sublimation Wrap',
    tags: '15oz mug wrap, tartan mug wrap, holiday mug png',
    tool: 'Multi-Produits Etsy',
  },
  {
    product: '16 oz Glass Can Wrap',
    size: '2820×1290 px (9.4×4.3 in)',
    price: '$4.50 – $6.50',
    keyword: '16oz Beer Glass Can Wrap PNG',
    tags: '16oz glass can wrap, iced coffee wrap, beer can glass png',
    tool: 'Multi-Produits Etsy',
  },
  {
    product: 'Ornement / Sous-verre Rond',
    size: '1200×1200 px (4×4 in Transp.)',
    price: '$3.50 – $4.90',
    keyword: 'Round Sublimation Ornament Coaster PNG',
    tags: 'round ornament png, coaster sublimation, circle wrap png',
    tool: 'Multi-Produits Etsy',
  },
  {
    product: 'Tissu / Coussin Seamless',
    size: '3600×3600 px (12×12 in)',
    price: '$4.90 – $7.90',
    keyword: 'Seamless Fabric Pattern Digital Paper',
    tags: 'seamless pattern, fabric design png, cushion pattern',
    tool: 'Multi-Produits Etsy',
  },
  {
    product: 'Papier Cadeau US Letter',
    size: '2550×3300 px (8.5×11 in)',
    price: '$3.50 – $5.50',
    keyword: 'Printable Christmas Wrapping Paper',
    tags: 'printable wrap, tartan gift wrap, holiday scrapbook',
    tool: 'Multi-Produits Etsy',
  },
  {
    product: "Fond d'écran Téléphone",
    size: '1290×2796 px (Lockscreen)',
    price: '$2.90 – $3.90',
    keyword: 'Preppy Aesthetic Phone Wallpaper',
    tags: 'iphone wallpaper, preppy lockscreen, tartan wallpaper',
    tool: 'Multi-Produits Etsy',
  },
  {
    product: 'Pen Wrap Sublimation',
    size: '1425×450 px (4.75×1.5 in)',
    price: '$2.90 – $4.50',
    keyword: 'Sublimation Pen Wrap Design PNG',
    tags: 'pen wrap png, epoxy pen wrap, glitter pen template',
    tool: 'Multi-Produits Etsy',
  },
];

const PACKS_ROWS = [
  {
    pack: 'Mini-Pack #1 (En ligne)',
    motifs: '01, 02, 03, 12 V2 (Heritage Argyle)',
    delivery: 'PDF Cliquable (680 Ko) + Drive',
    price: '$4.90 (promo -30% : $3.43)',
    driveUrl: 'https://drive.google.com/drive/folders/1NmbaIP7LgSdrxEvTUzJtIWDNLIb1lTk9?usp=sharing',
    driveLabel: 'Dossier Drive Mini-Pack 4',
  },
  {
    pack: 'Mini-Pack #2 (Prêt PDF)',
    motifs: '04, 05, 06, 07 (4 motifs)',
    delivery: 'PDF Cliquable (506 Ko) + Drive',
    price: '$4.90 (promo -30% : $3.43)',
    driveUrl: 'https://drive.google.com/drive/folders/1fEALwVoHPnuN945qK4YIjrrKhR6ic0kn?usp=sharing',
    driveLabel: 'Dossier Drive Mini-Pack #2',
  },
  {
    pack: 'Mini-Pack #3 (Prêt PDF)',
    motifs: '08, 09, 10, 11 (4 motifs V2)',
    delivery: 'PDF Cliquable (713 Ko) + Drive',
    price: '$4.90 (promo -30% : $3.43)',
    driveUrl: 'https://drive.google.com/drive/folders/1rk7T6xYu0Pd5f2gahWQrWwau99dpxjIA?usp=sharing',
    driveLabel: 'Dossier Drive Mini-Pack #3',
  },
  {
    pack: 'Grand Bundle 12 Motifs',
    motifs: '01 à 12 complet (24 PNGs)',
    delivery: 'PDF Cliquable + Drive principal',
    price: '$11.90 (Ancre prix haute)',
    driveUrl: 'https://drive.google.com/drive/folders/1Ml6yybt9-Me88vr_hgaKuycaf-8UL3-6?usp=sharing',
    driveLabel: 'Dossier Drive Bundle 12',
  },
  {
    pack: 'Collection 2 · Ski Lodge #1 (Prêt PDF)',
    motifs: 'SL-01 à SL-05 (10 PNGs Straight + Tapered)',
    delivery: 'PDF Cliquable (483 Ko) + Drive',
    price: '$4.90 (promo -30% : $3.43)',
    driveUrl: 'https://drive.google.com/drive/folders/1o9sDAMYT7ndw8ZYYE5bRFn-ODqRLRa91?usp=sharing',
    driveLabel: 'Dossier Drive Ski Lodge #1',
  },
];

const DAILY_PLAN_ROWS = [
  {
    day: 'Jour 1',
    batch: 'Mini-Pack #2 + Mini-Pack #3 + 8 fiches Tumbler 20 oz individuelles (#04 à #11)',
    goal: "Saturer la requête 'Heritage Tartan 20oz Tumbler Wrap'",
  },
  {
    day: 'Jour 2',
    batch: '10 fiches Mug 11 oz & 15 oz Wrap (motifs #01 à #05 en 11 oz et 15 oz)',
    goal: 'Capturer les vendeurs POD & Printify/CustomCat de mugs',
  },
  {
    day: 'Jour 3',
    batch: '10 fiches 16 oz Glass Can Wrap (motifs #01 à #10 · échelle 3×)',
    goal: "Cibler le mot-clé fort '16oz Glass Can Wrap'",
  },
  {
    day: 'Jour 4',
    batch: '10 fiches Ornement Rond + Sous-verre + Coussin Seamless 3600²',
    goal: 'Attirer les créatrices Spoonflower, tissus & déco Noël',
  },
  {
    day: 'Jour 5',
    batch: '10 fiches Papier Cadeau Letter + Pen Wraps + Phone Wallpapers',
    goal: 'Multiplier les petits paniers ($2.90–$3.90) & favoris boutique',
  },
];

const TM_REDLIST_ROWS = [
  {
    forbidden: 'Ralph Lauren / Polo / RL Bear',
    safe: 'Old Money Heritage / Classic Equestrian / Preppy Country Club',
  },
  {
    forbidden: 'Burberry / Novacheck',
    safe: 'Camel Black Red Plaid / Classic British Tartan / Heritage Check',
  },
  {
    forbidden: 'Stanley / Yeti / Hydro Flask',
    safe: '20oz Skinny Tumbler / Insulated Travel Mug Wrap',
  },
  {
    forbidden: 'Libbey',
    safe: '16oz Frosted Glass Can / Iced Coffee Glass Wrap',
  },
  {
    forbidden: 'Cricut / Silhouette (en titre promo)',
    safe: 'Sublimation PNG / Printable Transfer / Craft Wrap',
  },
];

const EVENT_CALENDAR_ROWS = [
  {
    publishWindow: '15 Nov – 10 Déc (MAINTENANT)',
    eventName: 'Fin Noël + Cozy Winter / Après-Ski',
    peakDate: 'Déc – Janvier',
    niches: "Heritage Tartan SANS le mot 'Christmas' : Winter Cabin, Alpine Plaid, Cocoa Season",
    products: 'Tumblers 20oz, Mugs 11/15oz, Coussins',
  },
  {
    publishWindow: '25 Nov – 15 Jan',
    eventName: "Saint-Valentin & Galentine's Day",
    peakDate: '14 Février',
    niches: 'Coquette Velvet Bow, Pink & Burgundy Tartan, Cherry Check, Love Letter Toile',
    products: '16oz Glass Can, Tumblers, Phone Wallpaper, Papier',
  },
  {
    publishWindow: '10 Jan – 15 Fév',
    eventName: 'Saint-Patrick & Printemps / Pâques',
    peakDate: '17 Mars & Avril',
    niches: 'Emerald Hunter Plaid (Lucky Vibes), Pastel Easter Gingham, Spring Florals, Bunny Toile',
    products: '16oz Glass Can, Mugs, Sous-verres, Tissus',
  },
  {
    publishWindow: '15 Fév – 31 Mars',
    eventName: 'Fête des Mères, Professeurs & Diplômes',
    peakDate: 'Mai – Juin',
    niches: 'Botanical Heritage, French Toile de Jouy, Teacher Plaid, Preppy Class Monogram',
    products: 'Mugs 11/15oz, Tumblers, Pen Wraps, Glass Can',
  },
  {
    publishWindow: '1er Avril – 20 Mai',
    eventName: 'Mariages, Été, Fête des Pères & 4 Juillet (USA)',
    peakDate: 'Juin – Juillet',
    niches: 'Coastal Grandmother Blue/White, Bridal Monogram Crest, Americana Heritage Check',
    products: '16oz Glass Can, Tumblers, Coussins, Papier Cadeau',
  },
  {
    publishWindow: '15 Juin – 15 Août',
    eventName: 'Rentrée Scolaire, Football US & Automne',
    peakDate: 'Août – Octobre',
    niches: 'Dark Academia Plaid, Fall Harvest Gingham, Pumpkin & Tartan, Cozy Equestrian',
    products: 'Tumblers, Pen Wraps, Mugs, Tissus 3600²',
  },
  {
    publishWindow: '1er Août – 15 Sept',
    eventName: 'Halloween & Thanksgiving',
    peakDate: '31 Oct & Fin Nov',
    niches: 'Spooky Pastel Coquette, Moody Gothic Plaid, Autumn Harvest Tablecloth Check',
    products: '16oz Glass Can, Papier Cadeau, Ornement, Mugs',
  },
  {
    publishWindow: '1er Sept – 20 Nov',
    eventName: 'Q4 Noël, Black Friday & Cyber Monday (Pic N°1)',
    peakDate: 'Nov – Décembre',
    niches: 'Heritage Christmas Tartan, Velvet Bow + Argyle, Nutcracker Old Money, Festive Plaid',
    products: 'Bundles 4 & 12, Tumblers, Ornements, Papier Cadeau',
  },
];

const SHOP_SECTIONS_ROWS = [
  {
    section: '20 oz Tumbler Bundles',
    contents: 'Bundle 12 ($11.90) + Mini-Pack #1, #2, #3 ($4.90)',
    role: 'Ancre prix haute + meilleur panier moyen',
  },
  {
    section: '20 oz Single Tumblers',
    contents: 'Fiches unitaires #01 à #12 ($3.90–$4.50 · upload direct <20 Mo)',
    role: 'Capturer les recherches longue traîne par couleur/motif',
  },
  {
    section: '11 oz & 15 oz Mug Wraps',
    contents: 'Déclinaisons Mugs des meilleurs motifs (Multi-Produits Etsy)',
    role: 'Cibler vendeurs POD & cadeaux hiver/bureau',
  },
  {
    section: '16 oz Glass Can Wraps',
    contents: 'Iced Coffee / Frosted Glass wraps (échelle 3×)',
    role: 'Top format tendance Janvier & Saint-Valentin',
  },
  {
    section: 'Winter & Après-Ski PNG',
    contents: 'Motifs sans le mot Christmas : Alpine, Cozy Cabin, Knit, Equestrian',
    role: 'Prolonger les ventes de fin novembre à mars',
  },
  {
    section: "Valentine's & Galentine's",
    contents: 'Coquette Bow, Pink Gingham, Cherry Check, Heart Toile',
    role: 'Pic d’achat Janvier → 14 Février (publier dès maintenant)',
  },
  {
    section: 'Seamless & Printables',
    contents: 'Tuiles 3600×3600, Papier Cadeau Letter, Pen Wraps, Wallpapers',
    role: 'Petits prix ($2.90–$5.50) qui augmentent le nombre de ventes',
  },
];

const SALE_SAMURAI_RULES = [
  {
    metric: 'Search Volume (Mensuel)',
    target: '300 à 3 000+ / mois',
    action: 'Éviter les mots-clés à < 100 recherches sauf hyper-niches très acheteuses',
  },
  {
    metric: 'Etsy Competition',
    target: '2 000 à 25 000 résultats max',
    action: 'Si > 50 000 résultats, ajouter 1 à 2 adjectifs (couleur, style, format)',
  },
  {
    metric: 'Exact Match Titre + Tags',
    target: '2–3 expressions exactes dans les 60 1ers car.',
    action: 'Copier exactement les mêmes expressions longue traîne dans les 13 tags (<=20 car.)',
  },
  {
    metric: 'Pricing Sale Samurai',
    target: 'Autour de la médiane + promo -25/-30%',
    action: 'Ex. $3.90 unitaire, $4.90 Mini-Pack 4, $11.90 Bundle 12 (effet contraste)',
  },
];

const JANUARY_ROADMAP_ROWS = [
  {
    wave: 'Fin Décembre / Hiver (Immédiat)',
    theme: 'Après-Ski, Cozy Cabin & Old Money Winter (0 mot Christmas)',
    saleSamuraiSeeds: 'winter plaid tumbler wrap, ski lodge mug wrap, fair isle tumbler png, dark academia plaid, equestrian tartan png',
    formats: 'Recycler motifs 03, 06, 09, 10, 11 + nouvelle mini-collection Knit/Ski',
  },
  {
    wave: 'Nouvel An & Janvier (Reset)',
    theme: 'New Year Disco, Clean Girl Pastel, Pilates / Matcha & Bookish',
    saleSamuraiSeeds: 'disco ball glass can, new year tumbler wrap, pilates coquette png, matcha iced coffee wrap, bookish mug wrap png',
    formats: '16 oz Glass Can, 20 oz Tumbler, Phone Lockscreen, Pen Wraps',
  },
  {
    wave: 'Pic Janvier -> 14 Fév (Priorité #1)',
    theme: "Saint-Valentin & Galentine's Coquette (publier dès fin Nov/Déc)",
    saleSamuraiSeeds: 'coquette bow glass can, pink gingham wrap, cherry tumbler wrap, valentines mug wrap, heart toile seamless',
    formats: '16 oz Glass Can Wrap, 20 oz Tumbler (Mini-Packs de 4 + Bundle 12)',
  },
];

const SHOP_ANNOUNCEMENT_EN = `Welcome to Plume Digital Shop — Print-Ready 300 DPI Seamless Patterns & Sublimation Wraps!
INSTANT DIGITAL DOWNLOAD ONLY (No physical items are shipped).
Every wrap is crafted at 300 DPI in vivid sRGB with verified 360° seamless alignment for 20 oz skinny tumblers (Straight & Tapered), 11/15 oz mugs, and 16 oz glass cans.
Small-business physical commercial use is included on every listing. Message us anytime for custom bundle requests or file help!`;

const NEXT_LISTING_PIPELINE_ROWS = [
  {
    phase: 'Phase 1 · Immédiat (Post-Bundle 12)',
    listings: 'Mini-Pack #1 (01–03, 12), Mini-Pack #2 (04–07), Mini-Pack #3 (08–11)',
    section: '20 oz Tumbler Bundles',
    seoFocus: 'Ancre $11.90 déjà en ligne → publier les 3 Mini-Packs à $4.90 (promo -30% : $3.43) via PDF cliquable',
    targetCount: '3 fiches (PDF Drive)',
  },
  {
    phase: 'Phase 2 · Jours 1–2 (Unitaires + Hiver)',
    listings: '8 fiches unitaires #04–#11 + 4 fiches "Winter Cabin Plaid" (03, 06, 09, 10 sans mot Christmas)',
    section: '20 oz Single Tumblers / Winter & Après-Ski PNG',
    seoFocus: 'Upload PNG direct <20 Mo (sans Drive) · $3.90–$4.50 · Capter winter tumbler wrap (16 081 SV)',
    targetCount: '12 fiches directes',
  },
  {
    phase: 'Phase 3 · Jours 3–4 (Multi-Produits)',
    listings: 'Mugs 11/15 oz + 16 oz Glass Can + Seamless 3600² sur vos 4 meilleurs motifs Heritage',
    section: '11 oz & 15 oz Mug Wraps / 16 oz Glass Can / Seamless',
    seoFocus: 'Exporter en 1 clic dans Multi-Produits Etsy · $3.90–$5.90 · Zéro nouveau visuel à créer',
    targetCount: '10 à 12 fiches',
  },
  {
    phase: 'Phase 4 · Semaine 2 (Pépite Sale Samurai)',
    listings: 'Collection Ski Lodge & Après-Ski (4 motifs Chalet + 4 motifs Animaux Skieurs / Ski Trip)',
    section: 'Winter & Après-Ski PNG / 20 oz Single Tumblers',
    seoFocus: 'Exact-Match JSON : ski lodge (26 703 SV), ski tumbler (22 357 SV), skiing gift (40 857 SV), skier gift (27 848 SV)',
    targetCount: '10 à 16 fiches + 2 Mini-Packs',
  },
  {
    phase: 'Phase 5 · Fin Nov – Déc (Pic Janvier J-60)',
    listings: 'New Year Disco / Pilates Matcha + Collection Saint-Valentin Coquette (Bow, Pink Gingham, Cherry)',
    section: "16 oz Glass Can Wraps / Valentine's & Galentine's",
    seoFocus: 'Valider d’abord dans Sale Samurai (Competition <25 000) · Priorité 16 oz Glass Can + 20 oz Tumbler',
    targetCount: '12 à 20 fiches',
  },
];

function buildPlaybookMarkdown(): string {
  const lines: string[] = [
    '# PLUME DIGITAL SHOP — PLAYBOOK STRATÉGIE ETSY (RÉFÉRENCE PERMANENTE)',
    '',
    '## 1. CHECKLIST OBLIGATOIRE AVANT CHAQUE LISTING',
    '| Étape | Règle Stricte Etsy | Vérification |',
    '|---|---|---|',
    ...CHECKLIST_ROWS.map((r) => `| ${r.step} | ${r.rule} | ${r.verify} |`),
    '',
    '## 2. MATRICE MULTI-PRODUITS (1 PNG SEAMLESS 3600×3600 -> 9 LISTINGS ETSY)',
    '| Produit Etsy | Dimensions (300 DPI) | Prix USD | Angle SEO Principal (EN) | 3 Tags Clés (<=20 car.) |',
    '|---|---|---|---|---|',
    ...PRODUCT_MATRIX_ROWS.map(
      (r) => `| ${r.product} | ${r.size} | ${r.price} | ${r.keyword} | ${r.tags} |`
    ),
    '',
    '## 3. CATALOGUE PACKS & PRICING PSYCHOLOGIQUE',
    '| Pack | Motifs Inclus | Livraison Etsy | Prix Cible | Lien Drive / Action |',
    '|---|---|---|---|---|',
    ...PACKS_ROWS.map(
      (r) => `| ${r.pack} | ${r.motifs} | ${r.delivery} | ${r.price} | ${r.driveUrl || r.driveLabel} |`
    ),
    '',
    '## 4. ROUTINE PUBLICATION QUOTIDIENNE',
    '| Jour | Lot à Publier | Objectif SEO Etsy |',
    '|---|---|---|',
    ...DAILY_PLAN_ROWS.map((r) => `| ${r.day} | ${r.batch} | ${r.goal} |`),
    '',
    '## 5. LISTE ROUGE MARQUES DÉPOSÉES -> ALTERNATIVES SÛRES',
    '| TERME INTERDIT (TM) | ALTERNATIVE SEO SÛRE (EN) |',
    '|---|---|',
    ...TM_REDLIST_ROWS.map((r) => `| ${r.forbidden} | ${r.safe} |`),
    '',
    '## 6. CALENDRIER ANNUEL DES ÉVÉNEMENTS ETSY (RÈGLE J-45 À J-60)',
    '| Quand Publier | Événement / Pic Visé | Date du Pic | Micro-Niches Plume (0 TM) | Produits Prioritaires |',
    '|---|---|---|---|---|',
    ...EVENT_CALENDAR_ROWS.map(
      (r) => `| ${r.publishWindow} | ${r.eventName} | ${r.peakDate} | ${r.niches} | ${r.products} |`
    ),
    '',
    '## 7. ORGANISATION SHOP ETSY (7 SECTIONS)',
    '| Section Boutique | Contenu | Rôle Stratégique |',
    '|---|---|---|',
    ...SHOP_SECTIONS_ROWS.map((r) => `| ${r.section} | ${r.contents} | ${r.role} |`),
    '',
    '## 8. MÉTHODE SALE SAMURAI & FEUILLE DE ROUTE FIN D’ANNÉE / JANVIER',
    '| Vague | Thème (0 TM) | Mots-Clés à Tester dans Sale Samurai | Formats Prioritaires |',
    '|---|---|---|---|',
    ...JANUARY_ROADMAP_ROWS.map(
      (r) => `| ${r.wave} | ${r.theme} | ${r.saleSamuraiSeeds} | ${r.formats} |`
    ),
    '',
    '## 9. PLAN D’EXÉCUTION DES PROCHAINS LISTINGS (POST-BUNDLE 12)',
    '| Phase | Lots à Publier | Section Etsy | Stratégie SEO & Prix | Volume |',
    '|---|---|---|---|---|',
    ...NEXT_LISTING_PIPELINE_ROWS.map(
      (r) => `| ${r.phase} | ${r.listings} | ${r.section} | ${r.seoFocus} | ${r.targetCount} |`
    ),
  ];
  return lines.join('\n');
}

export function EtsyPlaybookStudio() {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadedDocx, setDownloadedDocx] = useState(false);

  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      await fetchAndDownloadDeliverable('PLUME_Etsy_Strategy_Playbook_SOP.docx');
      setDownloadedDocx(true);
      window.setTimeout(() => setDownloadedDocx(false), 3000);
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <section className="pt-6 space-y-10">
      {/* Header & Download Actions */}
      <div className="border-b border-[#E5DDD0] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-[#78716C]">
            Plume Digital Shop · Document de Référence SOP
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1C1917]">
            Playbook Stratégie Etsy &amp; Matrice 10 Listings/Jour
          </h2>
          <p className="text-sm text-[#57534E] leading-relaxed">
            Retrouvez ici toutes vos règles Etsy, dimensions 300 DPI, prix psychologiques, liens
            Google Drive et le planning 10 listings/jour sans jamais fouiller dans l’historique.
            Téléchargez aussi le fichier Word (<span className="font-mono">.docx</span>) ouvrable
            directement dans Google Docs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <CopyButton
            text={buildPlaybookMarkdown()}
            label="Copier Tableaux (Markdown)"
            copiedLabel="Tableaux Copiés"
          />
          <button
            type="button"
            disabled={downloadingDocx}
            onClick={handleDownloadDocx}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#7A1621] text-[#FAF6F0] hover:bg-[#5E1019] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            {downloadingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : downloadedDocx ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>
              {downloadingDocx
                ? 'Téléchargement...'
                : downloadedDocx
                  ? 'Doc Téléchargé !'
                  : 'Télécharger Tableau Doc (.docx)'}
            </span>
          </button>
        </div>
      </div>

      {/* Table 1: Checklist */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A1621] font-medium">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>01 · Checklist Obligatoire Avant Chaque Publication</span>
        </div>
        <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#2C2520] text-[#FAF6F0]">
                <th className="p-3 font-medium">Étape</th>
                <th className="p-3 font-medium">Règle Stricte Etsy</th>
                <th className="p-3 font-medium">Vérification Rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {CHECKLIST_ROWS.map((row) => (
                <tr key={row.step} className="hover:bg-[#FAF6F0]/70 transition-colors">
                  <td className="p-3 font-medium text-[#1C1917] whitespace-nowrap">{row.step}</td>
                  <td className="p-3 text-[#2C2520]">{row.rule}</td>
                  <td className="p-3 text-[#57534E]">{row.verify}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Multi-Product Matrix */}
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-[#7A1621] font-medium">
          02 · Matrice Multi-Produits (1 PNG Seamless 3600×3600 &rarr; 9 Listings Etsy)
        </div>
        <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#7A1621] text-[#FAF6F0]">
                <th className="p-3 font-medium">Produit Etsy</th>
                <th className="p-3 font-medium">Dimensions 300 DPI</th>
                <th className="p-3 font-medium">Prix USD</th>
                <th className="p-3 font-medium">Mot-Clé Titre (EN)</th>
                <th className="p-3 font-medium">3 Tags Clés (&le;20 car.)</th>
                <th className="p-3 font-medium">Outil dans Plume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {PRODUCT_MATRIX_ROWS.map((row) => (
                <tr key={row.product} className="hover:bg-[#FAF6F0]/70 transition-colors">
                  <td className="p-3 font-medium text-[#1C1917]">{row.product}</td>
                  <td className="p-3 font-mono text-[11px] text-[#2C2520] whitespace-nowrap">
                    {row.size}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-[#7A1621] font-medium whitespace-nowrap">
                    {row.price}
                  </td>
                  <td className="p-3 text-[#2C2520]">{row.keyword}</td>
                  <td className="p-3 text-[#57534E]">{row.tags}</td>
                  <td className="p-3 font-medium text-[#1C1917] whitespace-nowrap">{row.tool}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3: Packs & Drive Architecture */}
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-[#7A1621] font-medium">
          03 · Architecture des Packs &amp; Liens Google Drive
        </div>
        <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#2C2520] text-[#FAF6F0]">
                <th className="p-3 font-medium">Pack</th>
                <th className="p-3 font-medium">Motifs Inclus</th>
                <th className="p-3 font-medium">Livraison Etsy</th>
                <th className="p-3 font-medium">Prix &amp; Stratégie</th>
                <th className="p-3 font-medium">Dossier Google Drive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {PACKS_ROWS.map((row) => (
                <tr key={row.pack} className="hover:bg-[#FAF6F0]/70 transition-colors">
                  <td className="p-3 font-medium text-[#1C1917]">{row.pack}</td>
                  <td className="p-3 text-[#2C2520]">{row.motifs}</td>
                  <td className="p-3 text-[#57534E]">{row.delivery}</td>
                  <td className="p-3 font-medium text-[#7A1621]">{row.price}</td>
                  <td className="p-3">
                    {row.driveUrl ? (
                      <a
                        href={row.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#1C1917] underline underline-offset-4 hover:text-[#7A1621]"
                      >
                        <span>{row.driveLabel}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-[#57534E]">{row.driveLabel}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 4 & 5: Daily 10/day Plan + TM Redlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-[#7A1621] font-medium">
            04 · Planning Routine 10 Listings / Jour
          </div>
          <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#2C2520] text-[#FAF6F0]">
                  <th className="p-3 font-medium">Jour</th>
                  <th className="p-3 font-medium">Lot à Publier</th>
                  <th className="p-3 font-medium">Objectif SEO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0]">
                {DAILY_PLAN_ROWS.map((row) => (
                  <tr key={row.day} className="hover:bg-[#FAF6F0]/70 transition-colors">
                    <td className="p-3 font-medium text-[#1C1917] whitespace-nowrap">{row.day}</td>
                    <td className="p-3 text-[#2C2520]">{row.batch}</td>
                    <td className="p-3 text-[#57534E]">{row.goal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A1621] font-medium">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>05 · Liste Rouge Marques Déposées (Zéro Suspension)</span>
          </div>
          <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#7A1621] text-[#FAF6F0]">
                  <th className="p-3 font-medium">Terme Interdit (TM)</th>
                  <th className="p-3 font-medium">Alternative SEO Sûre (EN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0]">
                {TM_REDLIST_ROWS.map((row) => (
                  <tr key={row.forbidden} className="hover:bg-[#FAF6F0]/70 transition-colors">
                    <td className="p-3 font-medium text-[#9A3412]">{row.forbidden}</td>
                    <td className="p-3 text-[#1C1917]">{row.safe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Table 6: Annual Etsy Event Calendar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A1621] font-medium">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>06 · Calendrier Annuel des Événements &amp; Pics d’Achat Etsy (Règle J-45 à J-60)</span>
          </div>
          <span className="text-[11px] text-[#57534E]">
            Les créatrices achètent 6 à 8 semaines avant chaque fête
          </span>
        </div>
        <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#7A1621] text-[#FAF6F0]">
                <th className="p-3 font-medium">Fenêtre de Publication</th>
                <th className="p-3 font-medium">Événement Visé</th>
                <th className="p-3 font-medium">Pic Réel</th>
                <th className="p-3 font-medium">Micro-Niches Plume (0 TM)</th>
                <th className="p-3 font-medium">Produits Prioritaires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {EVENT_CALENDAR_ROWS.map((row) => (
                <tr key={row.publishWindow} className="hover:bg-[#FAF6F0]/70 transition-colors">
                  <td className="p-3 font-medium text-[#7A1621] whitespace-nowrap">
                    {row.publishWindow}
                  </td>
                  <td className="p-3 font-medium text-[#1C1917]">{row.eventName}</td>
                  <td className="p-3 font-mono text-[11px] text-[#2C2520] whitespace-nowrap">
                    {row.peakDate}
                  </td>
                  <td className="p-3 text-[#2C2520]">{row.niches}</td>
                  <td className="p-3 text-[#57534E]">{row.products}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 7: Shop Organization, Sale Samurai & January Launch */}
      <div className="space-y-6 pt-4 border-t border-[#E5DDD0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#7A1621] font-medium">
              07 · Organisation Boutique Etsy, Filtres Sale Samurai &amp; Plan Janvier / Fin d’Année
            </div>
            <p className="text-xs text-[#57534E] mt-1">
              Structurez vos 7 sections Etsy après le Bundle 12, puis validez chaque niche de fin d’année et de janvier dans Sale Samurai.
            </p>
          </div>
          <CopyButton
            text={SHOP_ANNOUNCEMENT_EN}
            label="Copier Shop Announcement (EN)"
            copiedLabel="Announcement Copié"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#2C2520] text-[#FAF6F0]">
                  <th className="p-3 font-medium">Section Etsy (EN)</th>
                  <th className="p-3 font-medium">Produits à ranger</th>
                  <th className="p-3 font-medium">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0]">
                {SHOP_SECTIONS_ROWS.map((row) => (
                  <tr key={row.section} className="hover:bg-[#FAF6F0]/70 transition-colors">
                    <td className="p-3 font-medium text-[#1C1917] whitespace-nowrap">{row.section}</td>
                    <td className="p-3 text-[#2C2520]">{row.contents}</td>
                    <td className="p-3 text-[#57534E]">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#7A1621] text-[#FAF6F0]">
                  <th className="p-3 font-medium">Critère Sale Samurai</th>
                  <th className="p-3 font-medium">Seuil Cible</th>
                  <th className="p-3 font-medium">Action SEO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0]">
                {SALE_SAMURAI_RULES.map((row) => (
                  <tr key={row.metric} className="hover:bg-[#FAF6F0]/70 transition-colors">
                    <td className="p-3 font-medium text-[#1C1917] whitespace-nowrap">{row.metric}</td>
                    <td className="p-3 font-mono text-[11px] text-[#7A1621]">{row.target}</td>
                    <td className="p-3 text-[#57534E]">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#2C2520] text-[#FAF6F0]">
                <th className="p-3 font-medium">Vague Lancement</th>
                <th className="p-3 font-medium">Thème Rentable (0 TM)</th>
                <th className="p-3 font-medium">Requêtes à tester dans Sale Samurai</th>
                <th className="p-3 font-medium">Formats Prioritaires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {JANUARY_ROADMAP_ROWS.map((row) => (
                <tr key={row.wave} className="hover:bg-[#FAF6F0]/70 transition-colors">
                  <td className="p-3 font-medium text-[#7A1621] whitespace-nowrap">{row.wave}</td>
                  <td className="p-3 font-medium text-[#1C1917]">{row.theme}</td>
                  <td className="p-3 font-mono text-[11px] text-[#2C2520]">{row.saleSamuraiSeeds}</td>
                  <td className="p-3 text-[#57534E]">{row.formats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 8: Next Listings Execution Pipeline */}
      <div className="space-y-3 pt-4 border-t border-[#E5DDD0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-widest text-[#7A1621] font-medium">
            08 · Plan d’Exécution des Prochains Listings (Post-Bundle 12 → Ski Lodge → Janvier)
          </div>
          <span className="text-[11px] text-[#57534E]">
            Objectif : 45 à 60 fiches actives structurées avant le pic de Janvier
          </span>
        </div>
        <div className="overflow-x-auto border border-[#E5DDD0] bg-[#F6F2EC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#7A1621] text-[#FAF6F0]">
                <th className="p-3 font-medium">Phase</th>
                <th className="p-3 font-medium">Fiches à Publier</th>
                <th className="p-3 font-medium">Section Boutique</th>
                <th className="p-3 font-medium">Focus SEO &amp; Prix</th>
                <th className="p-3 font-medium">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]">
              {NEXT_LISTING_PIPELINE_ROWS.map((row) => (
                <tr key={row.phase} className="hover:bg-[#FAF6F0]/70 transition-colors">
                  <td className="p-3 font-medium text-[#7A1621] whitespace-nowrap">{row.phase}</td>
                  <td className="p-3 font-medium text-[#1C1917]">{row.listings}</td>
                  <td className="p-3 text-[#2C2520]">{row.section}</td>
                  <td className="p-3 text-[#57534E]">{row.seoFocus}</td>
                  <td className="p-3 font-mono text-[11px] text-[#1C1917] whitespace-nowrap">
                    {row.targetCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
