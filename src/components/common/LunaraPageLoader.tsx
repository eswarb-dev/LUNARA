import React from 'react';

interface LunaraPageLoaderProps {
  subtitle?: string;
}

export const LunaraPageLoader: React.FC<LunaraPageLoaderProps> = ({
  subtitle = 'Opening your moonlit journal...',
}) => {
  return (
    <section className="lunara-page-loader" role="status" aria-live="polite">
      <picture className="lunara-page-loader-bg">
        <source srcSet="/assets/lunara-moon-bg.webp" type="image/webp" />
        <img
          src="/assets/lunara-moon-bg.jpg"
          alt=""
          aria-hidden="true"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== '/assets/lunar lumina.jpg') {
              img.src = '/assets/lunar lumina.jpg';
            }
          }}
        />
      </picture>

      <div className="lunara-page-loader-overlay" />

      <div className="lunara-page-loader-content">
        <div className="lunara-eclipse-loader" aria-hidden="true">
          <div className="lunara-eclipse-shadow" />
        </div>
        <p className="lunara-page-loader-text">Loading...</p>
        {subtitle && (
          <p className="lunara-page-loader-subtitle">{subtitle}</p>
        )}
      </div>
    </section>
  );
};

export default LunaraPageLoader;
