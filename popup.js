
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

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      urlInfo.textContent = `Analyzing: ${tab.url}`;

      // Inject content script and get page data
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: analyzePageTechnologies
      });

      const techData = results[0].result;
      displayResults(techData);

    } catch (error) {
      showError('Failed to analyze website: ' + error.message);
    } finally {
      loadingDiv.style.display = 'none';
    }
  }

  function displayResults(techData) {
    // Clear previous results
    document.getElementById('frontend').innerHTML = '';
    document.getElementById('backend').innerHTML = '';
    document.getElementById('analytics').innerHTML = '';
    document.getElementById('cms').innerHTML = '';

    // Display detected technologies
    addTechItems('frontend', techData.frontend);
    addTechItems('backend', techData.backend);
    addTechItems('analytics', techData.analytics);
    addTechItems('cms', techData.cms);

    resultsDiv.style.display = 'block';
  }

  function addTechItems(category, technologies) {
    const list = document.getElementById(category);
    if (technologies.length === 0) {
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

// This function will be injected into the page
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
    'Three.js': () => window.THREE
  };

  // Check for backend/server technologies via headers and meta tags
  const serverHeader = document.querySelector('meta[name="generator"]');
  const poweredBy = document.querySelector('meta[name="powered-by"]');
  
  // Check response headers (limited in content script)
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
    if (check()) technologies.frontend.push(name);
  });

  Object.entries(backendChecks).forEach(([name, check]) => {
    if (check()) technologies.backend.push(name);
  });

  Object.entries(analyticsChecks).forEach(([name, check]) => {
    if (check()) technologies.analytics.push(name);
  });

  Object.entries(cmsChecks).forEach(([name, check]) => {
    if (check()) technologies.cms.push(name);
  });

  // Additional detection from scripts and links
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const links = Array.from(document.querySelectorAll('link[href]'));
  
  scripts.forEach(script => {
    const src = script.src.toLowerCase();
    if (src.includes('cdn.jsdelivr.net') || src.includes('unpkg.com') || src.includes('cdnjs.cloudflare.com')) {
      // Common CDN patterns
      if (src.includes('axios') && !technologies.frontend.includes('Axios')) technologies.frontend.push('Axios');
      if (src.includes('moment') && !technologies.frontend.includes('Moment.js')) technologies.frontend.push('Moment.js');
      if (src.includes('chart') && !technologies.frontend.includes('Chart.js')) technologies.frontend.push('Chart.js');
    }
  });

  return technologies;
}
