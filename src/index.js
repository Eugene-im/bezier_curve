const converter = {
  converterPointsToCanvas(point, canvasWidth, canvasHeight, view = true) {
    return new Point(
      Math.round(point.x * canvasWidth),
      view
        ? Math.round(canvasHeight - point.y * canvasHeight)
        : Math.round(point.y * canvasHeight)
    );
  },
  converterCanvasToPoints(point, canvasWidth, canvasHeight, view = true) {
    return new Point(
      Math.floor((point.x * 100) / canvasWidth) / 100,
      view
        ? Math.floor(((canvasHeight - point.y) * 100) / canvasHeight) / 100
        : Math.floor((point.y * 100) / canvasHeight) / 100
    );
  },
};

// observer

const Observer = {
  aInternal: 0,
  aListener: function (val) {},
  set a(val) {
    this.aInternal = val;
    this.aListener(val);
  },
  get a() {
    return this.aInternal;
  },
  registerListener: function (listener) {
    this.aListener = listener;
  },
};

class Point {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

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
  initData = {};
  shouldUpdateUi = false;
  constructor(initData) {
    if (!initData) {
      throw new Error("pls set init data instance of StorageData");
    }
    this.initData = initData;
  }

  getData() {
    return this.initData;
  }
  getDataForView() {
    let x = JSON.stringify(this.initData);
    return x;
  }
  updateData(storageData) {
    if (JSON.stringify(this.initData) !== JSON.stringify(storageData)) {
      for (let key in storageData) {
        this.initData[key] = storageData[key];
      }
      this.shouldUpdateUi = true;
      Observer.a = this.shouldUpdateUi;
    }
    return undefined;
  }
}

// const storage = new Storage(4, new Point(0, 1), new Point(1, 0));

class Updater {
  elementList = [];
  canvasElementList = [];
  canvas;
  /**
   * @param {Array} elementList
   */
  constructor(elementList, canvasElementList, canvasWidth, canvasHeight) {
    if (!canvasElementList) {
      throw new Error("pls set list of canvas elements for move");
    }
    if (!elementList) {
      throw new Error("pls set list of elements for view output data");
    }
    if (!canvasWidth || !canvasHeight) {
      throw new Error(
        "pls set width and height of element where elements should be updated"
      );
    }
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.elementList = [...elementList];
    this.canvasElementList = [...canvasElementList];
  }
  /**
   * @param {string} data
   */
  update(data) {
    this._updateUi(JSON.stringify(data));
    this._updateCanvasShape(data);
    return undefined;
  }
  _updateUi(dataString) {
    this.elementList.forEach((element) => (element.innerHTML = dataString));
  }
  _updateCanvasShape(dataObj) {
    this.canvasElementList.forEach((shape) => {
      shape.update(dataObj);
      console.error("should implement", dataObj);
    });
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
    throw new Error("Not implemented");
  }
}

class LineShape extends AbstractShape {
  startPoint = new Point(0, 0);
  endPoint = new Point(0, 0);
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

class CurveControlShape extends AbstractShape {
  startPoint = new Point(300, 0);
  endPoint = new Point(0, 0);
  lineWidth = 1;
  lineColor = "#cecece";
  circleWidth = 5;
  circleColor = "#00ff00";
  controlPointNumber = 1;
  constructor(
    startPoint,
    endPoint,
    lineWidth,
    lineColor,
    circleWidth,
    circleColor,
    controlPointNumber
  ) {
    super();
    if (startPoint) this.startPoint = startPoint;
    if (endPoint) this.endPoint = endPoint;
    if (lineWidth) this.lineWidth = lineWidth;
    if (lineColor) this.lineColor = lineColor;
    if (circleWidth) this.circleWidth = circleWidth;
    if (circleColor) this.circleColor = circleColor;
    if (controlPointNumber) this.controlPointNumber = controlPointNumber;
  }
  draw(canvas) {
    canvas.ctx.lineWidth = this.lineWidth;
    canvas.ctx.strokeStyle = this.lineColor;
    canvas.ctx.beginPath();
    canvas.ctx.moveTo(this.startPoint.x, this.startPoint.y);
    canvas.ctx.lineTo(this.endPoint.x, this.endPoint.y);
    canvas.ctx.stroke();
    canvas.ctx.closePath();
    canvas.ctx.beginPath();
    canvas.ctx.arc(
      this.startPoint.x,
      this.startPoint.y,
      this.circleWidth,
      0,
      2 * Math.PI
    );
    canvas.ctx.fillStyle = this.circleColor;
    canvas.ctx.fill();
    canvas.ctx.closePath();
    return undefined;
  }

