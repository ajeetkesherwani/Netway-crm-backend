const AppError = require("./AppError");

const validateRequiredFields = (fieldsArray) => {
  for (const { field, name } of fieldsArray) {
    if (!field || (typeof field === "string" && !field.trim())) {
      return new AppError(`${name} is required.`, 400);
    }
  }
  return null;
};

module.exports = validateRequiredFields;