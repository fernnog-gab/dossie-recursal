# ⚖️ Painel de Julgamento - TRT Portátil

## 📖 Sobre o Projeto
O **Painel de Julgamento** é uma aplicação web front-end desenvolvida para otimizar o fluxo de trabalho na Justiça do Trabalho, com foco na organização e análise de recursos. Ele recebe dados estruturados (via JSON gerado por IA) e instancia um painel interativo contendo verificações de admissibilidade, temas vinculantes e uma trilha de julgamento dinâmica.

## ✨ Funcionalidades
* **📥 Importação Inteligente (JSON):** Tradutor flexível integrado para lidar com variações de chaves geradas por IA (Ex: `temas_vinculantes` vs `temas`).
* **🗂️ Trilha de Julgamento Interativa:** Sistema nativo de *Drag & Drop* para reordenar os tópicos do recurso com facilidade.
* **🏷️ Badges Dinâmicas de Partes:** Alternância de etiquetas de responsabilidade processual (AUTOR, RÉU, AMBOS) com um único clique.
* **➕ Inclusão Manual de Tópicos:** Botão dedicado para adicionar novos cartões de tópicos diretamente pela interface, perfeitamente integrados ao fluxo de ordenação.
* **💾 Persistência Automática (Auto-Save):** Salvamento em tempo real no `LocalStorage` do navegador, prevenindo perda de dados em atualizações acidentais da página.
* **📦 Exportação Completa (Bundler):** Geração de um arquivo `.html` único contendo o CSS e JS embutidos, nomeado dinamicamente (ex: `AAAAMMDD_dossie_[NUMERO]_HHMM.html`), ideal para anexação em sistemas de processo eletrônico (PJe).
* **📝 Observações Gerais:** Área dedicada para anotações extras, customizadas e independentes dos tópicos.

## 🛠️ Tecnologias Utilizadas
* **HTML5:** Estruturação semântica e acessível.
* **CSS3:** Estilização baseada em variáveis nativas (*Custom Properties*), tipografia moderna e design responsivo com *Flexbox*.
* **JavaScript (Vanilla):** Manipulação de DOM, API de *Drag & Drop* HTML5, gestão de estado no *LocalStorage* e processamento de *Blobs* para download de arquivos client-side. Não possui dependências de bibliotecas externas (como React ou jQuery).

## 🚀 Como Usar
1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. Cole o JSON contendo os dados do processo na área de importação e clique em **Gerar Painel**.
3. Interaja com o painel: marque *checkboxes* de admissibilidade, reordene tópicos arrastando-os, adicione novos tópicos manualmente e modifique a polaridade processual (Autor/Réu).
4. Ao finalizar a análise da trilha, clique em **Salvar e Baixar Cópia** para exportar o dossiê consolidado.

## 📂 Estrutura de Arquivos
* `index.html` - Marcação principal e layout da interface.
* `style.css` - Regras de estilo, paleta de cores e micro-interações de interface.
* `script.js` - Lógica de negócios, funções de renderização, *drag & drop* e bundler de exportação.
* `README.md` - Esta documentação central.
