const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

const { appRoutes } = require("./routes/appRoutes");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");
const scheduleExpirePlansJob = require("./jobs/expirePurchasedPlans");

const app = express();
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data (form data)
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
scheduleExpirePlansJob(); // Start the cron job

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcom to Netway Backend" });
});
router.get("/test", (req, res) => {
  res.status(200).json({ message: "this is test route" });
});

app.use(router);

appRoutes(app);

//not exist route handle here
// app.all("*", (req, res, next) => {
//   return next(
//     new AppError(`The route ${req.originalUrl} not run on this server.`, 404)
//   );
// });

app.use(globalErrorHandler);
module.exports = app;
