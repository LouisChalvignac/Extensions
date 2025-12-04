// Fonction pour récupérer le domaine courant
function getDomain() {
    return window.location.hostname; 
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



// Flag pour la sortie et l'entrée de notre mode édition
// 0 = normal, 1 = édition


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

function resetHiddenElements() {
    const domain = getDomain();
    chrome.storage.local.remove([domain], () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id); //reload la page actuelle et pas le hello.html
            });
        });
    };

document.getElementById("reset").addEventListener("click", resetHiddenElements);


hideSavedElements(); 
