import 'dotenv/config';
import express from 'express';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PLUME_SYSTEM_INSTRUCTION = `You are the Senior Digital Product Strategist & Creative Director for "PLUME STYLE" (Plume Digital Shop on Etsy).
When given a micro-niche name, link, or TikTok trend, immediately execute the complete 5-step Plume Style Product Factory using our exact winning template.

FIXED TEMPLATE RULES (NEVER CHANGE):
- Aesthetic: Luxury editorial lookbook, warm cream background (#FAF6F0), clean serif titles, 18-page structured layout:
  01 Cover, 02 Welcome & exact TOC 02–18, 03 Palette, 04 Key Pieces, 05 Method, 06–14 Outfit Looks, 15 Body Shapes Guide, 16 30-Day Outfit Calendar, 17 Printable Checklist + Budget Shopping Keywords, 18 Brand Outro.
- Competitive Edge over blogs: Always include real-life wearability, 5 Distinct Body Shapes tips (Hourglass, Pear, Rectangle, Inverted Triangle, Apple), a 30-Day Outfit Calendar (eliminates morning decision fatigue), and Amazon/Zara/Uniqlo search keywords.
- Visual Style for Image Prompts: 100% ULTRA-PHOTOREALISTIC luxury e-commerce studio product photography flat-lays on solid #F6F2EC background, tactile fabrics, NO brand logos, NO neck tags, NO text on images.

STRICT OUTPUT CONSTRAINTS:
1. COMPETITIVE ANGLE: Compelling niche hook, exact Piece/Outfit numbers (always 20 pieces and 45+ outfits, e.g. 45), and 5 adapted Palette Colors (valid 6-digit #HEX + color name + wardrobe role).
2. THE KEY PIECES LIST: Exactly 20 numbered pieces ("01" through "20") adapted to the niche, each with realistic category, tactile fabric notes, and a crisp 1-line Budget Shopping Keywords string formatted for Amazon/Zara/Uniqlo searches.
3. PHOTOREALISTIC IMAGE PROMPTS (BATCH FOR CHATGPT IMAGES): Exactly 6 ready-to-paste prompts formatted specifically for ChatGPT image generation (NEVER use Midjourney flags like --ar, --tile, --v, or --stylize):
   - Slot 01: Cover Lifestyle Flat-Lay (aspectRatio "3:4") — start with "Vertical 3:4 overhead studio flat-lay photograph on a solid warm cream #F6F2EC background..."
   - Slots 02–06: 5 Outfit Collage Boards (aspectRatio "4:3") — start with "Horizontal 4:3 three-outfit studio flat-lay collage on a solid warm cream #F6F2EC background, keeping the exact same garments, textures, and hardware from the cover board..."
   Every prompt MUST specify solid #F6F2EC warm cream background, ultra-photorealistic luxury e-commerce studio photography, tactile fabric detail, ZERO text, ZERO brand logos, and ZERO neck tags.
4. 30-DAY CALENDAR + 5 BODY SHAPES MATRIX:
   - Exactly 30 days (day 1 to day 30), each referencing specific piece numbers from "01"–"20" (3–4 pieces per look), a refined look title, and a real-life occasion.
   - Exactly 5 body shapes in order: "Hourglass", "Pear", "Rectangle", "Inverted Triangle", "Apple", each with silhouetteFocus and a sharp 1-line tailoring tip.
5. ETSY SEO KIT:
   - title: Front-loaded Etsy SEO title <= 140 characters, MUST end with "Digital Download".
   - description: Persuasive Etsy product description including the exact 18-page breakdown (01 through 18) and explicitly stating "No physical item shipped".
   - tags: Exactly 13 Etsy search tags, EVERY SINGLE TAG STRICTLY <= 20 characters (count characters carefully, no commas, lowercase or title case, <= 20 chars each).`;

const factoryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    competitiveAngle: {
      type: Type.OBJECT,
      properties: {
        nicheTitle: { type: Type.STRING },
        editorialSubtitle: { type: Type.STRING },
        nicheHook: { type: Type.STRING },
        pieceCount: { type: Type.INTEGER },
        outfitCount: { type: Type.INTEGER },
        palette: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              name: { type: Type.STRING },
              role: { type: Type.STRING },
            },
            required: ['hex', 'name', 'role'],
          },
        },
      },
      required: ['nicheTitle', 'editorialSubtitle', 'nicheHook', 'pieceCount', 'outfitCount', 'palette'],
    },
    keyPieces: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.STRING },
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          fabricNotes: { type: Type.STRING },
          budgetKeywords: { type: Type.STRING },
        },
        required: ['number', 'name', 'category', 'fabricNotes', 'budgetKeywords'],
      },
    },
    imagePrompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slot: { type: Type.STRING },
          boardTitle: { type: Type.STRING },
          aspectRatio: { type: Type.STRING },
          prompt: { type: Type.STRING },
        },
        required: ['slot', 'boardTitle', 'aspectRatio', 'prompt'],
      },
    },
    calendarDays: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          lookTitle: { type: Type.STRING },
          pieceNumbers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          occasion: { type: Type.STRING },
        },
        required: ['day', 'lookTitle', 'pieceNumbers', 'occasion'],
      },
    },
    bodyShapes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          shape: { type: Type.STRING },
          silhouetteFocus: { type: Type.STRING },
          tailoringTip: { type: Type.STRING },
        },
        required: ['shape', 'silhouetteFocus', 'tailoringTip'],
      },
    },
    etsySeo: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['title', 'description', 'tags'],
    },
  },
  required: ['competitiveAngle', 'keyPieces', 'imagePrompts', 'calendarDays', 'bodyShapes', 'etsySeo'],
};

const variationsResponseSchema = {
  type: Type.OBJECT,
  properties: {
    variations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.STRING },
          angle: { type: Type.STRING },
          coverTitle: { type: Type.STRING },
          coverSubtitle: { type: Type.STRING },
          keyHighlight: { type: Type.STRING },
          suggestedPrice: { type: Type.STRING },
          etsyTitle: { type: Type.STRING },
          etsyTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'index',
          'angle',
          'coverTitle',
          'coverSubtitle',
          'keyHighlight',
          'suggestedPrice',
          'etsyTitle',
          'etsyTags',
        ],
      },
    },
  },
  required: ['variations'],
};

function sanitizeEtsyTitle(rawTitle: string): string {
  const suffix = 'Digital Download';
  let base = rawTitle.replace(/\s*digital download\s*$/i, '').trim();
  base = base.replace(/[-|,:\s]+$/, '').trim();
  const maxBaseLength = 140 - suffix.length - 3; // " | " separator
  if (base.length > maxBaseLength) {
    base = base.slice(0, maxBaseLength).replace(/\s+\S*$/, '').trim();
  }
  const combined = `${base} | ${suffix}`;
  return combined.length <= 140 ? combined : `${base.slice(0, 140 - suffix.length - 1)} ${suffix}`;
}

