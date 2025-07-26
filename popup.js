
document.addEventListener('DOMContentLoaded', function() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const urlInfo = document.getElementById('urlInfo');

  analyzeBtn.addEventListener('click', analyzeTech);

  async function analyzeTech() {
    try {
      // Show loading state
      loadingDiv.style.display = 'block';
      resultsDiv.style.display = 'none';
      errorDiv.style.display = 'none';

      // Check if chrome APIs are available
      if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
        throw new Error('Extension not properly loaded. Please reload the extension in Chrome.');
      }

      // Get current tab with comprehensive error handling
      let tabs = null;
      try {
        tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      } catch (tabError) {
        console.error('Tab query error:', tabError);
        throw new Error('Unable to access browser tabs. Please refresh this page and try again.');
      }

      // Validate tabs array
      if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
        throw new Error('No active tab found. Please make sure you have an active webpage open.');
      }

      const tab = tabs[0];
      
      // Comprehensive tab validation
      if (!tab) {
        throw new Error('Unable to access the current tab. Please refresh and try again.');
      }

      if (!tab.id || typeof tab.id !== 'number') {
        throw new Error('Invalid tab ID. Please refresh the page and try again.');
      }

      if (!tab.url || typeof tab.url !== 'string') {
        throw new Error('Unable to access the webpage URL. Please refresh the page and try again.');
      }

      // Display URL being analyzed
      urlInfo.textContent = `Analyzing: ${tab.url}`;

      // Check if URL is analyzable
      const restrictedPrefixes = [
        'chrome://',
        'chrome-extension://',
        'moz-extension://',
        'about:',
        'file://',
        'edge://',
        'opera://',
        'brave://',
        'vivaldi://'
      ];

      const isRestricted = restrictedPrefixes.some(prefix => {
        try {
          return tab.url.toLowerCase().startsWith(prefix.toLowerCase());
        } catch (e) {
          return false;
        }
      });

      if (isRestricted) {
        throw new Error('Cannot analyze browser internal pages, extensions, or local files. Please navigate to a regular website.');
      }

      // Check for data URLs or invalid protocols
      if (tab.url.startsWith('data:') || tab.url.startsWith('javascript:') || tab.url.startsWith('blob:')) {
        throw new Error('Cannot analyze this type of content. Please navigate to a regular website.');
      }

      let analysisSuccess = false;
      let techData = null;

      // Method 1: Try using existing content script
      try {
        const response = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, { action: 'analyzeTech' }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        if (response && response.success && response.technologies) {
          techData = response.technologies;
          analysisSuccess = true;
        }
      } catch (contentScriptError) {
        console.log('Content script method failed:', contentScriptError.message);
      }

      // Method 2: Direct script execution fallback
      if (!analysisSuccess) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: analyzePageDirectly
          });
          
          if (results && results[0] && results[0].result) {
            techData = results[0].result;
            analysisSuccess = true;
          }
        } catch (directExecutionError) {
          console.log('Direct execution failed:', directExecutionError.message);
        }
      }

      // Method 3: Basic detection fallback
      if (!analysisSuccess) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: basicTechDetection
          });
          
          if (results && results[0] && results[0].result) {
            techData = results[0].result;
            analysisSuccess = true;
          }
        } catch (basicError) {
          console.log('Basic detection failed:', basicError.message);
        }
      }

      // Check if any method succeeded
      if (!analysisSuccess || !techData) {
        throw new Error('Unable to analyze this webpage. The page may have security restrictions or be blocking script execution.');
      }

      displayResults(techData);

    } catch (error) {
      console.error('Analysis error:', error);
      showError(error.message || 'An unexpected error occurred while analyzing the website.');
    } finally {
      loadingDiv.style.display = 'none';
    }
  }

  // Enhanced direct analysis function
  function analyzePageDirectly() {
    try {
      const technologies = {
        frontend: [],
        backend: [],
        analytics: [],
        cms: []
      };

      // Safe property access helper
      const safeCheck = (fn) => {
        try {
          return fn();
        } catch (e) {
          return false;
        }
      };

      // Frontend framework detection
      const frontendChecks = {
        'React': () => safeCheck(() => window.React || 
          document.querySelector('[data-reactroot], [data-react], script[src*="react"]')),
        'Vue.js': () => safeCheck(() => window.Vue || 
          document.querySelector('[data-v-], [v-], script[src*="vue"]')),
        'Angular': () => safeCheck(() => window.angular || window.ng || 
          document.querySelector('[ng-app], [ng-], script[src*="angular"]')),
        'jQuery': () => safeCheck(() => (window.$ && window.$.fn && window.$.fn.jquery) || 
          document.querySelector('script[src*="jquery"]')),
        'Bootstrap': () => safeCheck(() => document.querySelector('link[href*="bootstrap"], .container, .row, .col-')),
        'Next.js': () => safeCheck(() => window.__NEXT_DATA__ || 
          document.querySelector('script[src*="_next"], [id="__next"]')),
        'Nuxt.js': () => safeCheck(() => window.__NUXT__ || 
          document.querySelector('script[src*="_nuxt"], [id="__nuxt"]')),
        'Tailwind CSS': () => safeCheck(() => document.querySelector('script[src*="tailwind"]') ||
          document.querySelector('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]')),
        'Alpine.js': () => safeCheck(() => window.Alpine || document.querySelector('[x-data], [x-show]')),
        'Svelte': () => safeCheck(() => window.svelte || document.querySelector('script[src*="svelte"]')),
        'D3.js': () => safeCheck(() => window.d3 || document.querySelector('script[src*="d3"]')),
        'Three.js': () => safeCheck(() => window.THREE || document.querySelector('script[src*="three"]')),
        'Lodash': () => safeCheck(() => (window._ && window._.VERSION) || document.querySelector('script[src*="lodash"]'))
      };

      // CMS and platform detection
      const cmsChecks = {
        'WordPress': () => safeCheck(() => document.querySelector('link[href*="wp-content"], meta[name="generator"][content*="WordPress"]') || window.wp),
        'Shopify': () => safeCheck(() => window.Shopify || document.querySelector('script[src*="shopify"], [data-shopify]')),
        'Squarespace': () => safeCheck(() => document.querySelector('script[src*="squarespace"], meta[name="generator"][content*="Squarespace"]')),
        'Wix': () => safeCheck(() => document.querySelector('script[src*="wix.com"], meta[name="generator"][content*="Wix"]')),
        'Webflow': () => safeCheck(() => document.querySelector('script[src*="webflow"], meta[name="generator"][content*="Webflow"]')),
        'Drupal': () => safeCheck(() => document.querySelector('script[src*="drupal"], meta[name="generator"][content*="Drupal"]')),
        'Magento': () => safeCheck(() => window.Magento || document.querySelector('script[src*="magento"], [data-mage-init]'))
      };

      // Analytics detection
      const analyticsChecks = {
        'Google Analytics': () => safeCheck(() => window.gtag || window.ga || window.GoogleAnalyticsObject ||
          document.querySelector('script[src*="google-analytics"], script[src*="gtag"]')),
        'Google Tag Manager': () => safeCheck(() => window.dataLayer || window.google_tag_manager ||
          document.querySelector('script[src*="googletagmanager"]')),
        'Facebook Pixel': () => safeCheck(() => window.fbq || window._fbq ||
          document.querySelector('script[src*="connect.facebook.net"]')),
        'Hotjar': () => safeCheck(() => window.hj || window._hjSettings ||
          document.querySelector('script[src*="hotjar"]'))
      };

      // Run all checks
      Object.entries(frontendChecks).forEach(([name, check]) => {
        if (check()) technologies.frontend.push(name);
      });

      Object.entries(cmsChecks).forEach(([name, check]) => {
        if (check()) technologies.cms.push(name);
      });

      Object.entries(analyticsChecks).forEach(([name, check]) => {
        if (check()) technologies.analytics.push(name);
      });

      // Basic backend detection
      if (safeCheck(() => document.querySelector('input[name="csrfmiddlewaretoken"]'))) {
        technologies.backend.push('Django');
      }
      if (safeCheck(() => document.querySelector('input[name="__VIEWSTATE"]'))) {
        technologies.backend.push('ASP.NET');
      }
      if (safeCheck(() => window.location.href.includes('.php'))) {
        technologies.backend.push('PHP');
      }

      return technologies;
    } catch (error) {
      console.error('Direct analysis error:', error);
      return {
        frontend: ['Analysis completed with limited detection'],
        backend: [],
        analytics: [],
        cms: []
      };
    }
  }

  // Minimal fallback detection
  function basicTechDetection() {
    const technologies = {
      frontend: [],
      backend: [],
      analytics: [],
      cms: []
    };

    try {
      // Only the most basic checks
      if (typeof window !== 'undefined') {
        if (window.jQuery || window.$) technologies.frontend.push('jQuery');
        if (window.React) technologies.frontend.push('React');
        if (window.Vue) technologies.frontend.push('Vue.js');
        if (window.angular) technologies.frontend.push('Angular');
        if (window.ga || window.gtag) technologies.analytics.push('Google Analytics');
      }

      if (typeof document !== 'undefined') {
        if (document.querySelector && document.querySelector('link[href*="bootstrap"]')) {
          technologies.frontend.push('Bootstrap');
        }
        if (document.querySelector && document.querySelector('link[href*="wp-content"]')) {
          technologies.cms.push('WordPress');
        }
      }

      // Ensure at least something is returned
      if (technologies.frontend.length === 0 && technologies.backend.length === 0 &&
          technologies.analytics.length === 0 && technologies.cms.length === 0) {
        technologies.frontend.push('Basic detection completed');
      }
    } catch (e) {
      technologies.frontend.push('Minimal detection completed');
    }

    return technologies;
  }

  function displayResults(techData) {
    // Ensure techData is valid
    if (!techData || typeof techData !== 'object') {
      techData = {
        frontend: ['No data available'],
        backend: [],
        analytics: [],
        cms: []
      };
    }

    // Clear previous results
    const categories = ['frontend', 'backend', 'analytics', 'cms'];
    categories.forEach(category => {
      const element = document.getElementById(category);
      if (element) {
        element.innerHTML = '';
      }
    });

    // Display detected technologies
    addTechItems('frontend', techData.frontend || []);
    addTechItems('backend', techData.backend || []);
    addTechItems('analytics', techData.analytics || []);
    addTechItems('cms', techData.cms || []);

    resultsDiv.style.display = 'block';
  }

  function addTechItems(category, technologies) {
    const list = document.getElementById(category);
    if (!list) return;

    if (!technologies || !Array.isArray(technologies) || technologies.length === 0) {
      const item = document.createElement('li');
      item.className = 'tech-item';
      item.textContent = 'None detected';
      item.style.color = '#666';
      list.appendChild(item);
    } else {
      technologies.forEach(tech => {
        const item = document.createElement('li');
        item.className = 'tech-item';
        item.textContent = String(tech); // Ensure it's a string
        list.appendChild(item);
      });
    }
  }

  function showError(message) {
    errorDiv.textContent = String(message || 'An unknown error occurred');
    errorDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
  }
});
