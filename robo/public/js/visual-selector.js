// Funções para o seletor visual de elementos

// Abrir o seletor visual
function openVisualSelector() {
    // Pegar URL do robô atual
    const url = appState.currentRobot.url || '';
    $('#selector-url').val(url);
    
    // Limpar elementos selecionados
    clearSelectedElements();
    
    // Abrir o modal
    $('#visualSelectorModal').modal('show');
}

// Carregar página no iframe
function loadPageInIframe() {
    const url = $('#selector-url').val();
    if (!url) {
        alert('Por favor, informe uma URL válida.');
        return;
    }
    
    // Atualizar URL no iframe
    $('#browser-iframe').attr('src', url);
    
    // Injetar script de seleção após carregamento
    const iframe = document.getElementById('browser-iframe');
    iframe.onload = function() {
        try {
            injectSelectorScript(iframe);
        } catch (error) {
            console.error('Erro ao injetar script:', error);
            alert('Não foi possível injetar o script de seleção. Isso pode acontecer devido a políticas de segurança do navegador.');
        }
    };
}

// Injetar script de seleção no iframe
function injectSelectorScript(iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Adicionar estilos
    const style = iframeDoc.createElement('style');
    style.textContent = `
        .visual-selector-highlight {
            outline: 2px solid red !important;
            background-color: rgba(255, 0, 0, 0.2) !important;
            cursor: pointer !important;
            position: relative;
        }
    `;
    iframeDoc.head.appendChild(style);
    
    // Adicionar script de seleção
    const script = iframeDoc.createElement('script');
    script.textContent = `
        (function() {
            let currentElement = null;
            
            // Eventos de mouse
            document.addEventListener('mouseover', function(e) {
                if (currentElement) {
                    currentElement.classList.remove('visual-selector-highlight');
                }
                
                currentElement = e.target;
                currentElement.classList.add('visual-selector-highlight');
                e.stopPropagation();
            }, true);
            
            document.addEventListener('mouseout', function(e) {
                if (currentElement) {
                    currentElement.classList.remove('visual-selector-highlight');
                    currentElement = null;
                }
                e.stopPropagation();
            }, true);
            
            document.addEventListener('click', function(e) {
                if (currentElement) {
                    // Gerar informações do elemento
                    const elementInfo = {
                        tagName: currentElement.tagName.toLowerCase(),
                        id: currentElement.id || '',
                        classes: Array.from(currentElement.classList).filter(c => c !== 'visual-selector-highlight').join(' '),
                        text: currentElement.textContent.trim().substring(0, 30) + 
                              (currentElement.textContent.trim().length > 30 ? '...' : ''),
                        cssSelector: generateSelector(currentElement),
                        xpathSelector: generateXPath(currentElement),
                        attributes: getElementAttributes(currentElement)
                    };
                    
                    // Enviar para o pai (outside iframe)
                    window.parent.postMessage({
                        type: 'elementSelected',
                        element: elementInfo
                    }, '*');
                    
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);
            
            // Função para gerar um seletor CSS otimizado
            function generateSelector(el) {
                // Tenta usar ID
                if (el.id) return '#' + el.id;
                
                // Tenta usar classe única
                if (el.className) {
                    const classes = el.className.split(' ').filter(c => c && c !== 'visual-selector-highlight');
                    for (const cls of classes) {
                        const elements = document.getElementsByClassName(cls);
                        if (elements.length === 1) return '.' + cls;
                    }
                }
                
                // Usa combinação de tag e classe
                if (el.className) {
                    return el.tagName.toLowerCase() + '.' + 
                           el.className.split(' ')
                               .filter(c => c && c !== 'visual-selector-highlight')
                               .join('.');
                }
                
                // Cria seletor pelo caminho
                let path = [];
                let element = el;
                while (element.tagName !== 'HTML') {
                    let selector = element.tagName.toLowerCase();
                    
                    if (element.parentNode) {
                        const siblings = Array.from(element.parentNode.children).filter(
                            e => e.tagName === element.tagName
                        );
                        if (siblings.length > 1) {
                            const index = siblings.indexOf(element) + 1;
                            selector += ':nth-child(' + index + ')';
                        }
                    }
                    
                    path.unshift(selector);
                    element = element.parentNode;
                    
                    // Limitar a profundidade
                    if (path.length > 3) break;
                }
                
                return path.join(' > ');
            }
            
            // Função para gerar XPath
            function generateXPath(el) {
                if (el.id) return '//*[@id="' + el.id + '"]';
                
                let path = '';
                while (el && el.nodeType === 1) {
                    let index = 1;
                    for (let sibling = el.previousSibling; sibling; sibling = sibling.previousSibling) {
                        if (sibling.nodeType === 1 && sibling.tagName === el.tagName) {
                            index++;
                        }
                    }
                    
                    const tagName = el.tagName.toLowerCase();
                    path = '/' + tagName + '[' + index + ']' + path;
                    el = el.parentNode;
                }
                
                return path;
            }
            
            // Obter atributos importantes do elemento
            function getElementAttributes(el) {
                const result = {};
                const importantAttrs = ['name', 'type', 'value', 'placeholder', 'href', 'src', 'alt', 'title'];
                
                importantAttrs.forEach(attr => {
                    if (el.hasAttribute(attr)) {
                        result[attr] = el.getAttribute(attr);
                    }
                });
                
                return result;
            }
            
            console.log('Script de seleção visual carregado!');
        })();
    `;
    iframeDoc.body.appendChild(script);
    
    // Adicionar ouvinte de mensagens do iframe
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'elementSelected') {
            addSelectedElement(event.data.element);
        }
    });
}

