// logic and classes
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Curve {
  constructor(userPoint1, userPoint2) {
    this.point2 = userPoint1;
    this.point3 = userPoint2;
    this.point1 = new Point(0, 0);
    this.point4 = new Point(1, 1);
  }
  qube(i, x) {
    // P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
    return (
      Math.pow(1 - i, 3) * this.point1[x] +
      3 * Math.pow(1 - i, 2) * i * this.point2[x] +
      3 * (1 - i) * Math.pow(i, 2) * this.point3[x] +
      Math.pow(i, 3) * this.point4[x]
    );
  }
  getCurvePoints(seconds = 4) {
    let array = [];
    for (let i = 1; i > 0; i -= seconds / 100) {
      let x = this.qube(i, "x");
      let y = this.qube(i, "y");
      let dot = new Point(x, y);
      array.push(dot);
    }
    array.push(new Point(0, 0));
    return array;
  }
}

// functions
// manipulation with elements
function updateOtput() {
  output.innerText = `${defDotPreset[0].x} ${defDotPreset[0].y} ${defDotPreset[1].x} ${defDotPreset[1].y}`;
}

function updateAnimation(element, time, defDotPreset) {
  element.style = `animation-duration:${time}s;animation-timing-function:cubic-bezier(${defDotPreset[0].x}, ${defDotPreset[0].y}, ${defDotPreset[1].x}, ${defDotPreset[1].y})`;
}
function controlDotHitTest(point, controlDotIndex) {
  let dot = converterPointsToCanvas(
    defDotPreset[controlDotIndex],
    canvas,
    true
  );
  return (
    point.x >= dot.x - 4 * dotDiametr &&
    point.x <= dot.x + 4 * dotDiametr &&
    point.y >= dot.y - 4 * dotDiametr &&
    point.y <= dot.y + 4 * dotDiametr
  );
}

function updateDotsPositionPreset(point, index, defDotPreset) {
  let dot = converterCanvasToPoints(point, canvas);
  defDotPreset[index] = new Point(dot.x, dot.y);
}

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  let x = evt?.clientX - rect.left;
  let y = evt?.clientY - rect.top;
  return new Point(x, y);
}

//converters

function converterCanvasToPoints(point, canvas, view = true) {
  return new Point(
    Math.floor((point.x * 100) / canvas.width) / 100,
    view
      ? Math.floor(((canvas.height - point.y) * 100) / canvas.height) / 100
      : Math.floor((point.y * 100) / canvas.height) / 100
  );
}

function converterPointsToCanvas(point, canvas, view = true) {
  return new Point(
    Math.round(point.x * canvas.width),
    view
      ? Math.round(canvas.height - point.y * canvas.height)
      : Math.round(point.y * canvas.height)
  );
}

//manipulation with canvas

function drawCurve(canvas, pos = defDotPreset) {
  let convertedControlPoint1 = converterPointsToCanvas(pos[0], canvas);
  let convertedControlPoint2 = converterPointsToCanvas(pos[1], canvas);
  let amaizingCurve = new Curve(pos[0], pos[1]);
  let pointsArray = amaizingCurve.getCurvePoints(defTimePreset);
  if (canvas.getContext) {
    let ctx = canvas.getContext("2d");

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //line
    let line1 = new Path2D();
    let startPoint1 = converterPointsToCanvas(
      pointsArray[pointsArray.length - 1],
      canvas
    );
    line1.moveTo(startPoint1.x, startPoint1.y);
    line1.lineTo(convertedControlPoint1.x, convertedControlPoint1.y);

    let line2 = new Path2D();
    let startPoint2 = converterPointsToCanvas(pointsArray[0], canvas);
    line2.moveTo(startPoint2.x, startPoint2.y);
    line2.lineTo(convertedControlPoint2.x, convertedControlPoint2.y);
    // line1.closePath();

    //circle
    let circle1 = new Path2D();
    circle1.arc(
      convertedControlPoint1.x,
      convertedControlPoint1.y,
      dotDiametr,
      0,
      2 * Math.PI
    );
    let circle2 = new Path2D();
    circle2.arc(
      convertedControlPoint2.x,
      convertedControlPoint2.y,
      dotDiametr,
      0,
      2 * Math.PI
    );

    //curve
    // ctx.bezierCurveTo(0, 300, 150, 0, 300, 0);
    let curve = new Path2D();
    pointsArray.forEach((point) => {
      let pointForCurve = converterPointsToCanvas(point, canvas);
      curve.lineTo(pointForCurve.x, pointForCurve.y);
    });
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 7;
    ctx.stroke(curve);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.stroke(line1);
    ctx.stroke(line2);
    ctx.fillStyle = "#00ff00";
    ctx.strokeStyle = activeDotIndex === 1 ? "#ff0000" : "#00ff00";
    ctx.stroke(circle2);
    ctx.fill(circle2);
    ctx.strokeStyle = activeDotIndex === 0 ? "#ff0000" : "#00ff00";
    ctx.stroke(circle1);
    ctx.fill(circle1);
  }
}

