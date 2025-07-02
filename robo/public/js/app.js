// Aplicação principal do Robo Manager

// Estado global da aplicação
const appState = {
    currentPage: 'dashboard',
    currentRobot: {
        id: null,
        name: '',
        description: '',
        url: '',
        headless: false,
        screenshots: true,
        actions: []
    },
    robots: [],
    results: [],
    screenshots: [],
    editingActionIndex: -1,
    selectedElements: []
};

// DOM Ready
$(document).ready(function() {
    // Inicializar navegação
    initNavigation();
    
    // Inicializar handlers de eventos
    initEventHandlers();
    
    // Carregar dados salvos
    loadData();
    
    // Atualizar UI
    updateUI();
});

// Inicializar navegação
function initNavigation() {
    // Dashboard
    $('#nav-dashboard').click(function(e) {
        e.preventDefault();
        showPage('dashboard');
    });
    
    // Create Robot
    $('#nav-create').click(function(e) {
        e.preventDefault();
        showPage('create-robot');
    });
    
    // Manage Robots
    $('#nav-manage').click(function(e) {
        e.preventDefault();
        showPage('manage-robots');
        loadRobots();
    });
    
    // Results
    $('#nav-results').click(function(e) {
        e.preventDefault();
        showPage('results');
        loadResults();
    });
    
    // Botões de navegação rápida
    $('#btn-create-robot').click(function() {
        showPage('create-robot');
    });
    
    $('#btn-view-all-results').click(function() {
        showPage('results');
        loadResults();
    });
    
    $('#btn-new-robot').click(function() {
        resetCurrentRobot();
        showPage('create-robot');
    });
}

// Inicializar handlers de eventos
function initEventHandlers() {
    // Adicionar ação
    $('#btn-add-action').click(function() {
        openAddActionModal();
    });
    
    // Salvar ação
    $('#btn-save-action').click(function() {
        saveAction();
    });
    
    // Salvar robô
    $('#btn-save-robot').click(function() {
        saveRobot();
    });
    
    // Copiar JSON
    $('#btn-copy-json').click(function() {
        copyRobotJson();
    });
    
    // Testar robô
    $('#btn-test-robot').click(function() {
        testRobot();
    });
    
    // Seletor visual
    $('#btn-visual-selector').click(function() {
        openVisualSelector();
    });
    
    // Carregar página no iframe
    $('#btn-load-page').click(function() {
        loadPageInIframe();
    });
    
    // Adicionar elementos selecionados
    $('#btn-add-selected-elements').click(function() {
        addSelectedElementsToActions();
    });
    
    // Limpar seleções
    $('#btn-clear-selections').click(function() {
        clearSelectedElements();
    });
    
    // Adicionar bloco reutilizável
    $('#btn-add-block').click(function() {
        addReusableBlock();
    });
    
    // Evento para inputs do robô
    $('#robot-name, #robot-description, #robot-url').on('input', function() {
        updateCurrentRobot();
        updateRobotJson();
    });
    
    // Evento para checkboxes do robô
    $('#robot-headless, #robot-screenshots').on('change', function() {
        updateCurrentRobot();
        updateRobotJson();
    });
    
    // Tipo de ação alterado
    $('#action-type').on('change', function() {
        updateActionParams();
    });
}

// Mostrar página específica
function showPage(pageId) {
    // Esconder todas as páginas
    $('.page-content').removeClass('active');
    
    // Mostrar página selecionada
    $(`#${pageId}-page`).addClass('active');
    
    // Atualizar navegação
    $('.nav-link').removeClass('active');
    $(`#nav-${pageId}`).addClass('active');
    
    // Atualizar estado
    appState.currentPage = pageId;
}

// Carregar dados salvos
function loadData() {
    // Carregar robôs do localStorage
    try {
        const savedRobots = localStorage.getItem('robo_manager_robots');
        if (savedRobots) {
            appState.robots = JSON.parse(savedRobots);
        }
        
        const savedResults = localStorage.getItem('robo_manager_results');
        if (savedResults) {
            appState.results = JSON.parse(savedResults);
        }
        
        const savedScreenshots = localStorage.getItem('robo_manager_screenshots');
        if (savedScreenshots) {
            appState.screenshots = JSON.parse(savedScreenshots);
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Salvar dados
function saveData() {
    // Salvar robôs no localStorage
    try {
        localStorage.setItem('robo_manager_robots', JSON.stringify(appState.robots));
        localStorage.setItem('robo_manager_results', JSON.stringify(appState.results));
        localStorage.setItem('robo_manager_screenshots', JSON.stringify(appState.screenshots));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Atualizar UI
function updateUI() {
    // Atualizar contadores
    $('#total-robots').text(appState.robots.length);
    $('#total-executions').text(appState.results.length);
    $('#total-screenshots').text(appState.screenshots.length);
    
    // Atualizar robôs recentes
    updateRecentRobots();
    
    // Atualizar resultados recentes
    updateRecentResults();
    
    // Atualizar blocos reutilizáveis
    updateReusableBlocks();
}

// Atualizar robôs recentes
function updateRecentRobots() {
    const $recentRobots = $('#recent-robots');
    $recentRobots.empty();
    
    if (appState.robots.length === 0) {
        $recentRobots.html('<div class="text-center py-3 text-muted"><i>Nenhum robô criado ainda</i></div>');
        return;
    }
    
    // Mostrar apenas os 5 mais recentes
    const recentRobots = [...appState.robots].sort((a, b) => {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    }).slice(0, 5);
    
    recentRobots.forEach(robot => {
        const $item = $(`
            <a href="#" class="list-group-item list-group-item-action" data-id="${robot.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${robot.name}</h6>
                    <small>${formatDate(robot.updatedAt || robot.createdAt)}</small>
                </div>
                <p class="mb-1 text-muted small">${robot.description || 'Sem descrição'}</p>
                <small>${robot.actions.length} ações</small>
            </a>
        `);
        
        $item.click(function(e) {
            e.preventDefault();
            loadRobot(robot.id);
            showPage('create-robot');
        });
        
        $recentRobots.append($item);
    });
}

// Atualizar resultados recentes
function updateRecentResults() {
    const $recentResults = $('#recent-results');
    $recentResults.empty();
    
    if (appState.results.length === 0) {
        $recentResults.html('<div class="text-center py-3 text-muted"><i>Nenhum resultado disponível</i></div>');
        return;
    }
    
    // Mostrar apenas os 5 mais recentes
    const recentResults = [...appState.results].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 5);
    
    recentResults.forEach(result => {
        const $item = $(`
            <a href="#" class="list-group-item list-group-item-action" data-id="${result.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${result.robotName}</h6>
                    <small>${formatDate(result.createdAt)}</small>
                </div>
                <p class="mb-1 text-muted small">${formatDataSize(result.size)}</p>
            </a>
        `);
        
        $item.click(function(e) {
            e.preventDefault();
            viewResult(result.id);
        });
        
        $recentResults.append($item);
    });
}

// Formatar data
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Formatar tamanho de dados
function formatDataSize(sizeInBytes) {
    if (sizeInBytes < 1024) {
        return sizeInBytes + ' B';
    } else if (sizeInBytes < 1024 * 1024) {
        return (sizeInBytes / 1024).toFixed(1) + ' KB';
    } else {
        return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// Gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
