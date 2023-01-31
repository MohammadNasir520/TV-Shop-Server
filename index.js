const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;
require('dotenv').config()


const stripe = require('stripe')(process.env.STRIPE_SECREATE_KEY)

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
        const paymentCollection = client.db('tv-shopdb').collection('paymentCollection')

        //................................................................users.........................................


        //save Users  to the mongodb
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email
            const user = req.body
            console.log(email);
            const filter = { email: email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })






        // get a single user  by email
        app.get('/user/:email', async (req, res) => {

            const email = req.params.email;
            console.log(email);
            const query = {
                email: email
            }
            const result = await usersCollection.findOne(query)
            console.log(result);
            res.send(result)
        })


        // delete user by id
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })


        // ..................................................................seller...................................
        // get all seller
        app.get('/users/seller', async (req, res) => {
            const query = {
                role: 'Seller'
            };
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })


        // ...................................................................buyer..................................
        // get all buyer
        app.get('/users/buyer', async (req, res) => {
            const query = {
                role: 'Buyer'
            };
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })



        // ..................................................................products.....................................
        /***
         * app.Post('/products')
         * app.get('/products')
         * app.get('/category/:categoryName')
         * app.delete('/products/:id')
         */
        // save a product to the server
        app.post('/products', async (req, res) => {
            const products = req.body;
            // console.log(products)
            const result = await productsCollection.insertOne(products);
            res.send(result)

        })
        // get products by categoryName;
        app.get('/category/:categoryName', async (req, res) => {
            const category = req.params.categoryName;

            const query = { productCategory: category }

            const result = await productsCollection.find(query).toArray();
            res.send(result)

        })

        // get product by seller email;
        app.get('/product/:seller', async (req, res) => {
            const email = req.params.seller;

            const query = { email: email }

            const result = await productsCollection.find(query).toArray();
            res.send(result)

        })

        // delete sellers product by id:
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result)
        })


        // update advertised value by put method
        app.put('/productss/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const advertised = req.body

            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    isAdvertised: 'advertised'
                }
            }
            const result = await productsCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })

        // update seller status verified.
        app.put('/seller/:email', async (req, res) => {
            const email = req.params.email;

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


        // get advertised products
        app.get('/products/advertised', async (req, res) => {
            const query = { isAdvertised: 'advertised' };
            const result = await productsCollection.find(query).toArray()
            res.send(result)

        });




        // ......................................................................bookings............................
        // save booked product. to database
        app.post('/bookedProduct', async (req, res) => {
            const bookedProduct = req.body;

            const result = await bookedCollection.insertOne(bookedProduct);
            res.send(result)
        })

        //get booked product by id
        app.get('/bookingProduct/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                _id: ObjectId(id)
            }
            const bookingProduct = await bookedCollection.findOne(query);
            res.send(bookingProduct)
        })


        // find product from product collection according to booked product _id
        app.get('/bookedProduct/:email', async (req, res) => {
            const email = req.params.email

            const query = {
                email: email,
            };
            const BookedProducts = await bookedCollection.find(query).toArray();
            res.send(BookedProducts)
        });

        // delete bookings by id 
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {
                _id: ObjectId(id)
            }
            const result = await bookedCollection.deleteOne(query)
            res.send(result)
        })


        // ..........................................................................payments................................
        // for stripe payment intent .
        app.post('/create-payment-intent', async (req, res) => {

            // collecting payment price from client side
            const booking = req.body;
            const productPrice = booking.productPrice;
            const amount = productPrice * 100;


            // create payment intent, payment type,currency type.
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: [
                    "card"
                ]
            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })


        // save payment data
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);


            const id = payment._id;

            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updateResult = await bookedCollection.updateOne(filter, updatedDoc)


            res.send(result)
        })

    }
    finally {

    }
}
run().catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('tv shop server api is running')
});


app.listen(port, () => {
    console.log(`server is running on ${port}`)
})