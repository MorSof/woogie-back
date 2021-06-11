const {mergeKSortedArrays} = require("../../services/products-service");
const {isProductsSortedAsc} = require('../tests-utils/tests-utils');
const {isProductsSortedDesc} = require('../tests-utils/tests-utils');
const {generateProductsWithPriceOnly} = require('../tests-utils/tests-utils');

describe('sort', () => {
    describe('sort', () => {
        it('should be sorted descending', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            let arrays = [];
            const compareValues = ['priceValue'];
            for (let i = 5; i > 0; i--) {
                let arr = [];
                for (let j = 5; j > 0; j--) {
                    arr.push(generateProductsWithPriceOnly(i+j,34));
                }
                arrays.push(arr);
            }
            let sortedArr = mergeKSortedArrays(arrays, arrays.length, compareValues, true);
            expect(isProductsSortedDesc(sortedArr, compareValues)).toEqual(true);
        });

        it('should be sorted ascending', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            let arrays = [];
            const compareValues = ['priceValue'];
            for (let i = 0; i < 5; i++) {
                let arr = [];
                for (let j = 0; j < 5; j++) {
                    arr.push(generateProductsWithPriceOnly(i+j, i+j));
                }
                arrays.push(arr);
            }
            let sortedArr = mergeKSortedArrays(arrays, arrays.length, compareValues, false);
            expect(isProductsSortedAsc(sortedArr, compareValues)).toEqual(true);
        });

        it('should be sorted descending with multiple values', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            let arrays = [];
            const compareValues = ['priceValue', 'shippingCost'];
            for (let i = 5; i > 0; i--) {
                let arr = [];
                for (let j = 5; j > 0; j--) {
                    arr.push(generateProductsWithPriceOnly(90, i+j));
                }
                arrays.push(arr);
            }
            let sortedArr = mergeKSortedArrays(arrays, arrays.length, compareValues, true);
            expect(isProductsSortedDesc(sortedArr, compareValues)).toEqual(true);
        });

        it('should be sorted ascending multiple values', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            let arrays = [];
            const compareValues = ['priceValue', 'shippingCost'];
            for (let i = 0; i < 5; i++) {
                let arr = [];
                for (let j = 0; j < 5; j++) {
                    arr.push(generateProductsWithPriceOnly(90, i+j));
                }
                arrays.push(arr);
            }
            let sortedArr = mergeKSortedArrays(arrays, arrays.length, compareValues, false);
            expect(isProductsSortedAsc(sortedArr, compareValues)).toEqual(true);
        });

        it('should be sorted ascending by totalPrice with 2 arrays: one of them with single value', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            let arrays = [];
            let arr = [];
            const compareValues = ['totalPrice'];
            for (let j = 0; j < 5; j++) {
                arr.push(generateProductsWithPriceOnly(90, j));
            }
            arrays.push([generateProductsWithPriceOnly(90, 93)]);

            let sortedArr = mergeKSortedArrays(arrays, arrays.length, compareValues, false);
            expect(isProductsSortedAsc(sortedArr, compareValues)).toEqual(true);
        });
    });
});
