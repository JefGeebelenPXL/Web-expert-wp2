const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');
const crypto = require('crypto');
const Task = require('../../models/taskModel');
const User = require('../../models/userModel');

const taskService = require('../../services/taskService');
const userService = require('../../services/userService');
const {NotFoundError, ValidationError} = require('../../errors/error');

beforeEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

describe('taskService (admin)', () => {
    describe('findAll', () => {
        it('returns all tasks', async () => {
            const tasks = [new Task({todo: 'task one'}), new Task({todo: 'task two'})];
            mockingoose(Task).toReturn(tasks, 'find');
            const result = await taskService.findAll();
            expect(result).toHaveLength(2);
        });
    });

    describe('assignTask', () => {
        it('throws a ValidationError given an invalid taskId', async () => {
            await expect(taskService.assignTask('abc', crypto.randomUUID()))
                .rejects.toThrow(ValidationError);
        });

        it('throws a ValidationError given an invalid userId', async () => {
            await expect(taskService.assignTask(crypto.randomUUID(), 'abc'))
                .rejects.toThrow(ValidationError);
        });

        it('throws a NotFoundError when the task does not exist', async () => {
            mockingoose(Task).toReturn(null, 'findOne');
            await expect(taskService.assignTask(crypto.randomUUID(), crypto.randomUUID()))
                .rejects.toThrow(NotFoundError);
        });

        it('throws a NotFoundError when the user does not exist', async () => {
            const task = new Task({todo: 'task one'});
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(null, 'findOne');
            await expect(taskService.assignTask(task._id, crypto.randomUUID()))
                .rejects.toThrow(NotFoundError);
        });

        it('assigns the task to the user when everything is correct', async () => {
            const task = new Task({todo: 'task one'});
            const user = new User({username: 'user1', password: 'password1'});
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            jest.spyOn(Task.prototype, 'save').mockImplementation(function () {
                return Promise.resolve(this);
            });
            const result = await taskService.assignTask(task._id, user._id);
            expect(result.userId).toBe(user._id);
        });
    });
});

describe('userService', () => {
    describe('findAll', () => {
        it('returns all users', async () => {
            const users = [
                new User({username: 'user1', password: 'password1'}),
                new User({username: 'admin1', password: 'password2', roles: ['admin']})
            ];
            mockingoose(User).toReturn(users, 'find');
            const result = await userService.findAll();
            expect(result).toHaveLength(2);
        });
    });
});
