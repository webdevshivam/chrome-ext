
// Enhanced content script for technology detection
(function() {
  'use strict';

  // Safety wrapper for all operations
  const safeExecute = (fn, fallback = null) => {
    try {
      return fn();
    } catch (error) {
      console.debug('Safe execute error:', error);
      return fallback;
    }
  };

  // Main technology analysis function
  function analyzePageTechnologies() {
    const technologies = {
      frontend: [],
      backend: [],
      analytics: [],
      cms: []
    };

    try {
      // Frontend framework detection with enhanced safety
      const frontendChecks = {
        'React': () => safeExecute(() => 
          window.React || 
          document.querySelector('[data-reactroot], [data-react]') ||
          document.querySelector('script[src*="react"]')
        ),
        'Vue.js': () => safeExecute(() => 
          window.Vue || 
          document.querySelector('[data-v-], [v-]') ||
          document.querySelector('script[src*="vue"]')
        ),
        'Angular': () => safeExecute(() => 
          window.angular || window.ng ||
          document.querySelector('[ng-app], [ng-]') ||
          document.querySelector('script[src*="angular"]')
        ),
        'jQuery': () => safeExecute(() => 
          (window.$ && window.$.fn && window.$.fn.jquery) ||
          document.querySelector('script[src*="jquery"]')
        ),
        'Bootstrap': () => safeExecute(() => 
          document.querySelector('link[href*="bootstrap"]') ||
          document.querySelector('.container, .row, .col-') ||
          document.querySelector('script[src*="bootstrap"]')
        ),
        'Tailwind CSS': () => safeExecute(() => 
          document.querySelector('script[src*="tailwind"]') ||
          document.querySelector('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]')
        ),
        'Next.js': () => safeExecute(() => 
          window.__NEXT_DATA__ ||
          document.querySelector('script[src*="_next"]') ||
          document.querySelector('[id="__next"]')
        ),
        'Nuxt.js': () => safeExecute(() => 
          window.__NUXT__ ||
          document.querySelector('script[src*="_nuxt"]') ||
          document.querySelector('[id="__nuxt"]')
        ),
        'Svelte': () => safeExecute(() => 
          window.svelte || document.querySelector('script[src*="svelte"]')
        ),
        'Alpine.js': () => safeExecute(() => 
          window.Alpine ||
          document.querySelector('[x-data], [x-show], [x-init]')
        ),
        'Lodash': () => safeExecute(() => 
          (window._ && window._.VERSION) ||
          document.querySelector('script[src*="lodash"]')
        ),
        'D3.js': () => safeExecute(() => 
          window.d3 || document.querySelector('script[src*="d3"]')
        ),
        'Three.js': () => safeExecute(() => 
          window.THREE || document.querySelector('script[src*="three"]')
        ),
        'Webpack': () => safeExecute(() => 
          window.webpackJsonp || window.__webpack_require__ ||
          document.querySelector('script[src*="webpack"]')
        )
      };

      // Backend/Server technology detection
      const backendChecks = {
        'Node.js': () => safeExecute(() => {
          const generator = document.querySelector('meta[name="generator"]');
          return (generator && generator.content && generator.content.includes('Node')) ||
                 document.querySelector('script[src*="node"]');
        }),
        'Django': () => safeExecute(() => 
          document.querySelector('input[name="csrfmiddlewaretoken"]') ||
          document.querySelector('[data-django]')
        ),
        'Ruby on Rails': () => safeExecute(() => 
          document.querySelector('meta[name="csrf-token"]') &&
          document.querySelector('script[src*="rails"]')
        ),
        'ASP.NET': () => safeExecute(() => 
          document.querySelector('input[name="__VIEWSTATE"]') ||
          document.querySelector('form[action*=".aspx"]')
        ),
        'PHP': () => safeExecute(() => 
          window.location.href.includes('.php') ||
          document.querySelector('input[name*="PHPSESSID"]')
        ),
        'Laravel': () => safeExecute(() => 
          document.querySelector('meta[name="csrf-token"]') &&
          document.querySelector('script[src*="laravel"]')
        )
      };

      // Analytics and marketing tools
      const analyticsChecks = {
        'Google Analytics': () => safeExecute(() => 
          window.gtag || window.ga || window.GoogleAnalyticsObject ||
          document.querySelector('script[src*="google-analytics"], script[src*="gtag"]')
        ),
        'Google Tag Manager': () => safeExecute(() => 
          window.dataLayer || window.google_tag_manager ||
          document.querySelector('script[src*="googletagmanager"]')
        ),
        'Facebook Pixel': () => safeExecute(() => 
          window.fbq || window._fbq ||
          document.querySelector('script[src*="connect.facebook.net"]')
        ),
        'Hotjar': () => safeExecute(() => 
          window.hj || window._hjSettings ||
          document.querySelector('script[src*="hotjar"]')
        ),
        'Mixpanel': () => safeExecute(() => 
          window.mixpanel || document.querySelector('script[src*="mixpanel"]')
        ),
        'Segment': () => safeExecute(() => 
          window.analytics || document.querySelector('script[src*="segment"]')
        )
      };

      // CMS and e-commerce platforms
      const cmsChecks = {
        'WordPress': () => safeExecute(() => 
          document.querySelector('link[href*="wp-content"]') ||
          document.querySelector('meta[name="generator"][content*="WordPress"]') ||
          window.wp
        ),
        'Drupal': () => safeExecute(() => 
          document.querySelector('script[src*="drupal"]') ||
          document.querySelector('meta[name="generator"][content*="Drupal"]') ||
          window.Drupal
        ),
        'Shopify': () => safeExecute(() => 
          window.Shopify ||
          document.querySelector('script[src*="shopify"], [data-shopify]') ||
          document.querySelector('script[src*="shopifycdn"]')
        ),
        'WooCommerce': () => safeExecute(() => 
          document.querySelector('script[src*="woocommerce"], .woocommerce') ||
          window.woocommerce_params
        ),
        'Magento': () => safeExecute(() => 
          window.Magento ||
          document.querySelector('script[src*="magento"], [data-mage-init]')
        ),
        'Squarespace': () => safeExecute(() => 
          document.querySelector('script[src*="squarespace"]') ||
          document.querySelector('meta[name="generator"][content*="Squarespace"]')
        ),
        'Wix': () => safeExecute(() => 
          document.querySelector('script[src*="wix.com"]') ||
          document.querySelector('meta[name="generator"][content*="Wix"]') ||
          window.wixBiSession
        ),
        'Webflow': () => safeExecute(() => 
          document.querySelector('script[src*="webflow"]') ||
          document.querySelector('meta[name="generator"][content*="Webflow"]') ||
          window.Webflow
        )
      };

      // Execute all checks safely
      const runChecks = (checks, category) => {
        Object.entries(checks).forEach(([name, check]) => {
          try {
            if (check()) {
              technologies[category].push(name);
            }
          } catch (error) {
            console.debug(`Error checking ${name}:`, error);
          }
        });
      };

      runChecks(frontendChecks, 'frontend');
      runChecks(backendChecks, 'backend');
      runChecks(analyticsChecks, 'analytics');
      runChecks(cmsChecks, 'cms');

      // Additional detection from DOM elements
      safeExecute(() => {
        const scripts = document.querySelectorAll('script[src]');
        const links = document.querySelectorAll('link[href]');

        [...scripts, ...links].forEach(element => {
          const src = (element.src || element.href || '').toLowerCase();
          
          // CDN and library detection
          if (src.includes('cdn.') || src.includes('unpkg.') || src.includes('cdnjs.')) {
            if (src.includes('axios') && !technologies.frontend.includes('Axios')) {
              technologies.frontend.push('Axios');
            }
            if (src.includes('moment') && !technologies.frontend.includes('Moment.js')) {
              technologies.frontend.push('Moment.js');
            }
            if (src.includes('chart') && !technologies.frontend.includes('Chart.js')) {
              technologies.frontend.push('Chart.js');
            }
            if (src.includes('fontawesome') && !technologies.frontend.includes('Font Awesome')) {
              technologies.frontend.push('Font Awesome');
            }
          }
        });
      });

      return technologies;

    } catch (error) {
      console.error('Error in analyzePageTechnologies:', error);
      return {
        frontend: ['Detection completed with errors'],
        backend: [],
        analytics: [],
        cms: []
      };
    }
  }

  // Message listener with enhanced error handling
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request && request.action === 'analyzeTech') {
        try {
          const technologies = analyzePageTechnologies();
          sendResponse({ 
            success: true, 
            technologies: technologies 
          });
        } catch (error) {
          console.error('Content script analysis error:', error);
          sendResponse({ 
            success: false, 
            error: error.message || 'Analysis failed' 
          });
        }
      }
      return true; // Keep message channel open
    });
  }

  // Signal content script is ready
  safeExecute(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'contentScriptReady' }).catch(() => {
        // Ignore if popup is not listening
      });
    }
  });

})();
