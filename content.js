
// Content script for additional technology detection
(function() {
  'use strict';

  // Enhanced technology detection that runs on page load
  function detectAdditionalTech() {
    const techSignatures = {
      'Webpack': () => window.webpackJsonp || document.querySelector('script[src*="webpack"]'),
      'Vite': () => document.querySelector('script[type="module"][src*="vite"]'),
      'Parcel': () => document.querySelector('script[src*="parcel"]'),
      'Rollup': () => window.rollup,
      'TypeScript': () => document.querySelector('script[type="text/typescript"]'),
      'Sass/SCSS': () => document.querySelector('link[href*=".scss"], link[href*=".sass"]'),
      'Less': () => document.querySelector('link[href*=".less"]'),
      'PWA': () => 'serviceWorker' in navigator && document.querySelector('link[rel="manifest"]'),
      'AMP': () => document.querySelector('html[amp], html[⚡]'),
      'GraphQL': () => window.GraphQL || document.querySelector('script[src*="graphql"]')
    };

    // Store detected technologies in page context
    window.detectedTechnologies = window.detectedTechnologies || {};
    
    Object.entries(techSignatures).forEach(([name, check]) => {
      if (check()) {
        window.detectedTechnologies[name] = true;
      }
    });
  }

  // Run detection when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectAdditionalTech);
  } else {
    detectAdditionalTech();
  }

  // Also run detection after a delay to catch dynamically loaded content
  setTimeout(detectAdditionalTech, 2000);
})();
