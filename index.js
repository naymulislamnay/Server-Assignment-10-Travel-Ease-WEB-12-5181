const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@travelease.vacwmlf.mongodb.net/?appName=TravelEase`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('This is my last try')
})

async function run() {
    try {
        await client.connect()

        const db = client.db('travel-ease-db');
        const vehiclesCollection = db.collection('vehicles-data');



        // Vehicles APIs
        app.get('/vehicles', async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }

            const cursor = vehiclesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        await client.db('admin').command({ ping: 1 });
        console.log("Pinged Your Deployment. You Successfully Connected to MongoDB");
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`This server is running on port: ${port}`)
})