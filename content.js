console.log("[Cleaner] content.js chargé");

let editMode = false;
let highlightBox = null;

// Sauvegarde de sélecteur
function saveSelector(sel) {
    const domain = location.hostname;
    chrome.storage.local.get([domain], res => {
        const arr = res[domain] || [];
        if (!arr.includes(sel)) {
            arr.push(sel);
            chrome.storage.local.set({ [domain]: arr });
        }
    });
}

// Appliquer les éléments masqués
function applySaved() {
    const domain = location.hostname;
    chrome.storage.local.get([domain], res => {
        (res[domain] || []).forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.display = "none";
            });
        });
    });
}

// Activation du mode édition
function activateEdit() {
    editMode = true;
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
}

// Désactivation
function deactivateEdit() {
    editMode = false;
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    if (highlightBox) highlightBox.remove();
}

// Survol
function onMove(e) {
    if (!editMode) return;

    if (highlightBox) highlightBox.remove();

    const r = e.target.getBoundingClientRect();
    highlightBox = document.createElement("div");
    highlightBox.style.cssText = `
        position:fixed;
        left:${r.left}px;
        top:${r.top}px;
        width:${r.width}px;
        height:${r.height}px;
        outline: 2px dashed red;
        background: rgba(221, 255, 0, 0.1);
        pointer-events:none;
        z-index:999999;
    `;
    document.body.appendChild(highlightBox);
}

// Click pour supprimer
function onClick(e) {
    if (!editMode) return;

    e.preventDefault();
    e.stopPropagation();

    const sel = getSelector(e.target);
    saveSelector(sel);

    e.target.style.display = "none";
}

// Génère un sélecteur unique
function getSelector(el) {
    if (el.id) return "#" + CSS.escape(el.id);

    let path = [];
    let current = el;

    while (current && current.nodeType === 1 && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        
        if (current.classList.length > 0) {
            selector += "." + [...current.classList].map(c => CSS.escape(c)).join(".");
        } else {
            const parent = current.parentElement;
            if (parent) {
                const index = [...parent.children].indexOf(current) + 1;
                selector += `:nth-child(${index})`;
            }
        }

        path.unshift(selector);
        current = current.parentElement;
    }

    return path.join(" > ");
}

// Réception du background
chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === "modeChanged") {
        msg.value ? activateEdit() : deactivateEdit();
    }

    if (msg.action === "reset") {
        chrome.storage.local.remove(location.hostname, () => {
            location.reload();
        });
    }
});

// saveSelector.js

/**
 * Sauvegarde un sélecteur pour le domaine courant dans chrome.storage.local
 * @param {string} sel - le sélecteur CSS à enregistrer
 */
function saveSelector(sel) {
    const domain = location.hostname;

    chrome.storage.local.get([domain], res => {
        // On récupère la liste existante ou un tableau vide
        const arr = Array.isArray(res[domain]) ? res[domain] : [];

        // On évite les doublons
        if (!arr.includes(sel)) {
            arr.push(sel);
            chrome.storage.local.set({ [domain]: arr }, () => {
                console.log(`Sélecteur "${sel}" ajouté pour le domaine ${domain}`);
            });
        }
    });
}

// Initialisation
applySaved();
