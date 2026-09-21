import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private readonly cloudName = 'tu_cloud_name';
  private readonly uploadPreset = 'tu_upload_preset_unsigned';

  constructor(private http: HttpClient) {}

  uploadImage(base64Image: string): Observable<string> {
    if (!this.cloudName || this.cloudName.includes('your_')) {
      throw new Error('Configura tu Cloud Name en CloudinaryService antes de subir imágenes.');
    }

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Image}`);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<{ secure_url?: string }>(url, formData).pipe(
      map((response) => {
        if (!response?.secure_url) {
          throw new Error('No se recibió la URL de la imagen desde Cloudinary.');
        }
        return response.secure_url;
      }),
    );
  }
}
