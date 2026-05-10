const express = require('express');
const createAiController = require('../controllers/ai.controller');

module.exports = (deps) => {
  const router = express.Router();
  const controller = createAiController(deps);

  router.post('/suggest-destinations', controller.suggestDestinations);
  router.post('/regen-stop', controller.regenStop);
  return router;
};
