function matchesBinarySignature(bytes: Uint8Array, ext: string): boolean {
  if (bytes.length < 16) return false;
  switch (ext) {
    case 'pdf':
      return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
    case 'jpg':
    case 'jpeg':
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case 'png':
      return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    case 'zip':
    case 'docx':
      return bytes[0] === 0x50 && bytes[1] === 0x4b; // PK
    default:
      return true;
  }
}

function getMimeTypeForExt(ext: string): string {
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'zip':
      return 'application/zip';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const safeName =
    filename
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'PLUME_Export';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }, 1000);
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Fetches a deliverable inside the AI Studio preview iframe using authenticated fetch()
 * (trying both /assets/deliverables and /api/deliverables), validates its binary magic bytes
 * so Chrome never saves an HTML proxy page (e.g. 10.1 KB), and triggers a clean Blob download.
 */
export async function fetchAndDownloadDeliverable(filename: string): Promise<void> {
  const cleanName = filename.replace(/^\/+/, '');
  const ext = cleanName.split('.').pop()?.toLowerCase() ?? '';
  const candidates = [
    `/api/deliverables/${encodeURIComponent(cleanName)}?v=${Date.now()}`,
    `/assets/deliverables/${encodeURIComponent(cleanName)}?v=${Date.now()}`,
  ];

  let lastStatus = 0;

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        credentials: 'include',
        headers: { Accept: '*/*' },
      });
      lastStatus = res.status;
      if (!res.ok) continue;

      const rawBlob = await res.blob();
      const headBuf = new Uint8Array(await rawBlob.slice(0, 16).arrayBuffer());
      if (!matchesBinarySignature(headBuf, ext)) {
        continue;
      }

      const typedBlob = new Blob([rawBlob], { type: getMimeTypeForExt(ext) });
      triggerBlobDownload(typedBlob, cleanName);
      return;
    } catch {
      // Try next candidate URL
    }
  }

  throw new Error(
    `Impossible de récupérer un fichier valide pour ${cleanName}${lastStatus ? ` (HTTP ${lastStatus})` : ''}. Essayez d’ouvrir l’aperçu dans un nouvel onglet.`
  );
}

export type ProjectExportScope = 'code' | 'skilodge' | 'heritage' | 'deliverables';

const SCOPE_DEFAULT_FILENAMES: Record<ProjectExportScope, string> = {
  code: 'PLUME_Style_CodeSource_Et_Guide.zip',
  skilodge: 'PLUME_Collection2_Ski_Lodge_Complet.zip',
  heritage: 'PLUME_Collection1_Heritage_Et_Playbook.zip',
  deliverables: 'PLUME_Tous_Les_Livrables_Etsy_Pinterest.zip',
};

export async function fetchAndDownloadProjectZip(scope: ProjectExportScope): Promise<void> {
  const filename = SCOPE_DEFAULT_FILENAMES[scope];
  const url = `/api/export-project?scope=${encodeURIComponent(scope)}&v=${Date.now()}`;
  const res = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
    headers: { Accept: 'application/zip, */*' },
  });

  if (!res.ok) {
    throw new Error(`Erreur serveur lors de l’export (${res.status}).`);
  }

  const rawBlob = await res.blob();
  const headBuf = new Uint8Array(await rawBlob.slice(0, 16).arrayBuffer());
  if (!matchesBinarySignature(headBuf, 'zip')) {
    throw new Error('Réponse ZIP invalide reçue du serveur.');
  }

  const typedBlob = new Blob([rawBlob], { type: 'application/zip' });
  triggerBlobDownload(typedBlob, filename);
}

