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
      const { limit, sort, email } = req.query;

      let filter = {};
      if (email) {
        filter.organizerEmail = email;
      }

      let cursor = postCollection.find(filter);

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

        const post = await postCollection.findOne(
          {
            _id: postObjectId,
            volunteersNeeded:
            {
              $gt: 0
            }
          });

        if (!post) {
          return res.json({ status: 'full', message: 'Post not found or no volunteers needed.' });
        }

        await volunteerRequestCollection.insertOne({ postId: postObjectId, volunteerEmail, ...rest });
        await postCollection.updateOne(
          {
            _id: postObjectId
          },
          {
            $inc: {
              volunteersNeeded: -1
            }
          }
        );

        res.json({ status: 'success', message: 'Your volunteer request was successful!' });

      } catch (err) {
        console.error(err);
        res.json({ status: 'error', message: 'Sorry, something went wrong while processing your request.' });
      }
    });


    // 5. Update a volunteer post by _id and Email:
    app.put('/volunteer-posts/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      try {
        delete updateData._id;
        const filter = {
          _id: new ObjectId(id),
          organizerEmail: updateData.organizerEmail
        };
        const result = await postCollection.updateOne(filter, { $set: updateData });
        if (result.matchedCount === 0) {
          return res.json({ status: 'error', message: 'Post not found or you are not the owner.' });
        }
        res.json({ status: 'success', message: 'Post updated successfully.' });
      } catch (err) {
        console.error(err);
        res.json({ status: 'error', message: 'Failed to update post.' });
      }
    });

    // 6. Delete a volunteer post by _id and organizerEmail
    app.delete('/volunteer-posts/:id', async (req, res) => {
      const { id } = req.params;
      const { organizerEmail } = req.body;
      try {
        const filter = { _id: new ObjectId(id), organizerEmail };
        const result = await postCollection.deleteOne(filter);
        if (result.deletedCount === 0) {
          return res.json({ status: 'error', message: 'Post not found or you are not the owner.' });
        }
        res.json({ status: 'success', message: 'Post deleted successfully.' });
      } catch (err) {
        console.error(err);
        res.json({ status: 'error', message: 'Failed to delete post.' });
      }
    });


    // 7. Get all volunteer requests for a user
    app.get('/volunteer-requests', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email is required.' });
      }

      try {
        const requests = await volunteerRequestCollection.find({ volunteerEmail: email }).toArray();

        const result = [];
        for (const request of requests) {
          const post = await postCollection.findOne({ _id: request.postId });
          if (post) {
            result.push({
              _id: request._id,
              postTitle: post.title,
              organizerName: post.organizerName,
              status: request.status
            });
          }
        }

        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch volunteer requests.' });
      }
    });

    // 8. Delete a volunteer request by ID and user email
    app.delete('/volunteer-requests/:id', async (req, res) => {
      const id = req.params.id;
      const requesterEmail = req.body.requesterEmail;

      if (!requesterEmail) {
        return res.status(400).json({ status: 'error', message: 'Requester email is required.' });
      }

      try {
        const filter = {
          _id: new ObjectId(id),
          volunteerEmail: requesterEmail
        };

        const result = await volunteerRequestCollection.deleteOne(filter);

        if (result.deletedCount === 0) {
          return res.json({
            status: 'error',
            message: 'Request not found or you are not the owner.'
          });
        }

        res.json({
          status: 'success',
          message: 'Volunteer request cancelled successfully.'
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to cancel volunteer request.' });
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
