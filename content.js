// content.js - Final Stable Version

let observer = null;

chrome.storage.local.get(['isActive'], function(result) {
    if (result.isActive) enableBionicReading();
});

chrome.storage.onChanged.addListener(function(changes) {
    if (changes.isActive) {
        if (changes.isActive.newValue === true) enableBionicReading();
        else disableBionicReading();
    }
});

// --- CORE FUNCTIONS ---

function enableBionicReading() {
    modifyPage(document.body);

    if (!observer) {
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // 1 = Element
                        modifyPage(node);
                    }
                });
            });
        });
    }

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function disableBionicReading() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    revertPage();
}

// --- PROCESSING LOGIC ---

function modifyPage(rootElement) {
    // 1. SAFETY CHECK: If the element is one we created, STOP immediately.
    if (rootElement.classList && rootElement.classList.contains("bionic-word")) return;

    let targets = rootElement.querySelectorAll ? 
        rootElement.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, figcaption, cite, div, span, article, section, main, aside, yt-formatted-string") : [];

    if (matchesTarget(rootElement)) {
        processElement(rootElement);
    }

    for (let el of targets) {
        processElement(el);
    }
}

function matchesTarget(el) {
    if (!el.tagName) return false;
    
    // 2. STOP RECURSION: Ignore elements we already created
    if (el.classList.contains("bionic-word")) return false;

    const tags = ["P","LI","H1","H2","H3","H4","H5","H6","BLOCKQUOTE","TD","TH","FIGCAPTION","CITE","DIV","SPAN","ARTICLE","SECTION","MAIN","ASIDE", "YT-FORMATTED-STRING"];
    return tags.includes(el.tagName.toUpperCase());
}

function processElement(el) {
    if (el.getAttribute("data-processed") === "true") return;
    
    // Safety: don't process our own wrappers
    if (el.classList.contains("bionic-word")) return;

    if (!hasDirectText(el)) return;

    el.setAttribute("data-original", el.innerHTML);
    el.setAttribute("data-processed", "true");

    processTextNodes(el);
}

function processTextNodes(element) {
    let treeWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        { acceptNode: function(node) {
            // 1. Get the container of the text
            let parent = node.parentNode;
            
            // 2. SAFETY CHECK: Is this text already inside a bionic wrapper?
            // We check the parent AND any grandparents using .closest()
            if (parent.closest(".bionic-word")) {
                return NodeFilter.FILTER_REJECT;
            }

            // 3. Skip script/style tags
            let tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
                return NodeFilter.FILTER_REJECT;
            }
            
            // 4. Skip empty whitespace
            if (node.nodeValue.trim() === "") {
                return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
        }},
        false
    );

    let nodeList = [];
    while (treeWalker.nextNode()) {
        nodeList.push(treeWalker.currentNode);
    }

    nodeList.forEach(function(node) {
        let span = document.createElement("span");
        span.className = "bionic-word"; 
        span.innerHTML = transformText(node.nodeValue);
        node.parentNode.replaceChild(span, node);
    });
}

function revertPage() {
    let elements = document.querySelectorAll('[data-processed="true"]');
    for (let el of elements) {
        el.innerHTML = el.getAttribute("data-original");
        el.removeAttribute("data-processed");
        el.removeAttribute("data-original");
    }
}

function hasDirectText(element) {
    for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
            return true;
        }
    }
    return false;
}

// --- TEXT TRANSFORMATION ---

function transformText(text) {
    let parts = text.split(/(\s+)/);
    let newText = "";
    
    for (let part of parts) {
        if (part.trim().length > 0) {
            newText += halfBold(part);
        } else {
            newText += part;
        }
    }
    return newText;
}

function halfBold(word) {
    // UPDATED REGEX: Now has 3 capturing groups
    // Group 1: Leading punctuation (non-letters at the start)
    // Group 2: The Core Word (letters/numbers)
    // Group 3: Trailing punctuation (anything left over)
    let match = word.match(/^([^a-zA-Z0-9\u00C0-\u00FF]*)([a-zA-Z0-9\u00C0-\u00FF]+)(.*)$/);
    
    // If no word found inside (e.g. just "...") return as is
    if (!match) return word;

    let leadingPunc = match[1]; // e.g. "("
    let coreWord = match[2];    // e.g. "hello"
    let trailingPunc = match[3];// e.g. ")"

    if (coreWord.length === 1) {
        // Reassemble: Punctuation + Bold Letter + Punctuation
        return leadingPunc + "<b>" + coreWord + "</b>" + trailingPunc;
    }

    // Exact 50% split (Math.ceil)
    let mid = Math.floor(coreWord.length * 0.5); 
    if (mid === 0) mid = 1;

    let prefix = coreWord.substring(0, mid);
    let suffix = coreWord.substring(mid);
	console.log("\"" + word + "\": " + "\"" + prefix + "\" " + "\"" + suffix + "\"");

    // Final Assembly: Leading Punc + Bold Prefix + Normal Suffix + Trailing Punc
    return leadingPunc + "<b>" + prefix + "</b>" + '<span style="font-weight: 400 !important; opacity: 1;">' + suffix + "</span>" + trailingPunc;
}