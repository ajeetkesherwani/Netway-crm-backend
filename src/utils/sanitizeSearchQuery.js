module.exports = function sanitizeSearchQuery(searchQuery) {
  if (searchQuery && searchQuery.trim()) {
    return searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  return "";
};
