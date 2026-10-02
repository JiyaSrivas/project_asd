const productDatabase = require("../database/productDatabase");

async function getAllProducts() {
    return await productDatabase.readProducts();
}

async function getProductById(id) {
    const products = await productDatabase.readProducts();

    return products.find((item) => {
        return item.id == id;
    });
}

async function createProduct(productData) {
    const products = await productDatabase.readProducts();

    const newProduct = {
        id: products.length
            ? Math.max(...products.map((item) => item.id)) + 1
            : 1,
        name: productData.name,
        price: productData.price
    };

    products.push(newProduct);

    await productDatabase.writeProducts(products);

    return newProduct;
}

async function updateProduct(id, productData) {
    const products = await productDatabase.readProducts();

    const index = products.findIndex((item) => {
        return item.id == id;
    });

    if (index === -1) {
        return null;
    }

    const updatedProduct = {
        id: id,
        name: productData.name,
        price: productData.price
    };

    products[index] = updatedProduct;

    await productDatabase.writeProducts(products);

    return updatedProduct;
}

async function patchProduct(id, productData) {
    const products = await productDatabase.readProducts();

    const index = products.findIndex((item) => {
        return item.id == id;
    });

    if (index === -1) {
        return null;
    }

    products[index] = {
        ...products[index],
        ...productData,
        id: id
    };

    await productDatabase.writeProducts(products);

    return products[index];
}

async function deleteProduct(id) {
    const products = await productDatabase.readProducts();

    const index = products.findIndex((item) => {
        return item.id == id;
    });

    if (index === -1) {
        return null;
    }

    const deletedProduct = products[index];

    products.splice(index, 1);

    await productDatabase.writeProducts(products);

    return deletedProduct;
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    patchProduct,
    deleteProduct
};