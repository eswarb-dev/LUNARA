import React from 'react';

const colorVariants = ['pearl', 'silver', 'gold'] as const;

function makeFallingStars(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const left = (index * 37 + 11) % 101;
    const top = ((index * 29 + 17) % 121) - 20;
    const sizePattern = index % 11 === 0 ? 2 : index % 5 === 0 ? 1.45 : index % 3 === 0 ? 1.22 : 1;
    const bright = index % 13 === 0 || index % 17 === 0;
    const opacity = bright ? 0.72 + (index % 2) * 0.06 : 0.38 + ((index * 7) % 20) / 100;
    const travelX = index % 4 === 0 ? 10 : index % 3 === 0 ? 6 : index % 2 === 0 ? -8 : -14;

    return {
      id: `lunara-star-${index}`,
      left: `${left}%`,
      top: `${top}%`,
      duration: `${8 + ((index * 5) % 11)}s`,
      delay: `-${((index * 1.73) % 18).toFixed(2)}s`,
      size: sizePattern.toFixed(2),
      opacity: opacity.toFixed(2),
      travelX: `${travelX}vw`,
      travelY: `${78 + ((index * 13) % 52)}vh`,
      rotate: `${25 + ((index * 7) % 11)}deg`,
      blur: `${(0.2 + ((index * 3) % 6) / 10).toFixed(1)}px`,
      color: colorVariants[index % colorVariants.length],
    };
  });
}

const fallingStars = makeFallingStars(60);

export default function LunaraCelestialBackground() {
  return (
    <div className="lunara-celestial-background" aria-hidden="true">
      <div className="lunara-celestial-image">
        <picture>
          <source srcSet="/assets/lunara-moon-bg.webp" type="image/webp" />
          <img
            src="/assets/lunara-moon-bg.jpg"
            alt=""
            onError={(event) => {
              const image = event.currentTarget;
              if (!image.src.endsWith('/assets/lunar%20lumina.jpg')) {
                image.src = '/assets/lunar lumina.jpg';
                image.closest('.lunara-celestial-image')?.classList.add('is-low-res');
              }
            }}
          />
        </picture>
      </div>
      <div className="lunara-celestial-vignette" />
      <div className="lunara-celestial-overlay" />
      <div className="lunara-celestial-moon-glow" />
      <div className="lunara-falling-stars">
        {fallingStars.map((star) => (
          <span
            key={star.id}
            className={`lunara-falling-star lunara-falling-star-${star.color}`}
            style={{
              '--star-left': star.left,
              '--star-top': star.top,
              '--star-size': star.size,
              '--star-opacity': star.opacity,
              '--star-duration': star.duration,
              '--star-delay': star.delay,
              '--star-travel-x': star.travelX,
              '--star-travel-y': star.travelY,
              '--star-rotate': star.rotate,
              '--star-blur': star.blur,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
