const EcommerceCompany = require("./ecommerce-company");
const Product = require('../product');
const redisModule = require("../../modules/redis-module");
const uuid = require('uuid');
const genericMockupsConst = require('../../admin/generic-mockups/mockups-const.json')

class AliExpress extends EcommerceCompany {

    aliExpressMinPrice = null;
    aliExpressMaxPrice = null;

    async authenticate() {

        let cache = await redisModule.getValueByKey('ali_express_access_token');
        if (cache != null) {
            return cache;
        }
        // Create the params for the post api call
        //Wait 3 seconds
        await this.wait(3000);

        let ali_express_access_token = 'mockup Ali Express token';
        redisModule.setKeyValue('ali_express_access_token', 3600, ali_express_access_token);
        return ali_express_access_token;

    }

    async getProductsByKeyword(q, filter, sort, page) {

        // let access_token = await this.authenticate()

        console.log('Fetching products from Ali-Express mockups...')
        return new Promise(resolve => {resolve(this.createMockups(q, sort, filter))});
    }

    createMockups(q, sort, filter) {

        let products = [];
        this.checkPriceFilter(filter);

        //Create Mocks
        for (let i = 0; i < genericMockupsConst.maxNumOfMockups; i++) {

            let minPrice = this.aliExpressMinPrice == null ? 0.2 : this.aliExpressMinPrice;
            let maxPrice = this.aliExpressMaxPrice == null ? minPrice + 5 : this.aliExpressMaxPrice;
            let randomPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;

            products.push(new Product(uuid.v1().toString(), 'ali_express', q + ' ' + genericMockupsConst.genericProductName[i % genericMockupsConst.genericProductName.length],
                genericMockupsConst.genericImages[i % genericMockupsConst.genericImages.length], genericMockupsConst.genericImages[i % genericMockupsConst.genericImages.length],
                randomPrice, 'USD', genericMockupsConst.genericItemHrefAliExpress, 0, 'USD', null, null, null, null, null, null, null, null, null, false))
           }

        return sort[0] === '-'
            ? products.sort((a,b) => (a.priceValue < b.priceValue) ? 1 : ((b.priceValue < a.priceValue) ? -1 : 0))
            : products.sort((a,b) => (a.priceValue > b.priceValue) ? 1 : ((b.priceValue > a.priceValue) ? -1 : 0));
    }

    checkPriceFilter(filter) {
        if (filter != null) {
            let words = filter.split('price:');
            if (words[1] == null) {
                return;
            }
            words = words[1].split(',');
            words = words[0].split('..');

            if (words[0] != '') {
                this.aliExpressMinPrice = parseInt(words[0].slice(1));
            }
            if (words[1] != '') {
                this.aliExpressMaxPrice = parseInt(words[1].slice(0, -1));
            }
        }
    }
}

module.exports = AliExpress;
