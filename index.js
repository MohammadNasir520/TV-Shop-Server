const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const { query } = require('express');
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
        const bookedCollection = client.db('tv-shopdb').collection('bookedCollection')

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
        // load all seller
        app.get('/users/seller', async (req, res) => {
            const query = {
                role: 'Seller'
            };
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        // delete seller by id
        app.delete('/users/seller/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })
        // load all buyer
        app.get('/users/buyer', async (req, res) => {
            const query = {
                role: 'Buyer'
            };
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        // delete buyer by id
        app.delete('/users/buyer/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })

        // // checking buyer with email
        // app.get('/users/Buyer/:email', async (req, res) => {
        //     const email = req.params.email
        //     console.log(email)
        //     const query = { email: email };
        //     const user = await usersCollection.findOne(query);
        //     res.send({ Buyer: user?.role === 'Buyer' })
        // })
        // Checking Seller with email
        // app.get('/users/buyer/:email', async (req, res) => {
        //     const email = req.params.email
        //     console.log(email)
        //     const query = { email: email };
        //     const user = await usersCollection.findOne(query);
        //     res.send({ Buyer: user?.role === 'Buyer' })
        // })

        // checking buyer.
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = {

                email: email
            }
            const buyer = await usersCollection.findOne(query);

            res.send({ Buyer: buyer?.role === "Buyer" })
        })


        // Checking Seller with email
        app.get('/users/Seller/:email', async (req, res) => {
            const email = req.params.email
            console.log(email)
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send({ Seller: user?.role === 'Seller' })
        })
        // checking Admin with email
        app.get('/users/Admin/:email', async (req, res) => {
            const email = req.params.email
            console.log(email)
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send({ Admin: user?.role === 'Admin' })
        })




        /***
         * app.Post('/products')
         * app.get('/products')
         * app.get('/category/:categoryName')
         * app.delete('/products/:id')
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

        // load product by categoryName;
        app.get('/product/:seller', async (req, res) => {
            const email = req.params.seller;
            console.log(email)
            const query = { email: email }

            const result = await productsCollection.find(query).toArray();
            res.send(result)

        })

        // delete sellers product by id:
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result)
        })

        //         //PUT method for dynamic revews
        // app.put('/reviews/:id', async (req, res) => {
        //     const id = req.params.id;
        //     // console.log(id)
        //     const review = req.body.review;
        //     const query = { _id: ObjectId(id) }
        //     const updateDoc = {
        //       $set: {
        //         review: review
        //       }
        //     }
        //     const result = await ReviwsCollection.updateOne(query, updateDoc)
        //     res.send(result)
        //   });


        // update advertised value by put method
        app.put('/productss/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const advertised = req.body
            console.log(id, advertised)
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    isAdvertised: 'advertised'
                }
            }
            const result = await productsCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })

        // update seller status varifye.
        app.put('/seller/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = {
                email: email
            }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    isVerified: 'verified'
                }

            }
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })


        // load seller status.
        app.get('seller/verify/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
        })

        // load advertised products
        app.get('/products/advertised', async (req, res) => {
            const query = { isAdvertised: 'advertised' };
            const result = await productsCollection.find(query).toArray()
            res.send(result)

        });

        // save booked product.
        app.post('/bookedProduct', async (req, res) => {
            const bookedProduct = req.body;
            console.log(bookedProduct)
            const result = await bookedCollection.insertOne(bookedProduct);
            res.send(result)
        })

        // find product from product collection according to booked product _id
        app.get('/bookedProduct', async (req, res) => {

            const query = {};
            const allBookedProducts = await bookedCollection.find(query).toArray();
            res.send(allBookedProducts)
            // const allProducts = await productsCollection.find(query).toArray()
            // console.log(allProducts)

            //     allBookedProducts.forEach(product => {
            //         const bookedProducts = allProducts.filter(bookedProduct => product.productName === bookedProduct.productName)
            //         console.log(bookedProducts)
            //         res.send(bookedProducts)

            //     })
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