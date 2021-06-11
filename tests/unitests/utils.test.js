const getDaysDiff = require('../../utils/dates');
describe('utils', () => {
    describe('dates', () => {
        it('date1 should be bigger then date2', async () => {
            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            expect(getDaysDiff(today, yesterday)).toEqual(1);
        });
        it('date1 should be equal to date2', async () => {
            const today1 = new Date()
            const today2 = new Date()
            expect(getDaysDiff(today1, today2)).toEqual(0);
        });
        it('date2 should be bigger then date1', async () => {
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            expect(getDaysDiff(today, tomorrow)).toEqual(1);
        });
    });
});
