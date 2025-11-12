const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@travelease.vacwmlf.mongodb.net/?appName=TravelEase`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        // collect data form MongoDB
        const db = client.db('travel-ease-db')
        const vehicleData = db.collection('vehicles-data')

        app.get('/vehicles', async (req, res) => {
            const result = await vehicleData.find().toArray()
            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running fine---------')
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})
