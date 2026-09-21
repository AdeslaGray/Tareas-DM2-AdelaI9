import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private cloudName = 'dx5abcdef';
  private uploadPreset = 'ml_default';

  constructor(private http: HttpClient) {}

  /**
   * Sube cualquier archivo (imagen, PDF, doc, etc.) a Cloudinary.
   * Acepta base64 con o sin prefijo data URI.
   */
  uploadFile(base64Data: string, fileName?: string): Observable<string> {
    const contentType = this.detectContentType(base64Data);
    const resourceType = this.getResourceType(contentType);
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;

    const cleanBase64 = this.stripDataPrefix(base64Data);
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteNumbers], { type: contentType });
    const resolvedFileName = fileName ?? `upload-${Date.now()}.${this.getExtension(contentType)}`;

    const formData = new FormData();
    formData.append('file', blob, resolvedFileName);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(url, formData).pipe(
      map(res => res.secure_url)
    );
  }

  /** Alias para compatibilidad con el código existente que usa uploadImage() */
  uploadImage(base64Image: string): Observable<string> {
    return this.uploadFile(base64Image);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private stripDataPrefix(base64: string): string {
    if (!base64) return '';
    const idx = base64.indexOf(',');
    return idx !== -1 ? base64.substring(idx + 1) : base64;
  }

  private detectContentType(base64: string): string {
    if (!base64) return 'application/octet-stream';

    const match = base64.match(/^data:([a-zA-Z0-9+\-./]+);base64/);
    if (match) return match[1];

    // Sin prefijo → intentar detectar por magic bytes (primeros chars en base64)
    if (base64.startsWith('JVBERi0')) return 'application/pdf';  // %PDF-
    if (base64.startsWith('iVBORw')) return 'image/png';
    if (base64.startsWith('/9j/'))   return 'image/jpeg';
    if (base64.startsWith('UEsD'))   return 'application/zip';   // ZIP / DOCX / XLSX

    return 'application/octet-stream';
  }

  /**
   * Cloudinary distingue entre 'image', 'video' y 'raw' (cualquier otro).
   * PDFs y docs deben subirse como 'raw'.
   */
  private getResourceType(contentType: string): 'image' | 'video' | 'raw' {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    return 'raw'; // PDF, DOC, ZIP, etc.
  }

  private getExtension(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg':       'jpg',
      'image/png':        'png',
      'image/webp':       'webp',
      'image/gif':        'gif',
      'application/pdf':  'pdf',
      'application/zip':  'zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       'xlsx',
    };
    return map[contentType] ?? 'bin';
  }
}
