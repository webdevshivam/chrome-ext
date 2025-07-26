
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

      // Send message to content script to analyze page
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzeTech' });
      const techData = response.technologies;
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
