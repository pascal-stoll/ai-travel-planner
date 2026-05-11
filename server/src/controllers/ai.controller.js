module.exports = ({ createApiResponse, aiService }) => {
  const suggestDestinations = async (req, res, next) => {
    const start = Date.now();
    console.log('[API] POST /api/ai/suggest-destinations called');
    console.log('[API] Request body:', JSON.stringify(req.body, null, 2));

    try {
      const { preferences } = req.body;
      if (!preferences) {
        console.log('[API] Missing preferences in request');
        return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'Preferences are required'));
      }

      console.log('[API] Calling aiService.suggestDestinations...');
      const data = await aiService.suggestDestinations(preferences);
      console.log(`[API] Request completed in ${Date.now() - start}ms`);
      return res.json(createApiResponse(true, data, null, 'Destination suggestions generated successfully'));
    } catch (error) {
      console.error('[API] Error in suggestDestinations:', error);
      return next(error);
    }
  };

  const regenStop = async (req, res, next) => {
    const start = Date.now();
    console.log('[API] POST /api/ai/regen-stop called');
    console.log('[API] Request body:', JSON.stringify(req.body, null, 2));

    try {
      const { destination, dayIndex, stopIndex, existingStops, preferences } = req.body;
      if (!destination || dayIndex === undefined || stopIndex === undefined || !existingStops || !preferences) {
        console.log('[API] Missing required parameters in regen-stop request');
        return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'All parameters are required for stop regeneration'));
      }

      console.log('[API] Calling aiService.regenStop...');
      const data = await aiService.regenStop(destination, dayIndex, stopIndex, existingStops, preferences);
      console.log(`[API] Request completed in ${Date.now() - start}ms`);
      return res.json(createApiResponse(true, data, null, 'Stop regenerated successfully'));
    } catch (error) {
      console.error('[API] Error in regenStop:', error);
      return next(error);
    }
  };

  return {
    suggestDestinations,
    regenStop
  };
};
