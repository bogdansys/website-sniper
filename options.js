document.addEventListener('DOMContentLoaded', () => {
  const trackedSitesList = document.getElementById('siteList');
  const intervalInput = document.getElementById('interval');
  const setIntervalButton = document.getElementById('setInterval');
  const actionSwitch = document.getElementById('actionSwitch');
  const actionText = document.getElementById('actionText');
  const addSiteButton = document.getElementById('addSite');

  // Initialize trackedSites as an empty object
  let trackedSites = {};

  // Function to update the action text based on the switch state
  function updateActionText() {
    if (actionSwitch.checked) {
      actionText.textContent = 'Send Notification';
    } else {
      actionText.textContent = 'Open in New Tab';
    }
  }

  // Initialize the action text
  updateActionText();

  // Load tracked sites and populate the list
  chrome.storage.sync.get('trackedSites', (data) => {
    trackedSites = data.trackedSites || {};

    for (const [url, hash] of Object.entries(trackedSites)) {
      const li = document.createElement('li');
      li.textContent = url;
      li.className = 'url';
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        delete trackedSites[url];
        chrome.storage.sync.set({ trackedSites }, () => {
          li.remove();
        });
      });
      li.appendChild(removeButton);
      trackedSitesList.appendChild(li);
    }
  });

  // Load and set the check interval
  chrome.storage.sync.get('checkInterval', (data) => {
    if (data.checkInterval) {
      intervalInput.value = data.checkInterval;
    }
  });

  // Save the check interval when the button is clicked
  setIntervalButton.addEventListener('click', () => {
    const interval = parseInt(intervalInput.value);
    if (interval && interval > 0) {
      chrome.storage.sync.set({ checkInterval: interval });
    }
  });

  // Add a new site when the button is clicked
  addSiteButton.addEventListener('click', () => {
    const url = prompt('Enter the URL of the site to track:');
    if (url) {
      trackedSites[url] = '';
      chrome.storage.sync.set({ trackedSites }, () => {
        const li = document.createElement('li');
        li.textContent = url;
        li.className = 'url';
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
          delete trackedSites[url];
          chrome.storage.sync.set({ trackedSites }, () => {
            li.remove();
          });
        });
        li.appendChild(removeButton);
        trackedSitesList.appendChild(li);
      });
    }
  });

  // Toggle the action based on the switch state
  actionSwitch.addEventListener('change', () => {
    if (actionSwitch.checked) {
      actionText.textContent = 'Send Notification';
    } else {
      actionText.textContent = 'Open in New Tab';
    }

    // Save the action setting
    chrome.storage.sync.set({ openInNewTab: actionSwitch.checked });
  });

  // Initialize the action based on the switch's default state
  chrome.storage.sync.get('openInNewTab', (data) => {
    if (data.openInNewTab !== undefined) {
      actionSwitch.checked = data.openInNewTab;
      if (data.openInNewTab) {
        actionText.textContent = 'Open in New Tab';
      } else {
        actionText.textContent = 'Send Notification';
      }
    }
  });
});
