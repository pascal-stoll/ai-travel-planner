module.exports = ({ createApiResponse, aiService }) => {
  const suggestDestinations = async (req, res, next) => {
    try {
      const { preferences } = req.body;
      if (!preferences) {
        return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'Preferences are required'));
      }

      const data = await aiService.suggestDestinations(preferences);
      return res.json(createApiResponse(true, data, null, 'Destination suggestions generated successfully'));
    } catch (error) {
      return next(error);
    }
  };

  const regenStop = async (req, res, next) => {
    try {
      const { destination, dayIndex, stopIndex, existingStops, preferences } = req.body;
      if (!destination || dayIndex === undefined || stopIndex === undefined || !existingStops || !preferences) {
        return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'All parameters are required for stop regeneration'));
      }

      const data = await aiService.regenStop(destination, dayIndex, stopIndex, existingStops, preferences);
      return res.json(createApiResponse(true, data, null, 'Stop regenerated successfully'));
    } catch (error) {
      return next(error);
    }
  };

  return {
    suggestDestinations,
    regenStop
  };
};
