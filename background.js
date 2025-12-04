let modeEdition = false;

// Reçoit l'ordre du popup pour activer/désactiver le mode édition
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // Toggle mode édition
    if (request.action === "toggleMode") {

        modeEdition = !modeEdition;

        // Envoie l'info au content script de l’onglet actif
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "modeChanged",
                value: modeEdition
            });
        });

        sendResponse({ status: "ok", value: modeEdition });
    }

    // Réinitialiser les éléments masqués
    if (request.action === "resetElements") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "resetPage"
            });
        });

        sendResponse({ status: "ok" });
    }
});