// Adicionar elemento selecionado à lista
function addSelectedElement(element) {
    // Adicionar ao estado
    appState.selectedElements.push(element);
    
    // Atualizar UI
    updateSelectedElementsList();
}

// Atualizar lista de elementos selecionados
function updateSelectedElementsList() {
    const $container = $('#selected-elements');
    $container.empty();
    
    if (appState.selectedElements.length === 0) {
        $container.html('<div class="text-center py-3 text-muted"><i>Nenhum elemento selecionado</i></div>');
        return;
    }
    
    appState.selectedElements.forEach((element, index) => {
        const $item = $(`
            <div class="element-item">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong>${element.tagName} ${element.id ? '#' + element.id : ''}</strong>
                    <button class="btn btn-sm btn-outline-danger btn-remove-element" data-index="${index}">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                ${element.text ? `<div class="text-muted small mb-1">${element.text}</div>` : ''}
                <div class="selector-info">
                    <div class="selector-text mb-1">
                        ${element.cssSelector}
                        <button class="btn btn-sm btn-outline-secondary btn-copy-selector" data-selector="${element.cssSelector}">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>
                    <div class="selector-text">
                        ${element.xpathSelector}
                        <button class="btn btn-sm btn-outline-secondary btn-copy-selector" data-selector="${element.xpathSelector}">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        // Evento para remover elemento
        $item.find('.btn-remove-element').click(function() {
            const idx = $(this).data('index');
            appState.selectedElements.splice(idx, 1);
            updateSelectedElementsList();
        });
        
        // Evento para copiar seletor
        $item.find('.btn-copy-selector').click(function() {
            const selector = $(this).data('selector');
            copyToClipboard(selector);
            alert('Seletor copiado: ' + selector);
        });
        
        $container.append($item);
    });
}

// Limpar elementos selecionados
function clearSelectedElements() {
    appState.selectedElements = [];
    updateSelectedElementsList();
}

// Adicionar elementos selecionados às ações
function addSelectedElementsToActions() {
    if (appState.selectedElements.length === 0) {
        alert('Nenhum elemento selecionado.');
        return;
    }
    
    // Converter elementos para ações
    const newActions = appState.selectedElements.map(element => {
        // Criar ação baseada no tipo de elemento
        let action;
        
        switch (element.tagName) {
            case 'input':
                const inputType = element.attributes.type || 'text';
                if (inputType === 'submit' || inputType === 'button') {
                    action = {
                        type: 'click',
                        selector: element.cssSelector
                    };
                } else {
                    action = {
                        type: 'fill',
                        selector: element.cssSelector,
                        value: `[VALOR]`
                    };
                }
                break;
                
            case 'select':
                action = {
                    type: 'select',
                    selector: element.cssSelector,
                    value: `[OPCAO]`
                };
                break;
                
            case 'button':
            case 'a':
                action = {
                    type: 'click',
                    selector: element.cssSelector
                };
                break;
                
            default:
                // Para elementos de texto, assume que queremos extrair
                action = {
                    type: 'extract',
                    name: `item_${Date.now().toString(36)}`,
                    selector: element.cssSelector,
                    multiple: false,
                    saveAs: `resultado_${Date.now().toString(36)}`
                };
        }
        
        return action;
    });
    
    // Adicionar ações ao robô atual
    appState.currentRobot.actions = appState.currentRobot.actions.concat(newActions);
    
    // Atualizar UI
    $('#actions-container').empty();
    appState.currentRobot.actions.forEach((action, index) => {
        addActionToUI(action, index);
    });
    $('#empty-actions').hide();
    
    // Atualizar JSON
    updateRobotJson();
    
    // Fechar modal
    $('#visualSelectorModal').modal('hide');
    
    // Mostrar mensagem
    alert(`${newActions.length} ações adicionadas ao robô.`);
}

// Copiar para a área de transferência
function copyToClipboard(text) {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}
