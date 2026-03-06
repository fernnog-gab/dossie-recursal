// --- 1. LÓGICA DE GERAÇÃO (Lê o JSON e cria o HTML) ---
function generatePanel() {
    try {
        const input = document.getElementById('json-input').value;
        const data = JSON.parse(input);

        // A. Cabeçalho
        document.getElementById('process-id').innerText = `Processo: ${data.processo || 'S/N'}`;
        document.getElementById('parties-display').innerText = `${data.recorrente} x ${data.recorrido}`;

        // B. PAINEL DE TEMAS (NOVO)
        const themePanel = document.getElementById('theme-panel');
        themePanel.innerHTML = ''; // Limpa anterior
        
        // Verifica se existe o campo E se ele tem itens dentro
        if (data.temas_vinculantes && data.temas_vinculantes.length > 0) {
            themePanel.style.display = 'block';
            data.temas_vinculantes.forEach(tema => {
                themePanel.innerHTML += `
                    <div class="theme-card">
                        <div class="theme-title">🚨 ${tema.numero || 'Tema Vinculante'}</div>
                        <div class="theme-desc">${tema.descricao || 'Sem descrição.'}</div>
                        <div class="theme-impact">Impacto: ${tema.impacto || 'Não informado.'}</div>
                    </div>
                `;
            });
        } else {
            themePanel.style.display = 'none'; // Esconde se não tiver temas
        }

        // C. Admissibilidade
        const admContainer = document.getElementById('admissibility-list');
        admContainer.innerHTML = ''; 
        const admItems = [
            { t: 'Tempestividade', v: data.admissibilidade?.tempestividade },
            { t: 'Preparo', v: data.admissibilidade?.preparo },
            { t: 'Representação', v: data.admissibilidade?.representacao }
        ];
        
        admItems.forEach(item => {
            admContainer.innerHTML += createRowHTML(item.t, item.v);
        });

        // D. Tópicos
        const topicContainer = document.getElementById('sortable-list');
        topicContainer.innerHTML = '';
        
        if(data.topicos && data.topicos.length > 0) {
            data.topicos.forEach(topic => {
                let badgeClass = 'badge-author';
                let badgeText = 'AUTOR';
                if(topic.autor === 'RÉU') { badgeClass = 'badge-defendant'; badgeText = 'RÉU'; }
                if(topic.autor === 'AMBOS') { badgeClass = 'badge-joint'; badgeText = 'AMBOS'; }

                topicContainer.innerHTML += `
                    <div class="checklist-item" draggable="true">
                        <input type="checkbox" class="chk-input" onchange="toggleRow(this)">
                        <div class="item-content">
                            <span class="badge badge-tag">${topic.tag}</span>
                            <span class="item-title" title="${topic.resumo}">${topic.titulo}</span>
                        </div>
                        <span class="badge ${badgeClass}" onclick="rotateBadge(this)">${badgeText}</span>
                    </div>
                `;
            });
        }

        // Trocar telas
        document.getElementById('json-importer').style.display = 'none';
        document.getElementById('panel-container').style.display = 'block';
        setupDrag();

    } catch (e) {
        alert("Erro ao ler JSON: " + e.message);
    }
}

// Helper para criar linhas padrão
function createRowHTML(title, value = '') {
    return `
        <div class="checklist-item">
            <input type="checkbox" class="chk-input" onchange="toggleRow(this)">
            <div class="item-content">
                <span class="item-title">${title}</span>
                <input type="text" class="input-details" value="${value}" placeholder="Detalhes..." oninput="this.setAttribute('value', this.value)">
            </div>
        </div>`;
}

// --- 2. FUNÇÕES INTERATIVAS ---
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
            <input type="text" class="input-details" placeholder="Digite a observação..." oninput="this.setAttribute('value', this.value)" style="width:100%">
        </div>
        <button onclick="this.parentElement.remove()" style="border:none; background:none; cursor:pointer; color:#cbd5e1;">✕</button>
    `;
    container.appendChild(div);
}

// --- 3. EXPORTAÇÃO INTELIGENTE ---
async function downloadBundledHTML() {
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked ? c.setAttribute('checked', '') : c.removeAttribute('checked'));
    document.querySelectorAll('input[type="text"]').forEach(i => i.setAttribute('value', i.value));

    const clone = document.documentElement.cloneNode(true);

    const importer = clone.querySelector('#json-importer');
    if(importer) importer.remove();
    const panel = clone.querySelector('#panel-container');
    if(panel) panel.style.display = 'block';

    try {
        const cssLink = document.getElementById('main-css');
        if (cssLink) {
            const cssResponse = await fetch(cssLink.href);
            const cssText = await cssResponse.text();
            const styleTag = document.createElement('style');
            styleTag.textContent = cssText;
            const cloneLink = clone.querySelector('link[href="style.css"]');
            if(cloneLink) cloneLink.replaceWith(styleTag);
        }

        const scriptResponse = await fetch('script.js');
        const scriptText = await scriptResponse.text();
        const scriptTag = document.createElement('script');
        scriptTag.textContent = scriptText;
        const cloneScript = clone.querySelector('script[src="script.js"]');
        if(cloneScript) cloneScript.replaceWith(scriptTag);

        const blob = new Blob([clone.outerHTML], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const proc = document.getElementById('process-id').innerText.replace(/[^0-9]/g, '').slice(0,15) || 'Processo';
        a.download = `Painel_${proc}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        alert("Erro ao empacotar arquivos: " + e.message);
    }
}

// --- 4. DRAG AND DROP ---
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
