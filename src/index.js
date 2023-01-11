class Point {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Coordinates {
  data = [];
  constructor(point1, point2) {
    this.data.push(point1);
    this.data.push(point2);
  }
}

class Storage {
  time = 0;
  point1 = new Point();
  point2 = new Point();
  constructor(coordinates, time) {
    this.point1 = coordinates[0];
    this.point2 = coordinates[1];
    this.time = time;
  }
  getData() {
    return {
      time: this.time,
      coordinates: [this.point1, this.point2],
      combined: `${this.point1.x}, ${this.point1.y}, ${this.point2.x}, ${this.point2.y}`,
    };
  }
  updateData(point1, point2, time) {
    if (point1) this.point1 = point1;
    if (point1) this.point2 = point2;
    if (time) this.time = time;
    return this.getData();
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
export class AbstractShape {
    /**
     * @abstract
     * @param {Canvas} canvas
     */
    draw(canvas) {
        throw new Error('Not implemented')
    }

    /**
     * @abstract
     * @param {Canvas} canvas
     */
    update(canvas) {
        // https://stackoverflow.com/questions/30738717/javascript-canvas-clear-redraw
    }
}

export class CircleShape extends AbstractShape {
    constructor() {
        super();

    }

    draw(canvas) {
        canvas.ctx.stroke()

        return undefined;
    }


    update(canvas) {
        // canvas.ctx.sss
        // https://stackoverflow.com/questions/30738717/javascript-canvas-clear-redraw
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

  constructor(domNode) {
    if (!domNode.getContext) {
      throw new Error("domeNode is not canvas");
    }
    this.domNode = domNode;
    this._init();
    //   this._subscribe();
  }

  _init() {
    this.ctx = this.domNode.getContext("2d");
    //   this.ctx.clearRect(0, 0, this.domNode.width, this.domNode.height);
  }

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

  defDotPreset = new Coordinates(new Point(0, 1), new Point(1, 0));

  /**
   * @param {HTMLCanvasElement} domNode Canvas element
   */

  constructor(domNode, defDotPreset) {
    if (!domNode.getContext) {
      throw new Error("domeNode is not canvas");
    }
    this.domNode = domNode;
    this.defDotPreset = { ...defDotPreset };
    // this._init();
    this._subscribe();
  }

  //   _init() {
  //     this.ctx = this.domNode.getContext("2d");
  //     this.ctx.clearRect(0, 0, this.domNode.width, this.domNode.height);
  //   }

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
