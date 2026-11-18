const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const adminController = require("../controllers/adminController");
const {authenticate, authorize} = require("../middleware/authentication");

router.get("/tasks",
    cookieParser(),
    authenticate,
    authorize('admin'),
    adminController.getAllTasks
);

router.get("/users",
    cookieParser(),
    authenticate,
    authorize('admin'),
    adminController.getAllUsers
);

module.exports = router;