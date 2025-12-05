// Écouteurs pour les boutons du popup (attach only if elements exist)
const editBtn = document.getElementById("editBtn");
if (editBtn) {
    editBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "toggleEdit" });
    });
}

const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs && tabs[0] && tabs[0].id) chrome.tabs.sendMessage(tabs[0].id, { action: "reset" });
        });
    });
}


function getAllDomains() {
    return new Promise(resolve => {
        chrome.storage.local.get(null, res => {
            resolve(
                Object.entries(res)
                .filter(([k,v]) => Array.isArray(v))
                .map(([k]) => k)
            );
        });
    });
}

async function renderDomains() {
    const sitesList = document.getElementById("sitesList");
    sitesList.innerHTML = "";

    const domains = await getAllDomains();
    if (domains.length === 0) {
        sitesList.innerHTML = "<div>Aucun site nettoyé.</div>";
        return;
    }

    domains.forEach(domain => {
        chrome.storage.local.get([domain], res => {
            const count = res[domain].length;

            let row = document.createElement("div");
            row.className = "site-item";
            row.innerHTML = `
                <span>${domain}</span>
                <span class="badge">${count}</span>
            `;
            row.onclick = () => showDomain(domain);
            sitesList.appendChild(row);
        });
    });
}

function showDomain(domain) {
    const header = document.getElementById("domainHeader");
    const itemsList = document.getElementById("itemsList");

    header.textContent = domain;

    chrome.storage.local.get([domain], res => {
        const ids = res[domain] || [];
        itemsList.innerHTML = "";

        ids.forEach(sel => {
            const row = document.createElement("div");
            row.className = "item-row";
            row.innerHTML = `
                <span>${sel}</span>
                <button>Suppr.</button>
            `;
            row.querySelector("button").onclick = () => {
                removeFromDomain(domain, sel);
            };
            itemsList.appendChild(row);
        });
    });
}

function removeFromDomain(domain, selector) {
    chrome.storage.local.get([domain], res => {
        const updated = res[domain].filter(x => x !== selector);

        if (updated.length === 0) {
            chrome.storage.local.remove(domain, renderDomains);
        } else {
            chrome.storage.local.set({ [domain]: updated }, renderDomains);
        }
    });
}

const refreshBtn2 = document.getElementById("refresh");
if (refreshBtn2) refreshBtn2.onclick = renderDomains;

const clearAllBtn = document.getElementById("clearAll");
if (clearAllBtn) clearAllBtn.onclick = () => {
    chrome.storage.local.clear(renderDomains);
};

document.addEventListener("DOMContentLoaded", renderDomains);