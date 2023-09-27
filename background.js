let checkInterval = 5; // default to 5 seconds

chrome.storage.sync.get('checkInterval', (data) => {
  if (data.checkInterval) {
    checkInterval = data.checkInterval;
    setAlarm();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.checkInterval) {
      checkInterval = changes.checkInterval.newValue;
      setAlarm();
    }
  }
});

function setAlarm() {
  chrome.alarms.create('checkSites', { periodInMinutes: checkInterval / 60 });
}

let trackedSites = {};

chrome.storage.sync.get('trackedSites', (data) => {
  if (data.trackedSites) {
    trackedSites = data.trackedSites;
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkSites') {
    checkSitesForChanges();
  }
});

async function checkSitesForChanges() {
  for (const [url, oldHash] of Object.entries(trackedSites)) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const newHash = hashString(text);

      if (oldHash !== newHash) {
        trackedSites[url] = newHash;
        chrome.storage.sync.set({ trackedSites });

        // Check the action based on the selected option
        chrome.storage.sync.get('openInNewTab', (data) => {
          const openInNewTab = data.openInNewTab !== undefined ? data.openInNewTab : true;

          if (openInNewTab) {
            // Open the URL in a new tab
            chrome.tabs.create({ url });
          } else {
            // Send a notification
            chrome.notifications.create({
              type: 'basic',
              title: 'Website Changed',
              message: `${url} has changed.`,
              iconUrl: 'icon.png',
            });
          }
        });
      }
    } catch (e) {
      console.error(`Failed to fetch ${url}: ${e}`);
    }
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return hash.toString();
}
