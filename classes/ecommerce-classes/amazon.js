const EcommerceCompany = require("./ecommerce-company");
const Product = require('../product');
const generateAmazonMockup = require('../../admin/admin-amazon/amazon-product.js')
const redisModule = require("../../modules/redis-module");
const productsConstants = require('../../constants/products-constants.json');
const uuid = require('uuid');
const genericMockupsConst = require('../../admin/generic-mockups/mockups-const.json')


class Amazon extends EcommerceCompany {

    amazonSort = '';
    amazonCondition = '';
    amazonDeliveryFlags = '';
    amazonMinPrice = null;
    amazonMaxPrice = null;
    amazonItemCount = null;
    amazonItemPage = null;

    async authenticate() {

        let cache = await redisModule.getValueByKey('ebay_access_token');
        if (cache != null) {
            return cache;
        }
        // Create the params for the post api call
        //Wait 3 seconds
        await this.wait(3000);

        let amazon_access_token = 'mockup amazon token';
        redisModule.setKeyValue('amazon_access_token', 3600, amazon_access_token);
        return amazon_access_token;

    }

    async getProductsByKeyword(q, filter, sort, page) {

        // let access_token = await this.authenticate()

        // Create the params for the post api call
        const params = this.convertToQueryParams(q, filter, sort, page);

        // Wait 3 seconds...
        return new Promise(resolve => {
            let products = this.convertToProducts(this.createMockups(q, params), sort);

           resolve(sort[0] === '-'
                ? products.sort((a,b) => (a.priceValue < b.priceValue) ? 1 : ((b.priceValue < a.priceValue) ? -1 : 0))
                : products.sort((a,b) => (a.priceValue > b.priceValue) ? 1 : ((b.priceValue > a.priceValue) ? -1 : 0)));
        });

    }

    createMockups(q, params) {

        let amazonProductsMockup = generateAmazonMockup();

        //Create Mocks
        for (let i = 0; i < genericMockupsConst.maxNumOfMockups; i++) {
            amazonProductsMockup.SearchResult.Items.push(JSON.parse(JSON.stringify(amazonProductsMockup.SearchResult.Items[0])));
            amazonProductsMockup.SearchResult.Items[i].Offers.Listings[0].Id = uuid.v1().toString();
            amazonProductsMockup.SearchResult.Items[i].ItemInfo.Title.DisplayValue = q + " " + genericMockupsConst.genericProductName[i % genericMockupsConst.genericProductName.length];

            let minPrice = params.get('MinPrice') == 'null' ? 0.2 : parseInt(params.get('MinPrice'));
            let maxPrice = params.get('MaxPrice') == 'null' ? minPrice + 5 : parseInt(params.get('MaxPrice'));
            let randomPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;

            amazonProductsMockup.SearchResult.Items[i].Offers.Listings[0].Price.Amount = randomPrice;
            amazonProductsMockup.SearchResult.Items[i].Images.Primary.Medium.URL = genericMockupsConst.genericImages[i % genericMockupsConst.genericImages.length];
            amazonProductsMockup.SearchResult.Items[i].Images.Primary.Small.URL = genericMockupsConst.genericImages[i % genericMockupsConst.genericImages.length];
            amazonProductsMockup.SearchResult.Items[i].DeliveryInfo.IsFreeShippingEligible = params.get('DeliveryFlags');
        }
        return amazonProductsMockup;

    }

    convertToQueryParams(q, filter, sort, page) {

        //Convert woogie page to Amazon page
        const countPage = this.convertFromWoogiePage(page);

        //Convert Sort
        this.amazonSort = this.convertSort(sort);

        //Convert Filter
        if (filter != null) {
            const words = filter.split(/[:,]/);

            for (let i = 0; i < words.length; i += 2) {
                this.convertToFilter(words[i].trim().replace(/ /g, ''), words[i + 1].trim().replace(/ /g, ''));
            }
        }

        this.amazonItemCount = countPage.itemCount;
        this.amazonItemPage = countPage.itemPage;

        const params = new URLSearchParams({
            SortBy: this.amazonSort,
            Condition: this.amazonCondition,
            DeliveryFlags: this.amazonDeliveryFlags,
            MaxPrice: this.amazonMaxPrice,
            MinPrice: this.amazonMinPrice,
            ItemCount: this.amazonItemCount,
            ItemPage: this.amazonItemPage,
        });


        return params;
    }

    convertFromWoogiePage(page) {
        return {itemCount: productsConstants.WOOGIE_LIMIT, itemPage: page + 1}
    }

    convertSort(sort) {

        if (sort != null) {
            switch (sort) {
                case 'price':
                    return 'LowToHigh';
                case '-price':
                    return "HighToLow";
                case 'newlyListed':
                    return 'NewestArrivals';
            }
        }
    }

