import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = 'dx5abcdef';
  private uploadPreset = 'ml_default';

  constructor(private http: HttpClient) {}

  uploadImage(base64Image: string): Observable<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const cleanBase64 = this.stripDataPrefix(base64Image);
    const contentType = this.detectContentType(base64Image);
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const fileName = `upload-${Date.now()}.${this.getExtension(contentType)}`;
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(url, formData).pipe(
      map(res => res.secure_url)
    );
  }

  private stripDataPrefix(base64: string): string {
    if (!base64) {
      return '';
    }
    const prefixIndex = base64.indexOf(',');
    return prefixIndex !== -1 ? base64.substring(prefixIndex + 1) : base64;
  }

  private detectContentType(base64: string): string {
    if (!base64) {
      return 'image/jpeg';
    }
    if (base64.startsWith('data:image/png')) {
      return 'image/png';
    }
    if (base64.startsWith('data:image/webp')) {
      return 'image/webp';
    }
    if (base64.startsWith('data:image/')) {
      const match = base64.match(/data:(image\/[a-zA-Z0-9+.-]+);base64/);
      return match ? match[1] : 'image/jpeg';
    }
    return 'image/jpeg';
  }

  private getExtension(contentType: string): string {
    switch (contentType) {
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpg';
    }
  }
}
