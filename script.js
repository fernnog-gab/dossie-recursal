// --- 1. GERAÇÃO DO PAINEL ---
function generatePanel() {
    try {
        const input = document.getElementById('json-input').value;
        const data = JSON.parse(input);

        // A. Cabeçalho
        document.getElementById('process-id').innerText = data.processo || 'S/N';
        document.getElementById('parties-display').innerText = `Partes: ${data.recorrente} x ${data.recorrido}`;

        // B. Admissibilidade Geral
        const admGenContainer = document.getElementById('adm-general');
        admGenContainer.innerHTML = '';
        const admItems = [
            { t: 'Tempestividade', v: data.admissibilidade?.tempestividade },
            { t: 'Preparo Recursal', v: data.admissibilidade?.preparo }
        ];
        admItems.forEach(item => {
            admGenContainer.innerHTML += createRowHTML(item.t, item.v);
        });

        // C. Representação (Campos Específicos)
        // Preenche os valores iniciais vindos do JSON nos inputs e checks
        const repData = data.admissibilidade?.representacao || {};
        setupRepField('autor', repData.autor);
        setupRepField('reu', repData.reu);

        // D. Painel de Temas (Topo)
        const themePanel = document.getElementById('theme-panel');
        themePanel.innerHTML = '';
        if (data.temas_vinculantes && data.temas_vinculantes.length > 0) {
            data.temas_vinculantes.forEach(tema => {
                themePanel.innerHTML += `
                    <div class="theme-card-top">
                        <div class="theme-info"><strong>⚖️ ${tema.numero}:</strong> ${tema.descricao}</div>
                        <div style="font-size:0.7rem; background: #fff; padding:2px 6px; border-radius:4px;">${tema.impacto}</div>
                    </div>`;
            });
        }

        // E. Trilha de Julgamento (Com Badges de Tema)
        const topicContainer = document.getElementById('sortable-list');
        topicContainer.innerHTML = '';
        
        if(data.topicos) {
            data.topicos.forEach(topic => {
                // Define Parte (Badge Direita)
                let partyClass = 'badge-author'; let partyText = 'AUTOR';
                if(topic.autor === 'RÉU') { partyClass = 'badge-defendant'; partyText = 'RÉU'; }
                if(topic.autor === 'AMBOS') { partyClass = 'badge-joint'; partyText = 'AMBOS'; }

                // Define Badge de TEMA (Visual Feedback - Laranja)
                let themeBadgeHTML = '';
                if(topic.tema_numero) {
                    themeBadgeHTML = `<span class="badge-theme-tag">${topic.tema_numero}</span>`;
                }

                topicContainer.innerHTML += `
                    <div class="checklist-item" draggable="true">
                        <input type="checkbox" class="chk-input" onchange="toggleRow(this)">
                        <div class="item-content">
                            <span class="item-title" title="${topic.resumo}">${topic.titulo}</span>
                        </div>
                        ${themeBadgeHTML}
                        <span class="badge ${partyClass}" onclick="rotateBadge(this)">${partyText}</span>
                    </div>
                `;
            });
        }

        // Troca Tela
        document.getElementById('json-importer').style.display = 'none';
        document.getElementById('panel-container').style.display = 'block';
        setupDrag();

    } catch (e) {
        alert("Erro no JSON: " + e.message);
    }
}

// Helper para Representação
function setupRepField(type, dataObj) {
    if(!dataObj) return;
    const chk = document.getElementById(`chk-rep-${type}`);
    const input = document.getElementById(`input-rep-${type}`);
    
    if(dataObj.status) chk.checked = true;
    if(dataObj.obs) {
        input.value = dataObj.obs;
        input.setAttribute('value', dataObj.obs); // Persistência
    }
}

// Helper Linhas Comuns
function createRowHTML(title, value = '') {
    return `
        <div class="checklist-item">
            <input type="checkbox" class="chk-input" onchange="toggleRow(this)" checked> <div class="item-content">
                <span class="item-title">${title}</span>
                <input type="text" class="input-details" value="${value}" oninput="this.setAttribute('value', this.value)">
            </div>
        </div>`;
}

// --- Lógica de Interação ---
const badgeTypes = [ {c:'badge-author', t:'AUTOR'}, {c:'badge-defendant', t:'RÉU'}, {c:'badge-joint', t:'AMBOS'} ];
function rotateBadge(el) {
    let currentIdx = 0;
    if(el.classList.contains('badge-defendant')) currentIdx = 1;
    else if(el.classList.contains('badge-joint')) currentIdx = 2;
    const next = badgeTypes[(currentIdx + 1) % 3];
    el.className = `badge ${next.c}`;
    el.innerText = next.t;
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
        <input type="checkbox" class="chk-input" onchange="toggleRow(this)">
        <div style="flex:1;">
            <input type="text" class="input-details" placeholder="Escreva aqui..." oninput="this.setAttribute('value', this.value)" style="width:100%">
        </div>
        <button onclick="this.parentElement.remove()" style="border:none; background:none; cursor:pointer; color:#cbd5e1;">✕</button>
    `;
    container.appendChild(div);
}

// --- EXPORTAÇÃO (PERSISTÊNCIA COMPLETA) ---
async function downloadBundledHTML() {
    // 1. Persistir inputs comuns
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked ? c.setAttribute('checked', '') : c.removeAttribute('checked'));
    document.querySelectorAll('input[type="text"]').forEach(i => i.setAttribute('value', i.value));

    // 2. Clonar e Limpar
    const clone = document.documentElement.cloneNode(true);
    const importer = clone.querySelector('#json-importer');
    if(importer) importer.remove();
    clone.querySelector('#panel-container').style.display = 'block';

    try {
        // Embed CSS
        const cssLink = document.getElementById('main-css');
        if (cssLink) {
            const cssResponse = await fetch(cssLink.href);
            const styleTag = document.createElement('style');
            styleTag.textContent = await cssResponse.text();
            const cloneLink = clone.querySelector('link[href="style.css"]');
            if(cloneLink) cloneLink.replaceWith(styleTag);
        }

        // Embed JS
        const scriptResponse = await fetch('script.js');
        const scriptTag = document.createElement('script');
        scriptTag.textContent = await scriptResponse.text();
        const cloneScript = clone.querySelector('script[src="script.js"]');
        if(cloneScript) cloneScript.replaceWith(scriptTag);

        // Download
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
        alert("Erro ao empacotar: " + e.message);
    }
}

// Drag Setup
function setupDrag() {
    const list = document.getElementById("sortable-list");
    let dragged = null;
    list.addEventListener("dragstart", e => { dragged = e.target; setTimeout(()=>e.target.classList.add("dragging"),0); });
    list.addEventListener("dragend", e => { setTimeout(()=>e.target.classList.remove("dragging"),0); dragged = null; });
    list.addEventListener("dragover", e => {
        e.preventDefault();
        const after = [...list.querySelectorAll(".checklist-item:not(.dragging)")].reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
        if (after == null) list.appendChild(dragged); else list.insertBefore(dragged, after);
    });
}
