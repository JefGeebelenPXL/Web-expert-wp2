const mongoose = require("mongoose");
const {ValidationError, AuthorisationError, NotFoundError} = require("../errors/error");

const Task = require("../models/taskModel.js");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidId = (id) => UUID_REGEX.test(id);

async function findByUserId(requestingUserId) {
    if (!isValidId(requestingUserId)) {
        throw new ValidationError('Id is not valid');
    }
    return Task.find({userId: requestingUserId});
}

async function updateTask(taskId, requestingUserId, {completed, todo, userId}) {
    if (!isValidId(taskId)) {
        throw new ValidationError('Id is not valid');
    }
    if (!isValidId(requestingUserId)) {
        throw new ValidationError('Id is not valid');
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }
    if (requestingUserId.toString() !== task.userId.toString()) {
        throw new AuthorisationError('User is not the owner of the task');
    }

    if (completed !== undefined) task.completed = completed;
    if (todo !== undefined) task.todo = todo;
    if (userId !== undefined) {
        throw new AuthorisationError("Reassigning userId of a task is not allowed");
    }

    const validationError = task.validateSync();
    if (validationError) {
        throw new ValidationError(`Validation failed: ${validationError.message}`);
    }
    return task.save({validateBeforeSave: false});
}

module.exports = {findByUserId, updateTask};
