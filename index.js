const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

// midle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c5dej4c.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {

    try {
        const usersCollection = client.db('tv-shopdb').collection('users')
        const productsCollection = client.db('tv-shopdb').collection('products')

        /***
         *
         * app.post('users')
         *  app.get('/users/Buyer/:email')
         * app.get('/users/Seller/:email')
         */

        //Users save to the mongodb
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })


        // load buyer with email
        app.get('/users/Buyer/:email', async (req, res) => {
            const email = req.params.email
            console.log(email)
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send({ Buyer: user?.role === 'Buyer' })
        })
        // load Seller with email
        app.get('/users/Seller/:email', async (req, res) => {
            const email = req.params.email
            console.log(email)
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send({ Seller: user?.role === 'Seller' })
        })

        /***
         * app.Post('/products')
         * app.get('/products')
         * app.get('/category/:categoryName')
         */
        // add a product to the server
        app.post('/products', async (req, res) => {
            const products = req.body;
            // console.log(products)
            const result = await productsCollection.insertOne(products);
            res.send(result)

        })
        // load product by categoryName;
        app.get('/category/:categoryName', async (req, res) => {
            const category = req.params.categoryName;
            console.log(category)
            const query = { productCategory: category }

            const result = await productsCollection.find(query).toArray();
            res.send(result)

        })



    }
    finally {

    }
}
run().catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('server api is running')
});


app.listen(port, () => {
    console.log(`server is running on ${port}`)
})