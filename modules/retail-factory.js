const Ebay = require('../classes/ecommerce-classes/ebay');
const Amazon = require('../classes/ecommerce-classes/amazon');
const AliExpress = require('../classes/ecommerce-classes/ali-express');

function retailFactory(retail) {
    switch (retail){
        case 'ebay':
            return new Ebay();

        case 'amazon':
            return new Amazon();

        case 'ali_express':
            return new AliExpress();
    }
}

module.exports = retailFactory;
