const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fvjw5tg.mongodb.net/?retryWrites=true&w=majority`;
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
  await client.connect();

  const productCollection = client.db('productDB').collection('products');

  const cartCollection = client.db('productDB').collection('cart');

  //   posting product to database
  app.post('/products', async (req, res) => {
   const newProduct = req.body;
   console.log(newProduct);
   const result = await productCollection.insertOne(newProduct);
   console.log(result);
   res.send(result);
  });

  // posting cart item to database
  app.post('/myCart', async (req, res) => {
   const newItem = req.body;
   console.log(newItem);
   const result = await cartCollection.insertOne(newItem);
   console.log(result);
   res.send(result);
  });
  // api for product
  app.get('/products', async (req, res) => {
   const result = await productCollection.find().toArray();
   console.log(result);
   res.send(result);
  });

  app.get('/products/:_id', async (req, res) => {
   const id = req.params._id;
   const query = { _id: new ObjectId(id) };
   const result = await productCollection.findOne(query);
   console.log(result);
   res.send(result);
  });

  //   api for cart item

  app.get('/myCart', async (req, res) => {
   const result = await cartCollection.find().toArray();
   console.log(result);
   res.send(result);
  });

  //   deleting cart item

  app.delete('/myCart/:id', async (req, res) => {
   const id = req.params.id;
   const query = { _id: new ObjectId(id) };
   const result = await cartCollection.deleteOne(query);
   res.send(result);
  });

  //   update product

  app.put('/products/:_id', async (req, res) => {
   const id = req.params._id;
   const filter = { _id: new ObjectId(id) };
   const option = { upsert: true };
   const updatedProduct = req.body;

   const update = {
    $set: {
     image: updatedProduct.image,
     name: updatedProduct.name,
     brand: updatedProduct.brand,
     type: updatedProduct.type,
     price: updatedProduct.price,
     description: updatedProduct.description,
     rating: updatedProduct.rating,
    },
   };
   const result = await productCollection.updateOne(filter, update, option);
   res.send(result);
  });

  await client.db('admin').command({ ping: 1 });
  console.log('Pinged your deployment. You successfully connected to MongoDB!');
 } finally {
  //   await client.close();
 }
}
run().catch(console.dir);

app.get('/', (req, res) => {
 res.send('Hello World!');
});

app.listen(port, () => {
 console.log(`Example app listening on port ${port}`);
});
