module.exports = async function paginate(model, query = {}, options = {}) {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  const totalDocuments = await model.countDocuments(query);

  const results = await model
    .find(query)
    .skip(skip)
    .limit(limit)
    .populate(options.populate || "");

  return {
    status: true,
    currentPage: page,
    totalPages: Math.ceil(totalDocuments / limit),
    totalResults: totalDocuments,
    results: results.length,
    paginateData: results,
  };
};
