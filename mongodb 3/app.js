const express = require('express');
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const connectDB = require("./config/db");
const Product = require("./models/Product");

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

connectDB();

app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/products/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/products/:id/variants", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id, { variants: 1, _id: 0 });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product.variants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
