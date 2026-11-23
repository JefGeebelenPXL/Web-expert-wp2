const bcrypt = require('bcryptjs');

const usersIncludingPasswords = [
    {
        _id: "a1b2c3d4-0000-4000-8000-000000000001",
        username: "user1",
        roles: ["user"],
        password: "password1",
        hashedPassword: bcrypt.hashSync("password1", 8)
    },
    {
        _id: "a1b2c3d4-0000-4000-8000-000000000002",
        username: "user2",
        roles: ["user"],
        password: "password2",
        hashedPassword: bcrypt.hashSync("password2", 8)
    }
];

const admin = {
    _id: "a1b2c3d4-0000-4000-8000-0000000000ad",
    username: "admin1",
    roles: ["admin"],
    password: "adminpass1",
    hashedPassword: bcrypt.hashSync("adminpass1", 8)
};

const tasks = [
    {
        _id: "b1b2c3d4-0000-4000-8000-000000000001",
        todo: 'task1',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: "b1b2c3d4-0000-4000-8000-000000000002",
        todo: 'task2',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: "b1b2c3d4-0000-4000-8000-000000000003",
        todo: 'task3',
        completed: false,
    }
];


module.exports = {usersIncludingPasswords, admin, tasks};
