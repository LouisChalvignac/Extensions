// background.js

// État global du mode édition
let modeEdition = false;

// Écoute les messages envoyés depuis le content-script ou le popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleEdit") {
        // Bascule le mode édition
        modeEdition = !modeEdition;

        // Envoie le nouvel état au content-script actif
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "modeChanged",
                    value: modeEdition
                });
            }
        });
    }
});
