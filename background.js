let modeEdition = false;

// Changement du mode édition
chrome.runtime.onMessage.addListener((msg, sender, res) => {
    if (msg.action === "toggleEdit") {

        modeEdition = !modeEdition;

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "modeChanged",
                value: modeEdition
            });
        });

        res({ ok: true });
    }
});
