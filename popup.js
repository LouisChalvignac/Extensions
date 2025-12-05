// Écouteurs pour les boutons du popup

document.getElementById("editBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "toggleEdit" });
});

document.getElementById("resetBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "reset" });
    });
});
