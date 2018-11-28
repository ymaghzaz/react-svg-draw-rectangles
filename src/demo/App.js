import React, { Component } from "react";
import Example from "../lib";
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
      labelColor: "green",
      url:
        "https://images.unsplash.com/photo-1513790651065-2b4e0263b1d8?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=079789f92119a36ed6ad97618a442309&auto=format&fit=crop&w=1951&q=80",
      labelText: "LABEL",
      debug: true,
      imageStyle: {
        width: "600px",
        height: "600px"
      }
    };
    return (
      <div>
        <Example {...props} />
        <SecondExample />
      </div>
    );
  }
}
export default App;
