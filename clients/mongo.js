const config = require('config');
const mongoose = require('mongoose');

mongoose.connect(config.get('mongo.host'), {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {console.log("Connected to MongoDB...")})
    .catch((err) => console.error('Could not connect to MongoDB', err)
    );

const UserModel = mongoose.model('User',
    new mongoose.Schema({
        _id: Number,
        usersScore: {
            type: Map,
            of: Number,
        },
        totalNumOfActions: {
            type: Number,
            default: 0
        },
        actions: {
            type: Map,
            of: {
                actionType:{
                    type: String,
                    enum : ['follow','reaction'],
                },
                score: {
                    type: Number,
                    default: 0,
                },
                details: Object,
                users: Map,
                dirty: Boolean,
                createdAt: Date,
                updatedAt: Date
            }
        },

    }, {timestamps: true}));

module.exports = UserModel;
