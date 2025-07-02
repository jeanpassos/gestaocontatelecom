// Funções para manipulação de ações e robôs

// Carregar todos os robôs na tabela de gerenciamento
function loadRobots() {
    const $tbody = $('#robots-table-body');
    $tbody.empty();
    
    if (appState.robots.length === 0) {
        $tbody.html(`<tr><td colspan="6" class="text-center py-3">Nenhum robô encontrado</td></tr>`);
        return;
    }
    
    appState.robots.forEach(robot => {
        const $row = $(`
            <tr>
                <td>${robot.name}</td>
                <td>${robot.description || 'Sem descrição'}</td>
                <td><a href="${robot.url}" target="_blank">${robot.url}</a></td>
                <td>${robot.actions.length}</td>
                <td>${formatDate(robot.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${robot.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success btn-run" data-id="${robot.id}">
                        <i class="bi bi-play-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info btn-clone" data-id="${robot.id}">
                        <i class="bi bi-files"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${robot.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        
        // Adicionar eventos aos botões
        $row.find('.btn-edit').click(function() {
            const robotId = $(this).data('id');
            loadRobot(robotId);
            showPage('create-robot');
        });
        
        $row.find('.btn-run').click(function() {
            const robotId = $(this).data('id');
            runRobot(robotId);
        });
        
        $row.find('.btn-clone').click(function() {
            const robotId = $(this).data('id');
            cloneRobot(robotId);
        });
        
        $row.find('.btn-delete').click(function() {
            const robotId = $(this).data('id');
            confirmDeleteRobot(robotId);
        });
        
        $tbody.append($row);
    });
}

// Carregar um robô específico para edição
function loadRobot(robotId) {
    const robot = appState.robots.find(r => r.id === robotId);
    if (!robot) return;
    
    // Atualizar estado atual
    appState.currentRobot = { ...robot };
    
    // Preencher formulário
    $('#robot-name').val(robot.name);
    $('#robot-description').val(robot.description);
    $('#robot-url').val(robot.url);
    $('#robot-headless').prop('checked', robot.headless);
    $('#robot-screenshots').prop('checked', robot.screenshots !== false);
    
    // Limpar ações atuais
    $('#actions-container').empty();
    
    // Carregar ações
    if (robot.actions && robot.actions.length > 0) {
        robot.actions.forEach((action, index) => {
            addActionToUI(action, index);
        });
        $('#empty-actions').hide();
    } else {
        $('#empty-actions').show();
    }
    
    // Atualizar JSON
    updateRobotJson();
}

// Resetar o robô atual para um novo
function resetCurrentRobot() {
    appState.currentRobot = {
        id: null,
        name: '',
        description: '',
        url: '',
        headless: false,
        screenshots: true,
        actions: []
    };
    
    // Limpar formulário
    $('#robot-name').val('');
    $('#robot-description').val('');
    $('#robot-url').val('');
    $('#robot-headless').prop('checked', false);
    $('#robot-screenshots').prop('checked', true);
    
    // Limpar ações
    $('#actions-container').empty();
    $('#empty-actions').show();
    
    // Atualizar JSON
    updateRobotJson();
}

// Atualizar o robô atual com os dados do formulário
function updateCurrentRobot() {
    appState.currentRobot.name = $('#robot-name').val();
    appState.currentRobot.description = $('#robot-description').val();
    appState.currentRobot.url = $('#robot-url').val();
    appState.currentRobot.headless = $('#robot-headless').is(':checked');
    appState.currentRobot.screenshots = $('#robot-screenshots').is(':checked');
}

// Salvar o robô atual
function saveRobot() {
    // Validar
    if (!appState.currentRobot.name) {
        alert('Por favor, informe um nome para o robô.');
        return;
    }
    
    if (!appState.currentRobot.url) {
        alert('Por favor, informe a URL inicial.');
        return;
    }
    
    // Se é um novo robô, gerar ID
    if (!appState.currentRobot.id) {
        appState.currentRobot.id = generateId();
        appState.currentRobot.createdAt = new Date().toISOString();
        appState.robots.push(appState.currentRobot);
    } else {
        // Atualizar robô existente
        const index = appState.robots.findIndex(r => r.id === appState.currentRobot.id);
        if (index !== -1) {
            appState.currentRobot.updatedAt = new Date().toISOString();
            appState.robots[index] = { ...appState.currentRobot };
        }
    }
    
    // Salvar dados
    saveData();
    
    // Atualizar UI
    updateUI();
    
    // Mostrar mensagem
    alert(`Robô "${appState.currentRobot.name}" salvo com sucesso!`);
}

// Clonar um robô
function cloneRobot(robotId) {
    const robot = appState.robots.find(r => r.id === robotId);
    if (!robot) return;
    
    // Criar uma cópia
    const clone = {
        ...JSON.parse(JSON.stringify(robot)),
        id: generateId(),
        name: `${robot.name} (Cópia)`,
        createdAt: new Date().toISOString()
    };
    delete clone.updatedAt;
    
    // Adicionar à lista
    appState.robots.push(clone);
    
    // Salvar dados
    saveData();
    
    // Recarregar lista
    loadRobots();
    
    // Mostrar mensagem
    alert(`Robô "${robot.name}" clonado com sucesso!`);
}

// Confirmar exclusão de um robô
function confirmDeleteRobot(robotId) {
    const robot = appState.robots.find(r => r.id === robotId);
    if (!robot) return;
    
    // Configurar modal de confirmação
    $('#confirm-message').text(`Tem certeza que deseja excluir o robô "${robot.name}"?`);
    
    const $confirmBtn = $('#btn-confirm-action');
    $confirmBtn.off('click').on('click', function() {
        deleteRobot(robotId);
        $('#confirmModal').modal('hide');
    });
    
    // Mostrar modal
    $('#confirmModal').modal('show');
}

// Excluir um robô
function deleteRobot(robotId) {
    // Remover da lista
    appState.robots = appState.robots.filter(r => r.id !== robotId);
    
    // Salvar dados
    saveData();
    
    // Recarregar lista
    loadRobots();
    
    // Atualizar UI
    updateUI();
}

// Executar um robô
function runRobot(robotId) {
    const robot = appState.robots.find(r => r.id === robotId);
    if (!robot) return;
    
    // Configurar dados para envio à API
    const robotConfig = {
        url: robot.url,
        actions: robot.actions,
        options: {
            headless: robot.headless,
            screenshots: robot.screenshots
        }
    };
    
    // Simular execução (no ambiente real, isso seria uma chamada à API)
    console.log('Executando robô:', robotConfig);
    alert(`Robô "${robot.name}" iniciado.\n\nEm um ambiente real, isso chamaria a API do microserviço para executar o robô.`);
    
    // Criar um registro de resultado simulado
    const resultId = generateId();
    const result = {
        id: resultId,
        robotId: robot.id,
        robotName: robot.name,
        createdAt: new Date().toISOString(),
        status: 'success',
        data: {
            message: 'Execução simulada bem-sucedida',
            extractedData: { exemplo: 'Dado extraído' }
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

// Abrir o modal de adição de ação
function openAddActionModal() {
    // Limpar modal
    $('#action-type').val('navigate');
    updateActionParams();
    appState.editingActionIndex = -1;
    
    // Atualizar título do modal
    $('.modal-title').text('Adicionar Ação');
    
    // Atualizar texto do botão
    $('#btn-save-action').text('Adicionar');
    
    // Abrir modal
    $('#actionModal').modal('show');
}

// Abrir o modal de edição de ação
function openEditActionModal(index) {
    // Verificar se a ação existe
    if (index < 0 || index >= appState.currentRobot.actions.length) return;
    
    const action = appState.currentRobot.actions[index];
    
    // Definir índice de edição
    appState.editingActionIndex = index;
    
    // Preencher modal
    $('#action-type').val(action.type);
    updateActionParams();
    
    // Preencher parâmetros específicos
    fillActionParams(action);
    
    // Atualizar título do modal
    $('.modal-title').text('Editar Ação');
    
    // Atualizar texto do botão
    $('#btn-save-action').text('Salvar');
    
    // Abrir modal
    $('#actionModal').modal('show');
}

// Preencher os parâmetros de uma ação no modal
function fillActionParams(action) {
    switch (action.type) {
        case 'navigate':
            $('#param-url').val(action.url);
            break;
            
        case 'click':
        case 'waitForSelector':
            $('#param-selector').val(action.selector);
            break;
            
        case 'fill':
            $('#param-selector').val(action.selector);
            $('#param-value').val(action.value);
            break;
            
        case 'select':
            $('#param-selector').val(action.selector);
            $('#param-value').val(action.value);
            break;
            
        case 'extract':
            $('#param-name').val(action.name);
            $('#param-selector').val(action.selector);
            $('#param-multiple').prop('checked', action.multiple);
            $('#param-save-as').val(action.saveAs);
            break;
            
        case 'wait':
            $('#param-time').val(action.time);
            break;
            
        case 'screenshot':
            $('#param-name').val(action.name);
            $('#param-full-page').prop('checked', action.fullPage);
            break;
    }
}

// Atualizar os parâmetros mostrados no modal com base no tipo de ação
function updateActionParams() {
    const actionType = $('#action-type').val();
    const $paramsContainer = $('#action-params');
    $paramsContainer.empty();
    
    switch (actionType) {
        case 'navigate':
            $paramsContainer.html(`
                <div class="mb-3">
                    <label for="param-url" class="form-label">URL</label>
                    <input type="url" class="form-control" id="param-url" placeholder="https://www.exemplo.com.br">
                </div>
            `);
            break;
            
        case 'click':
        case 'waitForSelector':
            $paramsContainer.html(`
                <div class="mb-3">
                    <label for="param-selector" class="form-label">Seletor CSS</label>
                    <input type="text" class="form-control" id="param-selector" placeholder="#botao, .classe, div[atributo]">
                </div>
            `);
            break;
            
        case 'fill':
            $paramsContainer.html(`
                <div class="mb-3">
                    <label for="param-selector" class="form-label">Seletor CSS</label>
                    <input type="text" class="form-control" id="param-selector" placeholder="#campo, input[name=email]">
                </div>
                <div class="mb-3">
                    <label for="param-value" class="form-label">Valor</label>
                    <input type="text" class="form-control" id="param-value" placeholder="Texto a preencher">
                </div>
            `);
            break;
            
        case 'select':
            $paramsContainer.html(`
                <div class="mb-3">
                    <label for="param-selector" class="form-label">Seletor CSS</label>
                    <input type="text" class="form-control" id="param-selector" placeholder="select[name=opcao]">
                </div>
                <div class="mb-3">
                    <label for="param-value" class="form-label">Valor</label>
                    <input type="text" class="form-control" id="param-value" placeholder="Valor da opção">
                </div>
            `);
            break;
            
        case 'extract':
            $paramsContainer.html(`
                <div class="mb-3">
                    <label for="param-name" class="form-label">Nome da Extração</label>
                    <input type="text" class="form-control" id="param-name" placeholder="nome_do_campo">
                </div>
                <div class="mb-3">
                    <label for="param-selector" class="form-label">Seletor CSS</label>
                    <input type="text" class="form-control" id="param-selector" placeholder=".produto, span.preco">
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="param-multiple">
                    <label class="form-check-label" for="param-multiple">
                        Extrair múltiplos (lista)
                    </label>
                </div>
                <div class="mb-3">
                    <label for="param-save-as" class="form-label">Salvar Como</label>
                    <input type="text" class="form-control" id="param-save-as" placeholder="resultado_1">
                </div>
            `);
            break;
            
        case 'wait':
            $paramsContainer.html(`
                <div class="mb-3">
                    <label for="param-time" class="form-label">Tempo (ms)</label>
                    <input type="number" class="form-control" id="param-time" placeholder="1000">
                </div>
            `);
            break;
            
        case 'screenshot':
            $paramsContainer.html(`
                <div class="mb-3">
                    <label for="param-name" class="form-label">Nome da Captura</label>
                    <input type="text" class="form-control" id="param-name" placeholder="captura_1">
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="param-full-page">
                    <label class="form-check-label" for="param-full-page">
                        Página Inteira
                    </label>
                </div>
            `);
            break;
    }
}
