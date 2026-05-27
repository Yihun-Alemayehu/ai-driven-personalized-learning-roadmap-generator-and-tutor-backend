import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const CANVAS_W = 1123;
const CANVAS_H = 794;

/**
 * Capture the full-resolution certificate canvas (#certificate-canvas) as a PNG
 * data URL. The node renders at a fixed 1123×794 in the DOM (any visual scaling
 * is applied to a parent via CSS transform, which html-to-image ignores), so the
 * capture is always full size. pixelRatio bumps it to retina crispness.
 */
async function captureCanvas(pixelRatio = 2): Promise<string> {
  const node = document.getElementById('certificate-canvas');
  if (!node) throw new Error('Certificate canvas not found in the DOM');
  // Two passes: the first warms up font/style embedding so the second is pixel-accurate.
  await toPng(node, { pixelRatio, width: CANVAS_W, height: CANVAS_H, cacheBust: true });
  return toPng(node, { pixelRatio, width: CANVAS_W, height: CANVAS_H, cacheBust: true });
}

export async function downloadCertificatePng(filename: string): Promise<void> {
  const dataUrl = await captureCanvas(2);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadCertificatePdf(filename: string): Promise<void> {
  const dataUrl = await captureCanvas(2);
  // A4 landscape (297×210 mm) matches the canvas's √2 aspect ratio exactly.
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
  pdf.save(`${filename}.pdf`);
}
