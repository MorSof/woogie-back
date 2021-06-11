class EcommerceCompany {

    constructor() {
        if (this.constructor === EcommerceCompany) {
            throw new TypeError('Abstract class "EcommerceCompany" cannot be instantiated directly.');
        }
    }
    async authenticate() {
        throw new Error("Method 'authenticate' must be implemented.");
    }

    async getProductsByKeyword(q, filter, sort, page){
        throw new Error("Method 'getProductsByKeyword' must be implemented.");
    }

    convertToProducts(retail_products, sort) {
        throw new Error("Method 'convertToProducts' must be implemented.");
    }

    convertToQueryParams(q, filter, sort, limit, offset){
        throw new Error("Method 'convertToQueryParams' must be implemented.");
    }

    convertFromWoogiePage(page){
        throw new Error("Method 'convertFromWoogiePage' must be implemented.");
    }

    insureSortCorrection(products, i, compareValue, sort){
        if(i == 0) return;
        if(sort!=null && sort[0] == '-'){
            if(products[i-1].compareByMulKeys(products[i], compareValue) == -1) {
                [products[i-1], products[i]] = [products[i], products[i-1]];
                this.insureSortCorrection(products, i - 1, compareValue, sort);
            }
        }else{
            if(products[i-1].compareByMulKeys(products[i], compareValue) == 1){
                [products[i-1], products[i]] = [products[i], products[i-1]];
                this.insureSortCorrection(products, i - 1, compareValue, sort);
            }
        }
    }

}

module.exports = EcommerceCompany;
