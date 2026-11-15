const adminRouter = require("../routes/admin");
const express = require("express");
const cors = require("cors");
const securityRouter = require("../routes/security");
const taskRouter = require("../routes/task");
const {errorHandler, routeNotFound} = require("../middleware/error");

function loadExpress(CORS_OPTIONS) {
    const app = express();
    app.use(cors(CORS_OPTIONS));
    app.use("/security", securityRouter);
    app.use("/task", taskRouter);
    app.use("/admin", adminRouter);
    app.all("/{*splat}", routeNotFound);
    app.use(errorHandler);
    return app;
}

module.exports = loadExpress;
