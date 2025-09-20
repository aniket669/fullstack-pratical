import ProductCard from "./ProductCard";
import "./App.css";

function App() {
  const products = [
    { name: "Laptop", price: 60000, instock: true },
    { name: "Smartphone", price: 25000, instock: false },
    { name: "Headphone", price: 3000, instock: true }
  ];

  return (
    <div className="app-container">
      <h2 className="title">Products List</h2>
      <div className="product-list">
        <ProductCard products={products} />
      </div>
    </div>
  );
}

export default App;
