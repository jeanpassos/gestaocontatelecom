// Bookmarklet para seleção visual de elementos
// Salve o seguinte código como favorito (bookmark) no navegador:
// javascript:(function(){var s=document.createElement('script');s.src='http://localhost:3030/static/selector-helper.js';document.body.appendChild(s);})();

(function() {
  // Estilos para elementos selecionados
  const style = document.createElement('style');
  style.textContent = `
    .playwright-selector-highlight {
      outline: 2px solid red !important;
      background-color: rgba(255, 0, 0, 0.2) !important;
      cursor: pointer !important;
    }
    #playwright-selector-panel {
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border: 1px solid #ccc;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: Arial, sans-serif;
      padding: 10px;
      border-radius: 5px;
    }
    #playwright-selector-panel h3 {
      margin-top: 5px;
      margin-bottom: 10px;
      font-size: 16px;
    }
    #playwright-selector-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    #playwright-selector-list li {
      border-bottom: 1px solid #eee;
      padding: 5px 0;
    }
    .playwright-selector-copy {
      background: #f0f0f0;
      border: 1px solid #ddd;
      padding: 5px;
      margin: 3px 0;
      font-family: monospace;
      cursor: pointer;
      position: relative;
      padding-right: 70px;
      word-break: break-all;
    }
    .playwright-selector-copy:hover {
      background: #e0e0e0;
    }
    .playwright-selector-copy-button {
      position: absolute;
      right: 5px;
      top: 5px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 12px;
      cursor: pointer;
    }
    .playwright-selector-actions {
      margin-top: 10px;
    }
    .playwright-selector-button {
      background: #2196F3;
      color: white;
      border: none;
      padding: 5px 10px;
      margin-right: 5px;
      border-radius: 3px;
      cursor: pointer;
    }
    .playwright-selector-button.clear {
      background: #f44336;
    }
    .playwright-selector-button.export {
      background: #4CAF50;
    }
  `;
  document.head.appendChild(style);

  // Cria o painel de seleção
  const panel = document.createElement('div');
  panel.id = 'playwright-selector-panel';
  panel.innerHTML = `
    <h3>Seleção de Elementos</h3>
    <div>Clique em elementos para obter seletores</div>
    <ul id="playwright-selector-list"></ul>
    <div class="playwright-selector-actions">
      <button class="playwright-selector-button clear">Limpar</button>
      <button class="playwright-selector-button export">Exportar JSON</button>
      <button class="playwright-selector-button" id="exit-selector">Fechar</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Variáveis de estado
  let currentHighlightedElement = null;
  const selectedElements = [];
  
  // Função para gerar seletor CSS otimizado
  function generateSelector(el) {
    // Tenta usar ID
    if (el.id) return `#${el.id}`;
    
    // Tenta usar classe única
    if (el.className) {
      const classes = el.className.split(' ').filter(c => c);
      for (const cls of classes) {
        const elements = document.getElementsByClassName(cls);
        if (elements.length === 1) return `.${cls}`;
      }
    }
    
    // Usa combinação de tag e classe
    if (el.className) {
      return `${el.tagName.toLowerCase()}.${el.className.split(' ').filter(c => c).join('.')}`;
    }
    
    // Cria seletor pelo caminho
    let path = [];
    let element = el;
    while (element.tagName !== 'HTML') {
      let selector = element.tagName.toLowerCase();
      
      // Adiciona índice se tiver irmãos do mesmo tipo
      if (element.parentNode) {
        const siblings = Array.from(element.parentNode.children).filter(
          e => e.tagName === element.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(element) + 1;
          selector += `:nth-child(${index})`;
        }
      }
      
      path.unshift(selector);
      element = element.parentNode;
      
      // Limita a profundidade do seletor
      if (path.length > 3) break;
    }
    
    return path.join(' > ');
  }
  
  // Função para gerar XPath
  function generateXPath(el) {
    if (el.id) return `//*[@id="${el.id}"]`;
    
    let path = '';
    while (el && el.nodeType === 1) {
      let index = 1;
      for (let sibling = el.previousSibling; sibling; sibling = sibling.previousSibling) {
        if (sibling.nodeType === 1 && sibling.tagName === el.tagName) {
          index++;
        }
      }
      
      const tagName = el.tagName.toLowerCase();
      path = `/${tagName}[${index}]${path}`;
      el = el.parentNode;
    }
    
    return path;
  }
  
  // Adicionar seletor à lista
  function addSelector(element) {
    const cssSelector = generateSelector(element);
    const xpathSelector = generateXPath(element);
    const textContent = element.textContent.trim().substring(0, 30) + 
      (element.textContent.trim().length > 30 ? '...' : '');
    
    const item = document.createElement('li');
    item.innerHTML = `
      <div><strong>${element.tagName.toLowerCase()}</strong> ${textContent ? `- "${textContent}"` : ''}</div>
      <div class="playwright-selector-copy">
        ${cssSelector}
        <button class="playwright-selector-copy-button">Copiar</button>
      </div>
      <div class="playwright-selector-copy">
        ${xpathSelector}
        <button class="playwright-selector-copy-button">Copiar</button>
      </div>
    `;
    
    const copyButtons = item.querySelectorAll('.playwright-selector-copy-button');
    copyButtons[0].onclick = () => copyToClipboard(cssSelector);
    copyButtons[1].onclick = () => copyToClipboard(xpathSelector);
    
    const selectorList = document.getElementById('playwright-selector-list');
    selectorList.appendChild(item);
    
    selectedElements.push({
      element,
      cssSelector,
      xpathSelector,
      textContent,
      tagName: element.tagName.toLowerCase()
    });
  }
  
  // Copiar para o clipboard
  function copyToClipboard(text) {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    
    alert(`Seletor copiado: ${text}`);
  }
  
  // Exportar configuração para o formato JSON do robô
  function exportJson() {
    const actions = selectedElements.map((item, index) => {
      // Cria ação baseada no tipo de elemento
      let action;
      
      switch (item.element.tagName.toLowerCase()) {
        case 'input':
          action = {
            type: 'fill',
            selector: item.cssSelector,
            value: `[VALOR_${index + 1}]`
          };
          break;
        
        case 'select':
          action = {
            type: 'select',
            selector: item.cssSelector,
            value: `[OPCAO_${index + 1}]`
          };
          break;
        
        case 'button':
        case 'a':
          action = {
            type: 'click',
            selector: item.cssSelector
          };
          break;
        
        default:
          // Para elementos de texto, assume que queremos extrair
          action = {
            type: 'extract',
            name: `item${index + 1}`,
            selector: item.cssSelector,
            multiple: false,
            saveAs: `resultado${index + 1}`
          };
      }
      
      return action;
    });
    
    const config = {
      url: window.location.href,
      actions: actions
    };
    
    const jsonString = JSON.stringify(config, null, 2);
    
    // Criar um modal para mostrar o JSON
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
      z-index: 1000000;
      width: 80%;
      max-width: 600px;
      max-height: 80vh;
      overflow: auto;
    `;
    
    modal.innerHTML = `
      <h3>Configuração JSON para o Robô</h3>
      <p>Copie esta configuração para usar com o microserviço "robo":</p>
      <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">${jsonString}</pre>
      <button id="copy-json" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        margin-right: 10px;
        border-radius: 4px;
        cursor: pointer;
      ">Copiar JSON</button>
      <button id="close-modal" style="
        background: #f44336;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Fechar</button>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('copy-json').onclick = () => {
      copyToClipboard(jsonString);
    };
    
    document.getElementById('close-modal').onclick = () => {
      document.body.removeChild(modal);
    };
  }
  
  // Eventos de mouse
  function onMouseOver(e) {
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('playwright-selector-highlight');
    }
    
    currentHighlightedElement = e.target;
    currentHighlightedElement.classList.add('playwright-selector-highlight');
    e.stopPropagation();
  }
  
  function onMouseOut(e) {
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('playwright-selector-highlight');
      currentHighlightedElement = null;
    }
    e.stopPropagation();
  }
  
  function onClick(e) {
    if (currentHighlightedElement) {
      addSelector(currentHighlightedElement);
      e.preventDefault();
      e.stopPropagation();
    }
  }
  
  // Iniciar modo de seleção
  function startSelectionMode() {
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    document.addEventListener('click', onClick, true);
  }
  
  // Parar modo de seleção
  function stopSelectionMode() {
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('mouseout', onMouseOut, true);
    document.removeEventListener('click', onClick, true);
    
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('playwright-selector-highlight');
      currentHighlightedElement = null;
    }
  }
  
  // Eventos dos botões do painel
  document.querySelector('.playwright-selector-button.clear').onclick = () => {
    document.getElementById('playwright-selector-list').innerHTML = '';
    selectedElements.length = 0;
  };
  
  document.querySelector('.playwright-selector-button.export').onclick = exportJson;
  
  document.getElementById('exit-selector').onclick = () => {
    stopSelectionMode();
    document.body.removeChild(panel);
    document.head.removeChild(style);
  };
  
  // Iniciar automaticamente
  startSelectionMode();
  
  console.log('Ferramenta de seleção visual iniciada. Clique nos elementos para selecionar.');
})();
