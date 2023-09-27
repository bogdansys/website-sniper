const pageHash = hashString(document.documentElement.innerHTML);

chrome.runtime.sendMessage({
  action: "checkChange",
  url: window.location.href,
  newHash: pageHash
});

function hashString(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }

  return hash.toString();
}
