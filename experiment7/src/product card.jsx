const ProductCard = ({ products }) => {
    return (
      <div className="cards-container">
        {products.map((product, index) => (
          <div className="card" key={index}>
            <h3 className="product-name">{product.name}</h3>
            <p>Price: ₹{product.price}</p>
            <p>Status: {product.instock ? "In Stock" : "Out of Stock"}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default ProductCard;
