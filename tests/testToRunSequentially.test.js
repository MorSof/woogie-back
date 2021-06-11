const testSuiteUsers = require('./intergration/users.test')
const testSuiteReactions = require('./intergration/reactions.test')
const testSuiteNotifications = require('./intergration/notifications.test')

describe('sequentially run tests', () => {
    testSuiteUsers();
    testSuiteReactions();
    testSuiteNotifications();
})
