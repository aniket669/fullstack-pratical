import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

//  product data
const products = [
  { id: 1, name: "MacBook Air M3", price: "$1,099" },
  { id: 2, name: "HP Spectre x360", price: "$1,249" },
  { id: 3, name: "Dell XPS 13", price: "$999" },
];

// GET endpoint for products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
        