function sanitizeEtsyTags(rawTags: string[]): string[] {
  const cleaned = rawTags
    .map((t) => t.replace(/[,#]/g, '').trim())
    .filter(Boolean)
    .map((t) => {
      if (t.length <= 20) return t;
      const truncated = t.slice(0, 20).replace(/\s+\S*$/, '').trim();
      return truncated.length > 0 ? truncated : t.slice(0, 20);
    });

  const fallbacks = [
    'capsule wardrobe',
    'digital lookbook',
    'outfit planner',
    'wardrobe checklist',
    'style guide pdf',
    '30 day outfits',
    'minimalist style',
    'fashion lookbook',
    'body shape guide',
    'closet essentials',
    'digital download',
    'plume style',
    'capsule fashion',
  ];

  const unique: string[] = [];
  for (const tag of [...cleaned, ...fallbacks]) {
    const normalized = tag.slice(0, 20).trim();
    if (normalized && !unique.some((u) => u.toLowerCase() === normalized.toLowerCase())) {
      unique.push(normalized);
    }
    if (unique.length === 13) break;
  }
  return unique;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/deliverables/:filename', (req, res) => {
    const safeName = path.basename(String(req.params.filename || '')).replace(/[^a-zA-Z0-9._-]/g, '');
    if (!safeName) {
      res.status(400).json({ error: 'Nom de fichier invalide.' });
      return;
    }
    const filePath = path.resolve(__dirname, 'public', 'assets', 'deliverables', safeName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: `Fichier introuvable : ${safeName}` });
      return;
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    if (safeName.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
    res.download(filePath, safeName);
  });

  app.get('/api/export-project', async (req, res) => {
    const rawScope = String(req.query?.scope || 'code').toLowerCase();
    const allowedScopes = new Set(['code', 'skilodge', 'heritage', 'deliverables']);
    if (!allowedScopes.has(rawScope)) {
      res.status(400).json({ error: 'Scope d’export invalide.' });
      return;
    }

    const downloadNames: Record<string, string> = {
      code: 'PLUME_Style_CodeSource_Et_Guide.zip',
      skilodge: 'PLUME_Collection2_Ski_Lodge_Complet.zip',
      heritage: 'PLUME_Collection1_Heritage_Et_Playbook.zip',
      deliverables: 'PLUME_Tous_Les_Livrables_Etsy_Pinterest.zip',
    };

    const tmpZipPath = path.join(
      os.tmpdir(),
      `plume_export_${rawScope}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.zip`
    );

    const pythonZipBuilder = `
import os, sys, zipfile

root_dir = sys.argv[1]
scope = sys.argv[2]
out_zip = sys.argv[3]

resume_text = """PLUME DIGITAL SHOP / PLUME STYLE — GUIDE DE REPRISE & INSTALLATION
======================================================================

1. LANCER EN LOCAL (PC / Mac / Cursor / VS Code / Replit) :
   - Prérequis : Node.js 20+
   - Dans ce dossier, exécutez :
       npm install
       npm run dev
   - Ouvrez http://localhost:3000 dans votre navigateur.
   - Note : Tous les outils Tumbler Wrap, Mug Émaillé, Seamless et le Kit Marketing fonctionnent sans clé API.
   - Optionnel (uniquement pour l'onglet 5-Block Lookbook Factory IA) : créez un fichier .env avec GEMINI_API_KEY=votre_cle

2. PROMPT DE REPRISE (À COLLER DANS UNE NOUVELLE DISCUSSION IA) :
   Tu travailles sur l'application Plume Digital Shop / PLUME STYLE (React 19 + Vite + Tailwind + Express dans server.ts sur port 3000). Avant toute modification, lis src/components/TumblerWrapStudio.tsx et liste public/assets/deliverables/. Règles strictes : réponds en français ; rédige tous les textes/titres/tags Etsy, Pinterest et TikTok en anglais avec 0 marque déposée ; ne prétends jamais avoir testé physiquement une presse à chaud ; garde tous les téléchargements via /api/deliverables/:filename.
"""

code_root_files = [
    'package.json',
    'server.ts',
    'index.html',
    'metadata.json',
    'tsconfig.json',
    'vite.config.ts',
    '.env.example',
    '.gitignore',
]

if scope == 'code':
    with zipfile.ZipFile(out_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        zf.writestr('README_EXPORT_ET_PROMPT_REPRISE.txt', resume_text)
        for fname in code_root_files:
            fpath = os.path.join(root_dir, fname)
            if os.path.isfile(fpath):
                zf.write(fpath, arcname=fname)
        src_dir = os.path.join(root_dir, 'src')
        for dirpath, _, filenames in os.walk(src_dir):
            for fn in sorted(filenames):
                full_p = os.path.join(dirpath, fn)
                rel_p = os.path.relpath(full_p, root_dir)
                zf.write(full_p, arcname=rel_p)
else:
    deliv_dir = os.path.join(root_dir, 'public', 'assets', 'deliverables')
    with zipfile.ZipFile(out_zip, 'w', compression=zipfile.ZIP_STORED) as zf:
        if os.path.isdir(deliv_dir):
            for fn in sorted(os.listdir(deliv_dir)):
                full_p = os.path.join(deliv_dir, fn)
                if not os.path.isfile(full_p):
                    continue
                if scope == 'skilodge' and not fn.startswith('PLUME_Ski_Lodge'):
                    continue
                if scope == 'heritage' and fn.startswith('PLUME_Ski_Lodge'):
                    continue
                zf.write(full_p, arcname=os.path.join('deliverables', fn))
`;

    try {
      await execFileAsync('python3', ['-c', pythonZipBuilder, __dirname, rawScope, tmpZipPath], {
        timeout: 60000,
      });

      if (!fs.existsSync(tmpZipPath)) {
        res.status(500).json({ error: 'Impossible de créer l’archive ZIP.' });
        return;
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Content-Type', 'application/zip');
      res.download(tmpZipPath, downloadNames[rawScope], () => {
        fs.unlink(tmpZipPath, () => {});
      });
    } catch (err: unknown) {
      fs.unlink(tmpZipPath, () => {});
      const message = err instanceof Error ? err.message : 'Erreur export ZIP.';
      console.error('Export project error:', err);
      res.status(500).json({ error: `Erreur lors de l’export : ${message}` });
    }
  });

  app.post('/api/generate-factory', async (req, res) => {
    const niche = typeof req.body?.niche === 'string' ? req.body.niche.trim() : '';
    if (!niche) {
      res.status(400).json({ error: 'Please enter a fashion micro-niche, link, or trend.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'Gemini API key is not configured. Please check Settings > Secrets.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate the complete 5-step Plume Style Product Factory output for this fashion niche / trend: "${niche}".`,
        config: {
          systemInstruction: PLUME_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: factoryResponseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) {
        res.status(502).json({ error: 'Model returned an empty response. Please try again.' });
        return;
      }

      const parsed = JSON.parse(rawText);

      // Post-process strict Etsy SEO constraints and numbering
      parsed.etsySeo.title = sanitizeEtsyTitle(String(parsed.etsySeo?.title ?? `${niche} Capsule Wardrobe Guide`));
      parsed.etsySeo.tags = sanitizeEtsyTags(Array.isArray(parsed.etsySeo?.tags) ? parsed.etsySeo.tags : []);
      if (!/no physical item shipped/i.test(String(parsed.etsySeo?.description ?? ''))) {
        parsed.etsySeo.description = `${parsed.etsySeo.description}\n\nNote: This is an instant digital PDF download. No physical item shipped.`;
      }

      if (Array.isArray(parsed.keyPieces)) {
        parsed.keyPieces = parsed.keyPieces.slice(0, 20).map((piece: Record<string, unknown>, idx: number) => ({
          ...piece,
          number: String(idx + 1).padStart(2, '0'),
        }));
      }

      if (Array.isArray(parsed.calendarDays)) {
        parsed.calendarDays = parsed.calendarDays.slice(0, 30).map((day: Record<string, unknown>, idx: number) => ({
          ...day,
          day: idx + 1,
        }));
      }

      res.json({
        nicheInput: niche,
        ...parsed,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected server error.';
      console.error('Plume Style factory error:', err);
      res.status(500).json({
        error: `Could not generate factory blueprint: ${message}`,
      });
    }
  });

  app.post('/api/generate-variations', async (req, res) => {
    const nicheTitle = typeof req.body?.nicheTitle === 'string' ? req.body.nicheTitle.trim() : '';
    const nicheHook = typeof req.body?.nicheHook === 'string' ? req.body.nicheHook.trim() : '';

    if (!nicheTitle) {
      res.status(400).json({ error: 'Missing master guide niche title.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'Gemini API key is not configured. Please check Settings > Secrets.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `From this Master Guide ("${nicheTitle}" — ${nicheHook}), generate 10 distinct Etsy micro-niche listing variations ready for Canva Bulk Create and Etsy duplication.
Use these 10 strategic angles in exact order:
01: Hourglass Body Shape Edition
02: Pear Body Shape Edition
03: Petite Proportions Edition (Under 5'4")
04: Plus Size / Curvy Tailoring Edition
05: Rectangle Body Shape Edition
06: Workwear & Office Rotation Edition
07: Weekend & Casual Errands Edition
08: Elevated Evening & Event Edition
09: Budget Capsule Edition (Under $250 Look)
10: Complete Mega Bundle (All Editions Combined)

Rules:
- Never use protected brand trademarks.
- coverTitle: short 2-4 uppercase editorial words for Canva cover.
- coverSubtitle: 3-5 words naming the specific body shape or occasion angle.
- keyHighlight: concise 5-8 word hook for Canva cover bullet.
- suggestedPrice: e.g. "$6.90" for single editions and "$19.90" for #10 Mega Bundle.
- etsyTitle: <= 140 chars, front-loaded for the micro-niche angle, MUST end with "Digital Download".
- etsyTags: exactly 13 tags, STRICTLY <= 20 chars each.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: variationsResponseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) {
        res.status(502).json({ error: 'Model returned an empty variations response.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      const variations = Array.isArray(parsed.variations)
        ? parsed.variations.slice(0, 10).map((item: Record<string, unknown>, idx: number) => ({
            index: String(idx + 1).padStart(2, '0'),
            angle: String(item.angle ?? ''),
            coverTitle: String(item.coverTitle ?? ''),
            coverSubtitle: String(item.coverSubtitle ?? ''),
            keyHighlight: String(item.keyHighlight ?? ''),
            suggestedPrice: String(item.suggestedPrice ?? '$6.90'),
            etsyTitle: sanitizeEtsyTitle(String(item.etsyTitle ?? `${nicheTitle} Edition`)),
            etsyTags: sanitizeEtsyTags(Array.isArray(item.etsyTags) ? (item.etsyTags as string[]) : []),
          }))
        : [];

      res.json({ variations });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected server error.';
      console.error('Plume Style variations error:', err);
      res.status(500).json({
        error: `Could not generate 10 listing variations: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Plume Style server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
