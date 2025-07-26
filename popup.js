
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

      // Get current tab with proper error handling
      let tabs;
      try {
        tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      } catch (tabError) {
        throw new Error('Unable to access current tab. Please refresh the page and try again.');
      }

      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found. Please refresh the page and try again.');
      }

      const tab = tabs[0];
      
      // Check if tab has valid URL
      if (!tab.url) {
        throw new Error('Unable to access tab URL. Please refresh the page and try again.');
      }

      urlInfo.textContent = `Analyzing: ${tab.url}`;

      // Check if URL is analyzable
      const restrictedUrls = ['chrome://', 'chrome-extension://', 'moz-extension://', 'about:', 'file://'];
      if (restrictedUrls.some(prefix => tab.url.startsWith(prefix))) {
        throw new Error('Cannot analyze browser internal pages or local files');
      }

      // Check for permissions
      if (!chrome.scripting || !chrome.tabs) {
        throw new Error('Extension permissions not available. Please reload the extension.');
      }

      let analysisSuccess = false;
      let techData = null;

      // Method 1: Try using content script messaging
      try {
        // Inject content script
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Wait for content script to initialize
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Send message to content script
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

      // Method 2: Fallback to direct script execution
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
          console.log('Direct execution method failed:', directExecutionError.message);
        }
      }

      // Method 3: Final fallback with basic detection
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
        } catch (basicDetectionError) {
          throw new Error('Unable to analyze this page. The page may be blocking script execution or have security restrictions.');
        }
      }

      if (analysisSuccess && techData) {
        displayResults(techData);
      } else {
        throw new Error('No technologies could be detected on this page.');
      }

    } catch (error) {
      showError(error.message);
    } finally {
      loadingDiv.style.display = 'none';
    }
  }

  // Enhanced fallback function
  function analyzePageDirectly() {
    try {
      const technologies = {
        frontend: [],
        backend: [],
        analytics: [],
        cms: []
      };

      // Frontend detection
      const frontendChecks = {
        'React': () => window.React || document.querySelector('[data-reactroot]') || document.querySelector('script[src*="react"]'),
        'Vue.js': () => window.Vue || document.querySelector('[data-v-]') || document.querySelector('script[src*="vue"]'),
        'Angular': () => window.angular || window.ng || document.querySelector('[ng-app]') || document.querySelector('script[src*="angular"]'),
        'jQuery': () => window.$ && window.$.fn && window.$.fn.jquery,
        'Bootstrap': () => document.querySelector('link[href*="bootstrap"]') || document.querySelector('.container, .row, .col-'),
        'Next.js': () => window.__NEXT_DATA__ || document.querySelector('script[src*="_next"]'),
        'Nuxt.js': () => window.__NUXT__ || document.querySelector('script[src*="_nuxt"]'),
        'Tailwind CSS': () => document.querySelector('script[src*="tailwind"]') || document.querySelector('[class*="tw-"]') || document.querySelector('[class*="bg-"]'),
        'Alpine.js': () => window.Alpine || document.querySelector('[x-data]'),
        'Lodash': () => window._ && window._.VERSION,
        'D3.js': () => window.d3,
        'Three.js': () => window.THREE
      };

      // Backend/CMS detection
      const backendChecks = {
        'WordPress': () => document.querySelector('link[href*="wp-content"]') || document.querySelector('meta[name="generator"][content*="WordPress"]'),
        'Drupal': () => document.querySelector('script[src*="drupal"]') || document.querySelector('meta[name="generator"][content*="Drupal"]'),
        'Shopify': () => window.Shopify || document.querySelector('script[src*="shopify"]') || document.querySelector('[data-shopify]'),
        'Squarespace': () => document.querySelector('script[src*="squarespace"]') || document.querySelector('meta[name="generator"][content*="Squarespace"]'),
        'Wix': () => document.querySelector('script[src*="wix.com"]') || document.querySelector('meta[name="generator"][content*="Wix"]'),
        'Webflow': () => document.querySelector('script[src*="webflow"]') || document.querySelector('meta[name="generator"][content*="Webflow"]')
      };

      // Analytics detection
      const analyticsChecks = {
        'Google Analytics': () => window.gtag || window.ga || document.querySelector('script[src*="google-analytics"]') || document.querySelector('script[src*="gtag"]'),
        'Google Tag Manager': () => window.dataLayer || document.querySelector('script[src*="googletagmanager"]'),
        'Facebook Pixel': () => window.fbq || document.querySelector('script[src*="connect.facebook.net"]'),
        'Hotjar': () => window.hj || document.querySelector('script[src*="hotjar"]')
      };

      // Run checks
      Object.entries(frontendChecks).forEach(([name, check]) => {
        try {
          if (check()) technologies.frontend.push(name);
        } catch (e) {}
      });

      Object.entries(backendChecks).forEach(([name, check]) => {
        try {
          if (check()) {
            if (['WordPress', 'Drupal', 'Shopify', 'Squarespace', 'Wix', 'Webflow'].includes(name)) {
              technologies.cms.push(name);
            } else {
              technologies.backend.push(name);
            }
          }
        } catch (e) {}
      });

      Object.entries(analyticsChecks).forEach(([name, check]) => {
        try {
          if (check()) technologies.analytics.push(name);
        } catch (e) {}
      });

      return technologies;
    } catch (error) {
      return {
        frontend: ['Error detecting technologies'],
        backend: [],
        analytics: [],
        cms: []
      };
    }
  }

  // Basic detection as final fallback
  function basicTechDetection() {
    const technologies = {
      frontend: [],
      backend: [],
      analytics: [],
      cms: []
    };

    try {
      // Basic checks that are less likely to fail
      if (window.jQuery || window.$) technologies.frontend.push('jQuery');
      if (window.React) technologies.frontend.push('React');
      if (window.Vue) technologies.frontend.push('Vue.js');
      if (window.angular) technologies.frontend.push('Angular');
      if (document.querySelector('link[href*="bootstrap"]')) technologies.frontend.push('Bootstrap');
      if (window.ga || window.gtag) technologies.analytics.push('Google Analytics');
      if (document.querySelector('link[href*="wp-content"]')) technologies.cms.push('WordPress');
    } catch (e) {
      technologies.frontend.push('Basic detection completed');
    }

    return technologies;
  }

  function displayResults(techData) {
    // Clear previous results
    document.getElementById('frontend').innerHTML = '';
    document.getElementById('backend').innerHTML = '';
    document.getElementById('analytics').innerHTML = '';
    document.getElementById('cms').innerHTML = '';

    // Display detected technologies
    addTechItems('frontend', techData.frontend || []);
    addTechItems('backend', techData.backend || []);
    addTechItems('analytics', techData.analytics || []);
    addTechItems('cms', techData.cms || []);

    resultsDiv.style.display = 'block';
  }

  function addTechItems(category, technologies) {
    const list = document.getElementById(category);
    if (!technologies || technologies.length === 0) {
      const item = document.createElement('li');
      item.className = 'tech-item';
      item.textContent = 'None detected';
      item.style.color = '#666';
      list.appendChild(item);
    } else {
      technologies.forEach(tech => {
        const item = document.createElement('li');
        item.className = 'tech-item';
        item.textContent = tech;
        list.appendChild(item);
      });
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
  }
});
