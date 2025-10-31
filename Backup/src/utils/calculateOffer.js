exports.calculateOffer = (mrp, price) => {
  const m = Number(mrp),
    p = Number(price);
  return m && p && p < m ? Math.round(((m - p) * 100) / m).toString() : "0";
};
