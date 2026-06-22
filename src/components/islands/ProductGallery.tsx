import { useState } from 'react';

interface Props {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Main image */}
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', borderRadius: 'var(--radius-xl)', background: 'var(--color-charcoal)' }}>
        <img
          src={images[active]}
          alt={`${title} — image ${active + 1}`}
          loading="eager"
          fetchpriority="high"
          decoding="async"
          width={600}
          height={800}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 200ms' }}
        />
        {/* Dot nav */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                style={{
                  width: i === active ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '999px',
                  background: i === active ? 'var(--color-lime)' : 'rgba(246,240,232,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 200ms var(--ease-expo-out), background 150ms',
                }}
              />
            ))}
          </div>
        )}
        {/* Prev/Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((active - 1 + images.length) % images.length)}
              aria-label="Previous image"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(42,33,28,0.6)', border: 'none', borderRadius: '999px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-espresso)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => setActive((active + 1) % images.length)}
              aria-label="Next image"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(42,33,28,0.6)', border: 'none', borderRadius: '999px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-espresso)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              style={{
                flexShrink: 0,
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: i === active ? '2px solid var(--color-lime)' : '2px solid transparent',
                padding: 0,
                cursor: 'pointer',
                transition: 'border-color 150ms',
                background: 'var(--color-charcoal)',
              }}
            >
              <img src={img} alt="" loading="lazy" decoding="async" width={64} height={64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
