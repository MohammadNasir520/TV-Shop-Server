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

        /***
         * app.get('users')
         * app.post('users')
         */

        //Users save to the mongodb
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
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