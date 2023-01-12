(() => {
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
    update(userPoint1, userPoint2) {
      this.point2 = userPoint1;
      this.point3 = userPoint2;
    }
    qube(i, axis) {
      // P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
      const p1 = Math.pow(1 - i, 3) * this.point1[axis];
      const p2 = 3 * Math.pow(1 - i, 2) * i * this.point2[axis];
      const p3 = 3 * (1 - i) * Math.pow(i, 2) * this.point3[axis];
      const p4 = Math.pow(i, 3) * this.point4[axis];
      return p1 + p2 + p3 + p4;
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

  // variables
  let isDown = false;
  let defDotPreset = [new Point(0.1, 0.8), new Point(0.8, 0.1)];
  let activeDotIndex = -1;
  let defTimePreset = 4;

  // consts
  const color = {};
  color.controlLine = "#000000";
  color.controlCircle = "#00ff00";
  color.controlCircleActive = "#ff0000";
  color.curve = "#0d6efd";
  color.bacLines = "#cecece";

  const width = {};
  width.point = 6;
  width.curve = 7;

  // dom elements
  const copyButton = document.getElementById("copy");
  const copyButtonIcon = document.querySelector("#copy .bi");
  const canvas = document.getElementById("canvas");
  const canvasBack = document.getElementById("canvasBack");
  const inputTime = document.getElementById("duration");
  const output = document.querySelector(".output");
  const radiobuttons = document.querySelectorAll(
    '[name="selectTypeOfAnimation"]'
  );
  const circle = document.querySelector(".circle");

  // functions
  // manipulation with elements
  function buttonManipulate(element) {
    element.classList.replace("bi-clipboard", "bi-clipboard-plus");
    setTimeout(() => {
      element.classList.replace("bi-clipboard-plus", "bi-clipboard");
    }, 700);
  }

  function updateOtput(element, defDotPreset) {
    element.innerText = `${defDotPreset[0].x} ${defDotPreset[0].y} ${defDotPreset[1].x} ${defDotPreset[1].y}`;
  }

  function updateAnimation(element, time, defDotPreset) {
    element.style = `animation-duration:${time}s; animation-timing-function:cubic-bezier(${defDotPreset[0].x}, ${defDotPreset[0].y}, ${defDotPreset[1].x}, ${defDotPreset[1].y})`;
  }

  //ui manipulation
  function copyBezierPreset() {
    navigator.clipboard.writeText(
      `cubic-bezier(${defDotPreset[0].x}, ${defDotPreset[0].y}, ${defDotPreset[1].x}, ${defDotPreset[1].y})`
    );
    buttonManipulate(copyButtonIcon);
  }

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const x = evt?.clientX - rect.left;
    const y = evt?.clientY - rect.top;
    return new Point(x, y);
  }

  function compareMousePlase(point, controlDotIndex) {
    let dot = converterPointsToCanvas(
      defDotPreset[controlDotIndex],
      canvas,
      true
    );
    return (
      point.x >= dot.x - 4 * width.point &&
      point.x <= dot.x + 4 * width.point &&
      point.y >= dot.y - 4 * width.point &&
      point.y <= dot.y + 4 * width.point
    );
  }

  //data manipulation

  function updateDotsPositionPreset(point, index, defDotPreset) {
    const dot = converterCanvasToPoints(point, canvas);
    defDotPreset[index] = new Point(dot.x, dot.y);
  }

  function resetSelection() {
    isDown = false;
    activeDotIndex = -1;
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
  const amaizingCurve = new Curve(defDotPreset[0], defDotPreset[1]);

  function drawCurve(canvas, pos = defDotPreset) {
    const convertedControlPoint1 = converterPointsToCanvas(pos[0], canvas);
    const convertedControlPoint2 = converterPointsToCanvas(pos[1], canvas);
    amaizingCurve.update(pos[0], pos[1]);
    const pointsArray = amaizingCurve.getCurvePoints(defTimePreset);
    const startPoint1 = converterPointsToCanvas(
      pointsArray[pointsArray.length - 1],
      canvas
    );
    const startPoint2 = converterPointsToCanvas(pointsArray[0], canvas);
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");

      // clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.arc(
        convertedControlPoint2.x,
        convertedControlPoint2.y,
        width.point,
        0,
        2 * Math.PI
      );

      //curve
      // ctx.bezierCurveTo(0, 300, 150, 0, 300, 0);
      ctx.beginPath();
      ctx.strokeStyle = color.curve;
      ctx.lineWidth = width.curve;
      pointsArray.forEach((point) => {
        const pointForCurve = converterPointsToCanvas(point, canvas);
        ctx.lineTo(
          pointForCurve.x, // / 2 + canvas.width / 4,
          pointForCurve.y // / 2 + canvas.height / 4
        );
      });
      ctx.stroke();
      ctx.closePath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = color.controlLine;
      ctx.beginPath();
      ctx.moveTo(startPoint1.x, startPoint1.y);
      ctx.lineTo(convertedControlPoint1.x, convertedControlPoint1.y);
      ctx.stroke();
      ctx.moveTo(startPoint2.x, startPoint2.y);
      ctx.lineTo(convertedControlPoint2.x, convertedControlPoint2.y);
      ctx.stroke();
      ctx.closePath();
      ctx.fillStyle = color.controlCircle;
      ctx.strokeStyle =
        activeDotIndex === 1 ? color.controlCircleActive : color.controlCircle;
      ctx.beginPath();
      ctx.arc(
        convertedControlPoint2.x,
        convertedControlPoint2.y,
        width.point,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
      ctx.strokeStyle =
        activeDotIndex === 0 ? color.controlCircleActive : color.controlCircle;
      ctx.beginPath();
      ctx.arc(
        convertedControlPoint1.x,
        convertedControlPoint1.y,
        width.point,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }
  }

  function drawBack(canvas) {
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");
      // clear canvas
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color.bacLines;

      //line
      const line = new Path2D();
      for (let i = 0; i < canvas.width; i += canvas.width / 10) {
        line.moveTo(i, 0);
        line.lineTo(i, canvas.height);
      }
      for (let i = 0; i < canvas.height; i += canvas.height / 10) {
        line.moveTo(0, i);
        line.lineTo(canvas.width, i);
      }

      ctx.stroke(line);
      ctx.closePath();
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
    const userPointsPreset = event.target.value.split(", ");
    const controlPointsCoords = [
      new Point(userPointsPreset[0], userPointsPreset[1]),
      new Point(userPointsPreset[2], userPointsPreset[3])
    ];
    defDotPreset[0] = controlPointsCoords[0];
    defDotPreset[1] = controlPointsCoords[1];
    updateOtput(output, defDotPreset);
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
    if (isDown) {
      const hittedControlPointCoords = getMousePos(canvas, event);
      if (activeDotIndex === -1) {
        const firstControlActive = compareMousePlase(
          hittedControlPointCoords,
          0
        );
        const secondControlActive = compareMousePlase(
          hittedControlPointCoords,
          1
        );
        if (!firstControlActive && !secondControlActive) {
          activeDotIndex = -1;
          return;
        }
        if (firstControlActive) activeDotIndex = 0;
        if (secondControlActive) activeDotIndex = 1;
      }
      updateDotsPositionPreset(
        hittedControlPointCoords,
        activeDotIndex,
        defDotPreset
      );
      updateOtput(output, defDotPreset);
      drawCurve(canvas);
      updateAnimation(circle, defTimePreset, defDotPreset);
    }
  }

  function timeInputUpdated(event) {
    setTimeout(() => {
      const seconds = Number(event.target.value);
      if (seconds <= 0 || seconds >= 10) return;
      defTimePreset = +event.target.value;
      updateAnimation(circle, defTimePreset, defDotPreset);
    }, 400);
  }

  //eventlisteners
  canvas.addEventListener("mousedown", function () {
    isDown = true;
  });

  canvas.addEventListener("mouseup", resetSelection);

  canvas.addEventListener("mouseleave", resetSelection);

  canvas.addEventListener("mousemove", controllDotChagePosition);

  inputTime.addEventListener("change", timeInputUpdated);

  radiobuttons.forEach((radioButton) => {
    radioButton.addEventListener("click", radiobuttonChangeHandler);
  });

  copyButton.addEventListener("click", copyBezierPreset);

  function afterLoad() {
    document.getElementById("global").classList.remove("loading-skeleton");
    drawCurve(canvas);
    drawBack(canvasBack);
    updateOtput(output, defDotPreset);
  }

  afterLoad();
})();
