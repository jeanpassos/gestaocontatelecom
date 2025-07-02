const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

class PlaywrightService {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Inicializa o browser e cria uma página
   * @param {Object} options - Opções de inicialização
   * @returns {Object} - Objeto com browser, context e page
   */
  async initialize(options = {}) {
    try {
      const defaultOptions = {
        headless: false,
        slowMo: 100,
        timeout: 60000,
        viewport: { width: 1280, height: 720 }
      };

      const browserOptions = { ...defaultOptions, ...options };

      logger.info('Inicializando browser Playwright');
      this.browser = await chromium.launch({
        headless: browserOptions.headless,
        slowMo: browserOptions.slowMo
      });

      this.context = await this.browser.newContext({
        viewport: browserOptions.viewport,
        recordVideo: options.recordVideo ? {
          dir: path.join(__dirname, '../../public/videos'),
          size: { width: 1280, height: 720 }
        } : undefined
      });

      this.page = await this.context.newPage();
      
      // Configurar timeout padrão
      this.page.setDefaultTimeout(browserOptions.timeout);

      logger.info('Browser Playwright inicializado com sucesso');
      return { browser: this.browser, context: this.context, page: this.page };
    } catch (error) {
      logger.error(`Erro ao inicializar browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Navega para uma URL
   * @param {string} url - URL para navegar
   * @returns {Promise<void>}
   */
  async navigate(url) {
    try {
      logger.info(`Navegando para: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle' });
      logger.info(`Navegação para ${url} concluída`);
    } catch (error) {
      logger.error(`Erro ao navegar para ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tira screenshot da página atual
   * @param {string} name - Nome para o arquivo de screenshot
   * @returns {string} - Caminho do arquivo salvo
   */
  async takeScreenshot(name) {
    try {
      const fileName = `${name || 'screenshot'}_${Date.now()}.png`;
      const filePath = path.join(__dirname, '../../public/screenshots', fileName);
      
      logger.info(`Tirando screenshot: ${fileName}`);
      await this.page.screenshot({ path: filePath, fullPage: true });
      
      return `/static/screenshots/${fileName}`;
    } catch (error) {
      logger.error(`Erro ao tirar screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extrai dados de uma página usando um seletor CSS
   * @param {Object} extraction - Configuração da extração
   * @param {string} extraction.selector - Seletor CSS para extrair
   * @param {string} extraction.attribute - Atributo a extrair (opcional, padrão: textContent)
   * @param {boolean} extraction.multiple - Se deve extrair múltiplos elementos (opcional, padrão: false)
   * @returns {Promise<any>} - Dados extraídos
   */
  async extractData(extraction) {
    try {
      const { selector, attribute = 'textContent', multiple = false } = extraction;
      
      logger.info(`Extraindo dados com seletor: ${selector}`);
      
      if (multiple) {
        return await this.page.$$eval(selector, (elements, attr) => {
          return elements.map(el => {
            if (attr === 'textContent') return el.textContent.trim();
            if (attr === 'innerHTML') return el.innerHTML.trim();
            if (attr === 'outerHTML') return el.outerHTML.trim();
            return el.getAttribute(attr);
          });
        }, attribute);
      } else {
        return await this.page.$eval(selector, (el, attr) => {
          if (attr === 'textContent') return el.textContent.trim();
          if (attr === 'innerHTML') return el.innerHTML.trim();
          if (attr === 'outerHTML') return el.outerHTML.trim();
          return el.getAttribute(attr);
        }, attribute);
      }
    } catch (error) {
      logger.error(`Erro ao extrair dados: ${error.message}`);
      throw error;
    }
  }

  /**
   * Executa uma sequência de ações na página
   * @param {Array<Object>} actions - Lista de ações a executar
   * @returns {Promise<Object>} - Resultados das extrações
   */
  async executeActions(actions) {
    try {
      logger.info(`Executando ${actions.length} ações`);
      const results = {};
      
      for (const action of actions) {
        switch (action.type) {
          case 'navigate':
            await this.navigate(action.url);
            break;
            
          case 'click':
            logger.info(`Clicando em: ${action.selector}`);
            await this.page.click(action.selector);
            break;
            
          case 'fill':
            logger.info(`Preenchendo campo ${action.selector} com: ${action.value}`);
            await this.page.fill(action.selector, action.value);
            break;
            
          case 'select':
            logger.info(`Selecionando opção ${action.value} em ${action.selector}`);
            await this.page.selectOption(action.selector, action.value);
            break;
            
          case 'wait':
            logger.info(`Aguardando ${action.milliseconds}ms`);
            await this.page.waitForTimeout(action.milliseconds);
            break;
            
          case 'waitForSelector':
            logger.info(`Aguardando seletor: ${action.selector}`);
            await this.page.waitForSelector(action.selector, { 
              state: action.state || 'visible',
              timeout: action.timeout || 30000 
            });
            break;
            
          case 'screenshot':
            const screenshotPath = await this.takeScreenshot(action.name);
            if (action.saveAs) {
              results[action.saveAs] = screenshotPath;
            }
            break;
            
          case 'extract':
            logger.info(`Extraindo dados: ${action.name}`);
            const extractedData = await this.extractData({
              selector: action.selector,
              attribute: action.attribute,
              multiple: action.multiple
            });
            
            if (action.saveAs) {
              results[action.saveAs] = extractedData;
            }
            break;
            
          default:
            logger.warn(`Tipo de ação desconhecida: ${action.type}`);
        }
      }
      
      return results;
    } catch (error) {
      logger.error(`Erro ao executar ações: ${error.message}`);
      throw error;
    }
  }

  /**
   * Salva os dados extraídos em um arquivo JSON
   * @param {Object} data - Dados a salvar
   * @param {string} name - Nome do arquivo
   * @returns {string} - Caminho do arquivo salvo
   */
  async saveResults(data, name) {
    try {
      const fileName = `${name || 'result'}_${Date.now()}.json`;
      const filePath = path.join(__dirname, '../../public/results', fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      logger.info(`Resultados salvos em: ${filePath}`);
      
      return `/static/results/${fileName}`;
    } catch (error) {
      logger.error(`Erro ao salvar resultados: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fecha o browser
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      logger.info('Fechando browser');
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}

module.exports = new PlaywrightService();
