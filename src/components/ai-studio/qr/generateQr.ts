import QRCode from 'qrcode';

export async function generateQrDataUrl(
  url: string, 
  opts?: { 
    color?: string; 
    ecc?: 'L' | 'M' | 'Q' | 'H' 
  }
): Promise<string> {
  return QRCode.toDataURL(url, { 
    errorCorrectionLevel: opts?.ecc ?? 'M', 
    color: { 
      dark: opts?.color ?? '#000000', 
      light: '#FFFFFF00' // transparent background
    },
    width: 512,
    margin: 2
  });
}