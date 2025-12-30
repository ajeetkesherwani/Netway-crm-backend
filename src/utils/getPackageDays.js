export const getPackageDays = (number, unit) => {
  switch (unit.toLowerCase()) {
    case "day":
      return number;
    case "week":
      return number * 7;
    case "month":
      return number * 30;
    case "year":
      return number * 365;
    default:
      throw new Error("Invalid validity unit");
  }
};
