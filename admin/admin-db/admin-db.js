const createTablesJson = require('./admin-db.json')
const pool = require('../../clients/postgres');
const mongoUserModel = require('../../clients/mongo');
const userService = require('../../services/user-service');
const reactionsService = require('../../services/reactions-service');
const feedService = require('../../services/feed-service');
const productService = require('../../services/products-service');


deleteDocuments = async () => {
    await mongoUserModel.deleteMany({}, ()=>{});
}

deleteAllTables = async () => {
    try{
        await pool.query("DROP TABLE IF EXISTS users, connections, notifications, products, orders, reactions");
        await pool.query("DROP TYPE IF EXISTS connection_status_enum, retail_name_enum, reaction_type_enum, notification_type_enum");
        await mongoUserModel.deleteMany({}, ()=>{});
        return "Tables deleted successfully";
    }catch(err){
        console.error(err);
        return err;
    }
}

createAllTables = async () => {
    await pool.query("DROP TABLE IF EXISTS users, connections, notifications, products, orders, reactions");
    await pool.query("DROP TYPE IF EXISTS connection_status_enum, retail_name_enum, reaction_type_enum, notification_type_enum");
    await mongoUserModel.deleteMany({}, ()=>{});
    for (let key in createTablesJson) {
        try {
            await pool.query(createTablesJson[key]);
        } catch (err) {
            console.error(err.message);
            return err.message;
        }
    }
    console.log("Tables created successfully");
    return "Tables created successfully";
}

mockupAllTables = async () => {
    console.log(await createUsersMockup(11));
    console.log(await createConnectionsMockup(11));
    console.log(await createReactionsMockup(10));
}

createUsersMockup = async (numOfUsers) => {
    try {
        let newUser;

        newUser = await userService.createUser('Mor', 'Soferian', 'morsof48@gmail.com', '05481286785', 'https://thumbor.forbes.com/thumbor/fit-in/416x416/filters%3Aformat%28jpg%29/https%3A%2F%2Fspecials-images.forbesimg.com%2Fimageserve%2F558c0172e4b0425fd034f8ba%2F0x0.jpg%3Ffit%3Dscale%26background%3D000000');
        await feedService.createUser(newUser.id);

        newUser = await userService.createUser('Sarel', 'Micha', 'sarel93@gmail.com', '05481286785', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg/330px-Brad_Pitt_2019_by_Glenn_Francis.jpg');
        await feedService.createUser(newUser.id);

        for (let i = 1; i < numOfUsers + 1; i++) {
            newUser = await userService.createUser('first_name' + i, 'last_name' + i, 'email' + i, 'phone_number' + i, 'https://www.rd.com/wp-content/uploads/2019/01/shutterstock_673465372.jpg');
            await feedService.createUser(newUser.id);
        }
    }catch (err) {
        console.error(err.message);
        return err.message;
    }
    return "Users mockups created successfully";
}

createConnectionsMockup = async (numOfConnections) => {
    try {
        for (let i = 2; i < numOfConnections; i++) {
            await userService.followUser(i, i+1);
            await userService.confirmUser(i+1, i);
            await feedService.confirmUser(i, i+1);
            await userService.followUser(i+1, i);
        }

        //Make everybody to follow user 1 and everybody will follow him too
        for (let i = 2; i < numOfConnections; i++) {
            await userService.followUser(i, 1);
            await userService.confirmUser(1, i);
            await userService.followUser(1, i);
            await userService.confirmUser(i,1);
        }
    }catch (err) {
        console.error(err.message);
        return err.message;
    }
    return "Connections mockups created successfully";
}


createReactionsMockup = async (numOfReactions) => {

    const retailNames = ['ebay','amazon'];
    const reactions = ['loved', 'hated', 'interested', 'bought'];
    const productsNames = ['jeans', 't-shirt', 'nike shoes PU Leather Card Pocket Kickstand Strap Case TPU Cover Bumper 2', 'sexy bikini PU Leather Card Pocket Kickstand Strap Case TPU Cover Bumper 2', 'hair brush', 'men boxers'];
    const productsImages = ['http://cdn.shopify.com/s/files/1/1104/4168/products/Allbirds_WL_RN_SF_PDP_Natural_Grey_BTY_10b4c383-7fc6-4b58-8b3f-6d05cef0369c_600x600.png?v=1610061677', 'http://cdn.shopify.com/s/files/1/1104/4168/products/Allbirds_WL_RN_SF_PDP_Natural_Grey_BTY_10b4c383-7fc6-4b58-8b3f-6d05cef0369c_600x600.png?v=1610061677' , 'http://cdn.shopify.com/s/files/1/1104/4168/products/Allbirds_WL_RN_SF_PDP_Natural_Grey_BTY_10b4c383-7fc6-4b58-8b3f-6d05cef0369c_600x600.png?v=1610061677', 'http://cdn.shopify.com/s/files/1/1104/4168/products/Allbirds_WL_RN_SF_PDP_Natural_Grey_BTY_10b4c383-7fc6-4b58-8b3f-6d05cef0369c_600x600.png?v=1610061677', 'http://cdn.shopify.com/s/files/1/1104/4168/products/Allbirds_WL_RN_SF_PDP_Natural_Grey_BTY_10b4c383-7fc6-4b58-8b3f-6d05cef0369c_600x600.png?v=1610061677', 'http://cdn.shopify.com/s/files/1/1104/4168/products/Allbirds_WL_RN_SF_PDP_Natural_Grey_BTY_10b4c383-7fc6-4b58-8b3f-6d05cef0369c_600x600.png?v=1610061677'];
    const productsPriceValue = ['10', '20', '50', '2', '100', '3'];
    const productsPriceCurrencies = ['USD', 'USD', 'USD', 'USD', 'USD', 'USD'];
    const productShippingCost = ['0', '0' , '20', '20', '40', '0'];
    const itemHref = 'https://www.ebay.com/itm/USA-Distressed-Flag-Men-T-Shirt-Patriotic-American-Tee/224158213732?hash=item3430dee664:g:EqAAAOSw1ZZfYQ9V'

    try {
        for (let i = 1; i < numOfReactions + 1; i++) {
            await productService.createProduct(i, retailNames[i % 2], productsNames[i % 6], productsImages[i % 6] , productsImages[i % 6], productsPriceValue[i % 6], productsPriceCurrencies[i % 6], productShippingCost[i % 6], productsPriceCurrencies[i % 6], itemHref)
            await reactionsService.createReaction(i, retailNames[i % 2], i, reactions[i % 4], productsNames[i % 6], productsImages[i % 6] ,
                productsImages[i % 6], productsPriceValue[i % 6], productsPriceCurrencies[i % 6], productShippingCost[i % 6], productsPriceCurrencies[i % 6], itemHref)
            await feedService.addUserToReactionActions(i, `reaction_${retailNames[i % 2]}_${i}`, "reaction", i, retailNames[i % 2])
        }
    }catch (err) {
        console.error(err.message);
        return err.message;
    }
    return "Products and Reactions mockups created successfully";
}

module.exports = {deleteDocuments, createAllTables, deleteAllTables, mockupAllTables, createUsersMockup, createConnectionsMockup, createReactionsMockup};
