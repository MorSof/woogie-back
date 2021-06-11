/**
 * @jest-environment node
 */

const Ebay = require("../../classes/ecommerce-classes/ebay");

describe('ebay', () => {

    describe('Authentication', () => {
        it('The access token should be defined (not undefined)', async () => {
            const ebay = new Ebay();
            const access_token = await ebay.authenticate();
            expect(access_token).toBeDefined();
        });
    });

    describe('Search Product By Name', () => {
        it('should return products from ebay', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            const ebay = new Ebay();
            const products = await ebay.getProductsByKeyword('phone', null, null, 5, 3);
            expect(products).toBeDefined();
        });

        it('should be sorted ascending', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            const ebay = new Ebay();
            const products = await ebay.getProductsByKeyword('phone', null, 'price', 50, 0);
            let sorted = true;
            for (let i = 0; i < products.length - 1; i++) {
                if (products[i].totalPrice > products[i+1].totalPrice) {
                    sorted = false;
                    break;
                }
            }
            expect(sorted).toEqual(true);
        });
        it('should be sorted descending', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            const ebay = new Ebay();
            const products = await ebay.getProductsByKeyword('phone', null, '-price', 50, 0);
            let sorted = true;
            for (let i = 0; i < products.length - 1; i++) {
                if (products[i].totalPrice < products[i+1].totalPrice) {
                    sorted = false;
                    break;
                }
            }
            expect(sorted).toEqual(true);
        });

        it('should be sorted descending with filters', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            const ebay = new Ebay();
            const products = await ebay.getProductsByKeyword('phone', 'price:[10..15],priceCurrency:USD', '-price', 50, 0);
            let sorted = true;
            for (let i = 0; i < products.length - 1; i++) {
                if (products[i].totalPrice < products[i+1].totalPrice) {
                    sorted = false;
                    break;
                }
            }
            expect(sorted).toEqual(true);
        });
    });

    describe('Get Product By ID', () => {
        it('should return product from ebay', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            const ebay = new Ebay();
            const product = await ebay.getProductsById('v1|224187626176|522962927362');
            expect(product).toBeDefined();
        });
    });
});
