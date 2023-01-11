class Point {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
// class Coordinates {
//   data = [];
//   constructor(point1, point2) {
//     this.data.push(point1);
//     this.data.push(point2);
//   }
// }

class StorageData {
  time = 0;
  point1 = {};
  point2 = {};
  constructor(point1, point2, time) {
    if (point1) {
      this.point1 = point1;
    }
    if (point2) {
      this.point2 = point2;
    }
    if (time) this.time = time;
  }
}

class StorageImplementation {
  data = {};
  constructor(storageDataElement) {
    this.data = storageDataElement;
  }
  getData() {
    return this.data;
  }
  getDataForView() {
    let outString = "";
    Object.keys(this.data)
      .filter((key) => key !== "time")
      .forEach(
        (key) => (outString += `${this.data[key].x}, ${this.data[key].y}, `)
      );
    outString.trim();
    return {
      time: this.data.time,
      points: this.data.points,
      combinedCoordinates: outString,
    };
  }
  updateData(storageData) {
    this.data = storageData;
    //call observer
    observer.updateState(this.getData());
  }
}

class Observer {
  initElementDataState = {};
  outputElementUpdater;
  constructor(element, outputElementUpdater) {
    this.initElementState = element.getData();
    // this.initElementState = element.data;
    this.outputElementUpdater = outputElementUpdater;
  }
  updateState(elementDataState) {
    let shouldUpdate = false;
    if (
      JSON.stringify(this.initElementDataState) !==
      JSON.stringify(elementDataState)
    ) {
      for (let key in elementDataState) {
        this.initElementDataState[key] = elementDataState[key];
      }
      shouldUpdate = true;
    }
    if (shouldUpdate) this._updateUi();
  }
  _updateUi() {
    console.error("should implement");
    // TODO make it clear
    this.outputElementUpdater.update(
      dataStorage.getDataForView().combinedCoordinates
    );
  }
}

// const storage = new Storage(4, new Point(0, 1), new Point(1, 0));

class UpdateOutputUi {
  elementList = [];
  /**
   * @param {Array} elementList
   */
  constructor(elementList) {
    this.elementList = [...elementList];
  }
  /**
   * @param {string} data
   */
  update(data) {
    this.elementList.forEach((element) => (element.innerHTML = data));
  }
}

// here should be some observer which will look on storage.data and when they changed call
// https://learn.javascript.ru/mutation-observer
// const otput1 = document.getElementById('output1')
// const otput2 = document.getElementById('output2')
// const outputUiElemsList = new UpdateOutputUi([output1,output2]);
// outputUiElemsList.update(data.getData())

class InputData {
  data;

  constructor(data) {
    this.data;
  }

  getData() {
    return this.data;
  }

  updateStorage(storage) {
    storage.updateData(this.data);
  }
}

/**
 * @abstract
 */
class AbstractShape {
  /**
   * @abstract
   * @param {Canvas} canvas
   */
  draw(canvas) {
    throw new Error("Not implemented");
  }

  /**
   * @abstract
   * @param {Canvas} canvas
   */
  update(canvas) {
    // https://stackoverflow.com/questions/30738717/javascript-canvas-clear-redraw
  }
}

class CircleShape extends AbstractShape {
  centerCoordinates = new Point(0, 0);
  circleWidth = 6;
  color = "#00ff00";
  constructor(centerCoordinates, circleWidth, color) {
    super();
    this.centerCoordinates = { ...centerCoordinates };
    this.circleWidth = circleWidth;
    this.color = color;
  }

  draw(canvas) {
    canvas.ctx.beginPath();
    canvas.ctx.arc(
      this.centerCoordinates.x,
      this.centerCoordinates.y,
      this.circleWidth,
      0,
      2 * Math.PI
    );
    canvas.ctx.fillStyle = this.color;
    canvas.ctx.fill();
    canvas.ctx.closePath();

    return undefined;
  }

  update(centerCoordinates) {
    this.centerCoordinates = centerCoordinates;
    return undefined;
  }
}
// https://stackoverflow.com/questions/30738717/javascript-canvas-clear-redraw

class LineShape extends AbstractShape {
  startPoint = new Point(0, 0);
  endPoint = new Point(1, 1);
  lineWidth = 1;
  color = "#cecece";
  constructor(startPoint, endPoint, lineWidth, color) {
    super();
    if (startPoint) this.startPoint = startPoint;
    if (endPoint) this.endPoint = endPoint;
    if (lineWidth) this.lineWidth = lineWidth;
    if (color) this.color = color;
  }

  draw(canvas) {
    canvas.ctx.lineWidth = this.lineWidth;
    canvas.ctx.strokeStyle = this.color;
    canvas.ctx.beginPath();
    canvas.ctx.moveTo(this.startPoint.x, this.startPoint.y);
    canvas.ctx.lineTo(this.endPoint.x, this.endPoint.y);
    canvas.ctx.stroke();
    canvas.ctx.closePath();
    return undefined;
  }

  update(startPoint, endPoint) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    return undefined;
  }
}

