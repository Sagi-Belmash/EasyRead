# 📖 Easy Read - Bionic Reading Extension

**Easy Read** is a Chrome Extension that implements "Bionic Reading" concepts to help you read faster and more focused. It automatically highlights the first half of words on any web page, guiding your eye through the text while letting your brain complete the rest.

## ✨ Features

* **Smart Bolding:** Automatically bolds the first 50% of every word (rounding up).
* **Visual Contrast:** Forces the un-bolded part of the word to a lighter font weight (`font-weight: 400`), preventing "optical illusions" on sites with thick default fonts (like YouTube or Wikipedia).
* **Live Content Support:** Works on dynamic content like **YouTube Captions**, live comments, and "Load More" buttons using `MutationObserver`.
* **Recursion Protection:** Uses advanced DOM traversal and `closest()` checks to prevent the script from processing the same word twice (fixes the "infinite nesting" bug).
* **Structure Safe:** Uses `TreeWalker` to surgical alter text nodes without breaking links, buttons, or event listeners.
* **Punctuation Aware:** Smartly ignores punctuation (parentheses, quotes, periods) when calculating the bold portion of a word.
* **State Persistence:** Remembers if you left it ON or OFF even after you close the browser.

## 📂 Project Structure

* `manifest.json` - Extension configuration (Manifest V3).
* `content.js` - The core engine. Handles page analysis, `MutationObserver`, and text transformation.
* `script.js` - Controls the popup UI and saves settings to Chrome Storage.
* `popup.html` - The user interface for the toggle switch.
* `style.css` - Styling for the popup window.
* `icons/` - Contains extension icons (16, 32, 48, 128px).

## 🚀 Installation (Developer Mode)

Since this extension is currently a local project, you need to load it into Chrome manually:

1.  Extract the zip file into a folder (e.g. "EasyRead").
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click the **Load unpacked** button in the top left.
5.  Select your `EasyRead` folder.
6.  The extension is now installed! Pin it to your toolbar for easy access.

## 🛠️ Technical Highlights

This extension solves several common DOM manipulation challenges:

* **Recursion Prevention:** Uses a `.bionic-word` class and checks `parent.closest(".bionic-word")` to ensure text is never processed twice.
* **Shadow DOM & Dynamic Text:** Utilizes a `MutationObserver` to watch for nodes added to the DOM *after* the initial page load (essential for Single Page Applications like YouTube).
* **Text Node Isolation:** Instead of blindly replacing `innerHTML`, it uses `document.createTreeWalker` to safely modify specific text nodes inside complex containers like `<div>` or `<li>`.

## 📝 Usage

1.  Click the **Easy Read** icon in your Chrome toolbar.
2.  Flip the **Activate** switch to **ON**.
3.  The current page will instantly transform.
4.  Any new page you visit will be automatically processed until you turn the switch **OFF**.

## 📄 License

This project is open source. Feel free to modify and improve it!
