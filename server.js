const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = 3000;

const filePath = path.join(__dirname, "db.json");

app.use(express.json());


// ================= CACHE =================

let cache = {};

const TTL = 60 * 1000; // 1 minute


// ================= DATABASE =================

async function readData() {

    let products = await fs.readFile(filePath, "utf-8");

    return JSON.parse(products);
}


async function writeData(data) {

    await fs.writeFile(
        filePath,
        JSON.stringify(data, null, 2)
    );
}


// This is only to show the benefit of caching
async function delayedFile() {

    await new Promise((resolve, reject) => {

        setTimeout(resolve, 1500);

    });

    return await readData();
}


// ================= GET ALL PRODUCTS =================

app.get('/products', async (req, res) => {

    let key = req.url;

    let cached = cache[key];


    try {

        // Check cache
        if (cached) {

            let age = Date.now() - cached.createdAt;


            // Cache is still valid
            if (age < TTL) {

                res.set("X-Cache", "HIT");

                return res.json(cached.data);
            }


            // Cache expired
            delete cache[key];
        }


        // Cache MISS
        res.set("X-Cache", "MISS");


        // Get fresh data
        let data = await delayedFile();


        // Store in cache
        cache[key] = {
            data: data,
            createdAt: Date.now()
        };


        res.json(data);


    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error reading products"
        });

    }

});


// ================= GET PRODUCT BY ID =================

app.get('/products/:id', async (req, res) => {

    let key = req.url;

    let cached = cache[key];


    try {

        // Check cache
        if (cached) {

            let age = Date.now() - cached.createdAt;


            // Cache still valid
            if (age < TTL) {

                res.set("X-Cache", "HIT");

                return res.json(cached.data);
            }


            // Cache expired
            delete cache[key];
        }


        // Cache MISS
        res.set("X-Cache", "MISS");


        // Get fresh data
        let data = await delayedFile();


        let id = Number(req.params.id);


        let product = data.find(item => item.id == id);


        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        // Store product in cache
        cache[key] = {
            data: product,
            createdAt: Date.now()
        };


        res.json(product);


    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error reading product"
        });

    }

});


// ================= POST =================

app.post('/products', async (req, res) => {

    try {

        let data = await readData();


        let newId = 1;

        if (data.length > 0) {

            newId =
                Math.max(...data.map(item => item.id)) + 1;

        }


        let newProduct = {

            id: newId,

            name: req.body.name,

            price: req.body.price

        };


        data.push(newProduct);


        await writeData(data);


        // Data changed → clear cache
        cache = {};


        res.status(201).json(newProduct);


    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error creating product"
        });

    }

});



app.put('/products/:id', async (req, res) => {

    try {

        let data = await readData();

        let id = Number(req.params.id);


        let index =
            data.findIndex(item => item.id == id);


        if (index === -1) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        data[index] = {

            id: id,

            name: req.body.name,

            price: req.body.price

        };


        await writeData(data);


        // Data changed → clear cache
        cache = {};


        res.json(data[index]);


    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error updating product"
        });

    }

});


app.patch('/products/:id', async (req, res) => {

    try {

        let data = await readData();

        let id = Number(req.params.id);


        let index =
            data.findIndex(item => item.id == id);


        if (index === -1) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        // Change only the fields provided
        data[index] = {

            ...data[index],

            ...req.body

        };


        await writeData(data);


        // Data changed → clear cache
        cache = {};


        res.json(data[index]);


    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error patching product"
        });

    }

});


// ================= DELETE =================

app.delete('/products/:id', async (req, res) => {

    try {

        let data = await readData();

        let id = Number(req.params.id);


        let index =
            data.findIndex(item => item.id == id);


        if (index === -1) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        let deletedProduct = data[index];


        data.splice(index, 1);


        await writeData(data);


        // Data changed → clear cache
        cache = {};


        res.json({

            message: "Product deleted successfully",

            product: deletedProduct

        });


    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error deleting product"
        });

    }

});


app.listen(port, () => {

    console.log(
        `Example app listening on port ${port}`
    );

});