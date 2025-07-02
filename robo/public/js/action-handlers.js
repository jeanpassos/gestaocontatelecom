// Funções para manipulação de ações do robô

// Salvar ação do modal
function saveAction() {
    const actionType = $('#action-type').val();
    let action = { type: actionType };
    
    // Obter parâmetros específicos do tipo de ação
    switch (actionType) {
        case 'navigate':
            action.url = $('#param-url').val();
            if (!action.url) {
                alert('Por favor, informe a URL.');
                return;
            }
            break;
            
        case 'click':
        case 'waitForSelector':
            action.selector = $('#param-selector').val();
            if (!action.selector) {
                alert('Por favor, informe o seletor.');
                return;
            }
            break;
            
        case 'fill':
            action.selector = $('#param-selector').val();
            action.value = $('#param-value').val();
            if (!action.selector) {
                alert('Por favor, informe o seletor.');
                return;
            }
            break;
            
        case 'select':
            action.selector = $('#param-selector').val();
            action.value = $('#param-value').val();
            if (!action.selector) {
                alert('Por favor, informe o seletor.');
                return;
            }
            break;
            
        case 'extract':
            action.name = $('#param-name').val();
            action.selector = $('#param-selector').val();
            action.multiple = $('#param-multiple').is(':checked');
            action.saveAs = $('#param-save-as').val();
            if (!action.selector) {
                alert('Por favor, informe o seletor.');
                return;
            }
            if (!action.name) {
                alert('Por favor, informe um nome para a extração.');
                return;
            }
            break;
            
        case 'wait':
            action.time = parseInt($('#param-time').val());
            if (isNaN(action.time) || action.time <= 0) {
                alert('Por favor, informe um tempo válido em milissegundos.');
                return;
            }
            break;
            
        case 'screenshot':
            action.name = $('#param-name').val();
            action.fullPage = $('#param-full-page').is(':checked');
            if (!action.name) {
                action.name = `screenshot_${Date.now()}`;
            }
            break;
    }
    
    // Se estiver editando, atualizar ação existente
    if (appState.editingActionIndex >= 0) {
        appState.currentRobot.actions[appState.editingActionIndex] = action;
    } else {
        // Senão, adicionar nova ação
        appState.currentRobot.actions.push(action);
    }
    
    // Atualizar UI
    $('#actions-container').empty();
    appState.currentRobot.actions.forEach((a, index) => {
        addActionToUI(a, index);
    });
    $('#empty-actions').toggle(appState.currentRobot.actions.length === 0);
    
    // Atualizar JSON
    updateRobotJson();
    
    // Fechar modal
    $('#actionModal').modal('hide');
}

// Adicionar ação à UI
function addActionToUI(action, index) {
    // Clone do template
    const $template = $('#action-item-template').clone().html();
    const $action = $($.parseHTML($template));
    
    // Configurar ação
    $action.attr('data-index', index);
    $action.find('.action-type').text(getActionTypeLabel(action.type));
    $action.find('.action-content').html(getActionContentHtml(action));
    
    // Eventos para botões
    $action.find('.btn-edit-action').click(function() {
        openEditActionModal(index);
    });
    
    $action.find('.btn-delete-action').click(function() {
        deleteAction(index);
    });
    
    // Adicionar à lista
    $('#actions-container').append($action);
}

// Obter label para o tipo de ação
function getActionTypeLabel(type) {
    const labels = {
        navigate: 'Navegar',
        click: 'Clicar',
        fill: 'Preencher',
        select: 'Selecionar',
        extract: 'Extrair',
        wait: 'Aguardar',
        waitForSelector: 'Aguardar Elemento',
        screenshot: 'Screenshot'
    };
    
    return labels[type] || type;
}

