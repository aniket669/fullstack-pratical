import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "./App.css"
export default function App() {
  return (
    <Provider store={store}>
      <div className="main">
        <ProductList />
        <Cart />
      </div>
    </Provider>

  );
}
