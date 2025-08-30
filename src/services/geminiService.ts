// src/services/GeminiService.ts
// Servicio frontend que llama a /api/gemini (serverless en Vercel) usando fetch.
// No expone la API key en el cliente.

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

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class GeminiService {
  private endpoint: string;

  constructor() {
    // Funciona tanto en dev como en prod (Vercel)
    this.endpoint = '/api/gemini';
    console.log('🚀 GeminiService inicializado →', this.endpoint);
  }

  async generateClotheSwap(req: GeminiRequest): Promise<GeminiResponse> {
    // Validaciones
    if (!SUPPORTED_TYPES.includes(req.personImage.type as any)) {
      return { success: false, error: 'Formato de imagen de persona no permitido (jpeg/png/webp).' };
    }
    if (req.personImage.size > MAX_FILE_SIZE) {
      return { success: false, error: 'La imagen de la persona es demasiado grande. Máximo 5MB.' };
    }
    if (req.clothingImage) {
      if (!SUPPORTED_TYPES.includes(req.clothingImage.type as any)) {
        return { success: false, error: 'Formato de imagen de ropa no permitido (jpeg/png/webp).' };
      }
      if (req.clothingImage.size > MAX_FILE_SIZE) {
        return { success: false, error: 'La imagen de la ropa es demasiado grande. Máximo 5MB.' };
      }
    }

    try {
      // Convierte imágenes a base64 (solo la parte después de la coma)
      const personB64 = await this.fileToBase64(req.personImage);
      const clothingB64 = req.clothingImage ? await this.fileToBase64(req.clothingImage) : null;

      const prompt = req.prompt ?? this.buildPrompt(req.clothingUrl);

      // Payload REST para gemini-2.5-flash-image-preview
      // (Este modelo NO acepta 'tools', ni 'response_mime_type'.)
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inline_data: { mime_type: req.personImage.type, data: personB64 } },
              ...(clothingB64
                ? [{ inline_data: { mime_type: req.clothingImage!.type, data: clothingB64 } }]
                : []),
            ],
          },
        ],
        // Puedes ajustar parámetros de sampling si quieres:
        generationConfig: {
          temperature: 0.7,
        },
      };

      // ==== DEBUG ====
      console.log('=== GEMINI REQUEST ===');
      console.log('Endpoint:', this.endpoint);
      console.log('Prompt:', prompt);
      console.log('Person:', req.personImage.type, req.personImage.size);
      console.log('Clothing:', req.clothingImage?.type || 'N/A', req.clothingImage?.size || 'N/A');
      console.log('=====================');

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

      // === Parse respuesta ===
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

      // La imagen puede venir como inline_data (snake_case) o inlineData (camelCase)
      const imgPart = parts.find((p: any) => {
        const id = p.inline_data ?? p.inlineData;
        const mt = id?.mime_type ?? id?.mimeType;
        return id?.data && typeof mt === 'string' && mt.startsWith('image/');
      });

      if (!imgPart) {
        const txt = parts.find((p: any) => p?.text)?.text;
        if (txt) console.log('Texto devuelto por Gemini:', txt);
        throw new Error('No se pudo generar la imagen. Gemini devolvió solo texto.');
      }

      const id = (imgPart.inline_data ?? imgPart.inlineData) as {
        data: string;
        mime_type?: string;
        mimeType?: string;
      };

      const mime = id.mime_type || id.mimeType || 'image/png';
      const imageUrl = `data:${mime};base64,${id.data}`;

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
    ]
      .filter(Boolean)
      .join(' ');
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

  // Helpers opcionales para tu UI
  async validateImage(image: File): Promise<boolean> {
    if (!SUPPORTED_TYPES.includes(image.type as any)) return false;
    if (image.size > MAX_FILE_SIZE) return false;
    return true;
  }

  async processImage(image: File): Promise<string> {
    // Aquí podrías hacer resize/compresión si lo necesitas
    return URL.createObjectURL(image);
  }
}

export default new GeminiService();
