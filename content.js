function getDomain() {
    return window.location.hostname; 
}

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
