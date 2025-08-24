require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p62hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const db = client.db("shareStepDB");
    const postCollection = db.collection("volunteerPosts");

    // 1. Create a new volunteer post:
    app.post('/add-volunteer-post', async (req, res) => {
      const newPost = req.body;
      const result = await postCollection.insertOne(newPost);
      res.send(result);
    });

    // 2. Get all volunteer posts:
    app.get('/volunteer-posts', async (req, res) => {
      const posts = await postCollection.find().toArray();
      res.send(posts);
    });

    // 3. Get a single volunteer post by ID:
    app.get('/volunteer-posts/:id', async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId  (id) };
      const post = await postCollection.findOne(filter);
      res.send(post);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )



  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from Volunteer Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
