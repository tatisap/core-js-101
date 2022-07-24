/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
function SelectorConstructor() {
  return {
    selectors: {
      element: '',
      id: '',
      class: [],
      attr: [],
      pseudoClass: [],
      pseudoElement: '',
    },

    order: [],

    checkOrder(newMethod) {
      const rightOrder = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];
      if (rightOrder.indexOf(newMethod) >= rightOrder.indexOf(this.order[this.order.length - 1])) {
        this.order.push(newMethod);
      } else {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
    },

    element(value) {
      this.checkOrder('element');
      if (this.selectors.element) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
      this.selectors.element = value;
      return this;
    },

    id(value) {
      this.checkOrder('id');
      if (this.selectors.id) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
      this.selectors.id = value;
      return this;
    },

    class(value) {
      this.checkOrder('class');
      this.selectors.class.push(value);
      return this;
    },

    attr(value) {
      this.checkOrder('attr');
      this.selectors.attr.push(value);
      return this;
    },

    pseudoClass(value) {
      this.checkOrder('pseudoClass');
      this.selectors.pseudoClass.push(value);
      return this;
    },

    pseudoElement(value) {
      this.checkOrder('pseudoElement');
      if (this.selectors.pseudoElement) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
      this.selectors.pseudoElement = value;
      return this;
    },

    stringify() {
      let result = this.selectors.element;
      result += (this.selectors.id) ? `#${this.selectors.id}` : '';
      result += this.selectors.class.reduce((prev, curr) => `${prev}.${curr}`, '');
      result += this.selectors.attr.reduce((prev, curr) => `${prev}[${curr}]`, '');
      result += this.selectors.pseudoClass.reduce((prev, curr) => `${prev}:${curr}`, '');
      result += (this.selectors.pseudoElement) ? `::${this.selectors.pseudoElement}` : '';
      return result;
    },
  };
}

function Combinator(...items) {
  return {
    items,

    stringify() {
      let result = '';
      this.items.forEach((item) => {
        if (typeof item !== 'string') {
          result += item.stringify();
        } else {
          result += ` ${item} `;
        }
      });
      return result;
    },
  };
}

const cssSelectorBuilder = {
  element(value) {
    return new SelectorConstructor().element(value);
  },

  id(value) {
    return new SelectorConstructor().id(value);
  },

  class(value) {
    return new SelectorConstructor().class(value);
  },

  attr(value) {
    return new SelectorConstructor().attr(value);
  },

  pseudoClass(value) {
    return new SelectorConstructor().pseudoClass(value);
  },

  pseudoElement(value) {
    return new SelectorConstructor().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new Combinator(selector1, combinator, selector2);
  },

};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
