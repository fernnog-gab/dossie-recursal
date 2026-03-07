// --- CONSTANTES E ÍCONES ---
const SVG_BALANCE = `<svg class="icon-theme" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px; color: #9a3412;"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`;

const badgeTypes = [ 
    {c:'badge-author', t:'AUTOR'}, 
    {c:'badge-defendant', t:'RÉU'}, 
    {c:'badge-joint', t:'AMBOS'} 
];

// --- 0. INJEÇÃO DE ESTILOS ---
function injectGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body { 
            display: block !important; 
            overflow-y: auto !important; 
            height: auto !important; 
        }
        .container { 
            overflow: visible !important; 
            padding-bottom: 60px; 
        }
        .badge { 
            cursor: pointer; 
            user-select: none; 
            transition: opacity 0.2s ease; 
        }
        .badge:hover { opacity: 0.8; }
    `;
    document.head.appendChild(style);
}

// --- 1. GERAÇÃO E DOWNLOAD ---
async function generatePanel() {
    try {
        const input = document.getElementById('json-input').value;
        const data = JSON.parse(input);

        document.getElementById('process-id').innerText = data.processo || 'S/N';
        document.getElementById('parties-display').innerText = `Partes: ${data.recorrente} x ${data.recorrido}`;

        renderContent(data);
        await downloadBundledHTML();
        
        const btn = document.querySelector('.btn-generate');
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = "✅ Arquivo Baixado!";
            btn.style.backgroundColor = "#16a34a";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
            }, 3000);
        }

    } catch (e) {
        console.error(e);
        alert("Erro no JSON: " + e.message);
    }
}

function renderContent(data) {
    const themePanel = document.getElementById('theme-panel');
    themePanel.innerHTML = '';
    if (data.temas_vinculantes && data.temas_vinculantes.length > 0) {
        data.temas_vinculantes.forEach(tema => {
            themePanel.innerHTML += `
                <div class="theme-card-top">
                    <div class="theme-info"><strong>${SVG_BALANCE} ${tema.numero}:</strong> ${tema.descricao}</div>
                    <div style="font-size:0.7rem; background: #fff; padding:2px 6px; border-radius:4px;">${tema.impacto}</div>
                </div>`;
        });
    }

    const admGenContainer = document.getElementById('adm-general');
    admGenContainer.innerHTML = '';
    const admItems = [
        { t: 'Tempestividade', v: data.admissibilidade?.tempestividade },
        { t: 'Preparo Recursal', v: data.admissibilidade?.preparo }
    ];
    admItems.forEach(item => {
        admGenContainer.innerHTML += createRowHTML(item.t, item.v);
    });

    const repData = data.admissibilidade?.representacao || {};
    setupRepField('autor', repData.autor);
    setupRepField('reu', repData.reu);

    const topicContainer = document.getElementById('sortable-list');
    topicContainer.innerHTML = '';
    
    if(data.topicos) {
        data.topicos.forEach(topic => {
            let partyClass = 'badge-author'; let partyText = 'AUTOR';
            if(topic.autor === 'RÉU') { partyClass = 'badge-defendant'; partyText = 'RÉU'; }
            if(topic.autor === 'AMBOS') { partyClass = 'badge-joint'; partyText = 'AMBOS'; }

            let themeBadgeHTML = topic.tema_numero ? `<span class="badge-theme-tag">${topic.tema_numero}</span>` : '';

            topicContainer.innerHTML += `
                <div class="checklist-item" draggable="true">
                    <input type="checkbox" class="chk-input" onchange="toggleRow(this); autoSave();">
                    <div class="item-content">
                        <span class="item-title" title="${topic.resumo}">${topic.titulo}</span>
                    </div>
                    ${themeBadgeHTML}
                    <span class="badge ${partyClass}" 
                          onclick="rotateBadge(this);" 
                          title="Clique para alternar entre AUTOR, RÉU e AMBOS">${partyText}</span>
                </div>
            `;
        });
    }
    setupDrag();
}

// --- 2. PERSISTÊNCIA (AUTO-SAVE) ---
document.addEventListener('DOMContentLoaded', () => {
    injectGlobalStyles(); 
    
    const importer = document.getElementById('json-importer');
    if (!importer || importer.style.display === 'none') {
        loadState();
        setupAutoSaveListeners();
        setupDrag(); // Inicia o drag & drop no arquivo final
    }
});

function getStorageKey() {
    const procId = document.getElementById('process-id').innerText.trim();
    return 'dossie_' + procId.replace(/[^a-zA-Z0-9]/g, '_');
}

function autoSave() {
    const key = getStorageKey();
    const sortableList = document.getElementById('sortable-list');
    const obsList = document.getElementById('obs-list');
    
    const state = {
        checks: Array.from(document.querySelectorAll('.chk-input')).map(el => el.checked),
        inputs: Array.from(document.querySelectorAll('input[type="text"]')).map(el => el.value),
        badges: Array.from(document.querySelectorAll('.badge')).map(el => ({ 
            class: el.className, 
            text: el.innerText 
        })),
        sortableHTML: sortableList ? sortableList.innerHTML : null, // Salva ordem dos itens
        obsHTML: obsList ? obsList.innerHTML : null // Salva novas notas
    };
    localStorage.setItem(key, JSON.stringify(state));
}

function loadState() {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        
        // Restaura estrutura HTML antes de preencher valores
        const sortableList = document.getElementById('sortable-list');
        if (sortableList && state.sortableHTML) {
            sortableList.innerHTML = state.sortableHTML;
            setupDrag(); 
        }

        const obsList = document.getElementById('obs-list');
        if (obsList && state.obsHTML) {
            obsList.innerHTML = state.obsHTML;
        }

        const checks = document.querySelectorAll('.chk-input');
        state.checks.forEach((val, i) => { 
            if(checks[i]) { 
                checks[i].checked = val; 
                if(val) checks[i].closest('.checklist-item').classList.add('completed');
            } 
        });

        const inputs = document.querySelectorAll('input[type="text"]');
        state.inputs.forEach((val, i) => { if(inputs[i]) inputs[i].value = val; });

        const badges = document.querySelectorAll('.badge');
        state.badges.forEach((val, i) => { 
            if(badges[i]) { 
                badges[i].className = val.class; 
                badges[i].innerText = val.text; 
            } 
        });
    } catch (e) {
        console.error("Erro ao carregar estado:", e);
    }
}

function setupAutoSaveListeners() {
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            autoSave();
        }
    });
}

// --- 3. HELPERS DE INTERAÇÃO ---
function setupRepField(type, dataObj) {
    if(!dataObj) return;
    const chk = document.getElementById(`chk-rep-${type}`);
    const input = document.getElementById(`input-rep-${type}`);
    
    if(dataObj.status) chk.checked = true;
    if(dataObj.obs) {
        input.value = dataObj.obs;
        input.setAttribute('value', dataObj.obs);
    }
}

function createRowHTML(title, value = '') {
    return `
        <div class="checklist-item">
            <input type="checkbox" class="chk-input" onchange="toggleRow(this); autoSave();" checked> 
            <div class="item-content">
                <span class="item-title">${title}</span>
                <input type="text" class="input-details" value="${value}" oninput="this.setAttribute('value', this.value); autoSave();">
            </div>
        </div>`;
}

function rotateBadge(el) {
    const states = ['badge-author', 'badge-defendant', 'badge-joint'];
    const texts = ['AUTOR', 'RÉU', 'AMBOS'];
    let currentIdx = states.indexOf(el.classList.contains('badge-defendant') ? 'badge-defendant' : (el.classList.contains('badge-joint') ? 'badge-joint' : 'badge-author'));
    const nextIdx = (currentIdx + 1) % 3;
    el.classList.remove(...states);
    el.classList.add(states[nextIdx]);
    el.innerText = texts[nextIdx];
    autoSave();
}

function toggleRow(chk) {
    const item = chk.closest('.checklist-item');
    chk.checked ? item.classList.add('completed') : item.classList.remove('completed');
}

function addNewObs() {
    const container = document.getElementById('obs-list');
    const div = document.createElement('div');
    div.className = 'checklist-item';
    div.innerHTML = `
        <input type="checkbox" class="chk-input" onchange="toggleRow(this); autoSave();">
        <div style="flex:1;">
            <input type="text" class="input-details" placeholder="Escreva aqui..." oninput="this.setAttribute('value', this.value); autoSave();" style="width:100%">
        </div>
        <button onclick="this.parentElement.remove(); autoSave();" 
                style="border:none; background:none; cursor:pointer; color:#cbd5e1;">✕</button>
    `;
    container.appendChild(div);
    autoSave();
}

// --- 4. EXPORTAÇÃO COMPLETA ---
async function downloadBundledHTML() {
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked ? c.setAttribute('checked', 'checked') : c.removeAttribute('checked'));
    document.querySelectorAll('input[type="text"]').forEach(i => i.setAttribute('value', i.value));
    
    const clone = document.documentElement.cloneNode(true);
    const importer = clone.querySelector('#json-importer');
    if(importer) importer.remove();
    
    const container = clone.querySelector('#panel-container');
    if(container) container.style.display = 'block';

    try {
        // Injeção de CSS
        const cssLink = document.getElementById('main-css');
        if (cssLink) {
            try {
                const cssResponse = await fetch(cssLink.href);
                const styleTag = document.createElement('style');
                styleTag.textContent = await cssResponse.text();
                const cloneLink = clone.querySelector('link[href*="style.css"]');
                if(cloneLink) cloneLink.replaceWith(styleTag);
            } catch (err) { console.warn("CSS externo inacessível."); }
        }

        // Lógica aprimorada para capturar o JS e embutir no arquivo final
        const scriptTag = document.createElement('script');
        try {
            const jsResponse = await fetch('script.js');
            scriptTag.textContent = await jsResponse.text();
        } catch (err) {
            console.warn("Falha ao buscar script.js. Usando fallback inline.");
            scriptTag.textContent = document.scripts[document.scripts.length - 1].textContent;
        }

        const cloneScript = clone.querySelector('script[src*="script.js"]');
        if(cloneScript) cloneScript.replaceWith(scriptTag);

        const blob = new Blob([clone.outerHTML], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const proc = document.getElementById('process-id').innerText.replace(/[^0-9]/g, '').slice(0,15) || 'Dossie';
        a.download = `Dossie_${proc}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error(e);
        alert("Erro ao empacotar arquivo: " + e.message);
    }
}

// --- 5. DRAG & DROP ---
function setupDrag() {
    const list = document.getElementById("sortable-list");
    if (!list) return;
    
    let dragged = null;
    list.ondragstart = (e) => { 
        dragged = e.target; 
        e.target.classList.add("dragging"); 
    };
    
    list.ondragend = (e) => { 
        e.target.classList.remove("dragging"); 
        dragged = null;
        autoSave();
    };
    
    list.ondragover = (e) => {
        e.preventDefault();
        const after = [...list.querySelectorAll(".checklist-item:not(.dragging)")].reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
        
        if (after == null) list.appendChild(dragged); else list.insertBefore(dragged, after);
    };
}
