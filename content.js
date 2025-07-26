
// Content script for technology detection
(function() {
  'use strict';

  // Main technology analysis function
  function analyzePageTechnologies() {
    const technologies = {
      frontend: [],
      backend: [],
      analytics: [],
      cms: []
    };

    // Check for frontend frameworks and libraries
    const frontendChecks = {
      'React': () => window.React || document.querySelector('[data-reactroot]') || document.querySelector('script[src*="react"]'),
      'Vue.js': () => window.Vue || document.querySelector('[data-v-]') || document.querySelector('script[src*="vue"]'),
      'Angular': () => window.angular || window.ng || document.querySelector('[ng-app]') || document.querySelector('script[src*="angular"]'),
      'jQuery': () => window.$ && window.$.fn && window.$.fn.jquery,
      'Bootstrap': () => document.querySelector('link[href*="bootstrap"]') || document.querySelector('.container, .row, .col-'),
      'Tailwind CSS': () => document.querySelector('script[src*="tailwind"]') || document.querySelector('[class*="tw-"]') || document.querySelector('[class*="bg-"]'),
      'Next.js': () => window.__NEXT_DATA__ || document.querySelector('script[src*="_next"]'),
      'Nuxt.js': () => window.__NUXT__ || document.querySelector('script[src*="_nuxt"]'),
      'Svelte': () => document.querySelector('script[src*="svelte"]'),
      'Alpine.js': () => window.Alpine || document.querySelector('[x-data]'),
      'Lodash': () => window._ && window._.VERSION,
      'D3.js': () => window.d3,
      'Three.js': () => window.THREE,
      'Webpack': () => window.webpackJsonp || document.querySelector('script[src*="webpack"]'),
      'Vite': () => document.querySelector('script[type="module"][src*="vite"]'),
      'Parcel': () => document.querySelector('script[src*="parcel"]'),
      'TypeScript': () => document.querySelector('script[type="text/typescript"]')
    };

    // Check for backend/server technologies
    const serverHeader = document.querySelector('meta[name="generator"]');
    const poweredBy = document.querySelector('meta[name="powered-by"]');
    
    const backendChecks = {
      'Node.js': () => document.querySelector('script[src*="node"]') || (serverHeader && serverHeader.content.includes('Node')),
      'WordPress': () => document.querySelector('link[href*="wp-content"]') || document.querySelector('meta[name="generator"][content*="WordPress"]'),
      'Drupal': () => document.querySelector('script[src*="drupal"]') || document.querySelector('meta[name="generator"][content*="Drupal"]'),
      'Joomla': () => document.querySelector('script[src*="joomla"]') || document.querySelector('meta[name="generator"][content*="Joomla"]'),
      'Django': () => document.querySelector('input[name="csrfmiddlewaretoken"]') || document.querySelector('[data-django]'),
      'Ruby on Rails': () => document.querySelector('meta[name="csrf-token"]') && document.querySelector('script[src*="rails"]'),
      'ASP.NET': () => document.querySelector('input[name="__VIEWSTATE"]') || document.querySelector('form[action*=".aspx"]'),
      'PHP': () => document.querySelector('input[name*="PHPSESSID"]') || window.location.href.includes('.php'),
      'Laravel': () => document.querySelector('meta[name="csrf-token"]') && document.querySelector('script[src*="laravel"]'),
      'Express.js': () => poweredBy && poweredBy.content.includes('Express')
    };

    // Check for analytics and marketing tools
    const analyticsChecks = {
      'Google Analytics': () => window.gtag || window.ga || document.querySelector('script[src*="google-analytics"]') || document.querySelector('script[src*="gtag"]'),
      'Google Tag Manager': () => window.dataLayer || document.querySelector('script[src*="googletagmanager"]'),
      'Facebook Pixel': () => window.fbq || document.querySelector('script[src*="connect.facebook.net"]'),
      'Hotjar': () => window.hj || document.querySelector('script[src*="hotjar"]'),
      'Mixpanel': () => window.mixpanel || document.querySelector('script[src*="mixpanel"]'),
      'Segment': () => window.analytics || document.querySelector('script[src*="segment"]'),
      'Adobe Analytics': () => window.s_account || document.querySelector('script[src*="omniture"]'),
      'Matomo': () => window._paq || document.querySelector('script[src*="matomo"]')
    };

    // Check for CMS and e-commerce platforms
    const cmsChecks = {
      'Shopify': () => window.Shopify || document.querySelector('script[src*="shopify"]') || document.querySelector('[data-shopify]'),
      'WooCommerce': () => document.querySelector('script[src*="woocommerce"]') || document.querySelector('.woocommerce'),
      'Magento': () => window.Magento || document.querySelector('script[src*="magento"]'),
      'PrestaShop': () => document.querySelector('meta[name="generator"][content*="PrestaShop"]'),
      'BigCommerce': () => document.querySelector('script[src*="bigcommerce"]'),
      'Squarespace': () => document.querySelector('script[src*="squarespace"]') || document.querySelector('meta[name="generator"][content*="Squarespace"]'),
      'Wix': () => document.querySelector('script[src*="wix.com"]') || document.querySelector('meta[name="generator"][content*="Wix"]'),
      'Webflow': () => document.querySelector('script[src*="webflow"]') || document.querySelector('meta[name="generator"][content*="Webflow"]')
    };

    // Run checks
    Object.entries(frontendChecks).forEach(([name, check]) => {
      try {
        if (check()) technologies.frontend.push(name);
      } catch (e) {
        // Ignore errors in checks
      }
    });

    Object.entries(backendChecks).forEach(([name, check]) => {
      try {
        if (check()) technologies.backend.push(name);
      } catch (e) {
        // Ignore errors in checks
      }
    });

    Object.entries(analyticsChecks).forEach(([name, check]) => {
      try {
        if (check()) technologies.analytics.push(name);
      } catch (e) {
        // Ignore errors in checks
      }
    });

    Object.entries(cmsChecks).forEach(([name, check]) => {
      try {
        if (check()) technologies.cms.push(name);
      } catch (e) {
        // Ignore errors in checks
      }
    });

    // Additional detection from scripts and links
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    
    scripts.forEach(script => {
      const src = script.src.toLowerCase();
      if (src.includes('cdn.jsdelivr.net') || src.includes('unpkg.com') || src.includes('cdnjs.cloudflare.com')) {
        // Common CDN patterns
        if (src.includes('axios') && !technologies.frontend.includes('Axios')) technologies.frontend.push('Axios');
        if (src.includes('moment') && !technologies.frontend.includes('Moment.js')) technologies.frontend.push('Moment.js');
        if (src.includes('chart') && !technologies.frontend.includes('Chart.js')) technologies.frontend.push('Chart.js');
      }
    });

    // Check for additional technologies from window object
    if (window.detectedTechnologies) {
      Object.keys(window.detectedTechnologies).forEach(tech => {
        if (!technologies.frontend.includes(tech)) {
          technologies.frontend.push(tech);
        }
      });
    }

    return technologies;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeTech') {
      try {
        const technologies = analyzePageTechnologies();
        sendResponse({ success: true, technologies: technologies });
      } catch (error) {
        console.error('Tech analysis error:', error);
        sendResponse({ success: false, error: error.message });
      }
    }
    return true; // Keep message channel open for async response
  });

  // Signal that content script is ready
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({ action: 'contentScriptReady' });
    } catch (e) {
      // Ignore if popup is not open
    }
  }

  // Enhanced technology detection that runs on page load
  function detectAdditionalTech() {
    const techSignatures = {
      'PWA': () => 'serviceWorker' in navigator && document.querySelector('link[rel="manifest"]'),
      'AMP': () => document.querySelector('html[amp], html[⚡]'),
      'GraphQL': () => window.GraphQL || document.querySelector('script[src*="graphql"]'),
      'Sass/SCSS': () => document.querySelector('link[href*=".scss"], link[href*=".sass"]'),
      'Less': () => document.querySelector('link[href*=".less"]')
    };

    // Store detected technologies in page context
    window.detectedTechnologies = window.detectedTechnologies || {};
    
    Object.entries(techSignatures).forEach(([name, check]) => {
      try {
        if (check()) {
          window.detectedTechnologies[name] = true;
        }
      } catch (e) {
        // Ignore errors
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
