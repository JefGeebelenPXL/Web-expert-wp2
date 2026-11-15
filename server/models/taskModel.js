const mongoose = require('mongoose');
const crypto = require('crypto');

const taskSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => crypto.randomUUID()
        },
        todo: {
            type: String,
            trim: true,
            validate: {
                validator: function (value) {
                    return /^[A-Za-z0-9 ]+$/.test(value);
                },
                message: (props) => `${props.value} is not a valid todo`
            },
            required: [true, 'Todo is required']
        },
        completed: {
            type: Boolean,
            default: false
        },
        userId: {
            type: String,
            ref: 'User'
        }
    },
    {
        collection: 'tasks'
    }
);
module.exports = mongoose.model('Task', taskSchema);


