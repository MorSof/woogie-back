/**
 * @jest-environment node
 */
const adminModule = require("../../admin/admin-db/admin-db");
const {searchEngineLogic} = require("../../services/products-service");

describe('Search logic', () => {
    beforeEach(async () => {
        await adminModule.createAllTables();
        await adminModule.createUsersMockup(10);
        await adminModule.createReactionsMockup(10);
    });
    afterEach(async () => {
        await adminModule.deleteAllTables();
    });
    describe('searchEngineLogic', () => {
        it('The array should be sorted ', async () => {
            const compareValues = ['totalPrice'];
            jest.setTimeout(10000); //will throw error if test is taken more then 5 seconds
            let sortedProducts = await searchEngineLogic('phone', 'price:[20..100],priceCurrency:USD', 'price',50,0);
            let sorted = true;
            for (let i = 0; i < sortedProducts.length - 1; i++) {
                if (sortedProducts[i].compareByMulKeys(sortedProducts[i+1], compareValues) > 0) {
                    sorted = false;
                    break;
                }
            }
            expect(sorted).toEqual(true);
        });
    });
});
