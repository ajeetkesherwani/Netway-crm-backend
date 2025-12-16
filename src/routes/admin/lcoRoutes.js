const express = require("express");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const { createLco } = require("../../controllers/admin/lco/createLco");

const { getLcoList } = require("../../controllers/admin/lco/getLco");

const { getDetails } = require("../../controllers/admin/lco/getLcoDetails");

const { deleteLoc } = require("../../controllers/admin/lco/deleteLoc");

const { updateLco } = require("../../controllers/admin/lco/updateLco");

const {
  addLcoEmployee,
} = require("../../controllers/admin/lco/addLcoEmployee");

const {
  getLcoEmployeesList,
} = require("../../controllers/admin/lco/getLcoEmployeeList");

const {
  getLcoEmployeeDetails,
} = require("../../controllers/admin/lco/getLcoEmployeeDetails");

const {
  deleteLcoEmployee,
} = require("../../controllers/admin/lco/deleteLcoEmployee");

const {
  updateLcoEmployee,
} = require("../../controllers/admin/lco/updateLocEmployeeDetails");

const fileUploader = require("../../middlewares/fileUploader");

const {
  deleteLcoDocument,
} = require("../../controllers/admin/lco/deleteLcoDocument");
const { getLcos } = require("../../controllers/admin/lco/getLcos");

const router = express.Router();

router.get("/", adminAuthenticate, getLcos);
router.post(
  "/create",
  adminAuthenticate,
  fileUploader("retailerDocuments", [
    { name: "aadhaarCard", maxCount: 2 },
    { name: "panCard", maxCount: 2 },
    { name: "license", maxCount: 2 },
    { name: "other", maxCount: 6 },
  ]),
  createLco
);
router.get("/list", adminAuthenticate, getLcoList);
router.get("/list/:id", adminAuthenticate, getDetails);
router.patch(
  "/update/:lcoId",
  adminAuthenticate,
  fileUploader("retailerDocuments", [
    { name: "aadhaarCard", maxCount: 2 },
    { name: "panCard", maxCount: 2 },
    { name: "license", maxCount: 2 },
    { name: "other", maxCount: 6 },
  ]),
  updateLco
);
router.delete("/delete/:id", adminAuthenticate, deleteLoc);
router.patch("/addEmployee/:id", adminAuthenticate, addLcoEmployee);
router.get("/employee/:lcoId", adminAuthenticate, getLcoEmployeesList);
router.get(
  "/employee/:lcoId/:employeeId",
  adminAuthenticate,
  getLcoEmployeeDetails
);
router.delete(
  "/delete/employee/:lcoId/:employeeId",
  adminAuthenticate,
  deleteLcoEmployee
);
router.patch(
  "/update/employee/:lcoId/:employeeId",
  adminAuthenticate,
  updateLcoEmployee
);
router.delete("/document/delete/:lcoId", adminAuthenticate, deleteLcoDocument);

module.exports = router;
