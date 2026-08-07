const SearchService = require('../../services/SearchService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class SearchController {
  globalSearch = asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const results = await SearchService.globalSearch(q, { page, limit });
    return ApiResponse.success(res, { data: results });
  });

  suggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const suggestions = await SearchService.getSuggestions(q);
    return ApiResponse.success(res, { data: suggestions });
  });
}

module.exports = new SearchController();

