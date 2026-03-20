// --- CONSTANTES E ÍCONES ---
const SVG_BALANCE = `<svg class="icon-theme" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px; color: #9a3412;"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`;

const SVG_DRAG_HANDLE = `<div class="drag-handle" title="Arraste para reordenar">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
    </svg>
</div>`;

const SVG_EDIT = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

const SVG_DELETE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

const SVG_INDENT = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

const SVG_OUTDENT = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

const badgeTypes = [ 
    {c:'badge-author', t:'AUTOR'}, 
    {c:'badge-defendant', t:'RÉU'}, 
    {c:'badge-joint', t:'AMBOS'} 
];

// --- 0. INJEÇÃO DE ESTILOS ---
function injectGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --text-sub: #475569; 
            --border-color: #cbd5e1;
        }
        body { 
            display: block !important; 
            overflow-y: auto !important; 
            height: auto !important; 
        }
        .container { 
            overflow: visible !important; 
            padding-bottom: 60px; 
            max-width: 950px;
            margin: 0 auto;
        }
        
        .rep-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px; 
            width: 100%; 
        }

        .checklist-item { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            padding: 12px 20px; 
            border-bottom: 1px solid #f1f5f9; 
            background: #fff; 
            min-height: 45px; 
            transition: background-color 0.2s ease, margin 0.3s ease;
            position: relative;
        }
        .checklist-item:hover {
            background-color: #f8fafc;
        }
        
        /* Modificadores de Subtópico */
        .checklist-item.is-subtopic {
            padding-left: 60px;
            width: 100%;
            box-sizing: border-box;
            background-color: #f1f5f9;
            border-left: 4px solid var(--border-color);
            border-radius: 0;
        }
        .checklist-item.is-subtopic::before {
            display: none;
        }
        .checklist-item.is-subtopic .item-title {
            font-size: 0.88rem;
            color: var(--text-sub);
        }

        /* Classe utilitária para Drag & Drop de filhos */
        .dragging-child {
            display: none !important;
        }

        .item-content { 
            flex: 1 1 auto; 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            flex-wrap: wrap; 
            margin-right: 15px; 
        }

        .action-buttons {
            display: flex;
            gap: 6px;
            margin-right: 12px;
            align-items: center;
        }
        .btn-icon {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        .btn-icon:hover {
            background-color: #f1f5f9;
        }
        .btn-icon.icon-indent:hover {
            color: #ea580c;
        }
        .btn-icon.icon-edit:hover {
            color: #2563eb;
        }
        .btn-icon.icon-delete:hover {
            color: #dc2626;
        }

        .drag-handle {
            cursor: grab;
            color: #94a3b8;
            margin-right: 12px;
            display: flex;
            align-items: center;
        }
        .checklist-item[draggable="true"]:active,
        .checklist-item[draggable="true"]:active .drag-handle {
            cursor: grabbing;
        }

        .badge { 
            cursor: pointer; 
            user-select: none; 
            transition: opacity 0.2s ease; 
        }
        .badge:hover { opacity: 0.8; }
        .item-title { color: var(--text-sub); }

        .item-title-input {
            width: 100%;
            padding: 4px 8px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 0.9rem;
            outline-color: #2563eb;
        }
    `;
    document.head.appendChild(style);
}

// --- 1. NORMALIZAÇÃO E TRADUTOR FLEXÍVEL ---
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
    
    const repRowMain = document.getElementById('rep-row-main');
    if (repRowMain) {
        repRowMain.classList.add('rep-grid');
    }

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

            let themeBadgeHTML = topic.tema_numero ? `<span class="badge-theme-tag">${topic.tema_numero}</span>` : '';

            topicContainer.innerHTML += `
                <div class="checklist-item" draggable="true">
                    ${SVG_DRAG_HANDLE}
                    <div class="action-buttons">
                        <button class="btn-icon icon-indent" onclick="toggleSubtopic(this)" title="Transformar em Subtópico">${SVG_INDENT}</button>
                        <button class="btn-icon icon-edit" onclick="editTopicTitle(this)" title="Renomear Tópico">${SVG_EDIT}</button>
                        <button class="btn-icon icon-delete" onclick="if(confirm('Deseja realmente remover este tópico?')) this.closest('.checklist-item').remove()" title="Excluir Tópico">${SVG_DELETE}</button>
                    </div>
                    <input type="checkbox" class="chk-input" onchange="toggleRow(this);">
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

// --- 3. INICIALIZAÇÃO LIMPA ---
document.addEventListener('DOMContentLoaded', () => {
    injectGlobalStyles(); 
    const importer = document.getElementById('json-importer');
    if (!importer || importer.style.display === 'none') {
        setupDrag(); 
    }
});

// --- 4. HELPERS DE INTERAÇÃO ---
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
    }
}

