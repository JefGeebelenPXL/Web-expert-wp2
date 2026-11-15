const taskService = require("../services/taskService");

module.exports.getAllTasks = async function (req, res, next) {
    try {
        const tasks = await taskService.______();
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
};