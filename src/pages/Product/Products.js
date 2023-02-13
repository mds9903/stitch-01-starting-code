import React, { Component } from "react";
// import axios from "axios";

import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

import Products from "../../components/Products/Products";
import ObjectId from "bson-objectid";
// import { BSON } from "realm";

class ProductsPage extends Component {
  state = { isLoading: true, products: [] };
  componentDidMount() {
    this.fetchData();
  }

  productDeleteHandler = (productId) => {
    console.log("deleteHandler----initiated");
    console.log("productId: ", productId);

    // get the db as a variable
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    mongodb
      .db("shop")
      .collection("products")
      .deleteOne({ _id: ObjectId(productId) })
      .then((result) => {
        console.log(result);
        this.fetchData();
      })
      .catch((err) => {
        this.props.onError(
          "Deleting the product failed. Please try again later"
        );
        console.log("error occurred: ", err);
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
