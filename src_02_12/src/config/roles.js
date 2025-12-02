// config/roles.js
module.exports = {
  super_admin: {
    users: ["view", "add", "edit", "delete"],
    packages: ["view", "add", "edit", "delete"],
    payments: ["view", "refund"],
    settings: ["view", "edit"]
  },
  admin: {
    users: ["view", "add", "edit"],
    packages: ["view", "add", "edit"],
    payments: ["view"],
    settings: ["view"]
  },
  support: {
    users: ["view"],
    packages: ["view"],
    payments: ["view"],
    tickets: ["view", "respond"]
  },
  billing: {
    payments: ["view", "refund", "export"]
  }
};
