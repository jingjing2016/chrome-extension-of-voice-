// This script is injected into web pages to detect the word under the cursor.

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractWord") {
    const word = getWordUnderCursor();
    if (word) {
      // Send the extracted word back to the background script
      chrome.runtime.sendMessage({ action: "wordExtracted", word: word });
    }
  }
});

// Function to get the word under the cursor
function getWordUnderCursor() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  let range = selection.getRangeAt(0);
  let node = selection.anchorNode;

  // If the selection is not collapsed, it means text is selected, return that.
  if (selection.type === "Range") {
    return selection.toString().trim();
  }

  // If the selection is collapsed (caret), expand to the word.
  if (range.collapsed && node) {
    let text = "";
    if (node.nodeType === Node.TEXT_NODE) {
      text = node.textContent;
    } else if (node.childNodes.length > 0 && node.childNodes[0].nodeType === Node.TEXT_NODE ) {
      // This handles cases where the cursor might be on an element but near text,
      // like at the beginning or end of a link or span.
      // It's a simplification and might need refinement for complex DOM structures.
      node = node.childNodes[0];
      text = node.textContent;
      range.selectNodeContents(node); // Select the text node to get its range
    } else {
        // Attempt to get the word from input or textarea elements
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            const value = activeElement.value;
            const cursorPosition = activeElement.selectionStart;

            if (value && cursorPosition !== null) {
                const textBeforeCursor = value.substring(0, cursorPosition);
                const textAfterCursor = value.substring(cursorPosition);

                const wordBreakBefore = textBeforeCursor.search(/\W\S*$/);
                const start = wordBreakBefore === -1 ? 0 : textBeforeCursor.lastIndexOf(' ') + 1;


                const wordBreakAfter = textAfterCursor.search(/\W/);
                const end = wordBreakAfter === -1 ? value.length : cursorPosition + wordBreakAfter;

                const word = value.substring(start, end).trim();
                if (word.length > 0) return word;
            }
        }
        return null; // Not a text node or suitable input element
    }


    const cursorPosition = selection.anchorOffset;

    // Expand left
    let start = cursorPosition;
    while (start > 0 && /\S/.test(text[start - 1])) {
      start--;
    }

    // Expand right
    let end = cursorPosition;
    while (end < text.length && /\S/.test(text[end])) {
      end++;
    }

    const word = text.substring(start, end).trim();
    if (word.length > 0) return word;
  }
  return null;
}