// actions || fuctions chains
function radiobuttonChangeHandler(event) {
  /**
   * 1. get presetted coordinates
   * 2. update dots pos
   * 4. update output dots pos
   * 5. redraw curve
   * 6. update animation
   * **/
  let userPointsPreset = event.target.value.split(" ");
  let controlPointsCoords = [
    new Point(userPointsPreset[0], userPointsPreset[1]),
    new Point(userPointsPreset[2], userPointsPreset[3])
  ];
  updateDotsPositionPreset(controlPointsCoords[0], 0, defDotPreset);
  updateDotsPositionPreset(controlPointsCoords[1], 1, defDotPreset);
  updateOtput();
  drawCurve(canvas);
  updateAnimation(circle, defTimePreset, defDotPreset);
}

function controllDotChagePosition(event) {
  /**
   * 1. get mouse coordinates
   * 2. choose which dot moved
   * 3. update dots pos
   * 4. update output dots pos
   * 5. redraw curve
   * 6. update animation
   * **/
  if (down) {
    let hittedControlPointCoords = getMousePos(canvas, event);
    if (activeDotIndex === -1) {
      let a = controlDotHitTest(hittedControlPointCoords, 0);
      let b = controlDotHitTest(hittedControlPointCoords, 1);
      if (!a && !b) {
        activeDotIndex = -1;
        return;
      }
      if (a) activeDotIndex = 0;
      if (b) activeDotIndex = 1;
    }
    updateDotsPositionPreset(
      hittedControlPointCoords,
      activeDotIndex,
      defDotPreset
    );
    updateOtput();
    drawCurve(canvas);
    updateAnimation(circle, defTimePreset, defDotPreset);
  }
}

function timeInputUpdated(event) {
  setTimeout(() => {
    defTimePreset = event.target.value;
    updateAnimation();
  }, 400);
}

// variables
let down = false;
let defDotPreset = [new Point(0.1, 0.8), new Point(0.8, 0.1)];
let activeDotIndex = -1;
let defTimePreset = 4;
const dotDiametr = 6;

// dom elements
let canvas = document.getElementById("canvas");
let inputTime = document.getElementById("duration");
let output = document.querySelectorAll(".output")[0];
let radiobuttons = [
  ...document.querySelectorAll('[name="selectTypeOfAnimation"]')
];
let circle = document.getElementsByClassName("circle")[0];

//eventlisteners
canvas.addEventListener("mousedown", function () {
  down = true;
});

canvas.addEventListener("mouseup", function () {
  down = false;
  activeDotIndex = -1;
});

canvas.addEventListener("mousemove", controllDotChagePosition);

inputTime.addEventListener("change", timeInputUpdated);

radiobuttons.forEach((radioButton) => {
  radioButton.addEventListener("click", radiobuttonChangeHandler);
});

// first drow
drawCurve(canvas);
