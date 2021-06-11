
class Product {

    constructor(retailId, retailName, productName, image, thumbnail_image, priceValue, priceCurrency, itemHref, shippingCost,
                shippingCurrency, shippingCostType, minEstimatedDeliveryDate,maxEstimatedDeliveryDate,
                guaranteedDelivery, distanceUnit, distanceValue, apiItem, condition, additionalImages, adultOnly) {
        this.retailId = retailId;
        this.retailName = retailName;
        this.productName = productName;
        this.image = image;
        this.thumbnailImage = thumbnail_image
        this.priceValue = priceValue;
        this.priceCurrency= priceCurrency;
        this.itemHref = itemHref;
        this.shippingCost = shippingCost;
        this.shippingCurrency = shippingCurrency;
        this.shippingCostType = shippingCostType;
        this.totalPrice = shippingCost == null ? priceValue : priceValue + shippingCost;
        this.minEstimatedDeliveryDate = minEstimatedDeliveryDate;
        this.maxEstimatedDeliveryDate = maxEstimatedDeliveryDate;
        this.guaranteedDelivery = guaranteedDelivery;
        this.distanceUnit = distanceUnit;
        this.distanceValue = distanceValue;
        this.apiItem = apiItem;
        this.condition = condition;
        this.additionalImages = additionalImages;
        this.adultOnly = adultOnly;
    }


    compareByKey(product, key){
        if(this[key] > product[key])
            return 1;
        else if(this[key] < product[key])
            return -1;
        return 0;
    }

    //keys = Array of product properties. e.g. ['priceValue', 'shippingCost']
    compareByMulKeys(product, keys){
        for(let key of keys){
            if(this.compareByKey(product, key) == 1)
                return 1;
            else if(this.compareByKey(product, key) == -1)
                return -1;
        }
        return 0
    }

}

module.exports = Product;
