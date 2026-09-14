
import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 sm:py-12 px-4 sm:px-6 bg-deep-moon-navy">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col space-y-8 sm:space-y-6 md:flex-row md:justify-between md:items-center md:space-y-0">

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:justify-start">
             <a
               href="#"
               className="text-muted-stardust hover:text-pearl-mist transition-colors font-inter text-sm sm:text-base min-h-[44px] flex items-center"
             >
               Home
             </a>
             <a href="#journal" className="text-muted-stardust hover:text-pearl-mist transition-colors font-inter text-sm sm:text-base min-h-[44px] flex items-center">
               Journal
             </a>
             <a href="#about" className="text-muted-stardust hover:text-pearl-mist transition-colors font-inter text-sm sm:text-base min-h-[44px] flex items-center">
               About
             </a>
             <a href="#contact" className="text-muted-stardust hover:text-pearl-mist transition-colors font-inter text-sm sm:text-base min-h-[44px] flex items-center">
               Contact
             </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center items-center gap-4 sm:gap-6 order-first md:order-none">
            <a
              href="https://github.com/sushil930/lunara.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-stardust hover:text-pearl-mist transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="GitHub"
            >
              <Github size={20} className="sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-stardust hover:text-pearl-mist transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} className="sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-stardust hover:text-pearl-mist transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Vercel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:w-6 sm:h-6">
                <path d="M12 2L2 19.777h20L12 2z"/>
              </svg>
            </a>
            <a
              href="https://railway.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-stardust hover:text-pearl-mist transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Railway"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:w-6 sm:h-6">
                <path d="M13.5 2C18.194 2 22 5.806 22 10.5S18.194 19 13.5 19c-2.832 0-5.389-1.387-6.977-3.695L5.5 19l-1.05-1.05L10.195 8.205C11.613 6.387 12.5 4.542 12.5 2.5h1z"/>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-muted-stardust/70 font-inter text-xs sm:text-sm text-center md:text-left order-last">
            © 2025 Lunara — Moonlit Emotional Journal
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-muted-stardust/15 text-center">
           <p className="text-xs sm:text-sm font-garamond italic text-muted-stardust/60 px-4">
             "Under the moonlight, we find ourselves"
           </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
