// Enhanced content script for technology detection
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

    try {
      // Check for frontend frameworks and libraries
      const frontendChecks = {
        'React': () => window.React || document.querySelector('[data-reactroot]') || document.querySelector('script[src*="react"]') || document.querySelector('[data-react]'),
        'Vue.js': () => window.Vue || document.querySelector('[data-v-]') || document.querySelector('script[src*="vue"]') || document.querySelector('[v-]'),
        'Angular': () => window.angular || window.ng || document.querySelector('[ng-app]') || document.querySelector('script[src*="angular"]') || document.querySelector('[ng-]'),
        'jQuery': () => (window.$ && window.$.fn && window.$.fn.jquery) || document.querySelector('script[src*="jquery"]'),
        'Bootstrap': () => document.querySelector('link[href*="bootstrap"]') || document.querySelector('.container, .row, .col-') || document.querySelector('script[src*="bootstrap"]'),
        'Tailwind CSS': () => document.querySelector('script[src*="tailwind"]') || document.querySelector('[class*="tw-"]') || document.querySelector('[class*="bg-blue"], [class*="text-"], [class*="p-"], [class*="m-"]'),
        'Next.js': () => window.__NEXT_DATA__ || document.querySelector('script[src*="_next"]') || document.querySelector('[id="__next"]'),
        'Nuxt.js': () => window.__NUXT__ || document.querySelector('script[src*="_nuxt"]') || document.querySelector('[id="__nuxt"]'),
        'Svelte': () => document.querySelector('script[src*="svelte"]') || window.svelte,
        'Alpine.js': () => window.Alpine || document.querySelector('[x-data]') || document.querySelector('[x-show]'),
        'Lodash': () => (window._ && window._.VERSION) || document.querySelector('script[src*="lodash"]'),
        'D3.js': () => window.d3 || document.querySelector('script[src*="d3"]'),
        'Three.js': () => window.THREE || document.querySelector('script[src*="three"]'),
        'Webpack': () => window.webpackJsonp || document.querySelector('script[src*="webpack"]') || window.__webpack_require__,
        'Vite': () => document.querySelector('script[type="module"][src*="vite"]') || window.__vite__,
        'TypeScript': () => document.querySelector('script[type="text/typescript"]') || window.TypeScript
      };

      // Check for backend/server technologies
      const serverHeader = document.querySelector('meta[name="generator"]');
      const poweredBy = document.querySelector('meta[name="powered-by"]');

      const backendChecks = {
        'Node.js': () => document.querySelector('script[src*="node"]') || (serverHeader && serverHeader.content && serverHeader.content.includes('Node')),
        'Django': () => document.querySelector('input[name="csrfmiddlewaretoken"]') || document.querySelector('[data-django]') || document.querySelector('script[src*="django"]'),
        'Ruby on Rails': () => document.querySelector('meta[name="csrf-token"]') && document.querySelector('script[src*="rails"]'),
        'ASP.NET': () => document.querySelector('input[name="__VIEWSTATE"]') || document.querySelector('form[action*=".aspx"]') || document.querySelector('script[src*="aspnet"]'),
        'PHP': () => document.querySelector('input[name*="PHPSESSID"]') || window.location.href.includes('.php') || document.querySelector('script[src*="php"]'),
        'Laravel': () => document.querySelector('meta[name="csrf-token"]') && document.querySelector('script[src*="laravel"]'),
        'Express.js': () => (poweredBy && poweredBy.content && poweredBy.content.includes('Express')) || window.Express
      };

      // Check for analytics and marketing tools
      const analyticsChecks = {
        'Google Analytics': () => window.gtag || window.ga || document.querySelector('script[src*="google-analytics"]') || document.querySelector('script[src*="gtag"]') || window.GoogleAnalyticsObject,
        'Google Tag Manager': () => window.dataLayer || document.querySelector('script[src*="googletagmanager"]') || window.google_tag_manager,
        'Facebook Pixel': () => window.fbq || document.querySelector('script[src*="connect.facebook.net"]') || window._fbq,
        'Hotjar': () => window.hj || document.querySelector('script[src*="hotjar"]') || window._hjSettings,
        'Mixpanel': () => window.mixpanel || document.querySelector('script[src*="mixpanel"]'),
        'Segment': () => window.analytics || document.querySelector('script[src*="segment"]'),
        'Adobe Analytics': () => window.s_account || document.querySelector('script[src*="omniture"]') || window.s_gi,
        'Matomo': () => window._paq || document.querySelector('script[src*="matomo"]') || document.querySelector('script[src*="piwik"]')
      };

      // Check for CMS and e-commerce platforms
      const cmsChecks = {
        'WordPress': () => document.querySelector('link[href*="wp-content"]') || document.querySelector('meta[name="generator"][content*="WordPress"]') || window.wp,
        'Drupal': () => document.querySelector('script[src*="drupal"]') || document.querySelector('meta[name="generator"][content*="Drupal"]') || window.Drupal,
        'Joomla': () => document.querySelector('script[src*="joomla"]') || document.querySelector('meta[name="generator"][content*="Joomla"]'),
        'Shopify': () => window.Shopify || document.querySelector('script[src*="shopify"]') || document.querySelector('[data-shopify]') || document.querySelector('script[src*="shopifycdn"]'),
        'WooCommerce': () => document.querySelector('script[src*="woocommerce"]') || document.querySelector('.woocommerce') || window.woocommerce_params,
        'Magento': () => window.Magento || document.querySelector('script[src*="magento"]') || document.querySelector('[data-mage-init]'),
        'PrestaShop': () => document.querySelector('meta[name="generator"][content*="PrestaShop"]') || window.prestashop,
        'BigCommerce': () => document.querySelector('script[src*="bigcommerce"]') || window.BigCommerce,
        'Squarespace': () => document.querySelector('script[src*="squarespace"]') || document.querySelector('meta[name="generator"][content*="Squarespace"]') || window.Static,
        'Wix': () => document.querySelector('script[src*="wix.com"]') || document.querySelector('meta[name="generator"][content*="Wix"]') || window.wixBiSession,
        'Webflow': () => document.querySelector('script[src*="webflow"]') || document.querySelector('meta[name="generator"][content*="Webflow"]') || window.Webflow
      };

      // Run checks with error handling
      Object.entries(frontendChecks).forEach(([name, check]) => {
        try {
          if (check()) technologies.frontend.push(name);
        } catch (e) {
          console.debug(`Error checking ${name}:`, e);
        }
      });

      Object.entries(backendChecks).forEach(([name, check]) => {
        try {
          if (check()) technologies.backend.push(name);
        } catch (e) {
          console.debug(`Error checking ${name}:`, e);
        }
      });

      Object.entries(analyticsChecks).forEach(([name, check]) => {
        try {
          if (check()) technologies.analytics.push(name);
        } catch (e) {
          console.debug(`Error checking ${name}:`, e);
        }
      });

      Object.entries(cmsChecks).forEach(([name, check]) => {
        try {
          if (check()) technologies.cms.push(name);
        } catch (e) {
          console.debug(`Error checking ${name}:`, e);
        }
      });

      // Additional detection from scripts and meta tags
      try {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const links = Array.from(document.querySelectorAll('link[href]'));

        [...scripts, ...links].forEach(element => {
          const src = (element.src || element.href || '').toLowerCase();

          // CDN detection
          if (src.includes('cdn.jsdelivr.net') || src.includes('unpkg.com') || src.includes('cdnjs.cloudflare.com')) {
            if (src.includes('axios') && !technologies.frontend.includes('Axios')) technologies.frontend.push('Axios');
            if (src.includes('moment') && !technologies.frontend.includes('Moment.js')) technologies.frontend.push('Moment.js');
            if (src.includes('chart') && !technologies.frontend.includes('Chart.js')) technologies.frontend.push('Chart.js');
            if (src.includes('fontawesome') && !technologies.frontend.includes('Font Awesome')) technologies.frontend.push('Font Awesome');
          }
        });
      } catch (e) {
        console.debug('Error in additional detection:', e);
      }

      return technologies;
    } catch (error) {
      console.error('Error in analyzePageTechnologies:', error);
      return {
        frontend: ['Detection error occurred'],
        backend: [],
        analytics: [],
        cms: []
      };
    }
  }

  // Listen for messages from popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
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
  }

  // Signal readiness
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'contentScriptReady' }).catch(() => {
        // Ignore errors if popup is not listening
      });
    }
  } catch (e) {
    // Ignore connection errors
  }

})();