/**
 * template-utils.js
 * Módulo utilitário para geração e injeção de scripts/estilos
 * no template de exportação (HTML autônomo).
 */

export const templateUtils = {
  
  /**
   * Gera o CSS necessário para o estado de inatividade no HTML exportado.
   * @returns {string} Bloco de CSS para injeção.
   */
  getInjectableStyles: function() {
    return `
      .theme-card-top { 
        cursor: pointer; 
        transition: background 0.3s ease, border-color 0.3s ease, opacity 0.3s ease; 
        position: relative; 
      }
      .theme-card-top.inactive { 
        background: #e2e8f0 !important; 
        border-left-color: #94a3b8 !important; 
        opacity: 0.55; 
      }
      .theme-card-top.inactive .theme-info { 
        color: #64748b !important; 
        text-decoration: line-through; 
      }
      .theme-card-top.inactive .badge-theme-tag { 
        background: #f1f5f9 !important; 
        color: #94a3b8 !important; 
        border-color: #94a3b8 !important; 
      }
      .theme-card-top::after {
        content: 'clique para ativar/desativar';
        position: absolute;
        right: 12px;
        bottom: -18px;
        font-size: 0.65rem;
        color: #94a3b8;
        font-style: italic;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }
      .theme-card-top:hover::after { opacity: 1; }
    `;
  },

  /**
   * Gera o script de Toggle com persistência via localStorage.
   * @param {string} processoId - Identificador único do processo.
   * @returns {string} Bloco <script> completo para injeção.
   */
  getToggleScript: function(processoId) {
    const id = processoId || 'sem_id';
    return `
<script>
  (function() {
    var PROCESSO_ID = "${id}";

    function getKey(themeId) {
      return 'themeState_' + PROCESSO_ID + '_' + themeId;
    }

    function init() {
      document.querySelectorAll('.theme-card-top').forEach(function(card) {
        var themeId = card.getAttribute('data-theme-id');
        if (!themeId) return;

        // Restaurar estado salvo no localStorage
        if (localStorage.getItem(getKey(themeId)) === 'inactive') {
          card.classList.add('inactive');
        }

        // Adicionar listener de clique para toggle
        card.addEventListener('click', function() {
          card.classList.toggle('inactive');
          var isInactive = card.classList.contains('inactive');
          
          if (isInactive) {
            localStorage.setItem(getKey(themeId), 'inactive');
          } else {
            localStorage.removeItem(getKey(themeId));
          }
        });
      });
    }

    // Inicialização segura
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
</script>`;
  }
};
