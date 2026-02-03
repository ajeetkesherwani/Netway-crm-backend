// config/roles.js
module.exports = {
  super_admin: {
    users: ["View", "Add", "Edit", "Delete", "Create"],
    packages: ["View", "Add", "Edit", "Delete"],
    payments: ["View", "Refund"],
    settings: ["View", "Edit"]
  },
  admin: {
    users: ["View", "Add", "Edit"],
    packages: ["View", "Add", "Edit"],
    payments: ["View"],
    settings: ["View"]
  },
  support: {
    users: ["View"],
    packages: ["View"],
    payments: ["View"],
    tickets: ["View", "Respond"]
  },
  billing: {
    payments: ["View", "Refund", "Export"]
  }
};
