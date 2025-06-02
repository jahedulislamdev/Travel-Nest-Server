require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//MONGODB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@tester.mlqovry.mongodb.net/?retryWrites=true&w=majority&appName=tester`;

console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const spotsCollection = client.db("tester").collection("spots");

        // post request to add a spot
        app.post("/spots", async (req, res) => {
            console.log("hitting the post request");
            // console.log(req.body);
            const spots = req.body;
            const result = await spotsCollection.insertOne(spots);
            res.send(result);
        });
        // get all spots
        app.get("/spots", async (req, res) => {
            const cursor = spotsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });
        // get single spot by id
        app.get("/spots/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await spotsCollection.findOne(query);
            res.send(result);
        });
        // get  perticular spot by email which user added
        app.get("/spots/email/:email", async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const cursor = spotsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // update a spot by id
        app.put("/update-spot/:id", async (req, res) => {
            const id = req.params.id;
            const updatedSpot = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    spotName: updatedSpot.spotName,
                    spotImage: updatedSpot.spotImage,
                    avgCost: updatedSpot.avgCost,
                    shortDescription: updatedSpot.shortDescription,
                    location: updatedSpot.location,
                    travelTime: updatedSpot.travelTime,
                    visitorPerYear: updatedSpot.visitorPerYear,
                    duration: updatedSpot.duration,
                    season: updatedSpot.season,
                },
            };
            const result = await spotsCollection.updateOne(
                query,
                updatedDoc,
                options,
            );
            res.send(result);
        });
        // delete a spot by id
        app.delete("/delete-spot/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await spotsCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!",
        );
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

// get
app.get("/", async (req, res) => {
    res.send("server running ..");
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
