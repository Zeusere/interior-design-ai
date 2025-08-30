// src/services/GeminiService.ts

export interface GeminiRequest {
  personImage: File;
  clothingImage?: File;
  clothingUrl?: string;
  prompt?: string;
}

export interface GeminiResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class GeminiService {
  private endpoint: string;

  constructor() {
    // Relativo: sirve igual en dev (proxy) y en producción (Vercel)
    this.endpoint = '/api/gemini';
    console.log('🚀 GeminiService inicializado →', this.endpoint);
  }

  async generateClotheSwap(req: GeminiRequest): Promise<GeminiResponse> {
    // Validaciones básicas
    if (!SUPPORTED_TYPES.includes(req.personImage.type)) {
      return { success: false, error: 'Formato de imagen de persona no permitido.' };
    }
    if (req.personImage.size > MAX_FILE_SIZE) {
      return { success: false, error: 'La imagen de la persona es demasiado grande. Máximo 5MB.' };
    }
    if (req.clothingImage) {
      if (!SUPPORTED_TYPES.includes(req.clothingImage.type)) {
        return { success: false, error: 'Formato de imagen de ropa no permitido.' };
      }
      if (req.clothingImage.size > MAX_FILE_SIZE) {
        return { success: false, error: 'La imagen de la ropa es demasiado grande. Máximo 5MB.' };
      }
    }

    try {
      // Base64 de entrada (solo la parte después de la coma)
      const personB64 = await this.fileToBase64(req.personImage);
      const clothingB64 = req.clothingImage ? await this.fileToBase64(req.clothingImage) : null;

      const prompt = req.prompt ?? this.buildPrompt(req.clothingUrl);

      // Payload para Gemini (el server añadirá tools + response_mime_type por si acaso)
      const payload = {
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: req.personImage.type, data: personB64 } },
            ...(clothingB64 ? [{ inline_data: { mime_type: req.clothingImage!.type, data: clothingB64 } }] : []),
          ],
        }],
        generationConfig: {
          // Puedes ajustar temperatura si quieres; el server pondrá response_mime_type
          temperature: 0.7,
        },
        // Opcional: también puedes enviarlo ya aquí; el server lo sobreescribe si faltara
        tools: [{ image_generation: {} }],
      };

      // === DEBUG ===
      console.log('=== GEMINI REQUEST ===');
      console.log('Endpoint:', this.endpoint);
      console.log('Prompt:', prompt);
      console.log('Person Type/Size:', req.personImage.type, req.personImage.size);
      console.log('Clothing Type/Size:', req.clothingImage?.type || 'N/A', req.clothingImage?.size || 'N/A');
      console.log('======================');

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('=== GEMINI RESPONSE ===', response.status, response.statusText);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${response.statusText} ${text}`);
      }

      const data = await response.json();

      // === Parse de respuesta ===
      const cand = data?.candidates?.[0];
      const parts = cand?.content?.parts ?? [];

      console.log('finishReason:', cand?.finishReason);
      console.log('safetyRatings:', cand?.safetyRatings);
      console.log('promptFeedback:', data?.promptFeedback);
      console.log('parts length:', parts.length);

      if (!parts.length) {
        throw new Error(
          cand?.finishReason === 'SAFETY'
            ? 'La solicitud fue bloqueada por políticas (safety). Ajusta el prompt o las imágenes.'
            : 'No se generó imagen (respuesta vacía del modelo).'
        );
      }

      // Buscar la imagen
      const imgPart = parts.find(
        (p: any) => p?.inline_data?.mime_type?.startsWith('image/') && p?.inline_data?.data
      );

      if (!imgPart) {
        // Si no hay imagen, mira si vino texto para log
        const txt = parts.find((p: any) => p?.text)?.text;
        if (txt) console.log('Texto devuelto por Gemini:', txt);
        throw new Error('No se pudo generar la imagen. Gemini devolvió solo texto.');
      }

      const b64 = imgPart.inline_data.data as string;
      const mime = imgPart.inline_data.mime_type || 'image/png';
      const imageUrl = `data:${mime};base64,${b64}`;

      return { success: true, imageUrl };
    } catch (err: any) {
      console.error('Error en GeminiService:', err);
      return { success: false, error: err?.message || 'Error desconocido con Gemini' };
    }
  }

  private buildPrompt(clothingUrl?: string): string {
    return [
      'Edit the input photo: keep the same person and pose; change only the outfit.',
      'Use realistic lighting and natural fabric folds; preserve body geometry.',
      'Return a single photorealistic image.',
      clothingUrl ? `Use this clothing reference/style: ${clothingUrl}` : '',
      'The subject is an adult. Do not create explicit or unsafe content.',
    ].filter(Boolean).join(' ');
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1] || '';
          resolve(base64);
        } else {
          reject(new Error('Error al convertir archivo a base64'));
        }
      };
      reader.onerror = (e) => reject(e);
    });
  }

  // Helpers opcionales que puedes usar en tu UI
  async validateImage(image: File): Promise<boolean> {
    if (!SUPPORTED_TYPES.includes(image.type)) return false;
    if (image.size > MAX_FILE_SIZE) return false;
    return true;
  }

  async processImage(image: File): Promise<string> {
    // Aquí podrías hacer resize/compresión si lo necesitas
    return URL.createObjectURL(image);
  }
}

export default new GeminiService();
