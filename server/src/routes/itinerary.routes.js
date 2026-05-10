const express = require('express');
const createItineraryController = require('../controllers/itinerary.controller');

module.exports = (deps) => {
  const router = express.Router();
  const controller = createItineraryController(deps);

  router.post('/generate-itinerary', controller.generateItinerary);
  return router;
};
