let editMode = false;

function sendToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs && tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "toggleEdit") {
        editMode = !editMode;
        const payload = { action: "modeChanged", value: editMode };

        const tabId = sender && sender.tab && sender.tab.id;
        if (tabId) chrome.tabs.sendMessage(tabId, payload);
        else sendToActiveTab(payload);
    }
    
    if (msg.action === "reset") {
        const payload = { action: "reset" };
        const tabId = sender && sender.tab && sender.tab.id;
        if (tabId) chrome.tabs.sendMessage(tabId, payload);
        else sendToActiveTab(payload);
    }
});
