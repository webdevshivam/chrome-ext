
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

      // Check if URL is analyzable
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        throw new Error('Cannot analyze browser internal pages');
      }

      try {
        // First ensure content script is injected
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Wait a moment for content script to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Send message to content script to analyze page
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzeTech' });
        
        if (response && response.success) {
          const techData = response.technologies;
          displayResults(techData);
        } else {
          throw new Error(response?.error || 'Failed to analyze page');
        }
      } catch (messageError) {
        // If message fails, try to inject and run analysis directly
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: analyzePageDirectly
        });
        
        if (results && results[0] && results[0].result) {
          displayResults(results[0].result);
        } else {
          throw new Error('Unable to analyze this page');
        }
      }

    } catch (error) {
      showError('Failed to analyze website: ' + error.message);
    } finally {
      loadingDiv.style.display = 'none';
    }
  }

  // Fallback function to run analysis directly if content script messaging fails
  function analyzePageDirectly() {
    const technologies = {
      frontend: [],
      backend: [],
      analytics: [],
      cms: []
    };

    // Basic frontend detection
    const frontendChecks = {
      'React': () => window.React || document.querySelector('[data-reactroot]') || document.querySelector('script[src*="react"]'),
      'Vue.js': () => window.Vue || document.querySelector('[data-v-]') || document.querySelector('script[src*="vue"]'),
      'Angular': () => window.angular || window.ng || document.querySelector('[ng-app]') || document.querySelector('script[src*="angular"]'),
      'jQuery': () => window.$ && window.$.fn && window.$.fn.jquery,
      'Bootstrap': () => document.querySelector('link[href*="bootstrap"]') || document.querySelector('.container, .row, .col-'),
      'Next.js': () => window.__NEXT_DATA__ || document.querySelector('script[src*="_next"]'),
      'WordPress': () => document.querySelector('link[href*="wp-content"]') || document.querySelector('meta[name="generator"][content*="WordPress"]'),
      'Google Analytics': () => window.gtag || window.ga || document.querySelector('script[src*="google-analytics"]')
    };

    Object.entries(frontendChecks).forEach(([name, check]) => {
      try {
        if (check()) {
          if (name === 'WordPress' || name === 'Google Analytics') {
            if (name === 'WordPress') technologies.cms.push(name);
            if (name === 'Google Analytics') technologies.analytics.push(name);
          } else {
            technologies.frontend.push(name);
          }
        }
      } catch (e) {
        // Ignore errors in checks
      }
    });

    return technologies;
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
