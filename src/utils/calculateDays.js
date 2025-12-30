const { MS_PER_DAY } = require("../config/applicationConfig");

export const calculateDays = (start, end) =>
  Math.ceil((end - start) / MS_PER_DAY);