  update(points) {
    this.startPoint = points[`point${this.controlPointNumber}`];
    return undefined;
  }
}

class CurveShape extends AbstractShape {
  startPoint = new Point(0, 0);
  endPoint = new Point(1, 1);
  controlPoints = { point1: new Point(1, 0), point2: new Point(0, 1) };
  lineWidth = 7;
  color = "#0000ff";
  animationDuration = 4;
  scalable = true;
  canvasWidth = 0;
  canvasHeight = 0;
  constructor(controlPoints, lineWidth, color) {
    super();
    if (controlPoints) this.controlPoints = controlPoints;
    if (lineWidth) this.lineWidth = lineWidth;
    if (color) this.color = color;
  }

  draw(canvas) {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    canvas.ctx.lineWidth = this.lineWidth;
    canvas.ctx.strokeStyle = this.color;
    canvas.ctx.beginPath();
    this.getCurvePoints((canvas.width + canvas.height) / 2).forEach((point) => {
      const pointForCurve = converter.converterPointsToCanvas(
        point,
        canvas.width,
        canvas.height,
        true
      );
      canvas.ctx.lineTo(
        pointForCurve.x, // / 2 + canvas.width / 4,
        pointForCurve.y // / 2 + canvas.height / 4
      );
    });
    canvas.ctx.stroke();
    canvas.ctx.closePath();
    return undefined;
  }

  update(controlPoints) {
    let point1 = converter.converterCanvasToPoints(
      controlPoints.point1,
      this.canvasWidth,
      this.canvasHeight
    );
    let point2 = converter.converterCanvasToPoints(
      controlPoints.point2,
      this.canvasWidth,
      this.canvasHeight
    );
    this.controlPoints = { point1, point2 };
    return undefined;
  }

  cube(i, axis) {
    // P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
    const p1 = Math.pow(1 - i, 3) * this.startPoint[axis];
    const p2 = 3 * Math.pow(1 - i, 2) * i * this.controlPoints.point1[axis];
    const p3 = 3 * (1 - i) * Math.pow(i, 2) * this.controlPoints.point2[axis];
    const p4 = Math.pow(i, 3) * this.endPoint[axis];
    return p1 + p2 + p3 + p4;
  }
  getCurvePoints(canvasWidth = 100) {
    let array = [];
    for (let i = 1; i > 0; i -= this.animationDuration / canvasWidth) {
      array.push(new Point(this.cube(i, "x"), this.cube(i, "y")));
    }
    array.push(new Point(0, 0));
    return array;
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
    if (!domNode.width || !domNode.height) {
      throw new Error("be sure that canvas element has width and height");
    }
    this.domNode = domNode;
    this.width = domNode.width;
    this.height = domNode.height;
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
  addToListElementForDraw(shape) {
    this.existingShapes.add(shape);
  }
}

class InputCanvasElement extends CanvasElement {
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

  arrayOfControllingPrimitiveShape = [];
  storageElem;

  /**
   * @param {HTMLCanvasElement} domNode Canvas element
   */

  constructor(domNode, arrayOfControllingPrimitiveShape, storageElem) {
    super(domNode);
    if (!arrayOfControllingPrimitiveShape) {
      throw new Error("pls set list of elements for control animation");
    }
    if (!storageElem) {
      throw new Error("pls set storage for save output data");
    }
    this.arrayOfControllingPrimitiveShape = arrayOfControllingPrimitiveShape;
    this.storageElem = storageElem;
    this._subscribe();
  }

