const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k8aq9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );


    // Connect to the "insertDB" database and access its "haiku" collection

    const addCraftsCollection = client.db("artsAndCraftsDB").collection("artsAndCrafts")

    app.get("/", (req, res) => {
      res.send("The craft items will coming");
    });

    app.get("/allArtsCrafts", async(req, res)=>{
        const result = await addCraftsCollection.find().toArray()
        res.send(result)
    })

    app.get("/myArtCraftList/:email", async(req,res)=>{
      const email = req.params.email
      const query = {email:email}
      const result = await addCraftsCollection.find(query).toArray();
      res.send(result)


    })

    app.post("/addCraft", async(req, res) => {
      const newCraft = req.body;
      const result = await addCraftsCollection.insertOne(newCraft)
      res.send(result);
    });

    app.delete("/myArtCraftListDelete/:id", async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await addCraftsCollection.deleteOne(query)
      res.send(result)
    })

    app.get("/update/:id", async(req,res)=>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await addCraftsCollection.findOne(query)
      res.send(result)
    })

    app.put("/update/:id", async(req,res)=>{
      const id = req.params.id
      const updatedCraftInfo = req.body

      const query = {_id : new ObjectId(id)}

      const options = { upsert: true }

      const updatedCraft = {
        $set:{
          name: updatedCraftInfo.name,
          subCategory:updatedCraftInfo.subCategory,
          description:updatedCraftInfo.description,
          price:updatedCraftInfo.price,
          rating: updatedCraftInfo.rating,
          customization: updatedCraftInfo.customization,
          processingTime: updatedCraftInfo.processingTime,
          stockStatus: updatedCraftInfo.stockStatus,
          photoUrl:updatedCraftInfo.photoUrl
        }
      }

      const result = await addCraftsCollection.updateOne(
        query,
        updatedCraft,
        options
      )

      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`The server will running from the port of: ${port}`);
});
