const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;



const serviceAccount = require("./travel-ease-firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



// middleware
app.use(cors());
app.use(express.json());

// verify Token
const verifyFireBaseToken = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1];

    try {
        const decoded = await Admin.auth().verifyIdToken(token);
        console.log('inside token', decoded)
        req.token_email = decoded.email;
        next();
    }
    catch (error) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
}

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
        const usersCollection = db.collection('users-data');



        // User APIs
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                res.send({ message: 'user already exits.' })
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        });

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
        app.post('/vehicles', verifyFireBaseToken, async (req, res) => {
            const newVehicle = req.body;
            const result = await vehiclesCollection.insertOne(newVehicle);
            res.send(result);
        })

        // Update Vehicle API
        app.patch('/vehicles/:id', async (req, res) => {
            const id = req.params.id;
            const updatedVehicle = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedVehicle
            }

            const result = await vehiclesCollection.updateOne(query, update);
            res.send(result);
        })


        // Delete Vehicle API
        app.delete('/vehicles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await vehiclesCollection.deleteOne(query);
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