// Gerar HTML para o conteúdo da ação
function getActionContentHtml(action) {
    let html = '<div class="action-params">';
    
    switch (action.type) {
        case 'navigate':
            html += `<p class="action-param"><span class="param-name">URL:</span> ${action.url}</p>`;
            break;
            
        case 'click':
            html += `<p class="action-param"><span class="param-name">Seletor:</span> ${action.selector}</p>`;
            break;
            
        case 'fill':
            html += `<p class="action-param"><span class="param-name">Seletor:</span> ${action.selector}</p>`;
            html += `<p class="action-param"><span class="param-name">Valor:</span> ${action.value}</p>`;
            break;
            
        case 'select':
            html += `<p class="action-param"><span class="param-name">Seletor:</span> ${action.selector}</p>`;
            html += `<p class="action-param"><span class="param-name">Valor:</span> ${action.value}</p>`;
            break;
            
        case 'extract':
            html += `<p class="action-param"><span class="param-name">Nome:</span> ${action.name}</p>`;
            html += `<p class="action-param"><span class="param-name">Seletor:</span> ${action.selector}</p>`;
            html += `<p class="action-param"><span class="param-name">Múltiplo:</span> ${action.multiple ? 'Sim' : 'Não'}</p>`;
            if (action.saveAs) {
                html += `<p class="action-param"><span class="param-name">Salvar como:</span> ${action.saveAs}</p>`;
            }
            break;
            
        case 'wait':
            html += `<p class="action-param"><span class="param-name">Tempo:</span> ${action.time} ms</p>`;
            break;
            
        case 'waitForSelector':
            html += `<p class="action-param"><span class="param-name">Seletor:</span> ${action.selector}</p>`;
            break;
            
        case 'screenshot':
            html += `<p class="action-param"><span class="param-name">Nome:</span> ${action.name}</p>`;
            html += `<p class="action-param"><span class="param-name">Página inteira:</span> ${action.fullPage ? 'Sim' : 'Não'}</p>`;
            break;
    }
    
    html += '</div>';
    return html;
}

// Excluir ação
function deleteAction(index) {
    if (index < 0 || index >= appState.currentRobot.actions.length) return;
    
    // Remover ação
    appState.currentRobot.actions.splice(index, 1);
    
    // Atualizar UI
    $('#actions-container').empty();
    appState.currentRobot.actions.forEach((action, idx) => {
        addActionToUI(action, idx);
    });
    $('#empty-actions').toggle(appState.currentRobot.actions.length === 0);
    
    // Atualizar JSON
    updateRobotJson();
}

// Atualizar representação JSON do robô
function updateRobotJson() {
    const robotConfig = {
        id: appState.currentRobot.id,
        name: appState.currentRobot.name,
        description: appState.currentRobot.description,
        url: appState.currentRobot.url,
        options: {
            headless: appState.currentRobot.headless,
            screenshots: appState.currentRobot.screenshots
        },
        actions: appState.currentRobot.actions
    };
    
    $('#robot-json').val(JSON.stringify(robotConfig, null, 2));
}

// Copiar JSON para área de transferência
function copyRobotJson() {
    const json = $('#robot-json').val();
    copyToClipboard(json);
    alert('JSON copiado para a área de transferência!');
}

// Testar o robô atual
function testRobot() {
    if (!appState.currentRobot.name) {
        alert('Por favor, informe um nome para o robô antes de testá-lo.');
        return;
    }
    
    if (!appState.currentRobot.url) {
        alert('Por favor, informe a URL inicial antes de testar o robô.');
        return;
    }
    
    if (appState.currentRobot.actions.length === 0) {
        alert('O robô precisa ter pelo menos uma ação para ser testado.');
        return;
    }
    
    // Simular teste (no ambiente real, isso seria uma chamada à API)
    alert(`Iniciando teste do robô "${appState.currentRobot.name}".\n\nEm um ambiente real, isso chamaria a API do microserviço para executar o robô em modo de teste.`);
    
    // Criar um resultado simulado
    const resultId = generateId();
    const result = {
        id: resultId,
        robotId: appState.currentRobot.id || 'temp_' + Date.now(),
        robotName: appState.currentRobot.name,
        createdAt: new Date().toISOString(),
        status: 'success',
        data: {
            message: 'Teste simulado bem-sucedido',
            extractedData: { exemplo: 'Dado de teste extraído' }
        },
        size: 512
    };
    
    // Adicionar à lista de resultados
    appState.results.push(result);
    
    // Salvar dados
    saveData();
    
    // Atualizar UI
    updateUI();
}

