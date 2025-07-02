const express = require('express');
const robotController = require('../controllers/robot.controller');
const router = express.Router();

/**
 * Rota para iniciar o robô com um fluxo específico
 * POST /api/robot/run
 * Body: {
 *   url: string,
 *   actions: Array<Action>,
 *   options: BrowserOptions
 * }
 */
router.post('/run', robotController.runRobot);

/**
 * Rota para mapear elementos de uma página
 * POST /api/robot/map
 * Body: {
 *   url: string,
 *   selectors: Array<string>,
 *   options: BrowserOptions
 * }
 */
router.post('/map', robotController.mapElements);

/**
 * Rota para extrair dados de uma página
 * POST /api/robot/extract
 * Body: {
 *   url: string,
 *   extractions: Array<Extraction>,
 *   options: BrowserOptions
 * }
 */
router.post('/extract', robotController.extractData);

/**
 * Rota para obter lista de resultados salvos
 * GET /api/robot/results
 */
router.get('/results', robotController.getResults);

/**
 * Rota para obter lista de screenshots salvos
 * GET /api/robot/screenshots
 */
router.get('/screenshots', robotController.getScreenshots);

module.exports = router;
