function getDomain() {
    return window.location.hostname; 
}


const highlightCSS = document.createElement("style");
highlightCSS.textContent = `
    .ext-highlight-hover {
        outline: 2px dashed #ff9800 !important;
        background: rgba(255, 152, 0, 0.1) !important;
        cursor: pointer !important;
    }

    .ext-highlight-select {
        outline: 3px solid #ff0000 !important;
        background: rgba(255, 0, 0, 0.12) !important;
    }
`;
document.head.appendChild(highlightCSS);


function hideSavedElements() {
    const domain = getDomain();
    chrome.storage.local.get([domain], (result) => {
        const hidden = result[domain] || [];
        hidden.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
    });
}

let modeEdition = false;

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "modeChanged") {
        modeEdition = request.value;
        console.log("Mode édition :", modeEdition);
        if (modeEdition) activateEditMode();
    }
});

function activateEditMode() {
    document.removeEventListener("click", editClickHandler);
    document.addEventListener("click", editClickHandler);
}

function editClickHandler(event) {
    if (!modeEdition) return;

    let el = event.target;
    // Ajout d'un highlight rouge avant masquage
    el.classList.add("ext-highlight-select");
    setTimeout(() => {
        el.classList.remove("ext-highlight-select");
    }, 150); // léger effet rapide


    // Générer un id si absent
    if (!el.id) {
        el.id = "hide_" + crypto.randomUUID();
    }

    const id = el.id;

    el.style.display = "none";

    const domain = getDomain();
    chrome.storage.local.get([domain], (result) => {
        let hidden = result[domain] || [];
        if (!hidden.includes(id)) {
            hidden.push(id);
            chrome.storage.local.set({ [domain]: hidden });
        }
    });
}

function resetHiddenElements() {
    const domain = getDomain();
    chrome.storage.local.remove([domain], () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.reload(tabs[0].id);
        });
    });
}

document.getElementById("reset").addEventListener("click", resetHiddenElements);
document.getElementById("Mode édition").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "toggleEdit" });
});


hideSavedElements();

function activateEditMode() {
    document.removeEventListener("click", editClickHandler, true);
    document.addEventListener("click", editClickHandler, true);

    // Highlight au survol
    document.addEventListener("mouseover", highlightOver, true);
    document.addEventListener("mouseout", highlightOut, true);
}

function highlightOver(event) {
    if (!modeEdition) return;
    const el = event.target;
    el.classList.add("ext-highlight-hover");
}

function highlightOut(event) {
    if (!modeEdition) return;
    const el = event.target;
    el.classList.remove("ext-highlight-hover");
}
