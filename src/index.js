class Point {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Storage {
  time = 0;
  point1 = new Point();
  point2 = new Point();
  constructor(point1, point2, time) {
    this.point1 = point1;
    this.point2 = point2;
    this.time = time;
  }
  getData() {
    return {
      time: this.time,
      coordinates: `${this.point1.x}, ${this.point1.y}, ${this.point2.x}, ${this.point2.y}`,
    };
  }
  updateData(point1, point2, time) {
    if (point1) this.point1 = point1;
    if (point1) this.point2 = point2;
    if (time) this.time = time;
    return this.getData();
  }
}

const storage = new Storage(4, new Point(0, 1), new Point(1, 0));

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

// const radio

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
   * @type {Set<AbstractShape>}
   */
  existingShapes = new Set();

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

  /**
   * @param {HTMLCanvasElement} domNode Canvas element
   */

  constructor(domNode) {
    if (!domNode.getContext) {
      throw new Error("domeNode is not canvas");
    }
    this.domNode = domNode;
    this._init();
    this._subscribe();
  }

  _init() {
    this.ctx = this.domNode.getContext("2d");
    this.ctx.clearRect(0, 0, this.domNode.width, this.domNode.height);
  }

  _subscribe() {
    this.domNode.addEventListener("click", this._onCanvasClick.bind(this));
    this.domNode.addEventListener("mousedown", this._onCanvasClick.bind(this));
    this.domNode.addEventListener("mouseup", this._onCanvasClick.bind(this));
    this.domNode.addEventListener("mouseleave", this._onCanvasClick.bind(this));
    this.domNode.addEventListener("mouseenter", this._onCanvasClick.bind(this));
  }

  /**
   *
   * @param {Event} ev
   * @private
   */
  _onCanvasClick(ev) {}

  /**
   *
   * @param {AbstractShape} shape
   */
  drawShape(shape) {
    if (this.existingShapes.has(shape)) {
      shape.update(this);
      return;
    }

    this.existingShapes.add(shape);
    shape.draw(this);
  }

  resetSelection() {
    this.isDown = false;
    this.activeDotIndex = -1;
  }
}

// document.addEventListener();
