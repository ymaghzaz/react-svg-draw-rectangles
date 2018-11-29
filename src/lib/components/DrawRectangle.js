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

const switchPoint = ({ point1, point2, ...rec }) => {
  let { x: localx1, y: localy1 } = point1;
  let { x: localx2, y: localy2 } = point2;
  let x1 = localx1 >= localx2 ? localx2 : localx1;
  let y1 = localy1 >= localy2 ? localy2 : localy1;
  let x2 = localx1 >= localx2 ? localx1 : localx2;
  let y2 = localy1 >= localy2 ? localy1 : localy2;
  return { point1: { x: x1, y: y1 }, point2: { x: x2, y: y2 }, ...rec };
};

const drawOptimalRectangle = (point1, point2, color, key, selected) => {
  let { x: localx1, y: localy1 } = parsePoint(point1);
  let { x: localx2, y: localy2 } = parsePoint(point2);
  let x1 = localx1 >= localx2 ? localx2 : localx1;
  let y1 = localy1 >= localy2 ? localy2 : localy1;
  let x2 = localx1 >= localx2 ? localx1 : localx2;
  let y2 = localy1 >= localy2 ? localy1 : localy2;
  const pathPoint = `M${x1},${y1},${x1},${y2},${x2},${y2},${x2},${y1}z`;
  let fill = selected ? color : "none";
  let fillOpacity = selected ? "0.75" : "0";
  return (
    <path
      key={"path" + key}
      d={pathPoint}
      fill={fill}
      fillOpacity={fillOpacity}
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
  let { point1, point2, label } = rec;
  let { x: x1, y: y1 } = parseIntPoint(point1);
  let { x: x2, y: y2 } = parseIntPoint(point2);
  let text = label.name;
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
class DrawRectangleComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initX: 0,
      initY: 0,
      x: 0,
      y: 0,
      numberOfRectangle: 0,
      selectedRectangle: null,
      numberOfClick: 0,
      rectangle: {
        id: null,
        selected: false,
        point1: null,
        point2: null,
        completed: false,
        label: null
      },
      rectangles: []
    };
  }

  componentDidMount() {
    const { rectangles } = this.props;
    let newRectangles = rectangles.map((rec, key) => {
      rec.id = "init" + key;
      rec.completed = true;
      rec.selected = false;
      return rec;
    });
    this.setState({ rectangles: newRectangles });
  }

  _onMouseMove = ({ clientX: x, clientY: y }) => {
    const { x: initX, y: initY } = ReactDOM.findDOMNode(
      this.refs["drawerComponent"]
    ).getBoundingClientRect();
    this.setState({ initX, initY, x: x - initX, y: y - initY });
  };

  _onClick = ({ clientX: x, clientY: y }) => {
    let { label, handler } = this.props;
    let {
      rectangle,
      rectangles,
      initX,
      initY,
      numberOfClick,
      numberOfRectangle
    } = this.state;
    x = x - initX;
    y = y - initY;
    numberOfClick++;

    if (numberOfClick === 2) {
      let newRectangle = switchPoint(addPoint(rectangle, { x, y }));
      newRectangle.id = numberOfRectangle;
      numberOfRectangle++;
      let newRectangleList = [...rectangles, newRectangle];
      this.setState({
        numberOfRectangle: numberOfRectangle,
        rectangle: {
          id: null,
          selected: false,
          point1: null,
          point2: null,
          completed: false,
          label: null
        },
        rectangles: newRectangleList,
        numberOfClick: 0
      });
      if (handler) {
        handler(newRectangleList);
      }
    } else {
      let newRectangle = addPoint(rectangle, { x, y });
      newRectangle.label = label;
      this.setState({
        rectangle: newRectangle,
        numberOfClick: 1
      });
    }
  };

  processDraw = (rectangle, key, currentPoint) => {
    const { point1, point2, label, selected } = rectangle;
    if (rectangle.completed) {
      return drawOptimalRectangle(point1, point2, label.color, key, selected);
    } else {
      if (point1) {
        let { x, y } = currentPoint;
        return drawOptimalRectangle(point1, { x, y }, label.color, key);
      } else {
        return <div />;
      }
    }
  };

  removeRectangle = () => {
    let { rectangles, selectedRectangle } = this.state;
    _.remove(rectangles, {
      id: selectedRectangle
    });
    this.setState({
      rectangles,
      selectedRectangle: null
    });
  };
  selectRectangle = index => {
    const { rectangles } = this.state;
    let newSelectedRectangle = index;
    let newRectangles = rectangles.map(rec => {
      if (index === rec.id) {
        rec.selected = !rec.selected;
        if (!rec.selected) {
          newSelectedRectangle = null;
        }
      } else {
        rec.selected = false;
      }
      return rec;
    });

    this.setState({
      rectangles: newRectangles,
      selectedRectangle: newSelectedRectangle
    });
  };

  render() {
    const {
      x,
      y,
      props,
      rectangles,
      rectangle,
      initX,
      initY,
      selectedRectangle
    } = this.state;
    const { url, labelColor, labelText, imageStyle, debug, label } = this.props;
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: "10px 20px",
            background: "#f6f6f6"
          }}
        >
          {selectedRectangle === null && (
            <button
              style={{
                width: `200px`,
                height: `60px`,
                margin: "2px 2px 2px 2px",
                borderRadius: "4px",
                color: "#f6f6f6",
                fontSize: "large"
              }}
            >
              {" "}
              Remove
            </button>
          )}

          {selectedRectangle !== null && (
            <button
              style={{
                width: `200px`,
                height: `60px`,
                margin: "2px 2px 2px 2px",
                borderRadius: "4px",
                color: "white",
                fontSize: "large",
                backgroundColor: "#3032c1"
              }}
              onClick={this.removeRectangle}
            >
              Remove Selected Rectangle
            </button>
          )}
        </div>
        <div style={styles.container}>
          <div
            style={{ ...styles.drawContainer, ...imageStyle }}
            onMouseMove={this._onMouseMove}
            onClick={this._onClick}
            ref="drawerComponent"
          >
            <img alt="imge" src={url} style={imageStyle} />
            <svg
              draggable="false"
              style={{ ...styles.centered, ...imageStyle }}
            >
              <g key={"initGlobale"} style={{ opacity: "1" }}>
                {this.processDraw(rectangle, "441", { x, y })}
              </g>

              {rectangles.map((rec, index) => {
                return (
                  <g
                    onClick={e => {
                      this.selectRectangle(rec.id);
                      e.stopPropagation();
                    }}
                    key={"globale" + rec.id}
                    style={{ opacity: "1", cursor: "pointer" }}
                  >
                    {this.processDraw(rec, rec.id)}
                    <g key={"label" + rec.id}>
                      {displayLabel(rec, rec.id, rec.label && rec.label.color)}
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

export default DrawRectangleComponent;
