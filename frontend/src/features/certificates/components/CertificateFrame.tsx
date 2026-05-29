import { useEffect, useRef, useState } from 'react';
import { CertificateTemplate, type CertificateData } from './CertificateTemplate';

const CANVAS_W = 1123;
const CANVAS_H = 794;

/**
 * Scales the fixed 1123×794 certificate canvas down to fit its container width,
 * preserving aspect ratio. The inner canvas keeps its exact pixel dimensions so
 * it can still be exported to PNG/PDF at full resolution.
 */
export function CertificateFrame({ data, maxWidth = 1123 }: { data: CertificateData; maxWidth?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const avail = Math.min(el.clientWidth, maxWidth);
      setScale(avail / CANVAS_W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxWidth]);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div
        style={{
          width: CANVAS_W * scale,
          height: CANVAS_H * scale,
          margin: '0 auto',
          boxShadow: '0 12px 40px rgba(60,45,20,0.18)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <CertificateTemplate {...data} />
        </div>
      </div>
    </div>
  );
}