  _subscribe() {
    // this.domNode.addEventListener("click", this._onCanvasClick.bind(this));
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
  //   _onCanvasClick(ev) {}

  _getMousePos(canvas, ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ev?.clientX - rect.left;
    const y = ev?.clientY - rect.top;
    return new Point(x, y);
  }
  _compareMousePlace(point) {
    this.arrayOfControllingPrimitiveShape.forEach((controlShape, index) => {
      const { startPoint, circleWidth } = controlShape;

      const compare =
        point.x >= startPoint.x - 4 * circleWidth &&
        point.x <= startPoint.x + 4 * circleWidth &&
        point.y >= startPoint.y - 4 * circleWidth &&
        point.y <= startPoint.y + 4 * circleWidth;
      if (compare) {
        this.activeDotIndex = index;
      }
    });
    return undefined;
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
     * 3. update output dots pos
     * **/
    if (this.isDown) {
      const hittedControlPointCoords = this._getMousePos(this.domNode, ev);
      if (this.activeDotIndex === -1) {
        let x = this._compareMousePlace(hittedControlPointCoords);
      }
      if (this.activeDotIndex !== -1) {
        let copyStorageData = { ...this.storageElem.initData };

        let whichControlActive = `point${this.activeDotIndex + 1}`;
        copyStorageData[whichControlActive] = hittedControlPointCoords;
        this.storageElem.updateData(copyStorageData);
        // TODO add here update for all
        this.drawShape();
      }
    }
    return undefined;
  }

  _onCanvasMouseDown(ev) {
    this.isDown = true;
  }

  _resetSelection() {
    this.isDown = false;
    this.activeDotIndex = -1;
  }
}

// document.addEventListener();
// function timeInputUpdated(event) {
//     setTimeout(() => {
//       const seconds = Number(event.target.value);
//       if (seconds <= 0 || seconds >= 10) return;
//       defTimePreset = +event.target.value;
//       updateAnimation(circle, defTimePreset, defDotPreset);
//     }, 400);
//   }

(() => {
  // copyButton.addEventListener("click", copyBezierPreset);
  //   const converter = new Converter();

  const domeNodeOutput = document.getElementById("output");
  const domeNodeCanvasDynamic = document.getElementById("canvasDynamic");
  const domeNodeCanvasStatic = document.getElementById("canvasStatic");
  
  const staticCanvas = new CanvasElement(domeNodeCanvasStatic);
  const backLine = new LineShape(
    new Point(20, 0),
    new Point(20, staticCanvas.height)
  );
  const backLine2 = new LineShape(
    new Point(0, 20),
    new Point(staticCanvas.width, 20)
  );
  staticCanvas.addToListElementForDraw(backLine);
  staticCanvas.addToListElementForDraw(backLine2);
  staticCanvas.drawShape();


  const initDataPoints = new StorageData(
    new Point(0, 0),
    new Point(300, 300),
    4
  );
  const dataStorage = new StorageImplementation(initDataPoints);


  const curve = new CurveShape();
  const control = new CurveControlShape(
    initDataPoints.point1,
    new Point(0, 300)
  );
  const control2 = new CurveControlShape(
    initDataPoints.point2,
    new Point(300, 0),
    4,
    "#000",
    5,
    "#00f",
    2
  );

  const updater = new Updater(
    [domeNodeOutput],
    [control, control2, curve],
    domeNodeCanvasDynamic.width,
    domeNodeCanvasDynamic.height
  );


  const dynamicCanvas = new InputCanvasElement(
    domeNodeCanvasDynamic,
    [control, control2],
    dataStorage
  );

  dynamicCanvas.addToListElementForDraw(curve);
  dynamicCanvas.addToListElementForDraw(control);
  dynamicCanvas.addToListElementForDraw(control2);


  dynamicCanvas.drawShape();

  const someFunc = function (shouldUpdateUi) {
    updater.update(dataStorage.initData);
  };

  Observer.registerListener(someFunc);

  //   let i = 0;
  //   domeNodeCanvasDynamic.addEventListener("click", function (event) {
  //     const initDataPoints2 = new StorageData(
  //       new Point(1 + i, 1 + i),
  //       new Point(2 + 2 * i, 2 + 3 * i),
  //       5
  //     );
  //     circle.update(new Point(40 + i, 40 + i));
  //     circle2.update(new Point(250 - i, 250 - i));
  //     dynamicCanvas.drawShape();
  //     i += 10;
  //     dataStorage.updateData(initDataPoints2);
  //   });
})();