// Carregar resultados
function loadResults() {
    // Carregar lista de resultados
    const $resultsTableBody = $('#results-table-body');
    $resultsTableBody.empty();
    
    if (appState.results.length === 0) {
        $resultsTableBody.html(`<tr><td colspan="4" class="text-center py-3">Nenhum resultado encontrado</td></tr>`);
    } else {
        // Ordenar por data mais recente
        const sortedResults = [...appState.results].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedResults.forEach(result => {
            const $row = $(`
                <tr>
                    <td>${result.robotName}</td>
                    <td>${formatDate(result.createdAt)}</td>
                    <td>${formatDataSize(result.size)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-view-result" data-id="${result.id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete-result" data-id="${result.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
            
            $row.find('.btn-view-result').click(function() {
                viewResult(result.id);
            });
            
            $row.find('.btn-delete-result').click(function() {
                deleteResult(result.id);
            });
            
            $resultsTableBody.append($row);
        });
    }
    
    // Carregar screenshots
    const $screenshotsGallery = $('#screenshots-gallery');
    $screenshotsGallery.empty();
    
    if (appState.screenshots.length === 0) {
        $screenshotsGallery.html(`<div class="col-12 text-center py-3 text-muted"><i>Nenhum screenshot encontrado</i></div>`);
    } else {
        // Ordenar por data mais recente
        const sortedScreenshots = [...appState.screenshots].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedScreenshots.forEach(screenshot => {
            const $card = $(`
                <div class="col-md-3">
                    <div class="card screenshot-card">
                        <img src="${screenshot.url}" alt="${screenshot.name}" class="card-img-top">
                        <div class="card-body">
                            <h6 class="card-title">${screenshot.name}</h6>
                            <p class="card-text small text-muted">${formatDate(screenshot.createdAt)}</p>
                            <button class="btn btn-sm btn-outline-danger btn-delete-screenshot" data-id="${screenshot.id}">
                                <i class="bi bi-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `);
            
            $card.find('.btn-delete-screenshot').click(function() {
                deleteScreenshot(screenshot.id);
            });
            
            $screenshotsGallery.append($card);
        });
    }
}

// Visualizar resultado
function viewResult(resultId) {
    const result = appState.results.find(r => r.id === resultId);
    if (!result) return;
    
    // Preencher modal
    $('#result-content').text(JSON.stringify(result.data, null, 2));
    
    // Abrir modal
    $('#viewResultModal').modal('show');
}

// Excluir resultado
function deleteResult(resultId) {
    // Remover da lista
    appState.results = appState.results.filter(r => r.id !== resultId);
    
    // Salvar dados
    saveData();
    
    // Recarregar lista
    loadResults();
    
    // Atualizar UI
    updateUI();
}

// Excluir screenshot
function deleteScreenshot(screenshotId) {
    // Remover da lista
    appState.screenshots = appState.screenshots.filter(s => s.id !== screenshotId);
    
    // Salvar dados
    saveData();
    
    // Recarregar lista
    loadResults();
    
    // Atualizar UI
    updateUI();
}

// Adicionar bloco reutilizável às ações
function addReusableBlock() {
    const blockId = $('#reusable-blocks').val();
    if (!blockId) return;
    
    // Encontrar bloco
    const block = appState.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    // Adicionar ações do bloco ao robô atual
    appState.currentRobot.actions = appState.currentRobot.actions.concat(JSON.parse(JSON.stringify(block.actions)));
    
    // Atualizar UI
    $('#actions-container').empty();
    appState.currentRobot.actions.forEach((action, index) => {
        addActionToUI(action, index);
    });
    $('#empty-actions').hide();
    
    // Atualizar JSON
    updateRobotJson();
    
    // Mostrar mensagem
    alert(`Bloco "${block.name}" adicionado ao robô.`);
}

// Atualizar lista de blocos reutilizáveis
function updateReusableBlocks() {
    const $select = $('#reusable-blocks');
    $select.empty();
    
    $select.append('<option value="" selected disabled>Selecione...</option>');
    
    // Se não houver blocos, criar alguns de exemplo
    if (!appState.blocks || appState.blocks.length === 0) {
        appState.blocks = [
            {
                id: 'login_basic',
                name: 'Login Básico',
                actions: [
                    { type: 'fill', selector: 'input[name="username"]', value: '[USUARIO]' },
                    { type: 'fill', selector: 'input[name="password"]', value: '[SENHA]' },
                    { type: 'click', selector: 'button[type="submit"]' },
                    { type: 'waitForSelector', selector: '.dashboard-container' }
                ]
            },
            {
                id: 'extract_table',
                name: 'Extrair Tabela',
                actions: [
                    { type: 'extract', name: 'table_rows', selector: 'table tr', multiple: true, saveAs: 'tabela_dados' }
                ]
            }
        ];
    }
    
    // Adicionar blocos ao select
    appState.blocks.forEach(block => {
        $select.append(`<option value="${block.id}">${block.name} (${block.actions.length} ações)</option>`);
    });
}
