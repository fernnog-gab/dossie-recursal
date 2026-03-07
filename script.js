// --- CONSTANTES E ÍCONES ---
const SVG_BALANCE = `<svg class="icon-theme" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px; color: #9a3412;"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`;

/**
 * Separadores utilizados para fatiar múltiplos temas listados pela IA.
 * Implementa a Melhoria de Arquitetura (Prioridade 2).
 */
const AI_SEPARATORS = /[\/\\,]| \- /;

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

        /* Estilos para Tags de Temas e Desativação Visual */
        .badge-theme-tag { 
            background: #fff; 
            color: #9a3412; 
            border: 1px solid #9a3412; 
            font-size: 0.65rem; 
            font-weight: 700; 
            padding: 3px 8px; 
            border-radius: 4px; 
            margin-left: auto; 
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .badge-theme-tag:hover {
            opacity: 0.8;
        }
        .badge-theme-tag.inactive-theme {
            background: #f1f5f9;
            color: #94a3b8;
            border-color: #cbd5e1;
            text-decoration: line-through;
        }
    `;
    document.head.appendChild(style);
}

// --- 1. NORMALIZAÇÃO E TRADUTOR FLEXÍVEL (RESILIÊNCIA A IA) ---
function normalizeData(data) {
    const mapping = {
        'temas_vinculantes': ['temas', 'temas_vinculado', 'temas_juridicos', 'vinculantes'],
        'topicos_do_recurso': ['topicos', 'lista_topicos', 'itens_recurso', 'trilha_julgamento'],
        'admissibilidade': ['preliminares', 'admissao', 'dados_processuais']
    };

    const normalized = { ...data };

    for (const [officialKey, aliases] of Object.entries(mapping)) {
        if (!normalized[officialKey]) {
            const foundAlias = aliases.find(alias => data[alias]);
            if (foundAlias) {
                normalized[officialKey] = data[foundAlias];
            }
        }
    }
    return normalized;
}

// --- 2. GERAÇÃO E LIMPEZA ---
async function generatePanel() {
    try {
        const inputElement = document.getElementById('json-input');
        const input = inputElement.value;
        let data = JSON.parse(input);

        data = normalizeData(data);

        document.getElementById('process-id').innerText = data.processo || 'S/N';
        document.getElementById('parties-display').innerText = `Partes: ${data.recorrente || ''} x ${data.recorrido || ''}`;

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

function limparJSON() {
    const input = document.getElementById('json-input');
    if (input.value.trim() !== "") {
        if (confirm('Deseja realmente limpar todo o texto da caixa de entrada?')) {
            input.value = '';
            input.focus();
        }
    }
}

function renderContent(data) {
    const themePanel = document.getElementById('theme-panel');
    themePanel.innerHTML = '';
    
    if (data.temas_vinculantes && Array.isArray(data.temas_vinculantes)) {
        data.temas_vinculantes.forEach(tema => {
            themePanel.innerHTML += `
                <div class="theme-card-top">
                    <div class="theme-info"><strong>${SVG_BALANCE} ${tema.numero || ''}:</strong> ${tema.descricao || ''}</div>
                    <div style="font-size:0.7rem; background: #fff; padding:2px 6px; border-radius:4px;">${tema.impacto || ''}</div>
                </div>`;
        });
    }

    const admGenContainer = document.getElementById('adm-general');
    admGenContainer.innerHTML = '';
    
    const admData = data.admissibilidade || {};
    const admItems = [
        { t: 'Tempestividade', v: admData.tempestividade },
        { t: 'Preparo Recursal', v: admData.preparo }
    ];
    
    admItems.forEach(item => {
        admGenContainer.innerHTML += createRowHTML(item.t, item.v);
    });

    const repData = admData.representacao || {};
    setupRepField('autor', repData.autor_da_acao);
    setupRepField('reu', repData.reu_da_acao);

    const topicContainer = document.getElementById('sortable-list');
    topicContainer.innerHTML = '';
    
    if(data.topicos_do_recurso && Array.isArray(data.topicos_do_recurso)) { 
        data.topicos_do_recurso.forEach(topic => {
            let partyClass = 'badge-author'; 
            let partyText = 'AUTOR';
            
            const recorrente = (topic.quem_recorre || '').toUpperCase();
            if(recorrente === 'RÉU DA AÇÃO' || recorrente === 'RÉU') { 
                partyClass = 'badge-defendant'; 
                partyText = 'RÉU'; 
            } else if(recorrente === 'AMBOS') { 
                partyClass = 'badge-joint'; 
                partyText = 'AMBOS'; 
            }

            /**
             * Lógica de Desmembramento Dinâmico.
             * Cria um card individual para cada tema detectado na string.
             */
            let themeBadgeHTML = '';
            if (topic.tema_numero) {
                const temasSeparados = topic.tema_numero.split(AI_SEPARATORS);
                temasSeparados.forEach(tema => {
                    const temaLimpo = tema.trim();
                    if (temaLimpo) {
                        themeBadgeHTML += `
                            <span class="badge-theme-tag" 
                                  onclick="toggleThemeState(this)" 
                                  title="Clique para desativar/ativar este tema">${temaLimpo}</span>`;
                    }
                });
            }

            topicContainer.innerHTML += `
                <div class="checklist-item" draggable="true">
                    <input type="checkbox" class="chk-input" onchange="toggleRow(this); autoSave();">
                    <div class="item-content">
                        <span class="item-title" title="${topic.resumo || ''}">${topic.titulo || ''}</span>
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

// --- 3. PERSISTÊNCIA (AUTO-SAVE) ---
document.addEventListener('DOMContentLoaded', () => {
    injectGlobalStyles(); 
    
    const importer = document.getElementById('json-importer');
    if (!importer || importer.style.display === 'none') {
        loadState();
        setupAutoSaveListeners();
        setupDrag(); 
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
        sortableHTML: sortableList ? sortableList.innerHTML : null,
        obsHTML: obsList ? obsList.innerHTML : null 
    };
    localStorage.setItem(key, JSON.stringify(state));
}

function loadState() {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        
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
                if(val) {
                    const item = checks[i].closest('.checklist-item');
                    if(item) item.classList.add('completed');
                }
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

        checkRepStatus(); 
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

// --- 4. HELPERS DE INTERAÇÃO ---

/**
 * Alterna o estado visual da tag de tema (ativo/inativo).
 * Implementa a funcionalidade de Desativação Visual.
 */
function toggleThemeState(element) {
    element.classList.toggle('inactive-theme');
    autoSave();
}

function setupRepField(type, dataObj) {
    if(!dataObj) return;
    const chk = document.getElementById(`chk-rep-${type}`);
    const input = document.getElementById(`input-rep-${type}`);
    
    if(chk && dataObj.status) chk.checked = true;
    if(input && dataObj.obs) {
        input.value = dataObj.obs;
        input.setAttribute('value', dataObj.obs);
    }
    checkRepStatus(); 
}

function checkRepStatus() {
    const chkAutor = document.getElementById('chk-rep-autor');
    const chkReu = document.getElementById('chk-rep-reu');
    const row = document.getElementById('rep-row-main');

    if (chkAutor && chkReu && row) {
        if (chkAutor.checked && chkReu.checked) {
            row.classList.add('completed');
        } else {
            row.classList.remove('completed');
        }
        autoSave();
    }
}

function createRowHTML(title, value = '') {
    return `
        <div class="checklist-item" style="align-items: flex-start; flex-wrap: wrap;">
            <input type="checkbox" class="chk-input" style="margin-top: 5px;" onchange="toggleRow(this); autoSave();" checked> 
            <div class="item-content" style="display: block; width: calc(100% - 40px);">
                <div class="item-title" style="margin-bottom: 4px;">${title}</div>
                <div class="input-block-wrapper">
                    <input type="text" class="input-details input-full-width" 
                           value="${value}" 
                           placeholder="Digite observações aqui..."
                           oninput="this.setAttribute('value', this.value); autoSave();">
                </div>
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
    if(item) chk.checked ? item.classList.add('completed') : item.classList.remove('completed');
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

// --- 5. EXPORTAÇÃO COMPLETA ---
async function downloadBundledHTML() {
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked ? c.setAttribute('checked', 'checked') : c.removeAttribute('checked'));
    document.querySelectorAll('input[type="text"]').forEach(i => i.setAttribute('value', i.value));
    
    const clone = document.documentElement.cloneNode(true);
    const importer = clone.querySelector('#json-importer');
    if(importer) importer.remove();
    
    const container = clone.querySelector('#panel-container');
    if(container) container.style.display = 'block';

    try {
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

        const scriptTag = document.createElement('script');
        scriptTag.textContent = document.querySelector('script').textContent;

        const cloneScript = clone.querySelector('script[src*="script.js"]');
        if(cloneScript) cloneScript.replaceWith(scriptTag);

        const blob = new Blob([clone.outerHTML], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');

        const rawProc = document.getElementById('process-id').innerText;
        const procNum = rawProc.replace(/[^0-9]/g, '');
        const processoSeguro = procNum ? procNum : 'sem_processo';

        a.download = `${yyyy}${mm}${dd}_dossie_${processoSeguro}_${hh}${min}.html`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error(e);
        alert("Erro ao empacotar arquivo: " + e.message);
    }
}

// --- 6. DRAG & DROP ---
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
