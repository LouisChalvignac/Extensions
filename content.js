console.log("[Cleaner] content.js chargé");

let editMode = false;
let highlight = null;

// Stockage d'un sélecteur pour le domaine courant
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

function applySaved() {
    const domain = location.hostname;
    chrome.storage.local.get([domain], res => {
        (res[domain] || []).forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.style.display = "none");
        });
    });
}

// ---------------------------------------------------------
// MODE ÉDITION + HIGHLIGHT SUR SURVOL
// ---------------------------------------------------------

function activateEdit() {
    editMode = true;
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
}

function deactivateEdit() {
    editMode = false;
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);

    if (highlight) highlight.remove();
}

function onMove(e) {
    if (!editMode) return;

    if (highlight) highlight.remove();

    const r = e.target.getBoundingClientRect();
    highlight = document.createElement("div");
    highlight.style.cssText = `
        position:fixed;
        left:${r.left}px;
        top:${r.top}px;
        width:${r.width}px;
        height:${r.height}px;
        background: rgba(242, 255, 0, 0.48);
        outline: thick dashed #ff0000ff;
        pointer-events:none;
        z-index:999999;
        cursor: pointer
    `;

    document.body.appendChild(highlight);
}

function onClick(e) {
    if (!editMode) return;

    e.preventDefault();
    e.stopPropagation();

    const selector = getSelector(e.target);
    saveSelector(selector);

    e.target.style.display = "none";

    if (highlight) highlight.remove();
}

// Génère un sélecteur CSS unique
function getSelector(el) {
    if (el.id) {
        return "#" + CSS.escape(el.id);
    }

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

// ---------------------------------------------------------
// LISTENER MESSAGES
// ---------------------------------------------------------

chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === "modeChanged") {
        msg.value ? activateEdit() : deactivateEdit();
    }

    if (msg.action === "reset") {
        chrome.storage.local.clear();
        location.reload();
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

function listingDomains() {
    varTemp="";
    for(let i = 0; i < localStorage.length; i++) {
        varTemp=varTemp+localStorage.key(i)+" = "+localStorage.getItem(localStorage.key(i)).length+"<br>";
    };
    document.getElementById("listSite").innerHTML = varTemp;
}

// Initialisation
applySaved();
