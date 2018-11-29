import React, { Component } from "react";
import DrawRectangle from "../lib";
import { SecondExample } from "../lib";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      helle: "helo",
      he: "hh"
    };
  }
  render() {
    const props = {
      rectangles: [
        {
          point1: { x: "556.3333435058594", y: "123.66666603088379" },
          point2: { x: "697.3333435058594", y: "242.6666660308838" },
          label: { id: 1, name: "LABEL", color: "red" }
        },
        {
          point1: { x: "327.3333435058594", y: "164.6666660308838" },
          point2: { x: "472.3333435058594", y: "317.6666660308838" },
          label: { id: 1, name: "HAmid", color: "green" }
        }
      ],
      labelColor: "green",
      url:
        "https://images.unsplash.com/photo-1513790651065-2b4e0263b1d8?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=079789f92119a36ed6ad97618a442309&auto=format&fit=crop&w=1951&q=80",
      labelText: "LABEL",
      label: {
        id: 1,
        name: "LABEL",
        color: "red"
      },
      debug: true,
      imageStyle: {
        width: "600px",
        height: "400px"
      }
    };
    return (
      <div>
        <DrawRectangle
          {...props}
          handler={rectangles => {
            console.log("rectangles", JSON.stringify(rectangles));
          }}
        />
        <SecondExample />
      </div>
    );
  }
}
export default App;
