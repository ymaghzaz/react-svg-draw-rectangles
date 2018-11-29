import React, { Component } from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

const parsePoint = ({ x, y }) => {
  if (typeof x === "object") {
    x = JSON.stringify(x);
  }

  if (typeof y === "object") {
    y = JSON.stringify(y);
  }

  return { x, y };
};

const parseIntPoint = ({ x, y }) => {
  x = parseInt(x);
  y = parseInt(y);
  return { x, y };
};

const drawOptimalRectangle = (point1, point2, color, key) => {
  let { x: localx1, y: localy1 } = parsePoint(point1);
  let { x: localx2, y: localy2 } = parsePoint(point2);
  let x1 = localx1 >= localx2 ? localx2 : localx1;
  let y1 = localy1 >= localy2 ? localy2 : localy1;
  let x2 = localx1 >= localx2 ? localx1 : localx2;
  let y2 = localy1 >= localy2 ? localy1 : localy2;
  const pathPoint = `M${x1},${y1},${x1},${y2},${x2},${y2},${x2},${y1}z`;
  return (
    <path
      key={"path" + key}
      d={pathPoint}
      fill="none"
      fillOpacity="0"
      strokeWidth="4"
      stroke={color}
    />
  );
};

const drawRectangle = (point1, point2, color, key) => {
  let { x: localx1, y: localy1 } = parsePoint(point1);
  let { x: localx2, y: localy2 } = parsePoint(point2);
  let x1 = localx1 >= localx2 ? localx2 : localx1;
  let y1 = localy1 >= localy2 ? localy2 : localy1;
  let x2 = localx1 >= localx2 ? localx1 : localx2;
  let y2 = localy1 >= localy2 ? localy1 : localy2;

  const points = [
    { cx: x1, cy: y1 },
    { cx: x1, cy: y2 },
    { cx: x2, cy: y1 },
    { cx: x2, cy: y2 }
  ];
  const line1 = { x1, y1, x2: x1, y2 };
  const line2 = { x1, y1, x2, y2: y1 };
  const line3 = { x1: x2, y1, x2, y2 };
  const line4 = { x1, y1: y2, x2, y2 };
  const rectangle = [line1, line2, line3, line4];

  const drawLines = rectangle.map((line, index) => {
    return <line key={index} {...line} stroke={color} strokeWidth={5} />;
  });
  const drawPoint = points.map((point, index) => {
    return <circle key={"circle" + index} {...point} r={2} fill={color} />;
  });

  return [...drawLines, ...drawPoint];
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    background: "#f6f6f6"
  },
  drawContainer: {
    width: "100%",
    position: "relative"
  },
  svg: { margin: "0 auto", height: "auto", display: "block", maxWidth: "100%" },
  svgImage: { border: "0", margin: "0", padding: "0", boxSizing: "border-box" },
  bottom_left: { position: "absolute", bottom: "8px", left: "16px" },
  top_left: { position: "absolute", top: "8px", left: "16px" },
  top_right: { position: "absolute", top: "8px", right: "16px" },
  bottom_right: { position: "absolute", bottom: "8px", right: "16px" },
  centered: {
    cursor: "crosshair",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  }
};
const addPoint = (rectangle, { x: xInt, y: yInt }) => {
  const newRectangle = { ...rectangle };
  const x = JSON.stringify(xInt);
  const y = JSON.stringify(yInt);
  if (_.isEmpty(rectangle.point1)) {
    newRectangle.point1 = { x, y };
    newRectangle.completed = false;
  } else if (_.isEmpty(rectangle.point2)) {
    newRectangle.point2 = { x, y };
    newRectangle.completed = true;
  }
  return newRectangle;
};