    convertToFilter(firstWord, secondWord) {

        if (firstWord === 'conditions') {
            this.amazonCondition = secondWord.substring(1, secondWord.length - 1);
        }

        if (firstWord === 'freeShipping' && secondWord === 'true') {
            this.amazonDeliveryFlags = '["FreeShipping"]';
        }

        if (firstWord === 'price') {

            this.convertToPrice(secondWord)
        }
    }

    convertToPrice(secondWord) {
        //Check if there is value in the beginning of the square parentheses - Means there is a low boundary
        let priceFilter = secondWord.substring(1, secondWord.length - 1);
        let words = priceFilter.split("..");

        if (words[0] != '') {
            this.amazonMinPrice = words[0];
        }
        if (words[1] != '') {
            this.amazonMaxPrice = words[1];
        }
    }

    convertToProducts(retail_products, sort) {

        let allProducts = [];

        if (retail_products == null || retail_products.SearchResult == null || retail_products.SearchResult.Items == null) {
            return allProducts;
        }

        // Iterate through all the items from amazon
        for (let i = 0; i < retail_products.SearchResult.Items.length; i++) {

            if (retail_products.SearchResult.Items[i] == null) {
                continue;
            }
            // Extract all valuable values from the amazon json
            let retailId;
            let priceValue;
            let priceCurrency;
            let condition;
            let adultOnly;
            let additionalImages = [];
            let image;
            let thumbnailImage;
            let productName;
            let shippingCost;

            const itemHref = retail_products.SearchResult.Items[i].DetailPageURL;

            if (retail_products.SearchResult.Items[i].Offers != null && retail_products.SearchResult.Items[i].Offers.Listings[0]) {
                retailId = retail_products.SearchResult.Items[i].Offers.Listings[0].Id;
                priceValue = retail_products.SearchResult.Items[i].Offers.Listings[0].Price != null ? retail_products.SearchResult.Items[i].Offers.Listings[0].Price.Amount : null;
                priceCurrency = retail_products.SearchResult.Items[i].Offers.Listings[0].Price != null ? retail_products.SearchResult.Items[i].Offers.Listings[0].Price.Currency : null;
                condition = retail_products.SearchResult.Items[i].Offers.Listings[0].Condition != null ? retail_products.SearchResult.Items[i].Offers.Listings[0].Condition.Value : null;
            }

            if (retail_products.SearchResult.Items[i].Images != null) {
                if (retail_products.SearchResult.Items[i].Images.Primary != null) {
                    image = retail_products.SearchResult.Items[i].Images.Primary.Medium.URL;
                    thumbnailImage = retail_products.SearchResult.Items[i].Images.Primary.Small.URL;
                }
                if (retail_products.SearchResult.Items[i].Images.Variants[0] != null) {
                    retail_products.SearchResult.Items[i].Images.Variants[0].Medium != null ? additionalImages.push(retail_products.SearchResult.Items[i].Images.Variants[0].Medium.URL) : additionalImages.push(null);
                }
            }
            if (retail_products.SearchResult.Items[i].ItemInfo != null && retail_products.SearchResult.Items[i].ItemInfo.Title != null) {
                productName = retail_products.SearchResult.Items[i].ItemInfo.Title.DisplayValue;
            }
            if (retail_products.SearchResult.Items[i].DeliveryInfo != null) {
                shippingCost = retail_products.SearchResult.Items[i].DeliveryInfo.IsFreeShippingEligible ? 0 : null;
            }
            if (retail_products.SearchResult.Items[i].ItemInfo.ProductInfo != null && retail_products.SearchResult.Items[i].ItemInfo.ProductInfo.IsAdultProduct != null) {
                adultOnly = retail_products.SearchResult.Items[i].ItemInfo.ProductInfo.IsAdultProduct.DisplayValue;
            }

            const shippingCurrency = null;
            const shippingCostType = null;
            const minEstimatedDeliveryDate = null;
            const maxEstimatedDeliveryDate = null;
            const guaranteedDelivery = null;
            const distanceUnit = null;
            const distanceValue = null;
            const apiItem = null;

            // Add new product to the all products list
            allProducts.push(new Product(retailId, "amazon", productName, image, thumbnailImage, priceValue, priceCurrency, itemHref,
                shippingCost, shippingCurrency, shippingCostType, minEstimatedDeliveryDate, maxEstimatedDeliveryDate, guaranteedDelivery,
                distanceUnit, distanceValue, apiItem, condition, additionalImages, adultOnly));

            this.insureSortCorrection(allProducts, i, ['totalPrice'], sort);

        }

        return allProducts;
    }

    //Helper function for making a set timeout async for the mockups
    async wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

}

module.exports = Amazon;
