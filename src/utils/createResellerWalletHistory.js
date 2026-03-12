const ResellerWalletHistory = require("../models/resellerWallerHistory");

/**
 * Creates a new reseller wallet history entry.
 * @param {Object} data - The data for the reseller wallet history.
 * @param {string} data.reseller - The ID of the reseller.
 * @param {number} data.amount - The amount to be recorded.
 * @param {Date} data.paymentDate - The date of the payment.
 * @param {string} data.mode - The mode of payment (e.g., Cash, Online, etc.).
 * @param {string} data.createdBy - The name of the creator.
 * @param {string} data.createdById - The ID of the creator.
 * @param {number} [data.openingBalance] - The opening balance (optional).
 * @param {number} [data.closingBalance] - The closing balance (optional).
 * @param {string} [data.remark] - Any additional remarks (optional).
 * @returns {Promise<Object>} - The created reseller wallet history document.
 */
const createResellerWalletHistory = async (data) => {
  try {
    const {
      reseller,
      amount,
      paymentDate,
      mode,
      createdBy,
      createdById,
      openingBalance,
      closingBalance,
      remark = ""
    } = data;

    // Validate required fields
    if (!reseller || !amount || !paymentDate || !mode || !createdBy || !createdById) {
      throw new Error("Missing required fields to create reseller wallet history.");
    }

    // Create the reseller wallet history entry
    const newHistory = new ResellerWalletHistory({
      reseller,
      amount,
      paymentDate,
      mode,
      createdBy,
      createdById,
      openingBalance,
      closingBalance,
      remark
    });

    // Save to the database
    const savedHistory = await newHistory.save();
    return savedHistory;
  } catch (error) {
    console.error("Error creating reseller wallet history:", error);
    throw error;
  }
};

module.exports = createResellerWalletHistory;