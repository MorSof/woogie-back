/**
 * @jest-environment node
 */

const Amazon = require("../../classes/ecommerce-classes/amazon");

describe('amazon', () => {

    describe('Authentication', () => {
        it('The access token should be defined (not undefined)', async () => {
            const amazon = new Amazon();
            const access_token = await amazon.authenticate();
            expect(access_token).toBeDefined();
        });
    });

    describe('Get Product', () => {
        it('should return products from amazon', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            const amazon = new Amazon();
            await amazon.authenticate();
            const products = await amazon.getProductsByKeyword('iphone','conditions:{ USED },freeShipping: true,price:[ .. 50],priceCurrency:USD','-price',10,0);
            expect(products).toBeDefined();
        });
    });

    it('should convert the woogie params to amazon param', () => {
        const amazon = new Amazon();
        amazon.convertToQueryParams('iphone','conditions:{ USED },freeShipping: true,price:[ 10 .. 50],priceCurrency:USD','-price',10,0);
    });
});
