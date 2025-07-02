const fs = require('fs');
const path = require('path');
const playwrightService = require('../services/playwright.service');
const { logger } = require('../utils/logger');

/**
 * Controller para gerenciar as operações do robô
 */
class RobotController {
  /**
   * Executa um fluxo completo de ações com o robô
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async runRobot(req, res) {
    try {
      const { url, actions, options } = req.body;
      
      if (!url || !actions || !Array.isArray(actions)) {
        return res.status(400).json({
          error: true,
          message: 'URL e lista de ações são obrigatórios'
        });
      }
      
      // Inicializa o browser
      await playwrightService.initialize(options);
      
      // Navega para a URL inicial
      await playwrightService.navigate(url);
      
      // Executa as ações e obtém os resultados
      const results = await playwrightService.executeActions(actions);
      
      // Tira screenshot final
      const screenshotPath = await playwrightService.takeScreenshot('final_result');
      
      // Salva os resultados
      const resultPath = await playwrightService.saveResults({
        url,
        timestamp: new Date().toISOString(),
        actions: actions.length,
        results,
        screenshot: screenshotPath
      }, 'robot_execution');
      
      // Fecha o browser
      await playwrightService.close();
      
      res.json({
        success: true,
        url,
        actionsExecuted: actions.length,
        results,
        screenshot: screenshotPath,
        resultFile: resultPath
      });
    } catch (error) {
      logger.error(`Erro ao executar robô: ${error.message}`);
      
      // Garante que o browser seja fechado em caso de erro
      await playwrightService.close();
      
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
  
  /**
   * Mapeia elementos em uma página
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async mapElements(req, res) {
    try {
      const { url, selectors, options } = req.body;
      
      if (!url || !selectors || !Array.isArray(selectors)) {
        return res.status(400).json({
          error: true,
          message: 'URL e lista de seletores são obrigatórios'
        });
      }
      
      // Inicializa o browser
      await playwrightService.initialize(options);
      
      // Navega para a URL
      await playwrightService.navigate(url);
      
      // Resultados do mapeamento
      const mappingResults = {};
      
      // Para cada seletor, verifica existência e extrai informações
      for (const selector of selectors) {
        try {
          const count = await playwrightService.page.$$eval(selector, elements => elements.length);
          
          // Informações do elemento
          const elements = await playwrightService.page.$$eval(selector, elements => 
            elements.map(el => {
              const rect = el.getBoundingClientRect();
              return {
                tagName: el.tagName.toLowerCase(),
                id: el.id || null,
                className: el.className || null,
                text: el.textContent.trim().substring(0, 50) + (el.textContent.trim().length > 50 ? '...' : ''),
                position: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height
                },
                attributes: Array.from(el.attributes).map(attr => ({
                  name: attr.name,
                  value: attr.value
                }))
              };
            })
          );
          
          mappingResults[selector] = {
            count,
            elements: elements.slice(0, 5), // Limita a 5 elementos para evitar resposta muito grande
            hasMore: elements.length > 5
          };
        } catch (error) {
          mappingResults[selector] = {
            error: error.message,
            count: 0,
            elements: []
          };
        }
      }
      
      // Tira screenshot
      const screenshotPath = await playwrightService.takeScreenshot('mapping');
      
      // Salva os resultados
      const resultPath = await playwrightService.saveResults({
        url,
        timestamp: new Date().toISOString(),
        selectors,
        mappingResults,
        screenshot: screenshotPath
      }, 'element_mapping');
      
      // Fecha o browser
      await playwrightService.close();
      
      res.json({
        success: true,
        url,
        mappingResults,
        screenshot: screenshotPath,
        resultFile: resultPath
      });
    } catch (error) {
      logger.error(`Erro ao mapear elementos: ${error.message}`);
      
      // Garante que o browser seja fechado em caso de erro
      await playwrightService.close();
      
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
  
  /**
   * Extrai dados de uma página
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async extractData(req, res) {
    try {
      const { url, extractions, options } = req.body;
      
      if (!url || !extractions || !Array.isArray(extractions)) {
        return res.status(400).json({
          error: true,
          message: 'URL e configurações de extração são obrigatórios'
        });
      }
      
      // Inicializa o browser
      await playwrightService.initialize(options);
      
      // Navega para a URL
      await playwrightService.navigate(url);
      
      // Resultados da extração
      const extractionResults = {};
      
      // Para cada extração, obtém os dados
      for (const extraction of extractions) {
        try {
          const extractedData = await playwrightService.extractData({
            selector: extraction.selector,
            attribute: extraction.attribute,
            multiple: extraction.multiple
          });
          
          extractionResults[extraction.name] = extractedData;
        } catch (error) {
          extractionResults[extraction.name] = {
            error: error.message
          };
        }
      }
      
      // Tira screenshot
      const screenshotPath = await playwrightService.takeScreenshot('extraction');
      
      // Salva os resultados
      const resultPath = await playwrightService.saveResults({
        url,
        timestamp: new Date().toISOString(),
        extractions,
        extractionResults,
        screenshot: screenshotPath
      }, 'data_extraction');
      
      // Fecha o browser
      await playwrightService.close();
      
      res.json({
        success: true,
        url,
        extractionResults,
        screenshot: screenshotPath,
        resultFile: resultPath
      });
    } catch (error) {
      logger.error(`Erro ao extrair dados: ${error.message}`);
      
      // Garante que o browser seja fechado em caso de erro
      await playwrightService.close();
      
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
  
  /**
   * Obtém lista de resultados salvos
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async getResults(req, res) {
    try {
      const resultsDir = path.join(__dirname, '../../public/results');
      
      if (!fs.existsSync(resultsDir)) {
        return res.json({ results: [] });
      }
      
      const files = fs.readdirSync(resultsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(resultsDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            url: `/static/results/${file}`,
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created - a.created);
      
      res.json({ results: files });
    } catch (error) {
      logger.error(`Erro ao obter resultados: ${error.message}`);
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
  
  /**
   * Obtém lista de screenshots salvos
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async getScreenshots(req, res) {
    try {
      const screenshotsDir = path.join(__dirname, '../../public/screenshots');
      
      if (!fs.existsSync(screenshotsDir)) {
        return res.json({ screenshots: [] });
      }
      
      const files = fs.readdirSync(screenshotsDir)
        .filter(file => file.endsWith('.png'))
        .map(file => {
          const filePath = path.join(screenshotsDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            url: `/static/screenshots/${file}`,
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created - a.created);
      
      res.json({ screenshots: files });
    } catch (error) {
      logger.error(`Erro ao obter screenshots: ${error.message}`);
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
}

module.exports = new RobotController();
