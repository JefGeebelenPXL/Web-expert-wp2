const taskService = require("../services/taskService");
const userService = require("../services/userService");

async function getAllTasks (req, res, next) {
    try {
        const tasks = await taskService.findAll();
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
};

async function getAllUsers (req, res, next) {
    try {
        const users = await userService.findAll();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};


module.exports = {getAllTasks, getAllUsers};