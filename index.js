require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p62hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


console.log(uri);


console.log(process.env.DB_USER,
  process.env.DB_PASSWORD);

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
    const db = client.db("shareStepDB");
    const collection = db.collection("posts");

    // Add your API routes here after successful DB connection
    app.get('/api/posts', async (req, res) => {
      // Your routes will have access to the collection
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World from ShareStep!');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
