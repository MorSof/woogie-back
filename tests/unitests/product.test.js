const {generateProductsWithPriceOnly} = require('../tests-utils/tests-utils');

describe('product', () => {
    describe('compare 2 products by one value', () => {
        it('product1 should be bigger then product2', async () => {
            const product1 = generateProductsWithPriceOnly(35, 34);
            const product2 = generateProductsWithPriceOnly(34, 34);
            const answer = product1.compareByKey(product2,'priceValue');
            expect(answer).toBeDefined();
            expect(answer).toEqual(1);
        });
        it('product1 should be smaller then product2', async () => {
            const product1 = generateProductsWithPriceOnly(34, 34)
            const product2 = generateProductsWithPriceOnly(35, 34)
            const answer = product1.compareByKey(product2,'priceValue');
            expect(answer).toBeDefined();
            expect(answer).toEqual(-1);
        });
        it('product2 should be equal to product2', async () => {
            const product1 = generateProductsWithPriceOnly(40, 34);
            const product2 = generateProductsWithPriceOnly(40, 34);
            const answer = product1.compareByKey(product2,'priceValue');
            expect(answer).toBeDefined();
            expect(answer).toEqual(0);
        });
    });

    describe('compare 2 products by multiple values', () => {
        it('product1 should be bigger then product2 according to first value', async () => {
            const product1 = generateProductsWithPriceOnly(61, 34);
            const product2 = generateProductsWithPriceOnly(60, 34);
            const answer = product1.compareByMulKeys(product2,['priceValue', 'shippingCost']);
            expect(answer).toBeDefined();
            expect(answer).toEqual(1);
        });
        it('product1 should be bigger then product2 according to second value', async () => {
            const product1 = generateProductsWithPriceOnly(70, 35);
            const product2 = generateProductsWithPriceOnly(70, 34);
            const answer = product1.compareByMulKeys(product2,['priceValue', 'shippingCost']);
            expect(answer).toBeDefined();
            expect(answer).toEqual(1);
        });
        it('product1 should be equal to product2', async () => {
            const product1 = generateProductsWithPriceOnly(61, 34);
            const product2 = generateProductsWithPriceOnly(61, 34);
            const answer = product1.compareByMulKeys(product2,['priceValue', 'shippingCost']);
            expect(answer).toBeDefined();
            expect(answer).toEqual(0);
        });
        it('product1 should be smaller then product2 according to first value', async () => {
            const product1 = generateProductsWithPriceOnly(65, 34);
            const product2 = generateProductsWithPriceOnly(66, 34);
            const answer = product1.compareByMulKeys(product2,['priceValue', 'shippingCost']);
            expect(answer).toBeDefined();
            expect(answer).toEqual(-1);
        });
        it('product1 should be smaller then product2 according to second value', async () => {
            const product1 = generateProductsWithPriceOnly(90, 34);
            const product2 = generateProductsWithPriceOnly(90, 37);
            const answer = product1.compareByMulKeys(product2,['priceValue', 'shippingCost']);
            expect(answer).toBeDefined();
            expect(answer).toEqual(-1);
        });
        it('product1 should be smaller then product2 according to totalPrice', async () => {
            const product1 = generateProductsWithPriceOnly(90.1, 34);
            const product2 = generateProductsWithPriceOnly(90.2, 37);
            const answer = product1.compareByMulKeys(product2,['totalPrice']);
            expect(answer).toBeDefined();
            expect(answer).toEqual(-1);
        });
    });
});
