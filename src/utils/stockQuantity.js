const normalizeStockQuantities = (stockCategory) => {
  if (stockCategory.availableQuantity !== undefined && stockCategory.availableQuantity !== null) {
    return false;
  }

  const quantity = Number(stockCategory.quantity) || 0;
  const assignedQuantity = Number(stockCategory.assignedQuantity) || 0;

  if (assignedQuantity > 0) {
    stockCategory.availableQuantity = quantity;
    stockCategory.quantity = quantity + assignedQuantity;
  } else if (stockCategory.assignedToEngineer || stockCategory.assignedToUser) {
    stockCategory.availableQuantity = 0;
    stockCategory.assignedQuantity = quantity;
  } else {
    stockCategory.availableQuantity = quantity;
  }

  return true;
};

module.exports = normalizeStockQuantities;
