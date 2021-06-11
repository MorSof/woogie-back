const axios = require('axios');
const FormData = require('form-data');
const data = new FormData();
const EcommerceCompany = require("./ecommerce-company");
const redisModule = require("../../modules/redis-module");
const config = require('config');
const Product = require('../product');
const productsConstants = require('../../constants/products-constants.json');

const eBayEndPoint = 'https://api.ebay.com';

class Ebay extends EcommerceCompany{

    async authenticate() {
        let cache = await redisModule.getValueByKey('ebay_access_token');
        if (cache != null) {
            return cache;
        }
        let response = await axios.post(
            `${eBayEndPoint}/identity/v1/oauth2/token?grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope`,
            {data: data,},
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': config.get('retails.ebay.authorization'),
                    ...data.getHeaders()
                },
            });
        redisModule.setKeyValue('ebay_access_token', 3600, response.data.access_token);
        return response.data.access_token;
    }

    async getProductsByKeyword(q, filter, sort, page){
        let access_token = await this.authenticate();
        const limitOffset = this.convertFromWoogiePage(page);

        console.log(filter)

        const params = new URLSearchParams({
            q: q,
            filter: filter,
            sort: sort,
            limit: limitOffset.limit,
            offset: limitOffset.offset,
        });
        let response = await axios.get(`${eBayEndPoint}/buy/browse/v1/item_summary/search`,
            {
                headers:  {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'application/gzip',
                    'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId='+config.get('retails.ebay.affiliateCampaignId')+',contextualLocation=country%3DUS%2Czip%3D19406',
                    'Authorization': 'Bearer ' + access_token,
                    'Cookie': 'ebay=%5Esbf%3D%23%5E; dp1=bu1p/QEBfX0BAX19AQA**6342c8eb^'
                },
                params: params
            });
        return this.convertToProducts(response.data.itemSummaries, sort);
    }

    async getProductsById(id) {
        let access_token = await this.authenticate();
        const req = {
            method: 'get',
            url: `${eBayEndPoint}/buy/browse/v1/item/${id}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'application/gzip',
                'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=' + config.get('retails.ebay.affiliateCampaignId') + ',contextualLocation=country%3DUS%2Czip%3D19406',
                'Authorization': 'Bearer ' + access_token,
                'Cookie': 'ebay=%5Esbf%3D%23%5E; dp1=bu1p/QEBfX0BAX19AQA**634bea3f^'
            }
        };
        const product = await axios(req);
        return product.data;
    }

    convertFromWoogiePage(page){
        return {limit: productsConstants.WOOGIE_LIMIT, offset: page * productsConstants.WOOGIE_OFFSET}
    }

    convertToProducts(retail_products, sort) {

        let allProducts = [];

        if(retail_products == null) return allProducts;

        for(let i = 0 ; i < retail_products.length ; i++) {
            const retailId = retail_products[i].itemId;
            const productName = retail_products[i].title;
            const image = retail_products[i].image != null ? retail_products[i].image.imageUrl: null;
            const thumbnailImage = (retail_products[i].thumbnailImages != null && retail_products[i].thumbnailImages[0] != null) ? retail_products[i].thumbnailImages[0].imageUrl: null;
            let priceValue;
            let priceCurrency;
            if(retail_products[i].price != null) {
                priceValue = parseFloat(retail_products[i].price.value);
                priceCurrency = retail_products[i].price.currency;
            }
            const itemHref = retail_products[i].itemAffiliateWebUrl;
            let shippingCost;
            let shippingCurrency;
            let shippingCostType;
            let minEstimatedDeliveryDate;
            let maxEstimatedDeliveryDate;
            let guaranteedDelivery;
            if(retail_products[i].shippingOptions != null && retail_products[i].shippingOptions[0] != null){
                if(retail_products[i].shippingOptions[0].shippingCost != null) {
                    shippingCost = parseFloat(retail_products[i].shippingOptions[0].shippingCost.value);
                    shippingCurrency = retail_products[i].shippingOptions[0].shippingCost.currency;
                }
                shippingCostType = retail_products[i].shippingOptions[0].shippingCostType;
                minEstimatedDeliveryDate = retail_products[i].shippingOptions[0].minEstimatedDeliveryDate;
                maxEstimatedDeliveryDate = retail_products[i].shippingOptions[0].maxEstimatedDeliveryDate;
                guaranteedDelivery = retail_products[i].shippingOptions[0].guaranteedDelivery;
            }
            let distanceUnit;
            let distanceValue;
            if(retail_products[i].distanceFromPickupLocation != null){
                distanceUnit = retail_products[i].distanceFromPickupLocation.unitOfMeasure;
                distanceValue = retail_products[i].distanceFromPickupLocation.value;
            }
            const apiItem = null;
            const condition = retail_products[i].condition;
            const additionalImages = [];
            retail_products[i].additionalImages != null ?retail_products[i].additionalImages.forEach((imageObj) => {additionalImages.push(imageObj.imageUrl);}) : null
            const adultOnly = retail_products[i].adultOnly;

            allProducts.push(new Product(retailId,"ebay",productName,image,thumbnailImage,priceValue,priceCurrency,itemHref,
                shippingCost,shippingCurrency,shippingCostType,minEstimatedDeliveryDate,maxEstimatedDeliveryDate,guaranteedDelivery,
                distanceUnit,distanceValue,apiItem,condition,additionalImages,adultOnly));

            this.insureSortCorrection(allProducts, i, ['totalPrice'], sort);
        }
        return allProducts;
    }


}

module.exports = Ebay;