function createRowHTML(title, value = '') {
    return `
        <div class="checklist-item" style="align-items: flex-start; flex-wrap: wrap;">
            <input type="checkbox" class="chk-input" style="margin-top: 5px;" onchange="toggleRow(this);" checked> 
            <div class="item-content" style="display: block; width: calc(100% - 40px);">
                <div class="item-title" style="margin-bottom: 4px;">${title}</div>
                <div class="input-block-wrapper">
                    <input type="text" class="input-details input-full-width" 
                           value="${value}" 
                           placeholder="Digite observações aqui..."
                           oninput="this.setAttribute('value', this.value);">
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
}

function toggleRow(chk) {
    const item = chk.closest('.checklist-item');
    if(item) chk.checked ? item.classList.add('completed') : item.classList.remove('completed');
}

function editTopicTitle(btn) {
    const contentDiv = btn.closest('.checklist-item').querySelector('.item-content');
    const titleSpan = contentDiv.querySelector('.item-title');
    if (titleSpan) {
        const currentTitle = titleSpan.innerText;
        const currentTooltip = titleSpan.getAttribute('title') || '';
        contentDiv.innerHTML = `<input type="text" class="item-title-input" value="${currentTitle}" data-orig-tooltip="${currentTooltip}" oninput="this.setAttribute('value', this.value);" onblur="saveTopicTitle(this)" onkeypress="if(event.key === 'Enter') this.blur();">`;
        const input = contentDiv.querySelector('.item-title-input');
        input.focus();
    }
}

function saveTopicTitle(input) {
    const newTitle = input.value.trim() || 'Tópico sem nome';
    const originalTooltip = input.getAttribute('data-orig-tooltip') || '';
    const contentDiv = input.closest('.item-content');
    contentDiv.innerHTML = `<span class="item-title" title="${originalTooltip}">${newTitle}</span>`;
}

function toggleSubtopic(btn) {
    const item = btn.closest('.checklist-item');
    const prevItem = item.previousElementSibling;

    if (!item.classList.contains('is-subtopic') && (!prevItem || prevItem.classList.contains('dragging'))) {
        alert("O primeiro item da trilha não pode ser um subtópico.");
        return;
    }

    item.classList.toggle('is-subtopic');

    if(item.classList.contains('is-subtopic')) {
        btn.innerHTML = SVG_OUTDENT;
        btn.title = "Promover a Tópico Principal";
    } else {
        btn.innerHTML = SVG_INDENT;
        btn.title = "Transformar em Subtópico";
    }
}

function addNewObs() {
    const container = document.getElementById('obs-list');
    const div = document.createElement('div');
    div.className = 'checklist-item';
    div.innerHTML = `
        <input type="checkbox" class="chk-input" onchange="toggleRow(this);">
        <div style="flex:1;">
            <input type="text" class="input-details" placeholder="Escreva aqui..." oninput="this.setAttribute('value', this.value);" style="width:100%">
        </div>
        <button onclick="this.parentElement.remove();" 
                style="border:none; background:none; cursor:pointer; color:#cbd5e1;">✕</button>
    `;
    container.appendChild(div);
}

function addNewTopic() {
    const container = document.getElementById('sortable-list');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'checklist-item';
    div.setAttribute('draggable', 'true'); 
    
    div.innerHTML = `
        ${SVG_DRAG_HANDLE}
        <div class="action-buttons">
            <button class="btn-icon icon-indent" onclick="toggleSubtopic(this)" title="Transformar em Subtópico">${SVG_INDENT}</button>
            <button class="btn-icon icon-edit" onclick="editTopicTitle(this)" title="Renomear Tópico">${SVG_EDIT}</button>
            <button class="btn-icon icon-delete" onclick="if(confirm('Deseja realmente remover este tópico?')) this.closest('.checklist-item').remove()" title="Excluir Tópico">${SVG_DELETE}</button>
        </div>
        <input type="checkbox" class="chk-input" onchange="toggleRow(this);">
        <div class="item-content">
            <input type="text" class="item-title-input" placeholder="Digite o nome do tópico..." oninput="this.setAttribute('value', this.value);">
        </div>
        <span class="badge badge-author" onclick="rotateBadge(this);" title="Clique para alternar entre AUTOR, RÉU e AMBOS">AUTOR</span>
    `;
    
    container.appendChild(div);
    setupDrag(); 
    
    const novoInput = div.querySelector('.item-title-input');
    if(novoInput) novoInput.focus();
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

// --- 6. DRAG & DROP (Atualizado com Lógica de Aninhamento) ---
function setupDrag() {
    const list = document.getElementById("sortable-list");
    if (!list) return;
    
    let dragged = null;
    let draggedChildren = [];
    
    list.ondragstart = (e) => { 
        const target = e.target.closest('.checklist-item');
        if (target) {
            dragged = target; 
            dragged.classList.add("dragging"); 
            
            // Lógica para capturar subtópicos associados (Prioridade 3)
            draggedChildren = [];
            if (!dragged.classList.contains('is-subtopic')) {
                let next = dragged.nextElementSibling;
                while (next && next.classList.contains('is-subtopic')) {
                    draggedChildren.push(next);
                    next.classList.add("dragging-child"); // Oculta durante o arrasto
                    next = next.nextElementSibling;
                }
            }
        }
    };
    
    list.ondragend = (e) => { 
        if (dragged) {
            dragged.classList.remove("dragging"); 
            dragged = null;
            // Restaura a visibilidade dos subtópicos
            draggedChildren.forEach(child => child.classList.remove("dragging-child"));
            draggedChildren = [];
        }
    };
    
    list.ondragover = (e) => {
        e.preventDefault();
        // Ignora o item sendo arrastado e seus filhos ocultos no cálculo de posição
        const afterElement = [...list.querySelectorAll(".checklist-item:not(.dragging):not(.dragging-child)")].reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
        
        if (dragged) {
            if (afterElement == null) {
                list.appendChild(dragged);
            } else {
                list.insertBefore(dragged, afterElement);
            }
            // Move os filhos imediatamente para logo após o pai recém-posicionado
            let currentRef = dragged;
            draggedChildren.forEach(child => {
                list.insertBefore(child, currentRef.nextSibling);
                currentRef = child;
            });
        }
    };
}
