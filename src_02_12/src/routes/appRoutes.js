const express = require("express");

const adminRoutes = require("./admin.routes");
const userRoutes = require("./user.routes");
// const vendorRoutes = require("./vendor.routes");
// const driverRoutes = require("./driver.routes");

exports.appRoutes = (app) => {
  app.use("/public", express.static("public"));
  app.use("/api/admin", adminRoutes);
  app.use("/api/user", userRoutes);
  // app.use("/api/vendor", vendorRoutes);
  // app.use("/api/driver", driverRoutes);
};
