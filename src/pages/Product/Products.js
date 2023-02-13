import React, { Component } from "react";
import axios from "axios";

import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

import Products from "../../components/Products/Products";

class ProductsPage extends Component {
  state = { isLoading: true, products: [] };
  componentDidMount() {
    this.fetchData();
  }

  productDeleteHandler = (productId) => {
    axios
      .delete("http://localhost:3100/products/" + productId)
      .then((result) => {
        console.log(result);
        this.fetchData();
      })
      .catch((err) => {
        this.props.onError(
          "Deleting the product failed. Please try again later"
        );
        console.log(err);
      });
  };

  fetchData = () => {
    // get the db as a variable
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );

    // perform crud methods
    mongodb
      .db("shop")
      .collection("products")
      .find()
      .asArray()
      .then((productsRetrieved) => {
        const transformedProducts = productsRetrieved.map(
          (productRetrieved) => {
            productRetrieved._id = productRetrieved._id.toString();
            productRetrieved.price = productRetrieved.price.toString();
            console.log("productRetrieved: ", productRetrieved);
            return productRetrieved;
          }
        );
        // update the state with and for the loaded data
        this.setState({ isLoading: false, products: transformedProducts });
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        console.log("error occurred: ", err);
        this.props.onError("Fetching products failed, please try again later");
      });

    // axios
    //   .get("http://localhost:3100/products")
    //   .then((productsResponse) => {
    //     this.setState({ isLoading: false, products: productsResponse.data });
    //   })
    //   .catch((err) => {
    //     this.setState({ isLoading: false, products: [] });
    //     this.props.onError("Loading products failed. Please try again later");
    //     console.log(err);
    //   });
  };

  render() {
    let content = <p>Loading products...</p>;

    if (!this.state.isLoading && this.state.products.length > 0) {
      content = (
        <Products
          products={this.state.products}
          onDeleteProduct={this.productDeleteHandler}
        />
      );
    }
    if (!this.state.isLoading && this.state.products.length === 0) {
      content = <p>Found no products. Try again later.</p>;
    }
    return <main>{content}</main>;
  }
}

export default ProductsPage;
