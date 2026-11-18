const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const adminController = require("../controllers/adminController");
const bodyParser = require("body-parser");
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

router.patch("/tasks/:taskId/assign",
    cookieParser(),
    bodyParser.json(),
    (req, res, next) => {
        req.body = req.body || {};
        next();
    },
    authenticate,
    authorize('admin'),
    adminController.assignTask
);

module.exports = router;