class CanvasElement {
  /**
   * @type {CanvasRenderingContext2D}
   */
  ctx;

  /**
   * @type {HTMLCanvasElement}
   */
  domNode;

  /**
   * @type {Set<AbstractShape>}
   */
  existingShapes = new Set();

  width = 0;
  height = 0;

  constructor(domNode) {
    if (!domNode.getContext) {
      throw new Error("domeNode is not canvas");
    }
    this.domNode = domNode;
    this.width = domNode.width;
    this.height = domNode.height;
    this._init();
  }

  _init() {
    this.ctx = this.domNode.getContext("2d");
  }

  /**
   *
   * @param {AbstractShape} shape
   */
  drawShape() {
    this.ctx.clearRect(0, 0, this.domNode.width, this.domNode.height);
    this.existingShapes.forEach((shape) => {
      shape.draw(this);
    });
  }
  addElementForDrawToList(shape) {
    this.existingShapes.add(shape);
  }
}

// const CanvasWrapperClass = (superClass) => {return class CanvasElement extends superClass};
// const PaintInputWrapperClass = (superClass) => class PainterInput extends superClass;
// class Base {} // some base class to keep the arrow functions simple
// var A = (superclass) => class A extends superclass
// var B = (superclass) => class B extends superclass
// var C = B(A(Base))
// var D = B(Base)

class PainterInput extends InputData {
  // TODO should we implement local params data and methods getData and update?
  /**
   * @type {CanvasRenderingContext2D}
   */
  ctx;

  /**
   * @type {HTMLCanvasElement}
   */
  domNode;

  /**
   * @type {boolean} isDown if mouse key pressed down
   */
  isDown = false;

  /**
   * @type {number} activeDotIndex number of currently active controlDot
   * possible value -1|0|1
   * default value -1
   */
  activeDotIndex = -1;

  defDotPreset = [new Point(0, 1), new Point(1, 0)];

  /**
   * @param {HTMLCanvasElement} domNode Canvas element
   */

  constructor(domNode, defDotPreset) {
    if (!domNode.getContext) {
      throw new Error("domeNode is not canvas");
    }
    this.domNode = domNode;
    this.defDotPreset = { ...defDotPreset };
    this._subscribe();
  }

  _subscribe() {
    this.domNode.addEventListener("click", this._onCanvasClick.bind(this));
    this.domNode.addEventListener(
      "mousedown",
      this._onCanvasMouseDown.bind(this)
    );
    this.domNode.addEventListener("mouseup", this._resetSelection.bind(this));
    this.domNode.addEventListener(
      "mouseleave",
      this._resetSelection.bind(this)
    );
    this.domNode.addEventListener(
      "mousemove",
      this._controlDotChangePosition.bind(this)
    );
  }

