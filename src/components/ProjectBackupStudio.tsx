import { useState } from 'react';
import { Archive, Check, Code2, Download, ExternalLink, FolderArchive, Loader2 } from 'lucide-react';
import { fetchAndDownloadDeliverable } from '../utils/deliverableDownload';
import { CopyButton } from './CopyButton';

const RESUME_CONVERSATION_PROMPT = `Tu travailles sur l'application Plume Digital Shop / PLUME STYLE (React 19 + Vite + Tailwind CSS + Express dans server.ts sur port 3000).
Avant toute modification, lis src/components/TumblerWrapStudio.tsx et liste public/assets/deliverables/.
Règles strictes :
- Réponds toujours en français ; rédige tous les textes/titres/tags Etsy, Pinterest et TikTok en anglais avec 0 marque déposée.
- Ne prétends jamais avoir testé physiquement une presse à chaud.
- Tous les téléchargements dans l'aperçu doivent passer par /api/deliverables/:filename et fetchAndDownloadDeliverable().`;

interface BackupPack {
  key: string;
  filename: string;
  title: string;
  subtitle: string;
  sizeLabel: string;
  buttonLabel: string;
  accentClass: string;
  icon: 'code' | 'folder' | 'archive';
}

const BACKUP_PACKS: BackupPack[] = [
  {
    key: 'backup-code',
    filename: 'PLUME_Backup_01_CodeSource.zip',
    title: '1. Code Source Complet + Guide de Reprise (.zip)',
    subtitle:
      'Tout le code (src/, server.ts, package.json, configuration) + README_EXPORT_ET_PROMPT_REPRISE.txt pour ouvrir dans VS Code, Cursor, Replit ou une autre IA.',
    sizeLabel: '2.1 Mo · Archive directe testée',
    buttonLabel: 'Télécharger Code Source (.zip)',
    accentClass: 'bg-[#1B3B5A] hover:bg-[#122940] text-[#FAF6F0]',
    icon: 'code',
  },
  {
    key: 'backup-campmug-pins',
    filename: 'PLUME_Backup_02_SkiLodge_CampMug_Slides_Pins_PDF.zip',
    title: '2. Ski Lodge · Camp Mug + 7 Slides Etsy + 3 Pins + PDF (.zip)',
    subtitle:
      'Les 5 wraps Camping Mug 2550×975, les 7 slides galerie Etsy 2000×2000, les 3 épingles Pinterest 1000×1500 et le PDF Google Drive.',
    sizeLabel: '18.7 Mo · Compatible Cloud',
    buttonLabel: 'Télécharger Mugs, Slides & Pins (.zip)',
    accentClass: 'bg-[#7A1621] hover:bg-[#5E1019] text-[#FAF6F0]',
    icon: 'folder',
  },
  {
    key: 'backup-seamless',
    filename: 'PLUME_Backup_03_SkiLodge_Seamless_3600.zip',
    title: '3. Ski Lodge · 5 Seamless Patterns 3600×3600 (.zip)',
    subtitle:
      'Les 5 tuiles Seamless JPG 300 DPI (SL-01 à SL-05) en 12×12 pouces pour tissu, papier cadeau et sublimation.',
    sizeLabel: '20.0 Mo · Compatible Cloud',
    buttonLabel: 'Télécharger 5 Seamless (.zip)',
    accentClass: 'bg-[#2C2520] hover:bg-[#1C1917] text-[#FAF6F0]',
    icon: 'folder',
  },
  {
    key: 'backup-tumbler-a',
    filename: 'PLUME_Backup_04_SkiLodge_Tumbler_LotA.zip',
    title: '4. Ski Lodge · Tumbler 20 oz Lot A (SL-01 à SL-03 Straight)',
    subtitle: 'Les 3 premiers wraps Straight 2790×2460 px 300 DPI (SL-01, SL-02, SL-03).',
    sizeLabel: '19.9 Mo · Découpé < 26 Mo',
    buttonLabel: 'Télécharger Tumbler Lot A (.zip)',
    accentClass: 'bg-[#44403C] hover:bg-[#1C1917] text-[#FAF6F0]',
    icon: 'archive',
  },
  {
    key: 'backup-tumbler-b',
    filename: 'PLUME_Backup_05_SkiLodge_Tumbler_LotB.zip',
    title: '5. Ski Lodge · Tumbler 20 oz Lot B (SL-04/05 Straight + SL-05 Tapered)',
    subtitle: 'Wraps Straight SL-04 & SL-05 + Tapered SL-05 en 2790×2460 px 300 DPI.',
    sizeLabel: '21.1 Mo · Découpé < 26 Mo',
    buttonLabel: 'Télécharger Tumbler Lot B (.zip)',
    accentClass: 'bg-[#44403C] hover:bg-[#1C1917] text-[#FAF6F0]',
    icon: 'archive',
  },
  {
    key: 'backup-tumbler-c',
    filename: 'PLUME_Backup_06_SkiLodge_Tumbler_LotC.zip',
    title: '6. Ski Lodge · Tumbler 20 oz Lot C (SL-02 & SL-04 Tapered)',
    subtitle: 'Wraps coniques Tapered transparents SL-02 et SL-04 en 2790×2460 px 300 DPI.',
    sizeLabel: '25.4 Mo · Découpé < 26 Mo',
    buttonLabel: 'Télécharger Tumbler Lot C (.zip)',
    accentClass: 'bg-[#44403C] hover:bg-[#1C1917] text-[#FAF6F0]',
    icon: 'archive',
  },
  {
    key: 'backup-tumbler-d',
    filename: 'PLUME_Backup_07_SkiLodge_Tumbler_LotD.zip',
    title: '7. Ski Lodge · Tumbler 20 oz Lot D (SL-03 Tapered)',
    subtitle: 'Wrap conique Tapered transparent SL-03 Sepia Toile de Jouy 2790×2460 px 300 DPI.',
    sizeLabel: '13.1 Mo · Découpé < 26 Mo',
    buttonLabel: 'Télécharger Tumbler Lot D (.zip)',
    accentClass: 'bg-[#44403C] hover:bg-[#1C1917] text-[#FAF6F0]',
    icon: 'archive',
  },
  {
    key: 'backup-playbook',
    filename: 'PLUME_Etsy_Strategy_Playbook_SOP.docx',
    title: '8. Playbook Stratégie Etsy & SOP (.docx)',
    subtitle: 'Document Word complet avec ta stratégie Etsy Plume Digital Shop.',
    sizeLabel: '7 Ko · Instantané',
    buttonLabel: 'Télécharger Playbook (.docx)',
    accentClass: 'bg-[#1B3B5A] hover:bg-[#122940] text-[#FAF6F0]',
    icon: 'archive',
  },
];

