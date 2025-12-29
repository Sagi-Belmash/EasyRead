document.addEventListener('DOMContentLoaded', function() {
  // 1. On open: Check storage and restore the visual state of the popup
  chrome.storage.local.get(['isActive'], function(result) {
    var isChecked = !!result.isActive;
    document.getElementById("activationSwitch").checked = isChecked;
    
    // Trigger the visual update immediately
    updatePopupVisuals(isChecked);
  });
});

document.getElementById("activationSwitch").addEventListener("input", function() {
  var isChecked = document.getElementById("activationSwitch").checked;
  
  // 2. Save to storage (this triggers the website script)
  chrome.storage.local.set({ isActive: isChecked });

  // 3. Update the popup visuals immediately
  updatePopupVisuals(isChecked);
});

// --- Helper Functions for the Popup ---

function updatePopupVisuals(active) {
  if (active) {
    applyEaseRead("explenation"); // Matches your specific ID spelling
    applyEaseRead("activateText");
  } else {
    revertText("explenation");
    revertText("activateText");
  }
}

function applyEaseRead(id) {
  var textElement = document.getElementById(id);
  if (!textElement) return;

  // Save original text if not saved yet
  if (!textElement.getAttribute("data-original")) {
    textElement.setAttribute("data-original", textElement.innerHTML);
  }

  var text = textElement.innerText;
  textElement.innerHTML = transformText(text);
}

function revertText(id) {
  var textElement = document.getElementById(id);
  if (!textElement) return;

  var originalText = textElement.getAttribute("data-original");
  if (originalText) {
    textElement.innerHTML = originalText;
  }
}

function transformText(text) {
  var newText = "";
  var word = "";
  for (var i = 0; i < text.length; i++) {
    if (i >= text.length - 1) {
        word += text.charAt(i);
        newText += " " + halfBold(word);
    }
    else if (text.charAt(i + 1) == " " || text.charAt(i + 1) == "\n" || text.charAt(i + 1) == "\r") {
        word += text.charAt(i);
        newText += " " + halfBold(word);
        i++;
        word = "";
    }
    else {
      word += text.charAt(i);
    }
  }
  return newText;
}

function halfBold(word) {
  var prefix = word.substring(0, word.length / 2);
  var suffix = word.substring(word.length / 2);
  return "<b>" + prefix + "</b>" + suffix;
}