const displayLabel = (rec, key, labelColor) => {
  let { point1, point2, label: text } = rec;
  let { x: x1, y: y1 } = parseIntPoint(point1);
  let { x: x2, y: y2 } = parseIntPoint(point2);

  let x = x1 >= x2 ? x2 : x1;
  let y = y1 >= y2 ? y2 : y1;
  y = y < 20 ? 20 : y;
  const labelstyles = {
    fill: "#000",
    fontWeight: "bold",
    fontFamily: '"Roboto Condensed", "Arial Narrow", sans-serif',
    userSelect: "true",
    fontSize: "17",
    textTransform: "uppercase"
  };

  const labelSvg = [
    <defs key={"defs" + key}>
      <filter
        key={"filter" + key}
        x="0"
        y="0"
        width="1"
        height="1"
        id={"label" + key}
      >
        <feFlood style={{ floodColor: labelColor }} />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>,
    <text
      key={"text" + key}
      filter={`url(#${"label" + key})`}
      x={x - 1}
      y={y - 5}
      style={labelstyles}
    >
      {text}
    </text>
  ];

  return labelSvg;
};
class Example extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initX: 0,
      initY: 0,
      x: 0,
      y: 0,
      rectangle: {
        point1: null,
        point2: null,
        completed: false,
        label: "TEXT"
      },
      rectangles: []
    };
  }

  _onMouseMove = ({ clientX: x, clientY: y }) => {
    const { x: initX, y: initY } = ReactDOM.findDOMNode(
      this.refs["drawerComponent"]
    ).getBoundingClientRect();
    this.setState({ initX, initY, x: x - initX, y: y - initY });
  };

  _onClick = ({ clientX: x, clientY: y }) => {
    let { rectangle, rectangles, initX, initY } = this.state;
    x = x - initX;
    y = y - initY;
    if (!rectangle.completed) {
      let newRectangle = addPoint(rectangle, { x, y });
      this.setState({ rectangle: newRectangle });
    } else {
      let newRectangleList = [...rectangles, rectangle];
      this.setState({
        rectangle: addPoint(
          { point1: null, point2: null, completed: false, label: "TEXT" },
          { x, y }
        ),
        rectangles: newRectangleList
      });
    }
  };

  processDraw = (rectangle, color, key, currentPoint) => {
    const { point1, point2 } = rectangle;
    if (rectangle.completed) {
      return drawOptimalRectangle(point1, point2, color, key);
    } else {
      if (point1) {
        let { x, y } = currentPoint;
        return drawOptimalRectangle(point1, { x, y }, color, key);
      } else {
        return <div />;
      }
    }
  };

  render() {
    const { x, y, props, rectangles, rectangle, initX, initY } = this.state;
    const { url, labelColor, labelText, imageStyle, debug } = this.props;
    const imageWidth = 400;
    const imageHeight = 300;
    return (
      <div>
        {debug && (
          <h1>
            Mouse coordinates: {x} , {y}
            <p>
              init {initX} ,{initY}
            </p>
          </h1>
        )}
        <div />
        <div style={styles.container}>
          <div
            style={{ ...styles.drawContainer, ...imageStyle }}
            onMouseMove={this._onMouseMove}
            onClick={this._onClick}
            ref="drawerComponent"
          >
            <img alt="imge" src={url} style={imageStyle} />
            <svg
              // preserveAspectRatio="xMinYMin meet"
              // // viewBox={`0 0 ${imageWidth} ${imageHeight}`}
              draggable="false"
              // width={imageWidth}
              // height={imageHeight}
              style={{ ...styles.centered, ...imageStyle }} //{styles.svg}
            >
              {/* <image
                ref="imageComponent"
                x="0"
                y="0"
                width={imageWidth}
                height={imageHeight}
                style={{ ...styles.svgImage, opacity: "0.8" }}
                alt="imge"
                href={url}
              /> */}

              <g key={"globale" + 33} style={{ opacity: "1" }}>
                {this.processDraw(rectangle, labelColor, "441", { x, y })}
              </g>

              {rectangles.map((rec, index) => {
                return (
                  <g key={"globale" + index} style={{ opacity: "1" }}>
                    {this.processDraw(rec, labelColor, index)}
                    <g key={"label" + index}>
                      {displayLabel(rec, index, labelColor)}
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

export default Example;
