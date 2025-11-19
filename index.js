const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // All vehicles API
        app.get('/vehicles', async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }

            const cursor = vehiclesCollection.find(query).sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        // Latest Vehicles API for HomePage
        app.get('/latest-vehicles', async (req, res) => {
            const cursor = vehiclesCollection.find().sort({ createdAt: -1 }).limit(8);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Vehicle Details API
        app.get('/vehicles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await vehiclesCollection.findOne(query);
            res.send(result);
        })

        // Add new Vehicle API
        app.post('/vehicles', async (req, res) => {
            const newVehicle = req.body;
            const result = await vehiclesCollection.insertOne(newVehicle);
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