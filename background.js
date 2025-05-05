// background.js

// Menu ID and storage defaults
const MENU_ID = "stripSpecialChars";
const defaultBlacklist = "!@#$%^&*()_+=~`{}[]\\:\"'<>,.?/";
const defaultWhitelist = "-_.";

// Context-menu creation helper
function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Strip special characters",
      contexts: ["editable"],
    });
  });
}

// Setup context menu on install, startup, and immediately (dev reloads)
chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);
createContextMenu();

// Handle the menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) {
    chrome.tabs.executeScript(tab.id, {
      code: `(${stripSpecialCharsFromSelection.toString()})()`
    });
  }
});

// Main stripping function
function stripSpecialCharsFromSelection() {
  chrome.storage.local.get(["mode", "blacklist", "whitelist"], (res) => {
    const mode = res.mode === "blacklist" ? "blacklist" : "whitelist";
    const blacklist = res.blacklist ?? defaultBlacklist;
    const whitelist = res.whitelist ?? defaultWhitelist;

    // Escape regex metacharacters
    const safeBlacklist = blacklist.replace(/[-[\]\/{}()*+?.\\^$|]/g, "\\$&");
    const safeWhitelist = whitelist.replace(/[-[\]\/{}()*+?.\\^$|]/g, "\\$&");

    // Build pattern based on mode
    const pattern = mode === "blacklist"
      ? new RegExp(`[${safeBlacklist}]+`, "g")
      : new RegExp(`[^a-zA-Z0-9 ${safeWhitelist}]+`, "g");

    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "INPUT" ||
       active.tagName === "TEXTAREA" ||
       active.isContentEditable)
    ) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      const text = typeof active.value === "string" ? active.value : active.innerText;
      const selectedText = text.slice(start, end);
      const cleaned = selectedText.replace(pattern, "");
      const newText = text.slice(0, start) + cleaned + text.slice(end);

      if (typeof active.value === "string") {
        active.value = newText;
      } else {
        active.innerText = newText;
      }

      if (active.setSelectionRange) {
        active.setSelectionRange(start, start + cleaned.length);
      }
    }
  });
}
