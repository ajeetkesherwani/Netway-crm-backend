process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./src/app");


dotenv.config({ path: "config.env" });
console.log("process.env.DB_URL", process.env.DB_URL);
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connection created successfully."))
  .catch((err) => console.log(err));

const Port = process.env.PORT || 7001;
const server = app.listen(Port, () =>
  console.log(`Server running on port: ${Port}`)
);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);
  server.close(() => {
    process.exit(1);
  });
});
