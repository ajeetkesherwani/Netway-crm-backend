function cleanResponse(item) {
  return {
    id: Number(item.id?._ ?? item.id),
    name: item.name?._ ?? item.name,
    fee: Number(item.fee?._ ?? item.fee),
    iscurrent: item.iscurrent?._ === "true" || item.iscurrent === true
  };
}

module.exports = { cleanResponse };