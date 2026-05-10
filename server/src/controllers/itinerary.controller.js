module.exports = ({ createApiResponse, aiService }) => {
  const generateItinerary = async (req, res, next) => {
    try {
      const { destination, preferences } = req.body;
      if (!destination || !preferences) {
        return res.status(400).json(createApiResponse(false, null, 'INVALID_REQUEST', 'Destination and preferences are required'));
      }

      const data = await aiService.generateItinerary(destination, preferences);
      return res.json(createApiResponse(true, data, null, 'Itinerary generated successfully'));
    } catch (error) {
      return next(error);
    }
  };

  return {
    generateItinerary
  };
};