  /**
   *
   * @param {Event} ev
   * @private
   */
  _onCanvasClick(ev) {}

  _getMousePos(canvas, ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ev?.clientX - rect.left;
    const y = ev?.clientY - rect.top;
    return new Point(x, y);
  }
  _compareMousePlace(point, controlDotIndex) {
    let dot = converterPointsToCanvas(
      this.defDotPreset[controlDotIndex],
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
  /**
   *
   * @param {Event} ev
   * @private
   */
  _controlDotChangePosition(ev) {
    /**
     * 1. get mouse coordinates
     * 2. choose which dot moved
     * 3. update dots pos
     * 4. update output dots pos
     * 5. redraw curve
     * 6. update animation
     * **/
    if (this.isDown) {
      const hittedControlPointCoords = this._getMousePos(this.domNode, ev);
      if (this.activeDotIndex === -1) {
        // this.defDotPreset.data.forEach((coordinate, index) =>
        //   this._compareMousePlace(hittedControlPointCoords, index)
        // );
        const firstControlActive = this._compareMousePlace(
          hittedControlPointCoords,
          0
        );
        const secondControlActive = this._compareMousePlace(
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
      this.updateDotsPositionPreset(hittedControlPointCoords, activeDotIndex);
      //   this . ??????? drawCurve(canvas);

      // for observer
      //   updateOtput(output, defDotPreset);
      //   updateAnimation(circle, defTimePreset, defDotPreset);
    }
  }
  updateDotsPositionPreset(point, index) {
    this.defDotPreset[index] = { ...point };
  }

  _onCanvasMouseDown(ev) {
    this.isDown = true;
  }

  _resetSelection() {
    this.isDown = false;
    this.activeDotIndex = -1;
  }
}

//for case radiobutton call
// const canvasInput = new PainterInput(........)
// canvasInput.updateDotsPositionPreset()
//for case canvas redraw call
// the same? but under the class will be called canvasInput._controlDotChangePosition()

// document.addEventListener();
// function timeInputUpdated(event) {
//     setTimeout(() => {
//       const seconds = Number(event.target.value);
//       if (seconds <= 0 || seconds >= 10) return;
//       defTimePreset = +event.target.value;
//       updateAnimation(circle, defTimePreset, defDotPreset);
//     }, 400);
//   }

// copyButton.addEventListener("click", copyBezierPreset);
const domeNodeOutput = document.getElementById("output");

const domeNodeCanvasDynamic = document.getElementById("canvasDynamic");
const dynamicCanvas = new CanvasElement(domeNodeCanvasDynamic);

const domeNodeCanvasStatic = document.getElementById("canvasStatic");
const staticCanvas = new CanvasElement(domeNodeCanvasStatic);

const circle = new CircleShape(new Point(30, 30), 20, "#000");
const circle2 = new CircleShape(new Point(260, 260), 20, "#0f0");

const line = new LineShape(
  new Point(20, 20),
  new Point(staticCanvas.width, staticCanvas.height)
);

dynamicCanvas.addElementForDrawToList(circle);
dynamicCanvas.addElementForDrawToList(circle2);

staticCanvas.addElementForDrawToList(line);

dynamicCanvas.drawShape();
staticCanvas.drawShape();

const initDataPoints = new StorageData(new Point(0, 1), new Point(2, 1), 4);

const dataStorage = new StorageImplementation(initDataPoints);
const updater = new UpdateOutputUi([domeNodeOutput]);
const observer = new Observer(dataStorage, updater);

let i = 0;
domeNodeCanvasDynamic.addEventListener("click", function (event) {
  const initDataPoints2 = new StorageData(
    new Point(1 + i, 1 + i),
    new Point(2 + 2 * i, 2 + 3 * i),
    5
  );
  circle.update(new Point(40 + i, 40 + i));
  circle2.update(new Point(250 - i, 250 - i));
  dynamicCanvas.drawShape();
  i += 10;
  dataStorage.updateData(initDataPoints2);
});
