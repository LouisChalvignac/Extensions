// Fonction pour récupérer le domaine courant
function getDomain() {
    return window.location.hostname; // ex: "example.com"
}

// Cacher les éléments déjà enregistrés pour ce site
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

// Cacher l'élément cliqué et l'ajouter au stockage
document.addEventListener("click", function(event) {
    if (event.target.classList.contains("cachable")) {
        const id = event.target.id;
        event.target.style.display = "none";

        const domain = getDomain();
        chrome.storage.local.get([domain], (result) => {
            let hidden = result[domain] || [];
            if (!hidden.includes(id)) {
                hidden.push(id);
                chrome.storage.local.set({ [domain]: hidden });
            }
        });
    }
});



document.getElementById("reset").addEventListener("click", () => {
    chrome.storage.local.set({ hiddenElements: [] });
});

hideSavedElements();
