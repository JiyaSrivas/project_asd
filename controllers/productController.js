const productService = require("../services/productService");
const { clearCache } = require("../middleware/cacheMiddleware");

async function getAllProducts(req, res) {
    try {
        const products = await productService.getAllProducts();

        res.json(products);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

async function getProductById(req, res) {
    try {
        let { id } = req.params;
        id = Number(id);

        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        res.json(product);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

async function createProduct(req, res) {
    try {
        const productData = req.body;

        const newProduct = await productService.createProduct(productData);

        clearCache();

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

async function updateProduct(req, res) {
    try {
        let { id } = req.params;
        id = Number(id);

        const updatedProduct = await productService.updateProduct(
            id,
            req.body
        );

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        }

        clearCache();

        res.json(updatedProduct);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

async function patchProduct(req, res) {
    try {
        let { id } = req.params;
        id = Number(id);

        const updatedProduct = await productService.patchProduct(
            id,
            req.body
        );

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        }

        clearCache();

        res.json(updatedProduct);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

async function deleteProduct(req, res) {
    try {
        let { id } = req.params;
        id = Number(id);

        const deletedProduct = await productService.deleteProduct(id);

        if (!deletedProduct) {
            return res.status(404).send("Product not found");
        }

        clearCache();

        res.json(deletedProduct);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    patchProduct,
    deleteProduct
};