// This script handles the extension's background logic.

// Listener for the command shortcut (Ctrl+I or Command+I)
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        // Send a message to the content script in the active tab
        chrome.tabs.sendMessage(activeTab.id, { action: "extractWord" });
      } else {
        console.error("No active tab found.");
      }
    });
  }
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "wordExtracted") {
    const extractedWord = request.word;
    if (extractedWord) {
      // Add a suffix to the word
      const wordWithSuffix = extractedWord + "_example_suffix"; // You can change the suffix

      // Copy the modified word to the clipboard
      navigator.clipboard.writeText(wordWithSuffix)
        .then(() => {
          console.log("Word copied to clipboard:", wordWithSuffix);
        })
        .catch((error) => {
          console.error("Failed to copy word to clipboard:", error);
        });
    }
  }
});