export function ProjectBackupStudio() {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (pack: BackupPack) => {
    setError(null);
    setStatusNote(null);
    setDownloadingKey(pack.key);
    try {
      await fetchAndDownloadDeliverable(pack.filename);
      setDownloadedKey(pack.key);
      setStatusNote(
        `Fichier ${pack.filename} envoyé au navigateur (vérifie ton dossier Téléchargements).`
      );
      window.setTimeout(() => {
        setDownloadedKey((curr) => (curr === pack.key ? null : curr));
      }, 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : `Impossible de télécharger ${pack.filename}. Utilise le lien direct sous le bouton.`
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#F6F2EC] border border-[#E5DDD0] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E5DDD0] pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#7A1621] font-medium">
              Sauvegarde Directe · Lots &lt; 26 Mo (100 % Compatibles Navigateur)
            </p>
            <h2 className="font-serif text-2xl font-medium text-[#1C1917]">
              Exporter l’Application &amp; Tous Tes Fichiers (.zip)
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#57534E]">
            Archives pré-générées &amp; vérifiées
          </span>
        </div>

        <p className="text-xs text-[#57534E] leading-relaxed">
          Chaque archive est pré-construite sous la limite de <strong>26 Mo</strong> pour passer
          sans blocage ni coupure réseau. Si un bouton est bloqué par ton navigateur dans l’aperçu,
          clique sur le lien <strong>« Lien direct »</strong> juste en dessous.
        </p>

        {statusNote && (
          <div
            role="status"
            className="p-3.5 bg-[#FAF6F0] border border-[#166534]/40 text-xs text-[#166534]"
          >
            {statusNote}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-3.5 bg-[#FAF6F0] border border-[#7A1621]/40 text-xs text-[#7A1621]"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BACKUP_PACKS.map((pack) => {
            const isBusy = downloadingKey === pack.key;
            const isDone = downloadedKey === pack.key;
            const Icon =
              pack.icon === 'code'
                ? Code2
                : pack.icon === 'folder'
                  ? FolderArchive
                  : Archive;

            return (
              <div
                key={pack.key}
                className="bg-[#FAF6F0] border border-[#D6CEBE] p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-[#1C1917] leading-snug">
                      {pack.title}
                    </h3>
                    <Icon className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] text-[#57534E] leading-relaxed">{pack.subtitle}</p>
                  <p className="font-mono text-[10px] text-[#78716C]">{pack.sizeLabel}</p>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled={downloadingKey !== null}
                    onClick={() => handleDownload(pack)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 ${pack.accentClass}`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    ) : isDone ? (
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {isBusy
                        ? 'Téléchargement...'
                        : isDone
                          ? 'Téléchargé !'
                          : pack.buttonLabel}
                    </span>
                  </button>

                  <div className="flex justify-end">
                    <a
                      href={`/api/deliverables/${encodeURIComponent(pack.filename)}`}
                      download={pack.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#57534E] hover:text-[#1C1917] underline underline-offset-2"
                    >
                      <span>Lien direct ({pack.filename})</span>
                      <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ready-to-copy Resume Prompt for new chat / other AI platform */}
        <div className="pt-4 border-t border-[#D6CEBE] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#1B3B5A] font-medium">
                Continuer dans une autre discussion ou avec une autre IA
              </p>
              <p className="text-[11px] text-[#57534E]">
                Colle ce message au tout début de la nouvelle conversation pour transférer toutes tes
                règles en 2 secondes :
              </p>
            </div>
            <CopyButton
              text={RESUME_CONVERSATION_PROMPT}
              label="Copier Prompt de Reprise"
              copiedLabel="Prompt Copié"
              variant="primary"
            />
          </div>
          <pre className="text-[11px] text-[#2C2520] whitespace-pre-wrap font-sans leading-relaxed bg-[#FAF6F0] p-3.5 border border-[#E5DDD0] select-all">
            {RESUME_CONVERSATION_PROMPT}
          </pre>
        </div>
      </div>
    </section>
  );
}
