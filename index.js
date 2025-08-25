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
    const volunteerRequestCollection = db.collection("volunteerRequests");



    // 1. Create a new volunteer post:
    app.post('/add-volunteer-post', async (req, res) => {
      const newPost = req.body;
      if (typeof newPost.volunteersNeeded === 'string') {
        newPost.volunteersNeeded = parseInt(newPost.volunteersNeeded, 10);
      }
      if (isNaN(newPost.volunteersNeeded)) {
        newPost.volunteersNeeded = 0;
      }
      const result = await postCollection.insertOne(newPost);
      res.send(result);
    });


    // 2. Get all volunteer posts:
    app.get('/volunteer-posts', async (req, res) => {
      const { limit, sort } = req.query;
      let cursor = postCollection.find();

      if (sort === 'deadline') {
        cursor = cursor.sort({ deadline: 1 });
      }

      if (limit) {
        cursor = cursor.limit(Number(limit));
      }

      const posts = await cursor.toArray();
      res.send(posts);
    });

    // 3. Get a single volunteer post by ID:
    app.get('/volunteer-posts/:id', async (req, res) => {

      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const post = await postCollection.findOne(filter);
      res.send(post);

    });

    // 4. Submit a volunteer request:
    app.post('/volunteer-requests', async (req, res) => {
      try {
        const { postId, volunteerEmail, ...rest } = req.body;

        if (!ObjectId.isValid(postId)) {
          return res.json({ status: 'error', message: 'Invalid post ID.' });
        }

        const postObjectId = new ObjectId(postId);

        const duplicate = await volunteerRequestCollection.findOne({
          postId: postObjectId,
          volunteerEmail
        });

        if (duplicate) {
          return res.json({ status: 'duplicate', message: 'You have already requested to volunteer for this post.' });
        }

        await volunteerRequestCollection.insertOne({ postId: postObjectId, volunteerEmail, ...rest });

        const updateResult = await postCollection.updateOne(
          { _id: postObjectId, volunteersNeeded: { $gt: 0 } },
          { $inc: { volunteersNeeded: -1 } }
        );

        if (updateResult.matchedCount === 0) {
          return res.json({ status: 'full', message: 'Post not found or no volunteers needed.' });
        }

        res.json({ status: 'success', message: 'Your volunteer request was successful!' });

      } catch (err) {
        console.error(err);
        res.json({ status: 'error', message: 'Sorry, something went wrong while processing your request.' });
      }
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
