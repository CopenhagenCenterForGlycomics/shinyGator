/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {/*!
  * bean.js - copyright Jacob Thornton 2011
  * https://github.com/fat/bean
  * MIT License
  * special thanks to:
  * dean edwards: http://dean.edwards.name/
  * dperini: https://github.com/dperini/nwevents
  * the entire mootools team: github.com/mootools/mootools-core
  */
const bean = function (context) {
  var __uid = 1,
      registry = {},
      collected = {},
      overOut = /over|out/,
      namespace = /[^\.]*(?=\..*)\.|.*/,
      stripName = /\..*/,
      addEvent = 'addEventListener',
      attachEvent = 'attachEvent',
      removeEvent = 'removeEventListener',
      detachEvent = 'detachEvent',
      doc = context.document || {},
      root = doc.documentElement || {},
      W3C_MODEL = root[addEvent],
      eventSupport = W3C_MODEL ? addEvent : attachEvent,
      isDescendant = function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node !== null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
  },
      retrieveUid = function retrieveUid(obj, uid) {
    return obj.__uid = uid && uid + '::' + __uid++ || obj.__uid || __uid++;
  },
      retrieveEvents = function retrieveEvents(element) {
    var uid = retrieveUid(element);
    return registry[uid] = registry[uid] || {};
  },
      listener = W3C_MODEL ? function (element, type, fn, add) {
    element[add ? addEvent : removeEvent](type, fn, false);
  } : function (element, type, fn, add, custom) {
    custom && add && (element['_on' + custom] = element['_on' + custom] || 0);
    element[add ? attachEvent : detachEvent]('on' + type, fn);
  },
      nativeHandler = function nativeHandler(element, fn, args) {
    return function (event, arg) {
      event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || context).event);
      return fn.apply(element, [event].concat(args).concat(arg));
    };
  },
      customHandler = function customHandler(element, fn, type, condition, args) {
    return function (e) {
      if (condition ? condition.apply(this, arguments) : W3C_MODEL ? true : e && e.propertyName == '_on' + type || !e) {
        fn.apply(element, Array.prototype.slice.call(arguments, e ? 0 : 1).concat(args));
      }
    };
  },
      addListener = function addListener(element, orgType, _fn, args) {
    var type = orgType.replace(stripName, ''),
        events = retrieveEvents(element),
        handlers = events[type] || (events[type] = {}),
        originalFn = _fn,
        uid = retrieveUid(_fn, orgType.replace(namespace, ''));
    if (handlers[uid]) {
      return element;
    }
    var custom = customEvents[type];
    if (custom) {
      _fn = custom.condition ? customHandler(element, _fn, type, custom.condition) : _fn;
      type = custom.base || type;
    }
    var isNative = nativeEvents[type];
    _fn = isNative ? nativeHandler(element, _fn, args) : customHandler(element, _fn, type, false, args);
    isNative = W3C_MODEL || isNative;
    if (type == 'unload') {
      var org = _fn;
      _fn = function fn() {
        removeListener(element, type, _fn) && org();
      };
    }
    element[eventSupport] && listener(element, isNative ? type : 'propertychange', _fn, true, !isNative && type);
    handlers[uid] = _fn;
    _fn.__uid = uid;
    _fn.__originalFn = originalFn;
    return type == 'unload' ? element : collected[retrieveUid(element)] = element;
  },
      removeListener = function removeListener(element, orgType, handler) {
    var uid,
        names,
        uids,
        i,
        events = retrieveEvents(element),
        type = orgType.replace(stripName, '');
    if (!events || !events[type]) {
      return element;
    }
    names = orgType.replace(namespace, '');
    uids = names ? names.split('.') : [handler.__uid];

    function destroyHandler(uid) {
      handler = events[type][uid];
      if (!handler) {
        return;
      }
      delete events[type][uid];
      if (element[eventSupport]) {
        type = customEvents[type] ? customEvents[type].base : type;
        var isNative = W3C_MODEL || nativeEvents[type];
        listener(element, isNative ? type : 'propertychange', handler, false, !isNative && type);
      }
    }

    destroyHandler(names); //get combos
    for (i = uids.length; i--; destroyHandler(uids[i])) {} //get singles

    return element;
  },
      del = function del(selector, fn, $) {
    return function (e) {
      var array = typeof selector == 'string' ? $(selector, this) : selector;
      for (var target = e.target; target && target != this; target = target.parentNode) {
        for (var i = array.length; i--;) {
          if (array[i] == target) {
            return fn.apply(target, arguments);
          }
        }
      }
    };
  },
      add = function add(element, events, fn, delfn, $) {
    if (typeof events == 'object' && !fn) {
      for (var type in events) {
        events.hasOwnProperty(type) && add(element, type, events[type]);
      }
    } else {
      var isDel = typeof fn == 'string',
          types = (isDel ? fn : events).split(' ');
      fn = isDel ? del(events, delfn, $) : fn;
      for (var i = types.length; i--;) {
        addListener(element, types[i], fn, Array.prototype.slice.call(arguments, isDel ? 4 : 3));
      }
    }
    return element;
  },
      remove = function remove(element, orgEvents, fn) {
    var k,
        m,
        type,
        events,
        i,
        isString = typeof orgEvents == 'string',
        names = isString && orgEvents.replace(namespace, ''),
        names = names && names.split('.'),
        rm = removeListener,
        attached = retrieveEvents(element);
    if (isString && /\s/.test(orgEvents)) {
      orgEvents = orgEvents.split(' ');
      i = orgEvents.length - 1;
      while (remove(element, orgEvents[i]) && i--) {}
      return element;
    }
    events = isString ? orgEvents.replace(stripName, '') : orgEvents;
    if (!attached || names || isString && !attached[events]) {
      for (k in attached) {
        if (attached.hasOwnProperty(k)) {
          for (i in attached[k]) {
            for (m = names.length; m--;) {
              attached[k].hasOwnProperty(i) && new RegExp('^' + names[m] + '::\\d*(\\..*)?$').test(i) && rm(element, [k, i].join('.'));
            }
          }
        }
      }
      return element;
    }
    if (typeof fn == 'function') {
      rm(element, events, fn);
    } else if (names) {
      rm(element, orgEvents);
    } else {
      rm = events ? rm : remove;
      type = isString && events;
      events = events ? fn || attached[events] || events : attached;
      for (k in events) {
        if (events.hasOwnProperty(k)) {
          rm(element, type || k, events[k]);
          delete events[k]; // remove unused leaf keys
        }
      }
    }
    return element;
  },
      fire = function fire(element, type, args) {
    var evt,
        k,
        i,
        m,
        types = type.split(' ');
    for (i = types.length; i--;) {
      type = types[i].replace(stripName, '');
      var isNative = nativeEvents[type],
          isNamespace = types[i].replace(namespace, ''),
          handlers = retrieveEvents(element)[type];
      if (isNamespace) {
        isNamespace = isNamespace.split('.');
        for (k = isNamespace.length; k--;) {
          for (m in handlers) {
            handlers.hasOwnProperty(m) && new RegExp('^' + isNamespace[k] + '::\\d*(\\..*)?$').test(m) && handlers[m].apply(element, [false].concat(args));
          }
        }
      } else if (!args && element[eventSupport]) {
        fireListener(isNative, type, element);
      } else {
        for (k in handlers) {
          handlers.hasOwnProperty(k) && handlers[k].apply(element, [false].concat(args));
        }
      }
    }
    return element;
  },
      fireListener = W3C_MODEL ? function (isNative, type, element) {
    evt = document.createEvent(isNative ? "HTMLEvents" : "UIEvents");
    evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, context, 1);
    element.dispatchEvent(evt);
  } : function (isNative, type, element) {
    isNative ? element.fireEvent('on' + type, document.createEventObject()) : element['_on' + type]++;
  },
      clone = function clone(element, from, type) {
    var events = retrieveEvents(from),
        obj,
        k;
    var uid = retrieveUid(element);
    obj = type ? events[type] : events;
    for (k in obj) {
      obj.hasOwnProperty(k) && (type ? add : clone)(element, type || from, type ? obj[k].__originalFn : k);
    }
    return element;
  },
      fixEvent = function fixEvent(e) {
    var result = {};
    if (!e) {
      return result;
    }
    var type = e.type,
        target = e.target || e.srcElement;
    result.preventDefault = fixEvent.preventDefault(e);
    result.stopPropagation = fixEvent.stopPropagation(e);
    result.target = target && target.nodeType == 3 ? target.parentNode : target;
    if (type && type.indexOf('key')) {
      result.keyCode = e.which || e.keyCode;
    } else if (/click|mouse|menu/i.test(type)) {
      result.rightClick = e.which == 3 || e.button == 2;
      result.pos = { x: 0, y: 0 };
      if (e.pageX || e.pageY) {
        result.clientX = e.pageX;
        result.clientY = e.pageY;
      } else if (e.clientX || e.clientY) {
        result.clientX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        result.clientY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      overOut.test(type) && (result.relatedTarget = e.relatedTarget || e[(type == 'mouseover' ? 'from' : 'to') + 'Element']);
    }
    for (var k in e) {
      if (!(k in result)) {
        result[k] = e[k];
      }
    }
    return result;
  };

  fixEvent.preventDefault = function (e) {
    return function () {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    };
  };

  fixEvent.stopPropagation = function (e) {
    return function () {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
    };
  };

  var nativeEvents = { click: 1, dblclick: 1, mouseup: 1, mousedown: 1, contextmenu: 1, //mouse buttons
    mousewheel: 1, DOMMouseScroll: 1, //mouse wheel
    mouseover: 1, mouseout: 1, mousemove: 1, selectstart: 1, selectend: 1, //mouse movement
    keydown: 1, keypress: 1, keyup: 1, //keyboard
    orientationchange: 1, // mobile
    touchstart: 1, touchmove: 1, touchend: 1, touchcancel: 1, // touch
    gesturestart: 1, gesturechange: 1, gestureend: 1, // gesture
    focus: 1, blur: 1, change: 1, reset: 1, select: 1, submit: 1, //form elements
    load: 1, unload: 1, beforeunload: 1, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
    error: 0, abort: 1, scroll: 1 }; //misc

  function check(event) {
    var related = event.relatedTarget;
    if (!related) {
      return related === null;
    }
    return related != this && related.prefix != 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related);
  }

  var customEvents = {
    mouseenter: { base: 'mouseover', condition: check },
    mouseleave: { base: 'mouseout', condition: check
      //    mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
    } };

  var bean = { add: add, remove: remove, clone: clone, fire: fire };

  var clean = function clean(el) {
    var uid = remove(el).__uid;
    if (uid) {
      delete collected[uid];
      delete registry[uid];
    }
  };

  if (context[attachEvent]) {
    add(context, 'unload', function () {
      for (var k in collected) {
        collected.hasOwnProperty(k) && clean(collected[k]);
      }
      context.CollectGarbage && CollectGarbage();
    });
  }

  var oldBean = context.bean;
  bean.noConflict = function () {
    context.bean = oldBean;
    return this;
  };

  typeof module !== 'undefined' && module.exports ? module.exports = bean : context['bean'] = bean;

  return bean;
}({});

/* harmony default export */ __webpack_exports__["a"] = (bean);
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(6)(module)))

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bean__ = __webpack_require__(0);


/**
 *  @namespace MASCP namespace
 */
const MASCP = {};

/**
 *  @fileOverview   Basic classes and defitions for the MASCP services
 */

if (Object.defineProperty && !MASCP.IE8) {
    (function () {
        var ready_callbacks = [];
        var is_ready = false;
        Object.defineProperty(MASCP, "ready", {
            get: function get() {
                if (ready_callbacks.length === 0 && !is_ready) {
                    return false;
                }
                return function () {
                    ready_callbacks.forEach(function (cb) {
                        cb.call();
                    });
                };
            },
            set: function set(cb) {
                if (cb === false || cb === true) {
                    ready_callbacks = [];
                    if (cb) {
                        is_ready = true;
                    }
                    return is_ready;
                } else {
                    if (is_ready) {
                        cb.call();
                        return;
                    }
                    ready_callbacks.push(cb);
                }
            }
        });
    })();
}

/**
 *  @lends MASCP.Group.prototype
 *  @property   {String}        name                        Name for this group to be used as an identifier
 *  @property   {String}        fullname                    The full (long) name for this group, that can be used in UI widgets for labelling
 *  @property   {String}        color                       Color string to apply to this group
 *  @property   {Boolean}       hide_member_controllers     For controllers for this group, do not show the layer controllers for this group
 *  @property   {Boolean}       hide_group_controller       For controllers for this group do not show the parent group controller
 */

/**
 * Register a group with metadata for all sequence renderers.
 * @static
 * @param {String} groupName    Name to give to this group
 * @param {Hash} options        Options to apply to this group - see MASCP.Group for all the fields
 * @returns New group object
 * @type MASCP.Group
 * @see MASCP.event:groupRegistered
 * @see MASCP.Group
 */
MASCP.registerGroup = function (groupName, options) {
    if (!this.groups) {
        this.groups = {};
    }
    if (this.groups[groupName]) {
        return;
    }

    var group = new MASCP.Group();

    group.name = groupName;

    options = options || {};

    if (options.hide_member_controllers) {
        group.hide_member_controllers = true;
    }

    if (options.hide_group_controller) {
        group.hide_group_controller = true;
    }

    if (options.fullname) {
        group.fullname = options.fullname;
    }

    if (options.color) {
        group.color = options.color;
    }

    if (options.group) {
        group.group = this.getGroup(options.group);
        if (!group.group) {
            throw "Cannot register this layer with the given group - the group has not been registered yet";
        }
        group.group._layers.push(group);
    }

    group._layers = [];

    group.group_id = new Date().getMilliseconds();

    this.groups[groupName] = group;

    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(MASCP, 'groupRegistered', [group]);

    return group;
};

/**
 *  @lends MASCP.Layer.prototype
 *  @property   {String}        name        Name for this layer to be used as an identifier
 *  @property   {String}        fullname    The full (long) name for this layer, that can be used in UI widgets for labelling
 *  @property   {String}        color       Color string to apply to this layer
 *  @property   {MASCP.Group}   group       Group that this layer is part of. Either a group object, or the name for the group.
 *  @property   {String}        css         CSS block for this layer. Active and inactive layers are children of the .active and .inactive classes respectively. To target a track-based rendering, use the .tracks class first, and to target overlays, use the .overlay class last
 *  @property   {Object}        data        Data for this layer
 */

/**
 * Register a layer with metadata for all sequence renderers.
 * @static
 * @param {String} layerName    Name to give to this layer
 * @param {Hash} options        Options to set field values for this layer - see the fields for MASCP.Layer.
 * @returns New layer object
 * @type MASCP.Layer
 * @see MASCP.Layer
 * @see MASCP.event:layerRegistered
 */
MASCP.registerLayer = function (layerName, options, renderers) {
    if (!this.layers) {
        this.layers = {};
    }
    if (!renderers) {
        renderers = [];
    }
    var layer;
    if (this.layers[layerName]) {
        if (this.layers[layerName].disabled || renderers.length > 0) {
            this.layers[layerName].disabled = false;
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(MASCP, 'layerRegistered', [this.layers[layerName]].concat(renderers));
        }
        layer = this.layers[layerName];
    }

    if (layer && options.group) {
        if (layer.group !== this.getGroup(options.group)) {
            layer.group = this.getGroup(options.group);
            layer.group._layers.push(layer);
        }
        if (!layer.group) {
            throw "Cannot register this layer with the given group - the group has not been registered yet";
        }
    }

    if (layer) {
        return layer;
    }

    layer = new MASCP.Layer();

    layer.name = layerName;

    options = options || {};

    if (options.fullname) {
        layer.fullname = options.fullname;
    }

    if (options.color) {
        layer.color = options.color;
    }

    if (options.data) {
        layer.data = options.data;
    }

    if (layer && options.group) {
        layer.group = this.getGroup(options.group);
        if (!layer.group) {
            throw "Cannot register this layer with the given group - the group has not been registered yet";
        }
        layer.group._layers.push(layer);
    }

    this.layers[layerName] = layer;

    if (options.css) {
        console.log("options.css is deprecated");
    }
    layer.layer_id = new Date().getMilliseconds();
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(MASCP, 'layerRegistered', [layer].concat(renderers));

    return layer;
};

/**
 * @class
 * Metadata for a group of layers to be rendered
 */
MASCP.Group = function () {
    return;
};

/**
 * Describe what this method does
 * @private
 * @param {String|Object|Array|Boolean|Number} paramName Describe this parameter
 * @returns Describe what it returns
 * @type String|Object|Array|Boolean|Number
 */
MASCP.Group.prototype.size = function () {
    var counter = 0;
    for (var i = 0; i < this._layers.length; i++) {
        if (!this._layers[i].disabled) {
            counter += 1;
        }
    }
    return counter;
};

MASCP.Group.prototype.eachLayer = function (func) {
    for (var i = 0; i < this._layers.length; i++) {
        if (!this._layers[i].disabled) {
            func.call(this._layers[i], this._layers[i]);
        }
    }
};

/**
 * @class
 * Metadata for a single layer to be rendered
 */
MASCP.Layer = function () {
    this.scales = new Set();
    return;
};

/**
 * Retrieve a layer object from the layer registry. If a layer object is passed to this method, the same layer is returned.
 * @param {String} layer    Layer name
 * @returns Layer object
 * @type Object
 * @see MASCP.Layer
 */
MASCP.getLayer = function (layer) {
    if (!MASCP.layers) {
        return;
    }
    return typeof layer == 'string' ? MASCP.layers[layer] : layer;
};

/**
 * Retrieve a group object from the group registry. If a grop object is passed to this method, the same group is returned.
 * @param {String} group    Group name
 * @returns Group object
 * @type Object
 * @see MASCP.Group
 */
MASCP.getGroup = function (group) {
    if (typeof group == 'undefined') {
        return;
    }
    if (!MASCP.groups) {
        return;
    }
    if (typeof group == 'string') {
        return MASCP.groups[group];
    }
    return group == MASCP.groups[group.name] ? group : null;
};

/* harmony default export */ __webpack_exports__["a"] = (MASCP);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bean__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__jsandbox__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__MASCP__ = __webpack_require__(1);
//"use strict";






/** Default constructor for Services
 *  @class      Super-class for all MASCP services to retrieve data from
 *              proteomic databases. Sub-classes of this class override methods
 *              to change how requests are built, and how the data is parsed.
 *  @param      {String}    agi             AGI to retrieve data for
 *  @param      {String}    endpointURL     Endpoint for the service
 */
const Service = function Service(agi, endpointURL) {};

/** Build a data retrieval class that uses the given function to extract result data.
 *  @static
 *  @param  {Function}  dataExtractor   Function to extract data from the resultant data (passed as an argument
 *                                      to the function), and then populate the result object. The function is
 *                                      bound to a hash to populate data in to. When no data is passed to the
 *                                      function, the hash should be populated with default values.
 */

let resultsymb = Symbol('resultclass');

Service.buildService = function (dataExtractor) {

    let clazz = class extends Service {
        constructor(agi, endpointURL) {
            super();
            if (typeof endpointURL != 'undefined') {
                this._endpointURL = endpointURL;
            } else {
                this._endpointURL = clazz.SERVICE_URL;
            }
            this.agi = agi;
            return this;
        }

        toString() {
            for (var serv in __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */]) {
                if (this === __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */][serv]) {
                    return "MASCP." + serv;
                }
            }
        }

        get Result() {
            return this[resultsymb] || this.constructor.Result;
        }

        set Result(resultclass) {
            this[resultsymb] = resultclass;
        }
    };

    clazz.Result = class {
        constructor(data) {
            dataExtractor.apply(this, [data]);
            return this;
        }
    };

    Object.assign(dataExtractor.apply({}, []), clazz.Result.prototype);

    return clazz;
};

Service.clone = function (service, name) {
    var new_service = Service.buildService(function () {
        return this;
    });
    new_service.Result = service.Result;
    new_service.prototype = new service();
    __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */][name] = new_service;
    new_service.prototype['__class__'] = new_service;
    return new_service;
};

/**
 *  @lends Service.prototype
 *  @property   {String}  agi               AGI to retrieve data for
 *  @property   {Service.Result}  result  Result from the query
 *  @property   {Boolean} async             Flag for using asynchronous requests - defaults to true
 */
Service.prototype = Object.assign({
    'agi': null,
    'result': null,
    'async': true
}, Service.prototype);

/*
 * Internal callback for new data coming in from a XHR
 * @private
 */

Service.prototype._dataReceived = function (data, status) {
    if (!data) {
        return false;
    }
    var clazz = this.Result;
    if (data && data.error && data.error != '' && data.error !== null) {
        __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, 'error', [data.error]);
        return false;
    }
    if (Object.prototype.toString.call(data) === '[object Array]') {
        for (var i = 0; i < data.length; i++) {
            arguments.callee.call(this, data[i], status);
        }
        if (i === 0) {
            this.result = new clazz();
        }
        this.result._raw_data = { 'data': data };
    } else if (!this.result) {
        var result;
        try {
            result = new clazz(data);
        } catch (err2) {
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, 'error', [err2]);
            return false;
        }
        if (!result._raw_data) {
            result._raw_data = data;
        }
        this.result = result;
    } else {
        // var new_result = {};
        try {
            clazz.call(this.result, data);
        } catch (err3) {
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, 'error', [err3]);
            return false;
        }
        // for(var field in new_result) {
        //     if (true && new_result.hasOwnProperty(field)) {
        //         this.result[field] = new_result[field];
        //     }
        // }
        if (!this.result._raw_data) {
            this.result._raw_data = data;
        }
        // this.result._raw_data = data;
    }

    if (data && data.retrieved) {
        this.result.retrieved = data.retrieved;
        this.result._raw_data.retrieved = data.retrieved;
    }

    this.result.agi = this.agi;

    return true;
};

Service.prototype.gotResult = function () {
    var self = this;

    var reader_cache = function reader_cache(thing) {
        if (!thing.readers) {
            thing.readers = [];
        }
        thing.readers.push(self.toString());
    };

    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].add(__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */], 'layerRegistered', reader_cache);
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].add(__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */], 'groupRegistered', reader_cache);
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(self, "resultReceived");
    try {
        __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */], 'layerRegistered', reader_cache);
        __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */], 'groupRegistered', reader_cache);
    } catch (e) {}

    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(Service, "resultReceived");
};

Service.prototype.requestComplete = function () {
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, 'requestComplete');
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(Service, 'requestComplete', [this]);
};

Service.prototype.requestIncomplete = function () {
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, 'requestIncomplete');
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(Service, 'requestIncomplete', [this]);
};

Service.registeredLayers = function (service) {
    var result = [];
    for (var layname in __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].layers) {
        if (__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].layers.hasOwnProperty(layname)) {
            var layer = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].layers[layname];
            if (layer.readers && layer.readers.indexOf(service.toString()) >= 0) {
                result.push(layer);
            }
        }
    }
    return result;
};

Service.registeredGroups = function (service) {
    var result = [];
    for (var nm in __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].groups) {
        if (__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].groups.hasOwnProperty(nm)) {
            var group = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].groups[nm];
            if (group.readers && group.readers.indexOf(service.toString()) >= 0) {
                result.push(group);
            }
        }
    }
    return result;
};

/**
 *  Binds a handler to one or more events. Returns a reference to self, so this method
 *  can be chained.
 *
 *  @param  {String}    type        Event type to bind
 *  @param  {Function}  function    Handler to execute on event
 */

Service.prototype.bind = function (type, func) {
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].add(this, type, func);
    return this;
};

Service.prototype.once = function (type, func) {
    var self = this;
    var wrapped_func = function wrapped_func() {
        __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(self, type, wrapped_func);
        func.apply(self, [].slice.call(arguments));
    };
    self.bind(type, wrapped_func);
};

/**
 *  Unbinds a handler from one or more events. Returns a reference to self, so this method
 *  can be chained.
 *
 *  @param  {String}    type        Event type to unbind
 *  @param  {Function}  function    Handler to unbind from event
 */
Service.prototype.unbind = function (type, func) {
    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(this, type, func);
    return this;
};

/**
 * @name    Service#resultReceived
 * @event
 * @param   {Object}    e
 */

/**
 * @name    Service#error
 * @event
 * @param   {Object}    e
 */

/**
 *  Asynchronously retrieves data from the remote source. When data is received, a 
 *  resultReceived.mascp event is triggered upon this service, while an error.mascp
 *  event is triggered when an error occurs. This method returns a reference to self
 *  so it can be chained.
 */
(function (base) {

    var make_params = function make_params(params) {
        var qpoints = [];
        for (var fieldname in params) {
            if (params.hasOwnProperty(fieldname)) {
                qpoints.push(fieldname + '=' + params[fieldname]);
            }
        }
        return qpoints.join('&');
    };

    var cached_requests = {};

    var do_request = function do_request(request_data) {

        request_data.async = true;

        var datablock = null;

        if (!request_data.url) {
            request_data.success.call(null, null);
            return;
        }

        var request = new XMLHttpRequest();

        if (request_data.type == 'GET' && request_data.data) {
            var index_of_quest = request_data.url.indexOf('?');

            if (index_of_quest == request_data.url.length - 1) {
                request_data.url = request_data.url.slice(0, -1);
                index_of_quest = -1;
            }
            var has_question = index_of_quest >= 0 ? '&' : '?';
            request_data.url = request_data.url.replace(/\?$/, '') + has_question + make_params(request_data.data);
        }
        if (request_data.type == 'GET' && request_data.session_cache) {
            if (cached_requests[request_data.url]) {
                cached_requests[request_data.url].then(function (data) {
                    request_data.success.call(null, data);
                }).catch(function (error_args) {
                    request_data.error.apply(null, [null, request, error_args]);
                });
                return;
            } else {
                var success_callback = request_data.success;
                var error_callback = request_data.error;
                cached_requests[request_data.url] = new Promise(function (resolve, reject) {
                    request_data.success = function (data) {
                        resolve(data);
                    };
                    request_data.error = function (message, req, error_obj) {
                        reject([message, req, error_obj]);
                        delete cached_requests[request_data.url];
                    };
                });
                cached_requests[request_data.url].catch(function (error_args) {
                    error_callback.apply(null, error_args);
                }).then(function (data) {
                    success_callback.call(null, data);
                });
            }
        }

        request.open(request_data.type, request_data.url, request_data.async);

        if (request_data.type == 'POST') {
            request.setRequestHeader("Content-Type", request_data.content ? request_data.content : "application/x-www-form-urlencoded");
            datablock = request_data.content ? request_data.data : make_params(request_data.data);
        }

        if (request.customUA) {
            request.setRequestHeader('User-Agent', request.customUA);
        }

        if (request_data.auth) {
            request.setRequestHeader('Authorization', 'Bearer ' + request_data.auth);
        }

        if (request_data.api_key) {
            request.setRequestHeader('x-api-key', request_data.api_key);
        }

        var redirect_counts = 5;

        request.onreadystatechange = function (evt) {
            if (request.readyState == 4) {
                if (request.status >= 300 && request.status < 400 && redirect_counts > 0) {
                    var loc = request.getResponseHeader('location').replace(/location:\s+/, '');
                    redirect_counts = redirect_counts - 1;
                    request.open('GET', loc, request_data.async);
                    request.send();
                    return;
                }
                if (request.status == 503) {
                    // Let's encode an exponential backoff
                    request.last_wait = (request_data.last_wait || 500) * 2;
                    setTimeout(function () {
                        request.open(request_data.type, request_data.url, request_data.async);
                        if (request_data.type == 'POST') {
                            request.setRequestHeader("Content-Type", request_data.content ? request_data.content : "application/x-www-form-urlencoded");
                        }
                        if (request.customUA) {
                            request.setRequestHeader('User-Agent', request.customUA);
                        }
                        request.send(datablock);
                    }, request_data.last_wait);
                    return;
                }
                if (request.status == 403) {
                    // Make sure our S3 buckets expose the Server header cross-origin
                    var server = request.getResponseHeader('Server');
                    if (server === 'AmazonS3') {
                        request_data.success.call(null, { "error": "No data" }, 403, request);
                        return;
                    }
                }
                if (request.status >= 200 && request.status < 300) {
                    var data_block;
                    if (request_data.dataType == 'xml') {
                        data_block = typeof document !== 'undefined' ? document.implementation.createDocument(null, "nodata", null) : { 'getElementsByTagName': function getElementsByTagName() {
                                return [];
                            } };
                    } else {
                        data_block = {};
                    }
                    try {
                        var text = request.responseText;
                        data_block = request_data.dataType == 'xml' ? request.responseXML : request_data.dataType == 'txt' ? request.responseText : JSON.parse(request.responseText);
                    } catch (e) {
                        if (e.type == 'unexpected_eos') {
                            request_data.success.call(null, {}, request.status, request);
                            return;
                        } else {
                            request_data.error.call(null, request.responseText, request, { 'error': e.type || e.message, 'stack': e });
                            return;
                        }
                    }
                    if (request.status == 202 && data_block.status == "RUNNING") {
                        setTimeout(function () {
                            request.open(request_data.type, request_data.url, request_data.async);
                            if (request_data.type == 'POST') {
                                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                            }
                            if (request.customUA) {
                                request.setRequestHeader('User-Agent', request.customUA);
                            }
                            request.send(datablock);
                        }, 5000);
                        return;
                    }
                    request_data.success.call(null, data_block, request.status, request);
                    data_block = null;
                } else {
                    request_data.error.call(null, request.responseText, request, request.status);
                }
            }
        };
        if (__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].NETWORK_FAIL && __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].NETWORK_FAIL.enabled) {
            setTimeout(function () {
                console.log("Causing network failure");
                request = { 'onreadystatechange': request.onreadystatechange };
                request.readyState = 4;
                request.status = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].NETWORK_FAIL.status || 500;
                request.responseText = "Intercepted by Network Failure simulator";
                request.onreadystatechange();
            }, 1000);
            return;
        }

        request.send(datablock);
    };

    Service.request = function (url, callback, noparse) {
        var method = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].IE ? do_request_ie : do_request;
        if (__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].IE && !url.match(/^https?\:/)) {
            method = do_request;
        }
        var params;
        if (!url) {
            callback(null);
            return;
        }
        if (typeof url == 'string') {
            params = { async: true, url: url, timeout: 5000, type: "GET",
                error: function error(response, req, status) {
                    callback.call(null, { "status": status });
                },
                success: function success(data, status, xhr) {
                    callback.call(null, null, data);
                }
            };
        } else if (url.hasOwnProperty('url')) {
            params = url;
            params.success = function (data) {
                callback.call(null, null, data);
            };
            params.error = function (resp, req, status) {
                callback.call(null, { "status": status });
            };
        }
        if (noparse) {
            params.dataType = 'txt';
            if (noparse === "xml") {
                params.dataType = 'xml';
            }
        }
        method.call(null, params);
    };

    /**
     * Private method for performing a cross-domain request using Internet Explorer 8 and up. Adapts the 
     * parameters passed, and builds an XDR object. There is no support for a locking
     * synchronous method to do these requests (that is required for Unit testing) so an alert box is used
     * to provide the locking.
     * @private
     * @param {Object} dataHash Hash with the data and settings used to build the query.
     */

    var do_request_ie = function do_request_ie(dataHash) {
        // Use XDR
        var xdr = new XDomainRequest();
        var loaded = false;
        var counter = 0;
        xdr.onerror = function (ev) {
            dataHash.error(xdr, xdr, { "message": "XDomainRequest error" });
        };
        xdr.onprogress = function () {};
        xdr.open("GET", dataHash.url + "?" + make_params(dataHash.data));
        xdr.onload = function () {
            loaded = true;
            if (dataHash.dataType == 'xml') {
                var dom = new ActiveXObject("Microsoft.XMLDOM");
                dom.async = false;
                dom.loadXML(xdr.responseText);
                dataHash.success(dom, 'success', xdr);
            } else if (dataHash.dataType == 'json') {
                var parsed = null;
                try {
                    parsed = JSON.parse(xdr.responseText);
                } catch (err) {
                    dataHash.error(xdr, xdr, { "message": "JSON parsing error" });
                }
                if (parsed) {
                    dataHash.success(parsed, 'success', xdr);
                }
            } else {
                dataHash.success(xdr.responseText, 'success', xdr);
            }
        };
        // We can't set the content-type on the parameters here to url-encoded form data.
        setTimeout(function () {
            xdr.send();
        }, 0);
        while (!dataHash.async && !loaded && counter < 3) {
            alert("This browser does not support synchronous requests, click OK while we're waiting for data");
            counter += 1;
        }
        if (!dataHash.async && !loaded) {
            alert("No data");
        }
    };

    let handle_request_success = function handle_request_success(data, status, xhr) {
        Service._current_reqs -= 1;
        if (xhr && xhr.status !== null && xhr.status === 0) {
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, "error", [{ "error": "Zero return status from request " }]);
            this.requestComplete();
            return;
        }
        var received_flag = this._dataReceived(data, status);

        if (received_flag) {
            this.gotResult();
        }

        if (received_flag !== null && typeof received_flag !== 'undefined') {
            this.requestComplete();
        } else {
            this.requestIncomplete();
        }
    };

    let handle_request_error = function handle_request_error(response, req, status) {
        Service._current_reqs -= 1;
        if (typeof status == 'string') {
            status = { 'error': status, 'request': req };
        }
        if (!isNaN(status)) {
            status = { "error": "Reqeust error", "status": status, 'request': req };
        }
        __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, "error", [status]);
        __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(Service, 'requestComplete');
        this.requestComplete();
    };

    let perform_request = function perform_request(request_data) {

        if (request_data === false) {
            return;
        }

        if (!request_data) {
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(this, "error", ["No request data"]);
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(Service, "requestComplete", [this]);
            this.requestComplete();
            return this;
        }

        var default_params = {
            async: this.async,
            url: request_data.url || this._endpointURL,
            timeout: 5000,
            error: handle_request_error.bind(this),
            success: handle_request_success.bind(this)
        };
        default_params = Object.assign(request_data, default_params);

        do_request(default_params);

        Service._current_reqs += 1;
    };

    base.retrieve = function (agi, callback) {
        var self = this;

        Service._current_reqs = Service._current_reqs || 0;
        Service._waiting_reqs = Service._waiting_reqs || 0;

        if (Service.MAX_REQUESTS) {
            var my_func = arguments.callee;
            if (Service._current_reqs > Service.MAX_REQUESTS) {
                Service._waiting_reqs += 1;
                __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].add(Service, 'requestComplete', function () {
                    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(this, 'requestComplete', arguments.callee);
                    setTimeout(function () {
                        Service._waiting_reqs -= 1;
                        my_func.call(self, agi, callback);
                    }, 0);
                });
                return this;
            }
        }
        if (agi) {
            this.agi = agi;
        }

        if (agi && callback) {
            this.agi = agi;

            this.result = null;

            var done_result = false;
            var done_func = function done_func(err, obj) {
                __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(self, "resultReceived", done_func);
                __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(self, "error", done_func);
                __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].remove(self, "requestComplete", done_func);
                if (!done_result) {
                    if (err) {
                        callback.call(self, err);
                    } else {
                        callback.call(self);
                    }
                }
                done_result = true;
            };
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].add(self, "resultReceived", done_func);
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].add(self, "error", done_func);
            __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].add(self, "requestComplete", done_func);
        }
        var request_data = this.requestData();
        Promise.resolve(request_data).then(perform_request.bind(this));
        return this;
    };
})(Service.prototype);

/**
 *  Get the parameters that will be used to build this request. Implementations of services will
 *  override this method, returning the parameters to be used to build the XHR.
 */

Service.prototype.requestData = function () {};

Service.prototype.toString = function () {
    for (var clazz in __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */]) {
        if (this.__class__ == __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */][clazz]) {
            return "MASCP." + clazz;
        }
    }
};

/**
 * For this service, register a sequence rendering view so that the results can be marked up directly
 * on to a sequence. This method will do nothing if the service does not know how to render the 
 * results onto the sequence.
 * @param {MASCP.SequenceRenderer} sequenceRenderer Sequence renderer object to render results upon
 */
Service.prototype.registerSequenceRenderer = function (sequenceRenderer, options) {
    if (this.setupSequenceRenderer) {
        this.renderers = this.renderers || [];
        this.setupSequenceRenderer(sequenceRenderer, options);
        this.renderers.push(sequenceRenderer);
    }
    sequenceRenderer.trigger('readerRegistered', [this]);
    return this;
};

Service.prototype.resetOnResult = function (sequenceRenderer, rendered, track) {
    var self = this;
    var result_func = function result_func() {
        self.unbind('resultReceived', result_func);
        sequenceRenderer.bind('resultsRendered', clear_func);
    };

    var clear_func = function clear_func(reader) {
        if (reader !== self) {
            return;
        }
        sequenceRenderer.unbind('resultsRendered', clear_func);
        rendered.forEach(function (obj) {
            sequenceRenderer.remove(track, obj);
        });
    };
    this.bind('resultReceived', result_func);
};

/**
 * For this service, set up a sequence renderer so that the events are connected up with receiving data.
 * This method should be overridden to wire up the sequence renderer to the service.
 * @param {MASCP.SequenceRenderer} sequenceRenderer Sequence renderer object to render results upon
 */
Service.prototype.setupSequenceRenderer = function (sequenceRenderer) {
    return this;
};

/** Default constructor
 *  @class  Super-class for all results from MASCP services.
 */
Service.Result = function () {};

Service.Result.prototype = {
    agi: null,
    reader: null
};

Service.Result.prototype.render = function () {};

/* harmony default export */ __webpack_exports__["a"] = (Service);

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Dragger__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__CondensedSequenceRenderer__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__MASCP__ = __webpack_require__(1);






const component_symbol = Symbol('component');

class DraggableRenderer extends __WEBPACK_IMPORTED_MODULE_1__CondensedSequenceRenderer__["a" /* default */] {
  constructor(container, component) {
    super(container);
    this[component_symbol] = component;
  }
  getVisibleLength() {
    return this.rightVisibleResidue() - this.leftVisibleResidue();
  }
  getTotalLength() {
    return this.sequence.length;
  }
  getLeftPosition() {
    return this.leftVisibleResidue();
  }
  setLeftPosition(pos) {
    return this.setLeftVisibleResidue(pos);
  }

  get selecting() {
    return this[component_symbol].selecting;
  }
}

const tmpl = document.createElement('template');

tmpl.innerHTML = `
<style>
  :host {
    display: block;
    position: relative;
  }
  :host([resizeable]) {
    resize: both;
    overflow: auto;
    padding-right: 5px;
    padding-bottom: 5px;
  }
  #container, .widget_contents {
    width: 100%;
    height: 100%;
  }
  #container {
  }
</style>
<div class="widget_contents" >
  <div id="container">
  </div>
</div>
<slot></slot>
`;

const interactive_symb = Symbol('interactive');

class InteractiveState {
  constructor(component) {
    this.component = component;
  }
  get enabled() {
    return this.component.interactive && !this.component.selecting;
  }
  set enabled(toggle) {
    this.component.interactive = toggle;
  }
}

class ComponentDragger extends __WEBPACK_IMPORTED_MODULE_0__Dragger__["a" /* default */] {
  constructor(component) {
    super();
    this.component = component;
  }
  get enabled() {
    return this.component.interactive && !this.component.selecting;
  }
  set enabled(toggle) {
    this.component.interactive = toggle;
  }
}

function WrapHTML() {
  return Reflect.construct(HTMLElement, [], Object.getPrototypeOf(this).constructor);
}
Object.setPrototypeOf(WrapHTML.prototype, HTMLElement.prototype);
Object.setPrototypeOf(WrapHTML, HTMLElement);

if (window.ShadyCSS) {
  ShadyCSS.prepareTemplate(tmpl, 'x-protviewer');
}

let setup_renderer = function setup_renderer(renderer) {
  renderer.font_order = 'Helvetica, Arial, sans-serif';
  renderer.zoom = 0.81;
  renderer.padding = 10;
  renderer.trackOrder = [];
  renderer.reset();
  renderer.trackGap = 6;
  renderer.trackHeight = 5;
  renderer.fixedFontScale = 1;
};

let create_renderer = function create_renderer(container) {
  let renderer = new DraggableRenderer(container, this);
  setup_renderer(renderer);
  wire_renderer_sequence_change.call(this, renderer);
  return renderer;
};

let try_import_symbols = (renderer, namespace, url) => {
  __WEBPACK_IMPORTED_MODULE_2__Service__["a" /* default */].request(url, function (err, doc) {
    if (doc) {
      renderer.importIcons(namespace, doc.documentElement, url);
    }
  }, "xml");
};

let zoom_to_fit = renderer => {
  renderer.fitZoom();
};

let make_draggable = function make_draggable(renderer, dragger) {
  dragger.applyToElement(renderer._canvas);
  dragger.addTouchZoomControls(renderer, renderer._canvas, this[interactive_symb]);
  renderer._canvas.addEventListener('panned', () => {
    let evObj = new Event('pandone', { bubbles: true, cancelable: true });
    this.dispatchEvent(evObj);
  });
  __WEBPACK_IMPORTED_MODULE_0__Dragger__["a" /* default */].addScrollZoomControls.call(this[interactive_symb], renderer, renderer._canvas, 0.1);
};

let wire_renderer_sequence_change = function wire_renderer_sequence_change(renderer) {
  var dragger = new ComponentDragger(this);
  let seq_change_func = () => {
    try_import_symbols(renderer, "ui", "https://glycodomain.glycomics.ku.dk/icons.svg");
    try_import_symbols(renderer, "sugar", "https://glycodomain.glycomics.ku.dk/sugars.svg");
    zoom_to_fit(renderer);
    make_draggable.call(this, renderer, dragger);
    populate_tracks.call(this);
    setup_renderer(renderer);
    renderer.navigation.show();
    renderer.refresh();
  };
  renderer.bind('sequenceChange', seq_change_func);
};

let populate_tracks = function populate_tracks() {
  for (let track of this.querySelectorAll('x-gatortrack')) {
    this.createTrack(track);
  }
};

let wire_selection_change = function wire_selection_change(renderer) {
  renderer.bind('selection', selections => {
    let positions = selections.get(renderer);
    if (!positions[0] && !positions[1]) {
      this.removeAttribute('selected');
    } else {
      this.setAttribute('selected', `${positions[0]}:${positions[1]}`);
    }
    for (let track of this.querySelectorAll('x-gatortrack')) {
      let positions = selections.get(track.layer);
      if (!positions[0] && !positions[1]) {
        track.removeAttribute('selected');
      } else {
        track.setAttribute('selected', `${positions[0]}:${positions[1]}`);
      }
    }
  });
};

class GatorComponent extends WrapHTML {

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
  }

  attributeChangedCallback(name) {}

  connectedCallback() {
    if (window.ShadyCSS) {
      ShadyCSS.styleElement(this);
    }
    let shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
    this[interactive_symb] = new InteractiveState(this);
    this.renderer = create_renderer.call(this, shadowRoot.getElementById('container'));
    this.renderer.grow_container = true;
    if (window.getComputedStyle(this).height && window.getComputedStyle(this).height !== '0px' && window.getComputedStyle(this).height !== 'auto') {
      this.renderer.grow_container = false;
      if (window.getComputedStyle(this).getPropertyValue('--fill-viewer')) {
        this.renderer.fixed_size = true;
      }
    }
    wire_selection_change.call(this, this.renderer);
  }

  fitToZoom() {
    zoom_to_fit(this.renderer);
  }

  createTrack(track) {
    __WEBPACK_IMPORTED_MODULE_3__MASCP__["a" /* default */].registerLayer(track.name, {}, [this.renderer]);
    this.renderer.trackOrder = this.renderer.trackOrder.concat([track.name]);
    this.renderer.showLayer(track.name);
    this.renderer.refresh();
  }

  refreshTracks() {
    populate_tracks.call(this);
  }

  get selecting() {
    return this.hasAttribute('selecting');
  }

  set selecting(toggle) {
    if (toggle) {
      this.setAttribute('selecting', '');
    } else {
      this.removeAttribute('selecting');
    }
  }

  get interactive() {
    return this.hasAttribute('interactive');
  }

  set interactive(toggle) {
    if (toggle) {
      this.setAttribute('interactive', '');
    } else {
      this.removeAttribute('interactive');
    }
  }
}

customElements.define('x-protviewer', GatorComponent);

/* harmony default export */ __webpack_exports__["a"] = (GatorComponent);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_ClustalRunner__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_UniprotReader__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lib_UserdataReader__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lib_GenomeReader__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lib_GatorDataReader__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__lib_Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__lib_MASCP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__lib_CondensedSequenceRenderer__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__lib_Dragger__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__lib_GatorComponent__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__lib_GeneComponent__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__lib_TrackRendererComponent__ = __webpack_require__(24);












__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].ClustalRunner = __WEBPACK_IMPORTED_MODULE_0__lib_ClustalRunner__["a" /* default */];
__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].UniprotReader = __WEBPACK_IMPORTED_MODULE_1__lib_UniprotReader__["a" /* default */];
__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].UserdataReader = __WEBPACK_IMPORTED_MODULE_2__lib_UserdataReader__["a" /* default */];
__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].GenomeReader = __WEBPACK_IMPORTED_MODULE_3__lib_GenomeReader__["a" /* default */];
__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].GatorDataReader = __WEBPACK_IMPORTED_MODULE_4__lib_GatorDataReader__["a" /* default */];







__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].GatorComponent = __WEBPACK_IMPORTED_MODULE_9__lib_GatorComponent__["a" /* default */];
__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].GeneComponent = __WEBPACK_IMPORTED_MODULE_10__lib_GeneComponent__["a" /* default */];
__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */].TrackComponent = __WEBPACK_IMPORTED_MODULE_11__lib_TrackRendererComponent__["a" /* default */];

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_6__lib_MASCP__["a" /* default */]);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__bean__ = __webpack_require__(0);
/** @fileOverview   Classes for reading data from the Clustal tool
 */



/** Default class constructor
 *  @class      Service class that will retrieve data from Clustal for given sequences
 *  @param      {String} endpointURL    Endpoint URL for this service
 *  @extends    MASCP.Service
 */
const ClustalRunner = __WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */].buildService(function (data) {
    this._raw_data = data;
    if (data && typeof data == 'string') {
        this._raw_data = { 'data': { 'sequences': this.getSequences(), 'alignment': this.getAlignment() } };
    }
    return this;
});

ClustalRunner.SERVICE_URL = 'http://www.ebi.ac.uk/Tools/services/rest/clustalw2/run/';

ClustalRunner.hash = function (str) {
    var hash = 0;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = char + (hash << 6) + (hash << 16) - hash;
    }
    return hash;
};

ClustalRunner.prototype.requestData = function () {
    var sequences = [].concat(this.sequences || []);
    var self = this;
    this.agi = ClustalRunner.hash(this.sequences.join(',')) + '';
    if (!ClustalRunner.SERVICE_URL.match(/ebi/)) {
        return {
            type: "POST",
            dataType: "json",
            api_key: MASCP.GATOR_CLIENT_ID,
            data: {
                'sequences': sequences.join(",")
            }
        };
    }
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(self, 'running');
    if (this.job_id) {
        return {
            type: "GET",
            dataType: "txt",
            url: 'http://www.ebi.ac.uk/Tools/services/rest/clustalw2/status/' + this.job_id
        };
    }
    if (this.result_id) {
        return {
            type: "GET",
            dataType: "txt",
            url: 'http://www.ebi.ac.uk/Tools/services/rest/clustalw2/result/' + this.result_id + '/aln-clustalw'
        };
    }

    for (var i = 0; i < sequences.length; i++) {
        sequences[i] = ">seq" + i + "\n" + sequences[i];
    }
    return {
        type: "POST",
        dataType: "txt",
        data: { 'sequence': escape(sequences.join("\n") + "\n"),
            'email': 'joshi%40sund.ku.dk'
        }
    };
};

(function (serv) {
    var defaultDataReceived = serv.prototype._dataReceived;

    serv.prototype._dataReceived = function (data, status) {
        if (data === null) {
            return defaultDataReceived.call(this, null, status);
        }
        if (typeof data == "object") {
            if (data.status && data.status == "RUNNING") {
                var self = this;
                __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(self, "running");
                setTimeout(function () {
                    self.retrieve(self.agi);
                }, 5000);
                console.log("Got back running status");
                return;
            }
            return defaultDataReceived.call(this, data, status);
        }

        if (typeof data == "string" && data.match(/^clustalw/)) {
            this.job_id = data;
            this.retrieve(this.agi);
            return;
        }
        if (data.match(/FINISHED/)) {
            this.result_id = this.job_id;
            this.job_id = null;
            var self = this;
            setTimeout(function () {
                self.retrieve(self.agi);
            }, 500);
            return;
        }
        if (data.match(/RUNNING/)) {
            var self = this;
            setTimeout(function () {
                self.retrieve(self.agi);
            }, 500);
            return;
        }

        return defaultDataReceived.call(this, data, status);
    };
})(ClustalRunner);

(function () {
    var normalise_insertions = function normalise_insertions(inserts) {
        var pos;
        var positions = [];
        var result_data = {};
        for (pos in inserts) {
            if (inserts.hasOwnProperty(pos) && parseInt(pos) >= -1) {
                positions.push(parseInt(pos));
            }
        }
        positions = positions.sort(function sortfunction(a, b) {
            return a - b;
        });

        // From highest to lowest position, loop through and
        // subtract the lengths of previous subtratctions from
        // the final position value.

        for (var i = positions.length - 1; i >= 0; i--) {
            var j = i - 1;
            pos = parseInt(positions[i]);
            var value = inserts[pos];
            while (j >= 0) {
                pos -= inserts[positions[j]].length;
                j--;
            }
            if (!value.match(/^\s+$/)) {
                result_data[pos + 1] = value + (result_data[pos + 1] || '');
            }
        }
        //    delete result_data[0];
        return result_data;
    };

    var splice_char = function splice_char(seqs, index, insertions) {
        for (var i = 0; i < seqs.length; i++) {
            var seq = seqs[i].toString();
            if (seq.charAt(index) != '-') {
                if (!insertions[i]) {
                    insertions[i] = {};
                    insertions[i][-1] = '';
                }
                insertions[i][index - 1] = seq.charAt(index);
                if (insertions[i][index] && insertions[i][index].match(/\w/)) {
                    insertions[i][index - 1] += insertions[i][index];
                    delete insertions[i][index];
                }
            } else {
                if (insertions[i]) {
                    insertions[i][index - 1] = ' ';
                    if ((insertions[i][index] || '').match(/^\s+$/)) {
                        insertions[i][index - 1] += insertions[i][index];
                        delete insertions[i][index];
                    }
                }
            }
            seqs[i] = seq.slice(0, index) + seq.slice(index + 1);
        }
    };

    ClustalRunner.Result.prototype.alignToSequence = function (seq_index) {
        if (!this._orig_raw_data) {
            this._orig_raw_data = JSON.stringify(this._raw_data);
        } else {
            this._raw_data = JSON.parse(this._orig_raw_data);
        }
        var seqs = this._raw_data.data.sequences.concat([this._raw_data.data.alignment]);
        var insertions = [];
        var aligning_seq = seqs[seq_index],
            i = aligning_seq.length - 1;
        for (i; i >= 0; i--) {
            if (aligning_seq.charAt(i) == '-') {
                splice_char(seqs, i, insertions);
            }
        }
        for (i = 0; i < seqs.length; i++) {
            if (insertions[i] && i != seq_index) {
                insertions[i] = normalise_insertions(insertions[i]);
                var seq = seqs[i];
                seqs[i] = { 'sequence': seq, 'insertions': insertions[i] };
                seqs[i].toString = function () {
                    return this.sequence;
                };
            }
        }
        this._raw_data.data.alignment = seqs.pop();
        this._raw_data.data.sequences = seqs;
    };

    /*
    
    Test suite for calculating positions
    
    var aligner = 0;
    foo = new ClustalRunner.Result();
    foo._raw_data = {"data" : { "alignment" : "****************" , "sequences" : [ "----12345678----", "XXXXXXXXXXXXXXXX", "ABCDABC---ABCDAB" ] }};
    foo.alignToSequence(aligner);
    console.log(foo.getSequences());
    console.log(foo.calculatePositionForSequence(0,1));
    console.log(foo.calculatePositionForSequence(0,2));
    console.log(foo.calculatePositionForSequence(0,3));
    console.log(foo.calculatePositionForSequence(0,4));
    console.log(foo.calculatePositionForSequence(0,5));
    console.log(foo.calculatePositionForSequence(0,6));
    console.log(foo.calculatePositionForSequence(0,7));
    console.log(foo.calculatePositionForSequence(0,8));
    
    */
    ClustalRunner.Result.prototype.calculatePositionForSequence = function (idx, pos) {
        var inserts = this._raw_data.data.sequences[idx].insertions || {};
        var result = pos;
        var actual_position = 0;
        var seq = this._raw_data.data.sequences[idx].toString();
        for (var i = 0; i < seq.length; i++) {
            if (inserts[i]) {
                actual_position += inserts[i].length;
            }
            actual_position += 1;
            if (seq.charAt(i) == '-') {
                actual_position -= 1;
            }
            if (pos <= actual_position) {
                if (pos == actual_position) {
                    return i + 1;
                } else {
                    if (i == 0) {
                        i = 1;
                    }
                    return -1 * i;
                }
            }
        }
        return -1 * seq.length;
    };

    ClustalRunner.Result.prototype.calculateSequencePositionFromPosition = function (idx, pos) {
        var inserts = this._raw_data.data.sequences[idx].insertions || {};
        var result = pos;
        var actual_position = 0;
        var seq = this._raw_data.data.sequences[idx].toString();
        for (var i = 0; i < pos; i++) {
            if (inserts[i]) {
                actual_position += inserts[i].length;
            }
            actual_position += 1;
            if (seq.charAt(i) == '-') {
                actual_position -= 1;
            }
        }
        if (actual_position == 0) {
            actual_position += 1;
        }
        return actual_position;
    };
})();
//1265 (P)

ClustalRunner.prototype.setupSequenceRenderer = function (renderer) {
    var self = this;

    renderer.sequences = self.sequences;
    renderer.addAxisScale('clustal', function (pos, layer, inverse) {
        let idx = null;
        let seq_identifiers = self.sequences.map(function (seq) {
            return seq.agi;
        });
        while (seq_identifiers.length > 0) {
            idx = idx || 0;
            let acc = seq_identifiers.shift();
            if (layer.scales.has(acc)) {
                break;
            }
            idx++;
            if (seq_identifiers.length === 0) {
                idx = null;
            }
        }
        if (layer.name === 'primarySequence') {
            idx = self.result.aligned_idx;
        }
        if (idx === null) {
            return pos;
        }
        if (inverse) {
            return self.result.calculateSequencePositionFromPosition(idx, pos);
        }

        return self.result.calculatePositionForSequence(idx, pos);
    });

    var rendered_bits = [];
    var controller_name = 'isoforms';
    var group_name = 'isoforms';

    var draw_discontinuity = function draw_discontinuity(canvas, size) {
        var top = -3;
        var left = -2;
        var group = canvas.group();
        var line;
        line = canvas.line(left + 1, top + 4, left + 3, top + 1);
        line.setAttribute('stroke', '#fcc');
        line.setAttribute('stroke-width', '10');
        group.push(line);
        line = canvas.line(left + 1, top + 6, left + 3, top + 3);
        line.setAttribute('stroke', '#fcc');
        line.setAttribute('stroke-width', '10');
        group.push(line);
        line = canvas.line(left + 1, top + 4, left + 3, top + 3);
        line.setAttribute('stroke', '#fcc');
        line.setAttribute('stroke-width', '5');
        group.push(line);
        line = canvas.line(left + 1, top + 5.3, left + 1, top + 5.8);
        line.setAttribute('stroke', '#fcc');
        line.setAttribute('stroke-width', '10');
        group.push(line);
        line = canvas.line(left + 1, top + 5.9, left + 1.5, top + 5.9);
        line.setAttribute('stroke', '#fcc');
        line.setAttribute('stroke-width', '10');
        group.push(line);
        var circle = canvas.circle(left + 2.8, top + 1.75, 1);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', '#ccc');
        circle.setAttribute('stroke-width', '10');
        group.push(circle);
        var minus = canvas.text(left + 2.25, top + 2.25, (size || '÷') + "");
        minus.setAttribute('fill', '#ccc');
        minus.setAttribute('font-size', 75);
        group.push(minus);
        canvas.firstChild.nextSibling.appendChild(group);
        return group;
    };

    var check_values = function check_values(seq, idx, seqs) {
        var positives = 0;
        var aa = seq.toString().charAt(idx);
        for (var i = 1; i < seqs.length; i++) {
            if (seqs[i].toString().charAt(idx) == aa) {
                positives += 1;
            }
        }
        return positives / (seqs.length - 1);
    };

    var redraw_alignments = function redraw_alignments(sequence_index) {
        var result = self.result;

        while (rendered_bits.length > 0) {
            var bit = rendered_bits.shift();
            renderer.remove(bit.layer, bit);
        }
        result.alignToSequence(sequence_index || 0);

        var aligned = result.getSequences();

        if (!renderer.sequence) {
            renderer.setSequence(aligned[sequence_index])(function () {
                renderer.sequences = self.sequences;
                MASCP.registerGroup(group_name, 'Aligned');
                MASCP.registerLayer(controller_name, { 'fullname': 'Conservation', 'color': '#000000' });
                if (renderer.trackOrder.indexOf(controller_name) < 0) {
                    renderer.trackOrder = renderer.trackOrder.concat([controller_name]);
                }
                renderer.showLayer(controller_name);
                renderer.createGroupController(controller_name, group_name);
                redraw_alignments(sequence_index);
            });
            return;
        } else {
            renderer.sequence = aligned[sequence_index];
            renderer.redrawAxis();
        }
        var alignments = result.getAlignment().split('');
        rendered_bits = rendered_bits.concat(renderer.renderTextTrack(controller_name, result.getAlignment().replace(/ /g, ' ')));
        rendered_bits.slice(-1)[0].setAttribute('data-spaces', 'true');
        rendered_bits.slice(-1)[0].layer = controller_name;
        var idxs = ["*", ":", ".", " "].reverse();
        for (var i = 0; i < alignments.length; i++) {
            rendered_bits.push(renderer.getAA(i + 1, controller_name).addBoxOverlay(controller_name, 1, idxs.indexOf(alignments[i]) / 4, { "merge": true }));
            rendered_bits.slice(-1)[0].layer = controller_name;
        }
        for (var i = 0; i < aligned.length; i++) {
            var layname = self.sequences[i].agi.toUpperCase() || "missing" + i;
            var lay = MASCP.registerLayer(layname, { 'fullname': self.sequences[i].name || layname.toUpperCase(), 'group': group_name, 'color': '#ff0000', 'accession': self.sequences[i].agi });
            lay.scales.clear();
            lay.scales.add(self.sequences[i].agi);

            lay.fullname = self.sequences[i].name || layname.toUpperCase();
            var text_array = renderer.renderTextTrack(layname, aligned[i].toString());
            rendered_bits = rendered_bits.concat(text_array);
            rendered_bits.slice(-1)[0].layer = layname;
            if (renderer.trackOrder.indexOf(layname.toUpperCase()) < 0) {
                renderer.trackOrder = renderer.trackOrder.concat([group_name]);
            }
            var name = "Isoform " + (i + 1);
            if (aligned[i].insertions) {
                for (var insert in aligned[i].insertions) {
                    var insertions = aligned[i].insertions;
                    if (insert == 0 && insertions[insert] == "") {
                        continue;
                    }
                    if (insertions[insert].length < 1) {
                        continue;
                    }
                    var size = insertions[insert].length;
                    if (insert == 0) {
                        insert = 1;
                    }
                    var content = draw_discontinuity(renderer._canvas, size);
                    content.setAttribute('fill', '#ffff00');
                    var an_anno = renderer.getAA(insert, controller_name).addToLayer(layname, { 'content': content, //'+'+insertions[insert].length,
                        'bare_element': true,
                        'height': 10,
                        'offset': -5,
                        'no_tracer': true
                    })[1];
                    an_anno.container.setAttribute('height', '300');
                    an_anno.container.setAttribute('viewBox', '-50 -100 200 300');
                    rendered_bits.push(an_anno);
                    rendered_bits.slice(-1)[0].layer = layname;
                }
            }
        }
        renderer.zoom = 1;
        renderer.showGroup(group_name);
        renderer.refresh();
    };

    this.bind('resultReceived', function () {
        var self = this;
        redraw_alignments(0);
        self.result.aligned_idx = 0;
        var accs = [];
        self.sequences.forEach(function (seq) {
            accs.push(seq.agi.toUpperCase());
        });
        var current_order = [];
        renderer.bind('orderChanged', function (order) {
            if (self.result) {
                var new_order = order.slice(order.indexOf(controller_name) + 1, order.length).filter(function (track) {
                    return accs.indexOf(track) >= 0;
                });
                if (new_order.join(',') == current_order.join(',')) {
                    return;
                }
                current_order = new_order;
                self.result.aligned_idx = accs.indexOf(current_order[0]);

                redraw_alignments(self.result.aligned_idx);
                renderer.refreshScale();
            }
        });
    });
};

ClustalRunner.Result.prototype.getSequences = function () {
    if (this._raw_data && this._raw_data.data && this._raw_data.data.sequences) {
        return [].concat(this._raw_data.data.sequences);
    }
    var bits = this._raw_data.match(/seq\d+(.*)/g);
    var results = [];
    for (var i = 0; i < bits.length; i++) {
        var seqbits = bits[i].match(/seq(\d+)\s+(.*)/);
        if (!results[seqbits[1]]) {
            results[seqbits[1]] = '';
        }
        results[seqbits[1]] += seqbits[2];
    }
    return results;
};

ClustalRunner.Result.prototype.getAlignment = function () {
    if (this._raw_data && this._raw_data.data && this._raw_data.data.alignment) {
        return this._raw_data.data.alignment.toString();
    }
    this._text_data = this._raw_data;
    var re = / {16}(.*)/g;
    var result = "";
    var match = re.exec(this._raw_data);
    while (match !== null) {
        result += match[1];
        match = re.exec(this._raw_data);
    }

    return result;
};

let onlyUnique = (val, idx, arr) => arr.indexOf(val) === idx;

let clustal_emulator = sequences => {
    if (sequences.length == 0) {
        return { data: { sequences: [], alignment: "" } };
    }
    let all_aas = sequences.map(seq => seq.split(''));
    let alignment = all_aas[0].map((aa, pos) => all_aas.map(aas => aas[pos]).filter(onlyUnique).length == 1 ? '*' : ':').join('');
    return { data: { sequences: sequences, alignment: alignment } };
};

ClustalRunner.EmulatedClustalRunner = function (renderer) {
    let runner = new ClustalRunner();
    runner.retrieve = function () {
        let datablock = clustal_emulator(this.sequences || []);
        this._dataReceived(datablock);
        this.sequences = this.sequences.map((seq, idx) => {
            return { agi: 'seq' + idx, toString: () => seq };
        });
        this.gotResult();
        this.requestComplete();
    };
    if (renderer) {
        runner.registerSequenceRenderer(renderer);
    }
    return runner;
};

/* harmony default export */ __webpack_exports__["a"] = (ClustalRunner);

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = function (originalModule) {
	if (!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function get() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function get() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
 * JSandbox JavaScript Library v0.2.3
 *
 * With modifications to create a worker function inline so that
 * we can just include this single file
 *
 * 2009-01-25
 * By Elijah Grey, http://eligrey.com
 * Licensed under the X11/MIT License
 *   See LICENSE.md
 */

/*global self */

/*jslint undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true,
newcap: true, immed: true, maxerr: 1000, strict: true */

/*! @source http://purl.eligrey.com/github/jsandbox/blob/master/src/jsandbox.js*/



var JSandbox = function (self) {
	var undef_type = "undefined",
	    doc = self.document,
	    Worker = self.Worker;

	if (typeof Worker === undef_type) {
		return;
	}

	var
	// repeatedly used properties/strings (for minification)
	$eval = "eval",
	    $exec = "exec",
	    $load = "load",
	    $requests = "requests",
	    $input = "input",
	    $terminate = "terminate",
	    $data = "data",
	    $callback = "callback",
	    $onerror = "onerror",
	    $worker = "worker",
	    $onresponse = "onresponse",
	    $prototype = "prototype",
	    $call = "call",
	    str_type = "string",
	    fun_type = "function",
	    Sandbox = function Sandbox() {
		var sandbox = this;

		if (!(sandbox instanceof Sandbox)) {
			return new Sandbox();
		}
		try {
			sandbox[$worker] = new Worker(Sandbox.url);
		} catch (exception) {
			// Internet Explorer closes the BLOB before we can use it
			if (exception.name === "SecurityError") {
				sandbox[$worker] = new Worker(window.URL.createObjectURL(new Blob(['(' + default_worker_function.toString() + '(self,eval))'], { 'type': 'text/javascript' })));
			}
		}
		sandbox[$requests] = {};

		sandbox[$worker].onmessage = function (event) {
			var data = event[$data],
			    request;
			if (typeof data !== "object") {
				return;
			}
			if (data.id == "log") {
				console.log(data.message);
				return;
			}
			request = sandbox[$requests][data.id];
			if (request) {
				if (data.error) {
					if (typeof sandbox[$onerror] === fun_type) {
						sandbox[$onerror](data, request);
					}
					if (typeof request[$onerror] === fun_type) {
						request[$onerror][$call](sandbox, data.error);
					}
				} else {
					if (typeof sandbox[$onresponse] === fun_type) {
						sandbox[$onresponse](data, request);
					}

					if (typeof request[$callback] === fun_type) {
						request[$callback][$call](sandbox, data.results);
					}
				}
				delete sandbox[$requests][data.id];
			}
		};
	},
	    proto = Sandbox[$prototype],
	    createRequestMethod = function createRequestMethod(method) {
		proto[method] = function (options, callback, input, onerror) {
			if (typeof options === str_type || Object[$prototype].toString[$call](options) === "[object Array]" || arguments.length > 1) {
				// called in (data, callback, input, onerror) style
				options = {
					data: options,
					input: input,
					callback: callback,
					onerror: onerror
				};
			}

			if (method === $load && typeof options[$data] === str_type) {
				options[$data] = [options[$data]];
			}

			var data = options[$data],
			    id = this.createRequestID();

			input = options[$input];

			delete options[$data];
			delete options[$input];

			this[$requests][id] = options;

			this[$worker].postMessage({
				id: id,
				method: method,
				data: data,
				input: input
			});

			return id;
		};
		Sandbox[method] = function () {
			var sandbox = new Sandbox();

			sandbox[$onresponse] = sandbox[$onerror] = function () {
				sandbox[$terminate]();
				sandbox = null;
			};

			Sandbox[$prototype][method].apply(sandbox, Array[$prototype].slice[$call](arguments));
			return Sandbox;
		};
	},
	    methods = [$eval, $load, $exec],
	    i = 3; // methods.length

	while (i--) {
		createRequestMethod(methods[i]);
	}

	proto[$terminate] = function () {
		this[$requests] = {};
		this[$worker].onmessage = null;
		this[$worker][$terminate]();
	};

	proto.abort = function (id) {
		delete this[$requests][id];
	};

	proto.createRequestID = function () {
		var id = Math.random().toString();
		if (id in this[$requests]) {
			return this.createRequestID();
		}
		return id;
	};

	if (typeof doc !== undef_type) {
		var linkElems = doc.getElementsByTagName("link");
		i = linkElems.length;
		while (i--) {
			if (linkElems[i].getAttribute("rel") === "jsandbox") {
				Sandbox.url = linkElems[i].getAttribute("href");
				break;
			}
		}
	}

	var default_worker_function = function default_worker_function(self, globalEval) {
		"use strict";

		var postMessage = self.postMessage,
		    importScripts = self.importScripts,
		    messageEventType = "message",
		    messageHandler = function messageHandler(event) {
			var request = event.data,
			    response = {};

			response.id = request.id;

			var data = request.data;
			self.input = request.input || {};

			try {
				switch (request.method) {

					case "eval":
						// JSLint has something against indenting cases
						response.results = globalEval(data);
						break;
					case "exec":
						importScripts("data:application/javascript," + encodeURIComponent(data));
						break;
					case "load":
						importScripts.apply(self, data);
						break;

				}
			} catch (e) {
				response.code = e.message;
				response.error = e.stack;
				response.line = e.lineNumber;
				response.fileName = e.fileName;
			}

			delete self.input;
			try {
				delete self.onmessage; // in case the code defined it
			} catch (e) {}

			postMessage(response);
		};

		if (self.addEventListener) {
			self.addEventListener(messageEventType, messageHandler, false);
		} else if (self.attachEvent) {
			// for future compatibility with IE
			self.attachEvent("on" + messageEventType, messageHandler);
		}

		self.window = self; // provide a window object for scripts
		self.console = { log: function log(message) {
				postMessage({ "id": "log", "message": message });
			} };

		// dereference unsafe functions
		// some might not be dereferenced: https://bugzilla.mozilla.org/show_bug.cgi?id=512464
		self.Worker = self.addEventListener = self.removeEventListener = self.importScripts = self.XMLHttpRequest = self.postMessage =
		//self.dispatchEvent       =
		// in case IE implements web workers
		self.attachEvent = self.detachEvent = self.ActiveXObject = undefined;
	};

	if (!Sandbox.url) {
		Sandbox.url = window.URL.createObjectURL(new Blob(['(' + default_worker_function.toString() + '(self,eval))'], { 'type': 'text/javascript' }));
	}
	return Sandbox;
}(self),
    Sandbox = JSandbox;

/* harmony default export */ __webpack_exports__["a"] = (JSandbox);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__UserdataReader__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__bean__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__MASCP__ = __webpack_require__(1);
/**
 * @fileOverview    Classes for reading data from Uniprot database
 */






/** Default class constructor
 *  @class      Service class that will retrieve data from Uniprot for a given AGI.
 *  @param      {String} agi            Agi to look up
 *  @param      {String} endpointURL    Endpoint URL for this service
 *  @extends    MASCP.Service
 */
const UniprotReader = __WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */].buildService(function (data) {
    if (data && typeof data === 'string') {
        var dats = UniprotReader.parseFasta(data);
        var key;
        for (key in dats) {
            if (dats.hasOwnProperty(key)) {
                data = { 'data': dats[key] };
                this._raw_data = data;
            }
        }
    }
    this._data = data || {};
    if (!this._data.data) {
        this._data = { 'data': ['', ''] };
    }
    return this;
});

UniprotReader.SERVICE_URL = null;

UniprotReader.prototype.requestData = function () {
    var self = this;
    if (!UniprotReader.SERVICE_URL) {
        throw new Error('No service URL for UniprotReader');
    }
    return {
        type: "GET",
        dataType: "json",
        'auth': __WEBPACK_IMPORTED_MODULE_3__MASCP__["a" /* default */].GATOR_AUTH_TOKEN,
        'api_key': __WEBPACK_IMPORTED_MODULE_3__MASCP__["a" /* default */].GATOR_CLIENT_ID,
        'url': UniprotReader.SERVICE_URL + '/' + this.agi.toUpperCase()
    };
};

UniprotReader.Result.prototype.getDescription = function () {
    return this._data.data[1];
};

UniprotReader.Result.prototype.getSequence = function () {
    return this._data.data[0];
};

UniprotReader.parseFasta = function (datablock) {
    var chunks = datablock.split('>');
    var datas = {};
    chunks.forEach(function (entry) {
        var lines = entry.split(/\n/);
        if (lines.length <= 1) {
            return;
        }
        var header = lines.shift();
        var seq = lines.join("");
        var header_data = header.split('|');
        var acc = header_data[1];
        var desc = header_data[2];
        datas[acc] = [seq, desc];
    });
    return datas;
};

UniprotReader.readFastaFile = function (datablock, callback) {

    var datas = UniprotReader.parseFasta(datablock);

    var writer = new __WEBPACK_IMPORTED_MODULE_1__UserdataReader__["a" /* default */]();
    writer.toString = function () {
        return "UniprotReader";
    };
    writer.map = function (dat) {
        return dat.data;
    };
    writer.datasetname = "UniprotReader";
    callback(writer);
    setTimeout(function () {
        writer.avoid_database = true;
        writer.setData("UniprotReader", { "data": datas });
    }, 0);
    return writer;
};

/* harmony default export */ __webpack_exports__["a"] = (UniprotReader);

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ServiceCaching__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__MASCP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__bean__ = __webpack_require__(0);
/**
 * @fileOverview    Classes for getting arbitrary user data onto the GATOR
 */






/** Default class constructor
 *  @class      Service class that will retrieve sequence data for a given AGI from a given ecotype
 *  @param      {String} agi            Agi to look up
 *  @param      {String} endpointURL    Endpoint URL for this service
 *  @extends    MASCP.Service
 */
const UserdataReader = __WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */].buildService(function (data) {
    if (!data) {
        return this;
    }
    this._raw_data = data;
    return this;
});

UserdataReader.prototype.toString = function () {
    return 'UserdataReader.' + this.datasetname;
};

UserdataReader.prototype.requestData = function () {
    var agi = this.agi.toUpperCase();
    return {
        type: "GET",
        dataType: "json",
        data: { 'agi': agi,
            'service': this.datasetname
        }
    };
};

UserdataReader.prototype.setupSequenceRenderer = function (renderer) {
    // We don't have any default rendering for the UserDataReader
    // since it's all going to be custom stuff anyway
};

var apply_map = function apply_map(data_block) {
    var map = this.map;
    var databits = data_block.data;
    var headers = databits.shift();
    var dataset = {};
    var id_col = headers.indexOf(map.id);
    var cols_to_add = [];
    for (var col in map) {
        if (col == "id") {
            continue;
        }
        if (map.hasOwnProperty(col)) {
            cols_to_add.push({ "name": col, "index": headers.indexOf(map[col]) });
        }
    }
    while (databits.length > 0) {
        var row = databits.shift();
        var id = row[id_col].toLowerCase();
        if (!dataset[id]) {
            dataset[id] = { "data": {} };
        }
        var obj = dataset[id];
        var i;
        for (i = cols_to_add.length - 1; i >= 0; i--) {
            if (!obj.data[cols_to_add[i].name]) {
                obj.data[cols_to_add[i].name] = [];
            }
            obj.data[cols_to_add[i].name] = obj.data[cols_to_add[i].name].concat((row[cols_to_add[i].index] || '').split(','));
        }
        obj.retrieved = data_block.retrieved;
        obj.title = data_block.title;
        if (data_block.etag) {
            obj.etag = data_block.etag;
        }
    }
    return dataset;
};

UserdataReader.prototype.setData = function (name, data) {

    if (!data) {
        return;
    }

    var self = this;

    // Call CacheService on this object/class
    // just to make sure that it has access
    // to the cache retrieval mechanisms

    __WEBPACK_IMPORTED_MODULE_1__ServiceCaching__["a" /* default */].CacheService(this);

    this.datasetname = name;

    if (!data.retrieved) {
        data.retrieved = new Date();
    }
    if (!data.title) {
        data.title = name;
    }

    self.title = data.title;

    var dataset = {}; // Format is { "accession" : { "data" : {}, "retrieved" : "" , "title" : ""  } };

    if (typeof this.map == 'object') {
        dataset = apply_map.call(this, data);
    }
    if (typeof this.map == 'function') {

        if (this.map.callback) {
            var self_func = arguments.callee;
            this.map(data, function (parsed) {
                self.map = function (d) {
                    return d;
                };
                self_func.call(self, name, parsed);
            });
            return;
        }
        dataset = this.map(data);
    }

    if (!this.map) {
        return;
    }
    this.data = dataset;

    var inserter = new UserdataReader();

    inserter.toString = function () {
        return self.toString();
    };

    inserter.data = dataset;

    inserter.retrieve = function (an_acc, cback) {
        this.agi = an_acc;
        // this._dataReceived(dataset[this.agi]);
        cback.call(this);
    };

    __WEBPACK_IMPORTED_MODULE_1__ServiceCaching__["a" /* default */].CacheService(inserter);

    var accs = [];
    var acc;
    for (acc in dataset) {
        if (dataset.hasOwnProperty(acc)) {
            if (acc.match(/[A-Z]/)) {
                dataset[acc.toLowerCase()] = dataset[acc];
                delete dataset[acc];
                acc = acc.toLowerCase();
            }
            accs.push(acc);
        }
    }
    var total = accs.length;

    var retrieve = this.retrieve;

    this.retrieve = function (id, cback) {
        console.log("Data not ready! Waiting for ready state");
        var self = this;
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(self, 'ready', function () {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(self, 'ready', arguments.callee);
            self.retrieve(id, cback);
        });
    };
    if (accs.length < 1) {
        setTimeout(function () {
            self.retrieve = retrieve;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self, 'ready', [data]);
        }, 0);
        return;
    }
    __WEBPACK_IMPORTED_MODULE_1__ServiceCaching__["a" /* default */].BulkOperation(function (err) {
        if (err) {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self, 'error', [err]);
            return;
        }
        var trans = this.transaction;
        inserter.avoid_database = true;
        inserter.retrieve(accs[0], function () {
            while (accs.length > 0) {
                var acc = accs.shift();
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self, 'progress', [100 * ((total - accs.length) / total), total - accs.length, total]);
                inserter.agi = acc;
                inserter._dataReceived(dataset[acc]);
                if (accs.length === 0) {
                    self.retrieve = retrieve;
                    trans(function (err) {
                        if (!err) {
                            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self, 'ready', [data]);
                        } else {
                            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self, 'error');
                        }
                    });
                    return;
                }
            }
        });
    });
};

UserdataReader.datasets = function (cback, done) {
    __WEBPACK_IMPORTED_MODULE_1__ServiceCaching__["a" /* default */].FindCachedService(this, function (services) {
        var result = [];
        for (var i = 0, len = services.length; i < len; i++) {
            result.push(services[i].replace(/UserdataReader./, ''));
        }
        if (result.forEach) {
            result.forEach(cback);
        }
        if (done) {
            done();
        }
    });
};

/* harmony default export */ __webpack_exports__["a"] = (UserdataReader);

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__MASCP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__bean__ = __webpack_require__(0);
/** @fileOverview   Classes for reading data from MyGene.info */





/** Default class constructor
 *  @class      Service class that will retrieve data from Mygene.info for given sequences
 *  @param      {String} endpointURL    Endpoint URL for this service
 *  @extends    MASCP.Service
 */
const GenomeReader = __WEBPACK_IMPORTED_MODULE_1__Service__["a" /* default */].buildService(function (data) {
    this._raw_data = data;
    return this;
});

GenomeReader.SERVICE_URL = 'http://mygene.info/v2/query';
GenomeReader.prototype.requestData = function () {
    this.acc = this.agi;

    if (!this.geneid) {
        return {
            type: "GET",
            dataType: "json",
            url: 'https://mygene.info/v2/query',
            data: { 'q': 'uniprot:' + this.acc.toUpperCase(),
                'fields': 'entrezgene',
                'email': 'joshi%40sund.ku.dk'
            }
        };
    } else if (!this.acc) {
        this.acc = this.agi = "" + this.geneid;
    }

    if (!this.exons) {
        return {
            type: "GET",
            url: 'https://mygene.info/v3/gene/' + this.geneid,
            dataType: "json",
            data: {
                'fields': 'exons_hg19,uniprot.Swiss-Prot'
            }
        };
    }

    if (this.tried_isoform) {
        return __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].GatorDataReader.authenticate().then(url_base => {
            this.tried_bare = true;
            return {
                type: "GET",
                dataType: "json",
                auth: __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].GATOR_AUTH_TOKEN,
                api_key: __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].GATOR_CLIENT_ID,
                url: url_base + '/data/latest/combined/' + this.swissprot.toUpperCase()
            };
        });
    }

    return __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].GatorDataReader.authenticate().then(url_base => {
        this.tried_isoform = true;
        return {
            type: "GET",
            dataType: "json",
            auth: __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].GATOR_AUTH_TOKEN,
            api_key: __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].GATOR_CLIENT_ID,
            url: url_base + '/data/latest/combined/' + this.swissprot.toUpperCase() + '-1'
        };
    });

    return {
        type: "GET",
        dataType: "txt",
        url: "https://www.uniprot.org/mapping/",
        data: {
            "from": "REFSEQ_NT_ID",
            "to": "ACC",
            "format": "tab",
            "query": Object.keys(this.exons).join(' ')
        }
    };
};

let update_structure = data => {
    let result = {};
    for (let transcript of data) {
        result[transcript.transcript] = transcript;
        transcript.exons = transcript.position;
        delete transcript.position;
    }
    return result;
};

(function (serv) {
    var defaultDataReceived = serv.prototype._dataReceived;

    serv.prototype._dataReceived = function (data, status) {
        var self = this;
        if (data.data && status === "db") {
            self.sequences = [{ "agi": "genome" }];
            Object.keys(data.data).forEach(function (uniprot) {
                self.sequences.push({ "agi": uniprot.toLowerCase() });
            });
            return defaultDataReceived.call(this, data, status);
        }
        if (status < 200 || status >= 400) {
            return defaultDataReceived.call(this, null, status);
        }

        if (!this.geneid) {
            this.geneid = data.hits[0].entrezgene;
            this.retrieve(this.acc || this.agi);
            return;
        }
        if (!this.exons) {
            this.exons = update_structure(data.exons_hg19 || data.exons);
            this.swissprot = (data.uniprot || {})['Swiss-Prot'].toLowerCase();
            if (!this.nt_mapping) {
                this.retrieve(this.acc || this.agi);
                return;
            }
            data = this.nt_mapping.map(function (map) {
                return map.join('\t');
            }).join('\n');
        }
        data = data.data.filter(dat => dat.dataset == 'uniprot_refseqnt');

        if (data.length > 0) {
            data = data[0].data.map(mapping => [mapping.refseqnt.replace(/\..*/, ''), mapping.uniprot].join('\t')).join('\n');
        } else {
            if (this.tried_isoform && !this.tried_bare) {
                this.retrieve(this.acc || this.agi);
                return;
            }
            data = "";
        }

        var mapped = {};
        self.sequences = [{ "agi": "genome" }];
        (data || "").split('\n').forEach(function (row) {
            var bits = row.split('\t');
            if (!bits[1]) {
                return;
            }
            var uniprot = bits[1].toLowerCase().replace(/-\d+/, '');
            var nuc = bits[0];
            nuc = nuc.replace(/\..*$/, '');
            if (!self.exons[nuc]) {
                return;
            }
            if (!self.agi || !self.acc) {
                self.acc = uniprot;
                self.agi = uniprot;
            }

            if (!mapped[uniprot]) {
                mapped[uniprot] = [];
            }
            self.exons[nuc]._id = nuc;
            mapped[uniprot].push(self.exons[nuc]);
            self.sequences.push({ "agi": uniprot.toLowerCase() });
        });
        return defaultDataReceived.call(this, { "data": mapped }, status);
    };
})(GenomeReader);

GenomeReader.Result.prototype.getSequences = function () {
    var results = [];
    var cds_data = this._raw_data.data;
    var uniprots = Object.keys(cds_data);
    let min, max;
    min = max = null;
    uniprots.forEach(function (uniprot) {
        var ends = cds_data[uniprot].map(function (cd) {
            if (Array.isArray(cd)) {
                cd = cd.filter(function (c) {
                    return c.chr.match(/^[\dXx]+$/);
                })[0];
            }
            return [cd.txstart, cd.txend];
        });
        ends.forEach(function (cd) {
            if (!min || cd[0] < min) {
                min = cd[0];
            }
            if (!max || cd[1] > max) {
                max = cd[1];
            }
        });
    });
    results = [Array(Math.floor((max - min) / 3)).join('.')];
    this.min = min;
    this.max = max;
    return results;
};

GenomeReader.Result.prototype.getIntrons = function (margin) {
    var self = this;
    var results = [];
    var uprots = Object.keys(self._raw_data.data);
    uprots.forEach(function (up) {
        var cds = self._raw_data.data[up];
        cds.forEach(function (target_cds) {
            if (Array.isArray(target_cds)) {
                target_cds = target_cds.filter(function (c) {
                    return c.chr.match(/^[\dXx]+$/);
                })[0];
                if (!target_cds) {
                    return null;
                }
            }

            var exons = target_cds.exons;
            var target_position;

            for (var i = 0; i < exons.length; i++) {
                if (i == 0) {
                    results.push([self.min, exons[i][0] - margin]);
                } else {
                    results.push([exons[i - 1][1] + margin, exons[i][0] - margin]);
                }
                if (i == exons.length - 1) {
                    results.push([exons[i][1] + margin, self.max]);
                }
                if (results.slice(-1)[0][0] > results.slice(-1)[0][1]) {
                    results.splice(results.length - 1, 1);
                }
            }
        });
    });
    return results;
};

GenomeReader.prototype.proteinLength = function (target_cds) {
    var exons = target_cds.exons;
    var total = 0;
    for (var i = 0; i < exons.length; i++) {
        if (target_cds.cdsstart > exons[i][1] & target_cds.cdsstart > exons[i][0]) {
            continue;
        }
        if (target_cds.cdsend < exons[i][0]) {
            continue;
        }

        var start = target_cds.cdsstart > exons[i][0] ? target_cds.cdsstart : exons[i][0];
        var end = target_cds.cdsend < exons[i][1] ? target_cds.cdsend : exons[i][1];
        total += end - start;
    }
    return Math.floor(total / 3) - 1;
};

GenomeReader.prototype.calculateSequencePositionFromProteinPosition = function (idx, pos) {
    var self = this;
    var wanted_identifier = idx;
    var cds = self.result._raw_data.data[wanted_identifier.toLowerCase()];
    if (!cds) {
        return -1;
    }

    if (!cds.txstart) {
        cds = cds.map(function (cd) {
            if (Array.isArray(cd)) {
                cd = cd.filter(function (c) {
                    return c.chr.match(/^[\dXx]+$/);
                })[0];
                if (!cd) {
                    return null;
                }
            }
            return cd;
        });
    }

    var target_cds = cds[0] || {};
    var exons = target_cds.exons || [];

    var position_genome = Math.floor(pos / 3);

    var target_position = 0;

    if (pos < target_cds.cdsstart) {
        target_position = 6;
        if (target_cds.strand == -1) {
            target_position = 3;
        }
    }

    if (pos > target_cds.cdsend) {
        target_position = self.proteinLength(target_cds) * 3;
        if (target_cds.strand == 1) {
            target_position += 3;
        }
    }
    if (target_position == 0) {
        for (var i = 0; i < exons.length; i++) {
            if (target_cds.cdsstart > exons[i][1] & target_cds.cdsstart > exons[i][0]) {
                continue;
            }
            var start = target_cds.cdsstart > exons[i][0] ? target_cds.cdsstart : exons[i][0];
            var end = target_cds.cdsend < exons[i][1] ? target_cds.cdsend : exons[i][1];

            if (pos < start) {
                break;
            }

            if (pos <= end && pos >= start) {
                target_position += pos - start;
                break;
            } else {
                target_position += end - start;
            }
        }
    }
    target_position = Math.floor(target_position / 3) - 1;

    if (target_cds.strand == -1) {
        target_position = self.proteinLength(target_cds) - target_position;
    }

    return target_position;
};

GenomeReader.prototype.calculateProteinPositionForSequence = function (idx, pos) {
    var self = this;
    var wanted_identifier = idx;
    var cds = self.result._raw_data.data[wanted_identifier.toLowerCase()];
    if (!cds) {
        return -1;
    }

    if (!cds.txstart) {
        cds = cds.map(function (cd) {
            if (Array.isArray(cd)) {
                cd = cd.filter(function (c) {
                    return c.chr.match(/^[\dXx]+$/);
                })[0];
                if (!cd) {
                    return null;
                }
            }
            return cd;
        });
    }

    var target_cds = cds[0] || {};
    var exons = target_cds.exons || [];

    if (target_cds.strand == -1) {
        pos = self.proteinLength(target_cds) - pos;
    }
    var position_genome = pos * 3;

    var target_position;

    for (var i = 0; i < exons.length; i++) {
        if (target_cds.cdsstart > exons[i][1] & target_cds.cdsstart > exons[i][0]) {
            continue;
        }
        var start = target_cds.cdsstart > exons[i][0] ? target_cds.cdsstart : exons[i][0];
        var bases = exons[i][1] - start;
        if (bases >= position_genome) {
            target_position = start + position_genome;
            break;
        } else {
            position_genome -= bases;
        }
    }
    return target_position;
};

GenomeReader.prototype.calculatePositionForSequence = function (idx, pos) {
    var self = this;
    var wanted_identifier = self.sequences[idx].agi;
    var empty_regions = [];
    var calculated_pos = pos;

    if (wanted_identifier == 'genome') {
        // Don't change the genome identifier
    } else {
        calculated_pos = self.calculateProteinPositionForSequence(idx, pos);
    }

    for (var i = 0; i < empty_regions.length; i++) {
        if (pos > empty_regions[i][1]) {
            calculated_pos -= empty_regions[i][1] - empty_regions[i][0];
        }
        if (pos < empty_regions[i][1] && pos > empty_regions[i][0]) {
            calculated_pos = -1;
        }
    }

    return calculated_pos;
};

(function (serv) {
    var get_exon_boxes = function get_exon_boxes(result, uniprot) {
        var cds_data = result._raw_data.data;
        if (uniprot) {
            console.log('Filtering exons so we only show', uniprot);
        }
        var uniprots = Object.keys(cds_data);
        var max = result.max;
        var min = result.min;
        var return_data = [];
        var base_offset = 0;
        uniprots.filter(up => uniprot ? up === (uniprot || '').toLowerCase() : true).forEach(function (uniprot) {
            var ends = cds_data[uniprot].map(function (cd, idx) {
                if (Array.isArray(cd)) {
                    cd = cd.filter(function (c) {
                        return c.chr.match(/^[\dXx]+$/);
                    })[0];
                    if (!cd) {
                        return;
                    }
                }

                var exons = cd.exons;
                var color = idx == 0 ? '#999' : '#f99';
                exons.forEach(function (exon) {
                    return_data.push({ "aa": 1 + exon[0], "type": "box", "width": exon[1] - exon[0], "options": { "offset": base_offset, "height_scale": 1, "fill": color, "merge": false } });
                    if (cd.strand > 0) {
                        return_data.push({ "aa": exon[1] - 1, "type": "marker", "options": { "height": 4, "content": { "type": "right_triangle", "fill": '#aaa' }, "offset": base_offset + 2, "bare_element": true } });
                    } else {
                        return_data.push({ "aa": exon[0] + 1, "type": "marker", "options": { "height": 4, "content": { "type": "left_triangle", "fill": '#aaa' }, "offset": base_offset + 2, "bare_element": true } });
                    }
                });
                return_data.push({ "aa": cd.cdsstart, "type": "box", "width": 1, "options": { "fill": "#0000ff", "height_scale": 2, "offset": base_offset - 2, "merge": false } });
                return_data.push({ "aa": cd.cdsend, "type": "box", "width": 1, "options": { "fill": "#0000ff", "height_scale": 2, "offset": base_offset - 2, "merge": false } });
                base_offset += 1;
            });
            base_offset += 2;
        });
        return return_data;
    };

    var get_removed_labels = function get_removed_labels(result) {
        var removed = result.removed_regions || [];
        var results = [];
        var max = result.max;
        var min = result.min;
        var cds_data = result._raw_data.data;
        var uniprots = Object.keys(cds_data);
        var total = uniprots.reduce(function (prev, up) {
            return prev + cds_data[up].length;
        }, 0);
        removed.forEach(function (vals) {
            var start = vals[0];
            var end = vals[1];
            var start_txt = Math.floor(start % 1e6 / 1000) + "kb";
            var end_txt = Math.floor(end % 1e6 / 1000) + "kb";
            results.push({ "aa": start - 1, "type": "box", width: end - start + 3, "options": { "fill": "#999", "height_scale": total * 3, "offset": -1 * total } });
            results.push({ "aa": start - 3, "type": "text", "options": { "txt": start_txt, "fill": "#000", "height": 4, "offset": -4, "align": "right" } });
            results.push({ "aa": end + 3, "type": "text", "options": { "txt": end_txt, "fill": "#000", "height": 4, "offset": 4, "align": "left" } });
        });
        return results;
    };

    var calculate_removed_regions = function calculate_removed_regions(result, margin) {
        var introns = result.getIntrons(margin);

        var intervals = [{ "index": result.min - 2, "start": true, "idx": -1 }, { "index": result.min, "start": false, "idx": -1 }];
        introns.forEach(function (intron, idx) {
            intervals.push({ "index": intron[0], "start": true, "idx": idx });
            intervals.push({ "index": intron[1], "start": false, "idx": idx });
        });

        intervals.sort(function (a, b) {
            if (a.index < b.index) {
                return -1;
            }
            if (a.index > b.index) {
                return 1;
            }
            if (a.index == b.index) {
                return a.start ? -1 : 1;
            }
        });
        var results = [];
        intervals.forEach(function (intr, idx) {
            if (intr.start && intervals[idx + 1] && intervals[idx + 1].start == false) {
                if (intr.index != intervals[idx + 1].index && intervals[idx + 1].index != result.min) {
                    results.push([intr.index, intervals[idx + 1].index]);
                }
            }
        });
        result.removed_regions = results;
    };
    var generate_scaler_function = function generate_scaler_function(reader) {
        return function (in_pos, layer, inverse) {
            var pos = in_pos;

            if (!reader.result) {
                return inverse ? pos * 3 : Math.floor(pos / 3);
            }

            var introns = reader.result.removed_regions || [];

            if (inverse) {
                pos = in_pos * 3;
                calculated_pos = pos;
                for (var i = 0; i < introns.length && pos > 0; i++) {
                    var left_exon = i > 0 ? introns[i - 1] : [null, reader.result.min];
                    var right_exon = introns[i] || [reader.result.max, null];
                    pos -= right_exon[0] - left_exon[1];
                    if (pos > 0) {
                        calculated_pos += introns[i][1] - introns[i][0];
                    }
                }
                return calculated_pos + reader.result.min;
            }

            var calculated_pos = pos - reader.result.min;
            for (var i = 0; i < introns.length; i++) {
                if (pos > introns[i][1]) {
                    calculated_pos -= introns[i][1] - introns[i][0];
                }
                if (pos < introns[i][1] && pos > introns[i][0]) {
                    calculated_pos = introns[i][1] - reader.result.min;
                }
            }
            if (calculated_pos < 3) {
                calculated_pos = 3;
            }
            return Math.floor(calculated_pos / 3);
        };
    };
    Object.defineProperty(serv.prototype, 'exon_margin', {
        set: function set(val) {
            this._exon_margin = val;
            if (this.result) {
                calculate_removed_regions(this.result, val);
                this.redrawIntrons();
            }
        },
        get: function get() {
            return this._exon_margin;
        }
    });

    var redrawIntrons = function redrawIntrons(renderer, controller_name, scaler_function) {
        var labs = [];
        var zoomCheck = function zoomCheck() {
            if (labs.length < 1 || !labs[0].parentNode) {
                return;
            }
            var hidden = false;
            for (var i = 0; !hidden && i < labs.length - 3; i += 3) {
                if (labs[i].hasAttribute('display')) {
                    hidden = true;
                    continue;
                }
                if (labs[i].getBoundingClientRect().right > labs[i + 3].getBoundingClientRect().left) {
                    hidden = true;
                }
            }
            labs.forEach(function (lab) {
                if (lab.nodeName == 'rect') {
                    return;
                }if (hidden) {
                    lab.setAttribute('display', 'none');
                } else {
                    lab.removeAttribute('display');
                }
            });
        };
        renderer.bind('zoomChange', zoomCheck);

        return function () {
            var result = this.result;
            renderer.sequence = Array(scaler_function(result.max)).join('.');

            if (labs.length > 0) {
                labs.forEach(function (lab) {
                    renderer.remove(controller_name, lab);
                });
                labs = [];
            }
            var proxy_reader = {
                agi: controller_name,
                gotResult: function gotResult() {
                    labs = renderer.renderObjects(controller_name, get_removed_labels(result));
                    renderer.refresh();
                    zoomCheck();
                }
            };
            __WEBPACK_IMPORTED_MODULE_1__Service__["a" /* default */].prototype.registerSequenceRenderer.call(proxy_reader, renderer);
            proxy_reader.gotResult();
        };
    };

    serv.prototype.setupSequenceRenderer = function (renderer) {
        var self = this;
        renderer.addAxisScale('genome', function (pos, layer, inverse) {
            if (layer && layer.scales.has('genomic')) {
                return pos;
            }
            let all_scales = Object.keys(self.result._raw_data.data);
            let identifier = layer.name;
            for (let scale of all_scales) {
                if (layer.scales.has(scale.toUpperCase()) || layer.scales.has(scale.toLowerCase())) {
                    identifier = scale;
                }
            }
            if (inverse) {
                return self.calculateSequencePositionFromProteinPosition(identifier, pos);
            }
            return self.calculateProteinPositionForSequence(identifier, pos);
        });
        var controller_name = 'cds';
        var redraw_alignments = function redraw_alignments(sequence_index) {
            if (!sequence_index) {
                sequence_index = 0;
            }
            __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].registerLayer(controller_name, { 'fullname': 'Exons', 'color': '#000000' });
            __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(controller_name).scales.add('genomic');

            if (renderer.trackOrder.indexOf(controller_name) < 0) {
                renderer.trackOrder.push(controller_name);
            }
            renderer.showLayer(controller_name);

            var result = this.result;

            var aligned = result.getSequences();
            var scaler_function = generate_scaler_function(self);

            renderer.addAxisScale('removeIntrons', scaler_function);

            calculate_removed_regions(self.result, self.exon_margin || 300);

            if (!renderer.sequence) {
                // Not sure what to do with this bit here

                renderer.setSequence(Array(scaler_function(result.max)).join('.'))(function () {
                    redraw_alignments(sequence_index);
                });
                return;
            } else {
                renderer.sequence = Array(scaler_function(result.max)).join('.');
                renderer.redrawAxis();
            }
            var proxy_reader = {
                agi: controller_name,
                gotResult: function gotResult() {
                    renderer.renderObjects(controller_name, get_exon_boxes(result, self.reviewed ? self.swissprot : self.uniprot));
                }
            };
            __WEBPACK_IMPORTED_MODULE_1__Service__["a" /* default */].prototype.registerSequenceRenderer.call(proxy_reader, renderer);
            proxy_reader.gotResult();

            self.redrawIntrons = redrawIntrons(renderer, controller_name, scaler_function);
            self.redrawIntrons();
        };

        this.bind('resultReceived', redraw_alignments);
    };
})(GenomeReader);

/* harmony default export */ __webpack_exports__["a"] = (GenomeReader);

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__MASCP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__SequenceRenderer__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__CondensedSequenceRendererNavigation__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__bean__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__SVGCanvas__ = __webpack_require__(12);
/**
 *  @fileOverview   Basic classes and definitions for an SVG-based sequence renderer
 */







const svgns = 'http://www.w3.org/2000/svg';

/** Default class constructor
 *  @class      Renders a sequence using a condensed track-based display
 *  @param      {Element} sequenceContainer Container element that the sequence currently is found in, and also 
 *              the container that data will be re-inserted into.
 *  @extends    MASCP.SequenceRenderer
 */
const CondensedSequenceRenderer = function CondensedSequenceRenderer(sequenceContainer) {
    this._RS = 50;
    __WEBPACK_IMPORTED_MODULE_1__SequenceRenderer__["a" /* default */].apply(this, arguments);
    var self = this;

    // Create a common layer for the primary sequence
    __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].registerLayer('primarySequence', { 'fullname': 'Primary Sequence' });

    CondensedSequenceRenderer.Zoom(self);
    var resizeTimeout;
    var resize_callback = function resize_callback() {
        sequenceContainer.cached_width = sequenceContainer.getBoundingClientRect().width;
    };
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(resize_callback);
        } else {
            resizeTimeout = setTimeout(resize_callback, 100);
        }
    }, true);
    sequenceContainer.cached_width = sequenceContainer.getBoundingClientRect().width;

    // We want to unbind the default handler for sequence change that we get from
    // inheriting from CondensedSequenceRenderer
    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this, 'sequenceChange');

    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this, 'sequenceChange', function () {
        for (var layername in __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers) {
            if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers.hasOwnProperty(layername)) {
                __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers[layername].disabled = true;
            }
        }
        self.zoom = self.zoom;
    });

    return this;
};

CondensedSequenceRenderer.prototype = new __WEBPACK_IMPORTED_MODULE_1__SequenceRenderer__["a" /* default */]();

(function (clazz) {
    var createCanvasObject = function createCanvasObject() {
        var renderer = this;

        if (this._object) {
            if (typeof svgweb != 'undefined') {
                svgweb.removeChild(this._object, this._object.parentNode);
            } else {
                this._object.parentNode.removeChild(this._object);
            }
            this._canvas = null;
            this._object = null;
        }
        var canvas;
        if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
            var native_canvas = this.win().document.createElementNS(svgns, 'svg');
            native_canvas.setAttribute('width', '100%');
            native_canvas.setAttribute('height', '100%');
            this._container.appendChild(native_canvas);
            this._canvas = native_canvas;
            canvas = {
                'addEventListener': function addEventListener(name, load_func) {
                    native_canvas.contentDocument = { 'rootElement': native_canvas };
                    load_func.call(native_canvas);
                }
            };
        }

        canvas.addEventListener('load', function () {
            var container_canv = this;
            Object(__WEBPACK_IMPORTED_MODULE_4__SVGCanvas__["a" /* default */])(container_canv);
            if (renderer.font_order) {
                container_canv.font_order = renderer.font_order;
            }
            var group = container_canv.makeEl('g');

            var canv = container_canv.makeEl('svg');
            canv.RS = renderer._RS;
            Object(__WEBPACK_IMPORTED_MODULE_4__SVGCanvas__["a" /* default */])(canv);
            if (renderer.font_order) {
                canv.font_order = renderer.font_order;
            }
            group.appendChild(canv);
            container_canv.appendChild(group);

            var supports_events = true;

            try {
                var noop = canv.addEventListener;
            } catch (err) {
                supports_events = false;
            }

            var canvas_rect = canv.makeEl('rect', { 'x': '-10%',
                'y': '-10%',
                'width': '120%',
                'height': '120%',
                'style': 'fill: #ffffff;' });

            var left_fade = container_canv.makeEl('rect', { 'x': '0',
                'y': '0',
                'width': '50',
                'height': '100%',
                'style': 'fill: url(#left_fade);' });

            var right_fade = container_canv.makeEl('rect', { 'x': '100%',
                'y': '0',
                'width': '25',
                'height': '100%',
                'transform': 'translate(-15,0)',
                'style': 'fill: url(#right_fade);' });

            container_canv.appendChild(left_fade);
            container_canv.appendChild(right_fade);

            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canv, 'pan', function () {
                if (canv.currentTranslateCache.x >= 0) {
                    left_fade.setAttribute('visibility', 'hidden');
                } else {
                    left_fade.setAttribute('visibility', 'visible');
                }
                if (renderer.rightVisibleResidue() < renderer.sequence.length) {
                    right_fade.setAttribute('visibility', 'visible');
                } else {
                    right_fade.setAttribute('visibility', 'hidden');
                }
            });

            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canv, '_anim_begin', function () {
                left_fade.setAttribute('visibility', 'hidden');
                right_fade.setAttribute('visibility', 'hidden');
            });

            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canv, '_anim_end', function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(canv, 'pan');
            });

            canv.currentTranslateCache = { x: 0, y: 0 };

            if (canv.currentTranslateCache.x >= 0) {
                left_fade.setAttribute('visibility', 'hidden');
            }
            right_fade.setAttribute('visibility', 'hidden');

            var nav_group = container_canv.makeEl('g');
            container_canv.appendChild(nav_group);
            var nav_canvas = container_canv.makeEl('svg');
            nav_group.appendChild(nav_canvas);

            group.style.willChange = 'transform';

            canv.setScale = function (scale) {
                var curr_transform = (group._cached_transform || '').replace(/scale\([^\)]+\)/, '');
                if (scale !== null) {
                    curr_transform = (' scale(' + scale + ') ' + curr_transform).replace(/\s+/g, ' ');
                }
                group._cached_transform = curr_transform;
                group.style.transform = curr_transform;
            };

            nav_canvas.setScale = function (scale) {
                var curr_transform = (nav_group._cached_transform || '').replace(/scale\([^\)]+\)/, '');
                if (scale !== null) {
                    curr_transform = (curr_transform + ' scale(' + scale + ') ').replace(/\s+/g, ' ');
                }
                nav_group._cached_transform = curr_transform;
                nav_group.style.transform = curr_transform;
            };
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canv, 'zoomChange', () => {
                if (!renderer.fixed_size) {
                    return;
                }
                canv.setScale(1);
                nav_canvas.setScale(1);
                requestAnimationFrame(() => {
                    let container_height = container_canv.getBoundingClientRect().height;
                    let canv_height = canv.getBoundingClientRect().height;
                    let current_scale = (group._cached_transform || 'scale(1)').match(/scale\(([\d\.]+)\)/) || '1';
                    canv.setScale((1 * container_height / canv_height).toFixed(2));
                    nav_canvas.setScale((1 * container_height / canv_height).toFixed(2));
                });
            });
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canv, 'panend', () => {
                let evObj = new Event('panned', { bubbles: true, cancelable: true });
                canv.dispatchEvent(evObj);
            });

            var ua = window.navigator.userAgent;
            var is_explorer = false;
            if (ua.indexOf('Edge/') >= 0) {
                is_explorer = true;
            }

            canv.setCurrentTranslateXY = function (x, y) {
                var curr_transform = group._cached_transform || '';
                curr_transform = (curr_transform.replace(/translate\([^\)]+\)/, '') + ' translate(' + x + 'px, ' + y + 'px) ').replace(/\s+/g, ' ');
                group._cached_transform = curr_transform;
                if (!is_explorer) {
                    group.style.transform = curr_transform;
                } else {
                    group.setAttribute('transform', curr_transform.replace(/px/g, ''));
                }

                this.currentTranslateCache.x = x;
                this.currentTranslateCache.y = y;
            };
            canv.setCurrentTranslateXY(0, 0);

            nav_canvas.setCurrentTranslateXY = function (x, y) {
                var curr_transform = (nav_group.getAttribute('transform') || '').replace(/translate\([^\)]+\)/, '');
                curr_transform = curr_transform + ' translate(' + x + ', ' + y + ') ';
                nav_group.setAttribute('transform', curr_transform);
                this.currentTranslate.x = x;
                this.currentTranslate.y = y;
            };
            nav_canvas.setCurrentTranslateXY(0, 0);

            addNav.call(renderer, nav_canvas);

            var nav = renderer.navigation;
            var old_show = nav.show,
                old_hide = nav.hide;
            nav.show = function () {
                old_show.apply(nav, arguments);
                canv.style.GomapScrollLeftMargin = 100 * renderer._RS / renderer.zoom;
            };

            nav.hide = function () {
                old_hide.apply(nav, arguments);
                canv.style.GomapScrollLeftMargin = 1000;
            };

            renderer._container_canvas = container_canv;
            container_canv.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            container_canv.setAttribute('width', '100%');
            container_canv.setAttribute('height', '100%');
            canv.appendChild(canv.makeEl('rect', { 'x': 0, 'y': 0, 'opacity': 0, 'width': '100%', 'height': '100%', 'stroke-width': '0', 'fill': '#ffffff' }));
            renderer._object = this;
            renderer._canvas = canv;
            renderer._canvas._canvas_height = 0;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(renderer, 'svgready');
        }, false);

        return canvas;
    };

    var wheel_fn = function wheel_fn(e) {
        e.stopPropagation();
        return true;
    };

    var addNav = function addNav(nav_canvas) {
        this.navigation = new CondensedSequenceRenderer.Navigation(nav_canvas, this);
        var nav = this.navigation;
        var self = this;

        var hide_chrome = function hide_chrome() {
            nav.demote();
        };

        var show_chrome = function show_chrome() {
            nav.promote();
            nav.refresh();
        };

        if (!__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].IE) {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._canvas, 'panstart', hide_chrome);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._canvas, 'panend', show_chrome);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._canvas, '_anim_begin', hide_chrome);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._canvas, '_anim_end', show_chrome);
            nav_canvas.addEventListener('DOMMouseScroll', wheel_fn, false);
            nav_canvas.addEventListener('wheel', wheel_fn, false);
            nav_canvas.onmousewheel = wheel_fn;
        }
    };
    var drawAminoAcids = function drawAminoAcids() {
        var renderer = this;
        var aas = renderer.addTextTrack(this.sequence, this._canvas.set());
        aas.attr({ 'y': 0.5 * renderer._axis_height * renderer._RS });
        renderer.select = function () {
            var vals = Array.prototype.slice.call(arguments);
            var from = vals[0];
            var to = vals[1];
            this.moveHighlight.apply(this, vals);
        };
        var zoomchange = function zoomchange() {
            aas.attr({ 'y': 0.5 * renderer._axis_height * renderer._RS });
        };
        var canvas = renderer._canvas;
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canvas, 'zoomChange', zoomchange);
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(aas, 'removed', function () {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(canvas, 'zoomChange', zoomchange);
        });
        return aas;
    };
    var mainDrawAxis;
    var drawAxis = mainDrawAxis = function mainDrawAxis(canvas, lineLength) {
        var RS = this._RS;
        var self = this;
        var x = 0,
            i = 0;

        var axis = canvas.set();

        var axis_back = canvas.rect(0, 0, lineLength, 1.5);
        axis_back.setAttribute('fill', "url('#" + self.axis_pattern_id + "')");
        axis_back.removeAttribute('stroke');
        axis_back.removeAttribute('stroke-width');
        axis_back.setAttribute('id', 'axis_back');

        var base_axis_height = 30;

        var all_labels = canvas.set();
        var major_mark_labels = canvas.set();
        var minor_mark_labels = canvas.set();
        var thousand_mark_labels = canvas.set();
        var minor_mark = 10;
        var major_mark = 20;

        if (this.sequence.length > 5000) {
            minor_mark = 100;
            major_mark = 200;
        }
        if (this.sequence.length > 1000) {
            minor_mark = 20;
            major_mark = 40;
        }
        for (i = 0; i < lineLength / 5; i++) {

            var a_text = canvas.text(x - 0.5, 0, "" + x);
            all_labels.push(a_text);

            if (x % major_mark === 0 && x !== 0) {
                major_mark_labels.push(a_text);
            } else if (x % minor_mark === 0 && x !== 0) {
                minor_mark_labels.push(a_text);
            }
            if (x % (250 * parseInt(this.sequence.length / 500)) === 0 && x !== 0) {
                thousand_mark_labels.push(a_text);
            }
            x += 5;
        }

        for (i = 0; i < all_labels.length; i++) {
            all_labels[i].style.textAnchor = 'middle';
            all_labels[i].firstChild.setAttribute('dy', '1.5ex');
        }

        all_labels.attr({ 'pointer-events': 'none', 'text-anchor': 'middle', 'font-size': 7 * RS + 'pt' });
        all_labels.hide();

        self._axis_height = parseInt(base_axis_height / self.zoom);

        var zoom_status = null;
        var zoomchange = function zoomchange() {
            var renderer = self;
            renderer._axis_height = parseInt(base_axis_height / renderer.zoom);
            var pattern = renderer._canvas.ownerSVGElement.getElementById(renderer.axis_pattern_id);

            thousand_mark_labels.forEach(function (label) {
                label.setAttribute('visibility', 'hidden');
            });

            if (this.zoom > 3.6) {
                axis_back.setAttribute('transform', 'translate(-5,' + 0.3 * renderer._axis_height * RS + ')');
                axis_back.setAttribute('height', 0.25 * renderer._axis_height * RS);
                pattern.setAttribute('width', 10 * RS);
                pattern.firstChild.setAttribute('x', 9.5 * RS);
                pattern.firstChild.setAttribute('width', RS / renderer.zoom);

                minor_mark_labels.show();
                major_mark_labels.show();
                var text_scale = 0.15 * self._axis_height;
                if (text_scale < 1) {
                    text_scale = 1;
                }
                minor_mark_labels.attr({ 'font-size': text_scale * RS + 'pt', 'text-anchor': 'end' });
                major_mark_labels.attr({ 'font-size': text_scale * RS + 'pt', 'text-anchor': 'end' });
                if (this._visibleTracers && this._visibleTracers()) {
                    this._visibleTracers().show();
                }
            } else if (this.zoom > 1.8) {

                minor_mark_labels.hide();
                major_mark_labels.show();
                major_mark_labels.attr({ 'font-size': 0.5 * RS * self._axis_height + 'pt', 'text-anchor': 'middle' });
                axis_back.setAttribute('transform', 'translate(-25,' + 0.5 * renderer._axis_height * RS + ')');
                axis_back.setAttribute('height', 0.3 * renderer._axis_height * RS);
                pattern.setAttribute('width', 20 * RS);
                pattern.firstChild.setAttribute('width', RS / renderer.zoom);
                pattern.firstChild.setAttribute('x', '0');
                if (this.tracers) {
                    this.tracers.hide();
                }
            } else if (this.zoom > 0.2) {

                if (this.tracers) {
                    this.tracers.hide();
                }
                minor_mark_labels.hide();
                major_mark_labels.show();
                major_mark_labels.attr({ 'font-size': 0.5 * RS * self._axis_height + 'pt', 'text-anchor': 'middle' });
                axis_back.setAttribute('transform', 'translate(-25,' + 0.5 * renderer._axis_height * RS + ')');
                axis_back.setAttribute('height', 0.3 * renderer._axis_height * RS);
                pattern.setAttribute('width', 50 * RS);
                pattern.firstChild.setAttribute('width', RS / renderer.zoom);

                var last_right = -10000;
                var changed = false;
                major_mark_labels.forEach(function (label) {
                    if (!label.cached_bbox) {
                        label.cached_bbox = label.getBBox();
                    }
                    if (label.cached_bbox.x <= last_right + RS * 10 || parseInt(label.textContent) % 50 != 0) {
                        label.setAttribute('visibility', 'hidden');
                        changed = true;
                    } else {
                        label.setAttribute('visibility', 'visible');
                        last_right = label.cached_bbox.x + label.cached_bbox.width;
                    }
                });
                if (changed) {
                    major_mark_labels[0].setAttribute('visibility', 'hidden');
                }
            } else {
                if (this.tracers) {
                    this.tracers.hide();
                }
                minor_mark_labels.hide();
                major_mark_labels.hide();
                thousand_mark_labels.show();
                thousand_mark_labels.attr({ 'font-size': 0.5 * RS * self._axis_height + 'pt', 'text-anchor': 'middle' });

                axis_back.setAttribute('transform', 'translate(-50,' + 0.85 * renderer._axis_height * RS + ')');
                axis_back.setAttribute('height', 0.1 * renderer._axis_height * RS);
                pattern.setAttribute('width', 250 * RS);
                pattern.firstChild.setAttribute('width', RS / renderer.zoom);

                var last_right = -10000;
                var changed = false;
                thousand_mark_labels.forEach(function (label) {
                    if (!label.cached_bbox) {
                        label.cached_bbox = label.getBBox();
                    }
                    if (label.cached_bbox.x <= last_right + RS * 10 || parseInt(label.textContent) % 250 != 0) {
                        label.setAttribute('visibility', 'hidden');
                    } else {
                        label.setAttribute('visibility', 'visible');
                        last_right = label.cached_bbox.x + label.cached_bbox.width;
                    }
                });
                if (changed) {
                    thousand_mark_labels[0].setAttribute('visibility', 'hidden');
                }
            }
        };
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canvas, 'zoomChange', zoomchange);
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(axis, 'removed', function () {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(canvas, 'zoomChange', zoomchange);
            var remover = function remover(el) {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            };
            axis_back.parentNode.removeChild(axis_back);
            all_labels.forEach(remover);
        });
        return axis;
    };

    clazz.prototype.panTo = function (end, callback) {
        var renderer = this;
        var pos = renderer.leftVisibleResidue();
        var delta = 1;
        if (pos == end) {
            if (callback) {
                callback.call(null);
            }
            return;
        }
        if (pos > end) {
            delta = -1;
        }
        requestAnimationFrame(function () {
            renderer.setLeftVisibleResidue(pos);
            pos += delta;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(renderer._canvas, 'panend');
            if (pos !== end) {
                requestAnimationFrame(arguments.callee);
            } else {
                if (callback) {
                    callback.call(null);
                }
            }
        });
    };

    clazz.prototype.zoomTo = function (zoom, residue, callback) {
        var renderer = this;
        var curr = renderer.zoom;
        var delta = (zoom - curr) / 50;
        let zoomchange = function zoomchange() {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(renderer, 'zoomChange', zoomchange);
            delete renderer.zoomCenter;
            if (callback) {
                callback.call(null);
            }
        };
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(renderer, 'zoomChange', zoomchange);
        if (residue) {
            renderer.zoomCenter = residue == 'center' ? residue : { 'x': renderer._RS * residue };
        } else {
            renderer.zoom = zoom;
            return;
        }
        let zoomer = () => {
            renderer.zoom = curr;
            curr += delta;
            if (Math.abs(curr - zoom) > 0.01) {
                requestAnimationFrame(zoomer);
            }
        };
        requestAnimationFrame(zoomer);
    };

    clazz.prototype.showResidues = function (start, end) {
        let residues_per_zoom_unit = this._container.clientWidth / this._RS;
        let container_width = this._container.clientWidth;
        let min_zoom_level = container_width / (2 * this.sequence.length);

        if (!this.sequence) {
            return;
        }

        let delta = end - start;
        let target_zoom_level = min_zoom_level / (delta / this.sequence.length);
        if (target_zoom_level === this.zoom) {
            this.setLeftVisibleResidue(start);
            return Promise.resolve();
        }
        this.zoomCenter = { x: Math.floor(0.5 * (end + start)) };
        let zoomed = new Promise(resolve => {
            let zoomchange = () => {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this, 'zoomChange', zoomchange);
                delete this.zoomCenter;
                this.setLeftVisibleResidue(start);
                resolve();
            };
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this, 'zoomChange', zoomchange);
        });
        this.zoom = target_zoom_level;

        return zoomed;
    };

    clazz.prototype.setLeftVisibleResidue = function (val) {
        var self = this;
        self._canvas.setCurrentTranslateXY(self._canvas.width.baseVal.value * (1 - val / (self.sequence.length + self.padding + 2)) - self._canvas.width.baseVal.value, 0);
    };

    clazz.prototype.leftVisibleResidue = function () {
        var self = this;
        var val = Math.floor((self.sequence.length + self.padding + 2) * (1 - (self._canvas.width.baseVal.value + self._canvas.currentTranslateCache.x) / self._canvas.width.baseVal.value)) - 1;
        if (val < 0) {
            val = 0;
        }
        return val;
    };

    clazz.prototype.rightVisibleResidue = function () {
        var self = this;
        var container_width = self._container_canvas.parentNode.cached_width;
        if (!container_width) {
            container_width = self._container_canvas.parentNode.getBoundingClientRect().width;
        }
        var val = Math.floor(self.leftVisibleResidue() + (self.sequence.length + self.padding + 2) * (container_width / self._canvas.width.baseVal.value));
        if (val > self.sequence.length) {
            val = self.sequence.length;
        }
        return val;
    };

    clazz.prototype.addAxisScale = function (identifier, scaler) {
        if (!this._scalers) {
            this._scalers = [];
        }
        let scalers = this._scalers.filter(scale => scale.identifier !== identifier);
        scalers.push(scaler);
        this._scalers = scalers;
        scaler.identifier = identifier;
        return scaler;
    };

    clazz.prototype.refreshScale = function () {
        var self = this;
        var lays = Object.keys(this._layer_containers);
        lays.forEach(function (lay) {
            self._layer_containers[lay].forEach(function (el) {
                if (el.move && el.aa) {
                    var aa = self.scalePosition(el.aa, lay);
                    var aa_width = self.scalePosition(el.aa + el.aa_width, lay);
                    if (aa < 0) {
                        aa *= -1;
                    }
                    if (aa_width < 0) {
                        aa_width *= -1;
                    }
                    el.move(aa - 1, aa_width - aa);
                }
            });
        });
    };

    clazz.prototype.scalePosition = function (aa, layer, inverse) {
        var layer_obj = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(layer);
        if (!layer_obj) {
            console.log('Missing layer object for layer identifier', layer, 'making dummy layer scaled with identifier', layer);
            layer_obj = { 'name': layer, 'scales': new Set() };
            layer_obj.scales.add(layer);
        }
        let scaler_funcs = (this._scalers || []).concat([]);
        var new_aa = (inverse ? scaler_funcs.reverse() : scaler_funcs).reduce((val, fn) => {
            return fn(val, layer_obj, inverse);
        }, aa);
        return new_aa;
    };

    clazz.prototype.getAA = function (aa, layer, scale_name) {
        return this.getAminoAcidsByPosition([aa], layer, scale_name).shift();
    };

    clazz.prototype.getAminoAcidsByPosition = function (aas, layer) {
        var self = this;
        var new_aas = aas.map(function (aa) {
            return Math.abs(self.scalePosition(aa, layer));
        });
        var results = __WEBPACK_IMPORTED_MODULE_1__SequenceRenderer__["a" /* default */].prototype.getAminoAcidsByPosition.call(this, new_aas);

        for (var i = 0; i < new_aas.length; i++) {
            if (results[i]) {
                results[i].original_index = aas[i];
            }
        }
        return results;
    };

    clazz.prototype.getAminoAcidsByPeptide = function (peptide, layer) {
        layer = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(layer);
        var self = this;
        var positions = [];
        var self_seq;
        var identifier = layer.accession;
        if (self.sequences) {
            self_seq = self.sequences[self.sequences.map(function (seq) {
                return (seq.agi || seq.acc || "").toLowerCase();
            }).indexOf(identifier.toLowerCase())].toString();
        } else {
            self_seq = self.sequence;
        }
        var start = self_seq.indexOf(peptide);
        for (var i = 0; i < peptide.length; i++) {
            positions.push(start + i);
        }
        var results = self.getAminoAcidsByPosition(positions, layer);
        if (results.length) {
            results.addToLayer = function (layername, fraction, options) {
                return results[0].addBoxOverlay(layername, results.length, fraction, options);
            };
        } else {
            results.addToLayer = function () {};
        }
        return results;
    };

    clazz.prototype.win = function () {
        if (this._container && this._container.ownerDocument && this._container.ownerDocument.defaultView) {
            var return_val = this._container.ownerDocument.defaultView;
            if (typeof return_val === 'object' && return_val.constructor !== Window) {
                return_val = return_val[Object.keys(return_val)[0]];
            }
            return return_val;
        }
        return null;
    };

    clazz.prototype.setSequence = function (sequence) {
        var new_sequence = this._cleanSequence(sequence);
        if (new_sequence == this.sequence && new_sequence !== null) {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(this, 'sequenceChange');
            return;
        }

        if (!new_sequence) {
            return;
        }

        this.sequence = new_sequence;

        delete this.sequences;

        var seq_chars = this.sequence.split('');
        var line_length = seq_chars.length;

        if (line_length === 0) {
            return;
        }

        var renderer = this;

        var build_sequence_els = function build_sequence_els() {
            var seq_els = [];
            renderer.sequence.split('').forEach(function (aa, i) {
                var el = {};
                el._index = i;
                el._renderer = renderer;
                renderer._extendElement(el);
                el.amino_acid = aa;
                seq_els.push(el);
            });
            renderer._sequence_els = seq_els;
        };

        build_sequence_els();

        var RS = this._RS;

        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this, 'svgready');
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this, 'svgready', function (cnv) {
            var canv = renderer._canvas;
            canv.RS = RS;
            canv.setAttribute('background', '#000000');
            canv.setAttribute('preserveAspectRatio', 'xMinYMin meet');

            var defs = canv.makeEl('defs');
            renderer._container_canvas.appendChild(defs);

            defs.appendChild(canv.make_gradient('track_shine', '0%', '100%', ['#111111', '#aaaaaa', '#111111'], [0.5, 0.5, 0.5]));
            defs.appendChild(canv.make_gradient('simple_gradient', '0%', '100%', ['#aaaaaa', '#888888'], [1, 1]));
            defs.appendChild(canv.make_gradient('left_fade', '100%', '0%', ['#ffffff', '#ffffff'], [1, 0]));
            defs.appendChild(canv.make_gradient('right_fade', '100%', '0%', ['#ffffff', '#ffffff'], [0, 1]));
            defs.appendChild(canv.make_gradient('red_3d', '0%', '100%', ['#CF0000', '#540000'], [1, 1]));

            renderer.gradients = [];
            renderer.add3dGradient = function (color) {
                defs.appendChild(canv.make_gradient('grad_' + color, '0%', '100%', [color, '#ffffff', color], [1, 1, 1]));
                renderer.gradients.push(color);
            };

            var shadow = canv.makeEl('filter', {
                'id': 'drop_shadow',
                'filterUnits': 'objectBoundingBox',
                'x': '-50%',
                'y': '-50%',
                'width': '200%',
                'height': '200%'
            });

            shadow.appendChild(canv.makeEl('feGaussianBlur', { 'in': 'SourceGraphic', 'stdDeviation': '4', 'result': 'blur_out' }));
            shadow.appendChild(canv.makeEl('feOffset', { 'in': 'blur_out', 'result': 'the_shadow', 'dx': '3', 'dy': '1' }));
            shadow.appendChild(canv.makeEl('feBlend', { 'in': 'SourceGraphic', 'in2': 'the_shadow', 'mode': 'normal' }));

            defs.appendChild(shadow);
            var link_icon = canv.makeEl('svg', {
                'width': '100%',
                'height': '100%',
                'id': 'new_link_icon',
                'viewBox': '0 0 100 100',
                'preserveAspectRatio': 'xMinYMin meet'
            });

            defs.appendChild(link_icon);

            link_icon.appendChild(canv.makeEl('rect', {
                'x': '12.5',
                'y': '37.5',
                'stroke-width': '3',
                'width': '50',
                'height': '50',
                'stroke': '#ffffff',
                'fill': 'none'
            }));
            link_icon.appendChild(canv.makeEl('path', {
                'd': 'M 50.0,16.7 L 83.3,16.7 L 83.3,50.0 L 79.2,56.2 L 68.8,39.6 L 43.8,66.7 L 33.3,56.2 L 60.4,31.2 L 43.8,20.8 L 50.0,16.7 z',
                'stroke-width': '3',
                'stroke': '#999999',
                'fill': '#ffffff'
            }));

            var plus_icon = canv.makeEl('svg', {
                'width': '100%',
                'height': '100%',
                'id': 'plus_icon',
                'viewBox': '0 0 100 100',
                'preserveAspectRatio': 'xMinYMin meet'
            });
            plus_icon.appendChild(canv.plus(0, 0, 100 / canv.RS));

            defs.appendChild(plus_icon);

            var minus_icon = canv.makeEl('svg', {
                'width': '100%',
                'height': '100%',
                'id': 'minus_icon',
                'viewBox': '0 0 100 100',
                'preserveAspectRatio': 'xMinYMin meet'
            });
            minus_icon.appendChild(canv.minus(0, 0, 100 / canv.RS));

            defs.appendChild(minus_icon);
            var axis_pattern_id = 'axis_pattern_' + new Date().getTime();
            var pattern = canv.makeEl('pattern', {
                'patternUnits': 'userSpaceOnUse',
                'x': '0',
                'y': '0',
                'width': 10 * canv.RS,
                'height': 2 * canv.RS,
                'id': axis_pattern_id
            });
            renderer.axis_pattern_id = axis_pattern_id;

            var line = canv.makeEl('rect', {
                'x': '0',
                'y': '0',
                'width': '10%',
                'height': '1000%',
                'fill': '#000',
                'stroke': '0'
            });
            pattern.appendChild(line);

            defs.appendChild(pattern);

            var self = this;
            renderer._axis_height = 10;
            var aas = drawAminoAcids.call(self, canv);
            renderer.hideAxis = function () {
                drawAxis = function drawAxis(canv) {
                    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canv, 'zoomChange', function () {
                        self._axis_height = 10 / self.zoom;
                    });
                    return {};
                };
                self._axis_height = 10 / self.zoom;
                this.redrawAxis();
            };
            renderer.showAxis = function () {
                drawAxis = mainDrawAxis;
                this.redrawAxis();
            };

            var axis = drawAxis.call(self, canv, line_length);
            renderer.redrawAxis = function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(axis, 'removed');
                aas.forEach(function (aa) {
                    if (aa.parentNode) {
                        aa.parentNode.removeChild(aa);
                    }
                });
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(aas, 'removed');
                axis = drawAxis.call(self, canv, renderer.sequence.length);
                aas = drawAminoAcids.call(self, canv);

                build_sequence_els();
                renderer.refresh();
            };
            if (!renderer.hide_axis) {
                this.showAxis();
            } else {
                this.hideAxis();
            }

            renderer._layer_containers = {};
            renderer.enablePrintResizing();
            renderer.enableScaling();
            renderer.enableSelection();

            // When we have a layer registered with the global MASCP object
            // add a track within this renderer.
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */], 'layerRegistered', function (layer, rend) {
                if (!rend || rend === renderer) {
                    renderer.addTrack(layer);
                }
            });

            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(renderer, 'sequenceChange');
        });
        var canvas = createCanvasObject.call(this);
        if (!this._canvas) {
            if (typeof svgweb != 'undefined') {
                svgweb.appendChild(canvas, this._container);
            } else {
                this._container.appendChild(canvas);
            }
        }

        var rend = this;
        this.EnableHighlights();

        var seq_change_func = function seq_change_func(other_func) {
            if (!rend._canvas) {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(rend, 'sequenceChange', function () {
                    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(rend, 'sequenceChange', arguments.callee);
                    other_func.apply();
                });
            } else {
                other_func.apply();
            }
        };

        seq_change_func.ready = function (other_func) {
            this.call(this, other_func);
        };

        return seq_change_func;
    };
})(CondensedSequenceRenderer);

(function () {
    var svgns = 'http://www.w3.org/2000/svg';
    var add_import = function add_import(ownerdoc) {
        if (!ownerdoc.ELEMENT_NODE) {
            ownerdoc.ELEMENT_NODE = 1;
            ownerdoc.ATTRIBUTE_NODE = 2;
            ownerdoc.TEXT_NODE = 3;
            ownerdoc.CDATA_SECTION_NODE = 4;
            ownerdoc.ENTITY_REFERENCE_NODE = 5;
            ownerdoc.ENTITY_NODE = 6;
            ownerdoc.PROCESSING_INSTRUCTION_NODE = 7;
            ownerdoc.COMMENT_NODE = 8;
            ownerdoc.DOCUMENT_NODE = 9;
            ownerdoc.DOCUMENT_TYPE_NODE = 10;
            ownerdoc.DOCUMENT_FRAGMENT_NODE = 11;
            ownerdoc.NOTATION_NODE = 12;
        }

        ownerdoc._importNode = function (node, allChildren) {
            switch (node.nodeType) {
                case ownerdoc.ELEMENT_NODE:
                    var newNode = ownerdoc.createElementNS(svgns, node.nodeName);
                    /* does the node have any attributes to add? */
                    if (node.attributes && node.attributes.length > 0) for (var i = 0, il = node.attributes.length; i < il;) {
                        if (!/^on/.test(node.attributes[i].nodeName)) {
                            newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i++].nodeName));
                        }
                    }
                    /* are we going after children too, and does the node have any? */
                    if (allChildren && node.childNodes && node.childNodes.length > 0) for (var i = 0, il = node.childNodes.length; i < il;) {
                        if (node.childNodes[i].nodeName !== 'USE' && node.childNodes[i].nodeName.toUpperCase() !== 'SCRIPT') {
                            newNode.appendChild(ownerdoc._importNode(node.childNodes[i++], allChildren));
                        }
                    }
                    return newNode;
                    break;
                case ownerdoc.TEXT_NODE:
                case ownerdoc.CDATA_SECTION_NODE:
                case ownerdoc.COMMENT_NODE:
                    return ownerdoc.createTextNode(node.nodeValue);
                    break;
            }
        };
    };

    var fix_child_links = function fix_child_links(node, prefix) {
        if (node.childNodes && node.childNodes.length > 0) {
            for (var i = 0, il = node.childNodes.length; i < il;) {
                if (node.childNodes[i].nodeName.toUpperCase() === 'USE') {
                    var linkval = node.childNodes[i].getAttribute('xlink:href');
                    node.childNodes[i].setAttribute('xlink:href', linkval.replace(/^#/, '#' + prefix + '_'));
                }
                i++;
            }
        }
    };

    CondensedSequenceRenderer.prototype.importIcons = function (namespace, doc, alt_url) {
        var new_owner = this._container_canvas.ownerDocument;
        if (this._container_canvas.getElementById('defs_' + namespace)) {
            return;
        }
        this._container_canvas.appendChild(new_owner.createElement('defs'));
        this._container_canvas.lastChild.setAttribute('id', 'defs_' + namespace);
        var defs_block = this._container_canvas.lastChild;

        if (!new_owner._importNode) {
            add_import(new_owner);
        }
        var ua = window.navigator.userAgent;
        if (ua.indexOf('Edge/') >= 0) {
            this.icons_failed = this.icons_failed || {};
            this.icons_failed[namespace] = alt_url;
            return;
        }
        var new_nodes = new_owner._importNode(doc, true);
        if (typeof XPathResult !== 'undefined') {
            var iterator = new_owner.evaluate('//svg:defs/*', new_nodes, function (ns) {
                return svgns;
            }, XPathResult.ANY_TYPE, null);
            var el = iterator.iterateNext();
            var to_append = [];
            while (el) {
                to_append.push(el);
                el = iterator.iterateNext();
            }
            if (to_append.length === 0) {
                this.icons_failed = this.icons_failed || {};
                this.icons_failed[namespace] = alt_url;
            }
            to_append.forEach(function (el) {
                el.setAttribute('id', namespace + '_' + el.getAttribute('id'));
                fix_child_links(el, namespace);
                defs_block.appendChild(el);
            });
        } else {
            var els = new_nodes.querySelectorAll('defs > *');
            for (var i = 0; i < els.length; i++) {
                els[i].setAttribute('id', namespace + '_' + els[i].getAttribute('id'));
                fix_child_links(el, namespace);
                defs_block.appendChild(els[i]);
            }
        }
    };
})();

CondensedSequenceRenderer.prototype.addValuesToLayer = function (layerName, values, options) {
    var RS = this._RS;

    var canvas = this._canvas;

    if (!canvas) {
        var orig_func = arguments.callee;
        var self = this;
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._renderer, 'sequencechange', function () {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this._renderer, 'sequencechange', arguments.callee);
            orig_func.call(self, layerName, values);
        });
        log("Delaying rendering, waiting for sequence change");
        return;
    }

    var max_value;
    var min_value;
    var height_scale = 1;

    options = options || {};

    if (options.height) {
        height_scale = options.height / this._layer_containers[layerName].track_height;
    }

    var offset_scale = 0;
    if (options.offset) {
        offset_scale = options.offset / this._layer_containers[layerName].track_height;
    }
    var recalculate_plot = function recalculate_plot(scale) {
        var plot_path = ' m' + -0.5 * RS + ' 0';
        var last_value = null;
        values.forEach(function (value) {
            if (typeof last_value == 'undefined') {} else {
                plot_path += ' l' + RS + ' ' + -1 * RS * scale * height_scale * (value - last_value);
            }
            last_value = value;
            if (isNaN(max_value) || value > max_value) {
                max_value = value;
            }
            if (isNaN(min_value) || value < min_value) {
                min_value = value;
            }
        });
        return plot_path;
    };
    var plot = this._canvas.path('M0 0 M0 0 m0 ' + (max_value || 0) * RS + ' ' + recalculate_plot(1));
    var abs_min_val = min_value;
    var abs_max_val = max_value;
    plot.setAttribute('stroke', options.color || '#ff0000');
    plot.setAttribute('stroke-width', (options.thickness || 0.35) * RS);
    plot.setAttribute('fill', 'none');
    plot.setAttribute('visibility', 'hidden');
    plot.setAttribute('pointer-events', 'none');
    this._layer_containers[layerName].push(plot);
    plot.setAttribute('transform', 'translate(1,10) scale(1,1)');
    if (!options.hide_axis) {
        var axis = this._canvas.path('M0 0 m0 ' + RS * ((max_value || 0) - (min_value || 0)) + ' l' + this._sequence_els.length * RS + ' 0');
        axis.setAttribute('stroke-width', 0.2 * RS);
        axis.setAttribute('visibility', 'hidden');
        axis.setAttribute('transform', 'translate(1,0)');
        axis.setAttribute('pointer-events', 'none');
        axis.setHeight = function (height) {
            if (abs_min_val < 0 && abs_max_val > 0) {
                axis.setAttribute('d', 'M0 0 M0 0 m0 ' + height * offset_scale + ' m0 ' + 0.5 * height * height_scale + ' l' + renderer._sequence_els.length * RS + ' 0');
            } else {
                axis.setAttribute('d', 'M0 0 M0 0 m0 ' + height * offset_scale + ' m0 ' + 0.5 * (1 - abs_min_val) * height * height_scale + ' l' + renderer._sequence_els.length * RS + ' 0');
            }
            axis.setAttribute('stroke-width', 0.2 * RS / renderer.zoom);
        };
        this._layer_containers[layerName].push(axis);
    }
    var renderer = this;

    if (options.label) {
        var text = this._canvas.text(0, 0, options.label.max || options.label.min);
        text.setAttribute('transform', 'translate(0,0)');
        text.setAttribute('font-size', 4 * RS + 'pt');
        text.setHeight = function (height) {
            text.setAttribute('y', height * offset_scale);
            text.setAttribute('font-size', 4 * RS / renderer.zoom + 'pt');
        };
        this._layer_containers[layerName].push(text);
    }

    plot.setHeight = function (height) {
        var path_vals = recalculate_plot(0.5 * height / RS);
        plot.setAttribute('d', 'M0 0 M0 0 m0 ' + height * offset_scale + ' m0 ' + 0.5 * height * height_scale + ' ' + path_vals);
        plot.setAttribute('stroke-width', (options.thickness || 0.35) * RS / renderer.zoom);
    };
    return plot;
};

(function () {
    var addElementToLayer = function addElementToLayer(layerName, opts) {
        var canvas = this._renderer._canvas;

        if (!canvas) {
            var orig_func = arguments.callee;
            var self = this;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._renderer, 'sequencechange', function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this._renderer, 'sequencechange', arguments.callee);
                orig_func.call(self, layerName);
            });
            log("Delaying rendering, waiting for sequence change");
            return;
        }

        var tracer = null;
        var tracer_marker = null;
        var renderer = this._renderer;

        if (!opts) {
            opts = {};
        }

        var scale = 1;
        if (opts.height) {
            opts.height = parseFloat(opts.height);
            if (typeof opts.height !== 'undefined' && opts.bare_element) {
                opts.height *= 2;
            }
            scale = opts.height / this._renderer._layer_containers[layerName].track_height;
            if (typeof opts.offset !== 'undefined') {
                opts.offset = -1.25 - 1.25 + opts.offset / opts.height * 5; // ( -250/4 + (x / height) * 250 ) where 250 is growing marker height
            }
        }

        var tracer_marker = canvas.growingMarker(0, 0, opts.content || layerName.charAt(0).toUpperCase(), opts);
        tracer_marker.setAttribute('transform', 'translate(' + (this._index + 0.5) * this._renderer._RS + ',0.01) scale(' + scale + ')');
        tracer_marker.setAttribute('height', '250');
        tracer_marker.firstChild.setAttribute('transform', 'translate(-100,0) rotate(0,100,0.001)');
        if (opts.break_viewbox) {
            tracer_marker.container.removeAttribute('viewBox');
            tracer_marker.container.setAttribute('width', '100%');
            tracer_marker.container.setAttribute('height', '100%');
        }
        if (!opts.no_tracer) {

            var bobble = canvas.circle(this._index + 0.5, 10, 0.25);
            bobble.setAttribute('visibility', 'hidden');
            bobble.style.opacity = '0.4';
            tracer = canvas.rect(this._index + 0.5, 10, 0.05, 0);
            tracer._index = this._index;
            tracer.style.strokeWidth = '0';
            tracer.style.fill = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers[layerName].color;
            tracer.setAttribute('visibility', 'hidden');
            canvas.insertBefore(tracer, canvas.firstChild.nextSibling);
            var renderer = this._renderer;

            if (!this._renderer._layer_containers[layerName].tracers) {
                this._renderer._layer_containers[layerName].tracers = canvas.set();
            }
            if (!canvas.tracers) {
                canvas.tracers = canvas.set();
                canvas._visibleTracers = function () {
                    return renderer._visibleTracers();
                };
            }
            tracer.setHeight = function (height) {
                if (tracer.getAttribute('visibility') == 'hidden') {
                    return;
                }

                var transform_attr = tracer_marker.getAttribute('transform');
                var matches = /translate\(.*[,\s](.*)\) scale\((.*)\)/.exec(transform_attr);
                if (matches[1] && matches[2]) {
                    var scale = parseFloat(matches[2]);
                    var y = parseFloat(matches[1]);
                    var new_height = y + scale * ((tracer_marker.offset || 0) * 50 + 125) - parseInt(this.getAttribute('y'));
                    this.setAttribute('height', new_height < 0 ? 0 : new_height);
                } else {
                    this.setAttribute('height', height);
                }
            };
            this._renderer._layer_containers[layerName].tracers.push(tracer);
            this._renderer._layer_containers[layerName].tracers.push(bobble);
            tracer.setAttribute('pointer-events', 'none');
            bobble.setAttribute('pointer-events', 'none');
            canvas.tracers.push(tracer);
        }
        if (typeof opts.offset == 'undefined' || opts.offset === null) {
            // tracer_marker.offset = 2.5*this._renderer._layer_containers[layerName].track_height;
        } else {
            tracer_marker.offset = opts.offset;
        }

        // tracer_marker.setAttribute('transform','scale(0.5)');
        // tracer_marker.zoom_level = 'text';
        tracer_marker.setAttribute('visibility', 'hidden');

        this._renderer._layer_containers[layerName].push(tracer_marker);
        var result = [tracer, tracer_marker, bobble];
        tracer_marker.setAttribute('class', layerName);
        result.move = function (x, width) {
            var transform_attr = tracer_marker.getAttribute('transform');
            var matches = /translate\(.*[,\s](.*)\) scale\((.*)\)/.exec(transform_attr);
            if (matches[1] && matches[2]) {
                tracer_marker.setAttribute('transform', 'translate(' + (x + 0.5) * renderer._RS + ',' + matches[1] + ') scale(' + matches[2] + ')');
            }
            if (tracer) {
                tracer.move(x + 0.5, 0.05);
                bobble.move(x + 0.5);
            }
        };
        if (tracer) {
            tracer_marker.tracer = tracer;
            tracer_marker.bobble = bobble;
        }
        this._renderer._layer_containers[layerName].push(result);
        return result;
    };

    var addBoxOverlayToElement = function addBoxOverlayToElement(layerName, width, fraction, opts) {

        var canvas = this._renderer._canvas;
        var renderer = this._renderer;
        if (!opts) {
            opts = {};
        }
        if (!canvas) {
            var orig_func = arguments.callee;
            var self = this;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._renderer, 'sequencechange', function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this._renderer, 'sequencechange', arguments.callee);
                orig_func.call(self, layerName, width, opts);
            });
            log("Delaying rendering, waiting for sequence change");
            return;
        }

        var rect = canvas.rect(-0.25 + this._index, 60, width || 1, opts.height || 4, opts);
        var rect_x = parseFloat(rect.getAttribute('x'));
        var rect_max_x = rect_x + parseFloat(rect.getAttribute('width'));
        var container = this._renderer._layer_containers[layerName];
        if (typeof opts.merge !== 'undefined' && opts.merge) {
            for (var i = 0; i < container.length; i++) {
                if (container[i].value != fraction) {
                    continue;
                }
                var el_x = parseFloat(container[i].getAttribute('x'));
                var el_max_x = el_x + parseFloat(container[i].getAttribute('width'));
                if (el_x <= rect_x && rect_x <= el_max_x || rect_x <= el_x && el_x <= rect_max_x) {
                    container[i].setAttribute('x', "" + Math.min(el_x, rect_x));
                    container[i].setAttribute('width', "" + (Math.max(el_max_x, rect_max_x) - Math.min(el_x, rect_x)));
                    rect.parentNode.removeChild(rect);
                    return container[i];
                }
            }
        }
        this._renderer._layer_containers[layerName].push(rect);
        rect.setAttribute('class', layerName);
        rect.setAttribute('visibility', 'hidden');
        rect.setAttribute('stroke-width', '0px');
        if (typeof fraction !== 'undefined') {
            rect.setAttribute('opacity', fraction);
            rect.value = fraction;
        }
        rect.setAttribute('fill', opts.fill || __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers[layerName].color);
        rect.position_start = this._index;
        rect.position_end = this._index + width;
        if (typeof opts.offset !== "undefined" || opts.height_scale) {
            var offset_val = opts.offset;
            rect.setHeight = function (hght) {
                var height_val = opts.height ? opts.height * renderer._RS / renderer.zoom : hght * (opts.height_scale || 1);
                if (opts.align == 'bottom') {
                    this.setAttribute('y', offset_val * renderer._RS / renderer.zoom - hght * (opts.height_scale || 1));
                    this.setAttribute('height', height_val);
                } else {
                    this.setAttribute('y', offset_val * renderer._RS / renderer.zoom);
                    this.setAttribute('height', height_val);
                }
            };
        }
        return rect;
    };

    var addTextToElement = function addTextToElement(layerName, width, opts) {
        var canvas = this._renderer._canvas;
        var renderer = this._renderer;
        if (!canvas) {
            var orig_func = arguments.callee;
            var self = this;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._renderer, 'sequencechange', function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this._renderer, 'sequencechange', arguments.callee);
                orig_func.call(self, layerName, width, opts);
            });
            log("Delaying rendering, waiting for sequence change");
            return;
        }
        if (!opts) {
            opts = {};
        }
        if (opts.height) {
            opts.height = opts.height * this._renderer._RS;
        }
        var height = opts.height || this._renderer._layer_containers[layerName].trackHeight || 4;
        var position = this._index;
        if (width > 1) {
            position = position + Math.floor(0.5 * width);
        }
        var text_scale = 4 / 3;
        var text = canvas.text(position, 0, opts.txt || opts.content || "Text");
        text.setAttribute('font-size', text_scale * height);
        text.cached_width = text.getComputedTextLength() / height;
        text.setAttribute('font-weight', 'bolder');
        text.setAttribute('fill', opts.fill || '#ffffff');
        text.setAttribute('stroke', '#000000');
        if (!("stroke_width" in opts)) {
            opts.stroke_width = 5;
        }
        text.setAttribute('stroke-width', opts.stroke_width + '');
        text.setAttribute('style', 'font-family: ' + canvas.font_order);
        text.firstChild.setAttribute('dy', '1.3ex');
        text.setAttribute('text-anchor', 'middle');
        if (opts.align) {
            if (opts.align == "left") {
                text.setAttribute('text-anchor', 'start');
            }
            if (opts.align == 'right') {
                text.setAttribute('text-anchor', 'end');
            }
        }
        if (width > 1) {
            var clip = canvas.clipPath();
            var mask = canvas.rect(-0.5 * width, opts.offset || 0, width, height);
            clip.push(mask);
            mask.removeAttribute('y');
            var mask_id = 'id' + new Date().getTime() + "_" + clip.parentNode.childNodes.length;
            clip.setAttribute('id', mask_id);
            text.setAttribute('clip-path', 'url(#' + mask_id + ')');
        }
        if (typeof opts.offset !== 'undefined') {
            text.setAttribute('transform', 'translate(' + text.getAttribute('x') + ',' + text.getAttribute('y') + ')');
            text.offset = opts.offset;
            text.setHeight = function (height) {
                var top_offset = this.offset;
                this.setAttribute('x', 0);
                this.setAttribute('y', top_offset * renderer._RS / renderer.zoom);
                if (mask) mask.setAttribute('y', this.getAttribute('y'));
                this.setAttribute('stroke-width', 5 / renderer.zoom);
                if (opts.height) {
                    this.setAttribute('font-size', text_scale * opts.height / renderer.zoom);
                    if (mask) mask.setAttribute('height', opts.height / renderer.zoom);
                } else {
                    this.setAttribute('font-size', text_scale * height);
                    if (mask) mask.setAttribute('height', height);
                }
                // If we have a mask, we want to move the text to the left.
                if (mask) {
                    if (this.cached_width * height > width * 50) {
                        this.setAttribute('x', -0.5 * width * 50);
                        this.setAttribute('text-anchor', 'start');
                    } else {
                        this.setAttribute('x', '0');
                        this.setAttribute('text-anchor', 'middle');
                    }
                } else {
                    this.setAttribute('x', '0');
                    this.setAttribute('text-anchor', 'middle');
                }
            };
        } else {
            text.setHeight = function (height) {
                text.setAttribute('stroke-width', 5 / renderer.zoom);
                if (opts.height) {
                    text.setAttribute('font-size', text_scale * opts.height / renderer.zoom);
                    if (mask) mask.setAttribute('height', opts.height / renderer.zoom);
                } else {
                    text.setAttribute('font-size', text_scale * height);
                    if (mask) mask.setAttribute('height', height);
                }
            };
        }
        if (width > 1) {
            text.move = function (new_x, new_width) {
                if (mask) mask.setAttribute('x', -1 * new_width * renderer._RS * 0.5);
                if (mask) mask.setAttribute('width', new_width * renderer._RS);
                text.setAttribute('x', (new_x + parseInt(0.5 * new_width)) * renderer._RS);
            };
        }
        this._renderer._layer_containers[layerName].push(text);
        return text;
    };

    var addShapeToElement = function addShapeToElement(layerName, width, opts) {
        var canvas = this._renderer._canvas;
        var renderer = this._renderer;

        if (!canvas) {
            var orig_func = arguments.callee;
            var self = this;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._renderer, 'sequencechange', function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this._renderer, 'sequencechange', arguments.callee);
                orig_func.call(self, layerName, width, opts);
            });
            log("Delaying rendering, waiting for sequence change");
            return;
        }

        var methods = {
            "pentagon": canvas.pentagon,
            "hexagon": canvas.hexagon,
            "rectangle": canvas.rect,
            "ellipse": canvas.ellipticalRect,
            "roundrect": function roundrect(x, y, width, height) {
                return canvas.roundRect(x, y, width, height, 0.25 * height);
            }
        };
        if (!opts.rotate) {
            opts.rotate = 0;
        }
        var shape = null;
        var shape_name = (opts.shape.split('-') || '')[0];
        if (shape_name in methods) {
            var is_rotated = opts.shape.split('-')[1];
            if (is_rotated == 'left' && !opts.rotate) {
                opts.rotate = 90;
            }
            if (is_rotated == 'right' && !opts.rotate) {
                opts.rotate = 270;
            }
            if (is_rotated == 'flip' && !opts.rotate) {
                opts.rotate = 180;
            }
            shape = methods[shape_name].call(canvas, this._index, 60, width || 1, opts.height || 4, opts.rotate);
        } else {
            return;
        }
        if (typeof opts.offset !== 'undefined') {
            var x_pos = shape.getAttribute('x');
            var y_pos = shape.getAttribute('y');
            shape.setAttribute('transform', 'translate(' + x_pos + ',' + y_pos + ')');
            shape.setAttribute('x', '0');
            var offset_val = opts.offset || 0;
            var orig_height = opts.height || 4;
            shape.setAttribute('y', offset_val * this._renderer._RS);
            shape.setHeight = function (height) {
                if (!this._orig_stroke_width) {
                    this._orig_stroke_width = parseInt(this.getAttribute('stroke-width'));
                }
                shape.setAttribute('y', offset_val * renderer._RS / renderer.zoom);
                shape.setAttribute('height', orig_height * renderer._RS / renderer.zoom);
                shape.setAttribute('stroke-width', this._orig_stroke_width / renderer.zoom);
                if (opts.shape == 'ellipse') {
                    shape.setAttribute('ry', 0.5 * (orig_height * renderer._RS) / renderer.zoom);
                }
                if (opts.shape == 'roundrect') {
                    shape.setAttribute('rx', 0.25 * (orig_height * renderer._RS) / renderer.zoom);
                    shape.setAttribute('ry', 0.25 * (orig_height * renderer._RS) / renderer.zoom);
                }
            };
            shape.move = function (new_x, new_width) {
                var transform_attr = this.getAttribute('transform');
                var matches = /translate\(.*[,\s](.*)\)/.exec(transform_attr);
                if (matches[1]) {
                    this.setAttribute('transform', 'translate(' + new_x * renderer._RS + ',' + matches[1] + ')');
                }
                this.setAttribute('width', new_width * renderer._RS);
            };
        }

        if (typeof opts.offset !== 'undefined' && (opts.shape == "hexagon" || opts.shape == "pentagon")) {
            var offset_val = opts.offset || 0;
            var orig_height = opts.height || 4;
            var adjustment_g = canvas.group();
            adjustment_g.setAttribute('transform', shape.getAttribute('transform'));
            adjustment_g.push(shape);
            shape.setAttribute('transform', 'translate(0,0)');
            adjustment_g.setHeight = function (height) {
                if (!shape._orig_stroke_width) {
                    shape._orig_stroke_width = parseInt(shape.getAttribute('stroke-width')) || 0;
                }
                shape.setHeight(orig_height * renderer._RS / renderer.zoom);
                shape.setAttribute('stroke-width', this._orig_stroke_width / renderer.zoom);
                shape.setAttribute('transform', 'translate(0,0)');
            };
            this._renderer._layer_containers[layerName].push(adjustment_g);
            adjustment_g.setAttribute('visibility', 'hidden');
            adjustment_g.setAttribute('class', layerName);
            adjustment_g.position_start = this._index;
            adjustment_g.position_end = this._index + width;
        } else {
            this._renderer._layer_containers[layerName].push(shape);
            shape.setAttribute('visibility', 'hidden');
            shape.setAttribute('class', layerName);
            shape.position_start = this._index;
            shape.position_end = this._index + width;
        }
        shape.setAttribute('fill', opts.fill || __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers[layerName].color);
        if (opts.stroke) {
            shape.setAttribute('stroke', opts.stroke);
        }
        if (opts.stroke_width) {
            shape.setAttribute('stroke-width', renderer._RS * opts.stroke_width);
        } else {
            shape.style.strokeWidth = '0';
        }
        return shape;
    };

    var addElementToLayerWithLink = function addElementToLayerWithLink(layerName, url, width) {
        var canvas = this._renderer._canvas;

        if (!canvas) {
            var orig_func = arguments.callee;
            var self = this;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._renderer, 'sequencechange', function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this._renderer, 'sequencechange', arguments.callee);
                orig_func.call(self, layerName, url, width);
            });
            log("Delaying rendering, waiting for sequence change");
            return;
        }

        var rect = canvas.rect(-0.25 + this._index, 60, width || 1, 4);
        this._renderer._layer_containers[layerName].push(rect);
        rect.style.strokeWidth = '0px';
        rect.setAttribute('fill', __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers[layerName].color);
        rect.setAttribute('visibility', 'hidden');
        rect.setAttribute('class', layerName);
        return rect;
    };

    var addCalloutToLayer = function addCalloutToLayer(layerName, element, opts) {
        var canvas = this._renderer._canvas;

        var renderer = this._renderer;

        if (typeof element == 'string') {
            var a_el = document.createElement('div');
            renderer.fillTemplate(element, opts, function (err, el) {
                a_el.innerHTML = el;
            });
            element = a_el;
        }

        if (!canvas) {
            var orig_func = arguments.callee;
            var self = this;
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this._renderer, 'sequencechange', function () {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this._renderer, 'sequencechange', arguments.callee);
                orig_func.call(self, layerName, width, opts);
            });
            log("Delaying rendering, waiting for sequence change");
            return;
        }
        var callout = canvas.callout(this._index + 0.5, 0.01, element, { 'width': 10 * opts.width || 100, 'height': opts.height * 10 || 100, 'align': opts.align, 'font-size': opts['font-size'] });
        callout.setHeight(opts.height * this._renderer._RS);
        this._renderer._canvas_callout_padding = Math.max(10 * opts.height || 100, this._renderer._canvas_callout_padding || 0);
        this._renderer._layer_containers[layerName].push(callout);
        callout.clear = function () {
            var cont = renderer._layer_containers[layerName];
            if (cont.indexOf(callout) > 0) {
                cont.splice(cont.indexOf(callout), 1);
            }
            callout.parentNode.removeChild(callout);
        };
        return callout;
    };

    var scaledAddShapeOverlay = function scaledAddShapeOverlay(layername, width, opts) {
        var start = this._index;
        var end = Math.abs(this._renderer.scalePosition(this.original_index + width, layername)) - 1;
        var res = addShapeToElement.call(start < end ? this : this._renderer._sequence_els[end], layername, Math.abs(end - start), opts);
        res.aa = this.original_index;
        res.aa_width = width;
        return res;
    };

    var scaledAddBoxOverlay = function scaledAddBoxOverlay(layername, width, fraction, opts) {
        var start = this._index;
        var end = Math.abs(this._renderer.scalePosition(this.original_index + width, layername)) - 1;

        var res = addBoxOverlayToElement.call(start < end ? this : this._renderer._sequence_els[end], layername, Math.abs(end - start), fraction, opts);

        if (!(opts || {}).merge) {
            res.aa_width = width;
            res.aa = this.original_index;
        } else {
            res.aa_width = parseInt(res.getAttribute('width')) / this._renderer._RS;
            if (res.aa_width == width) {
                res.aa = this.original_index;
            }
        }
        return res;
    };

    var scaledAddTextOverlay = function scaledAddTextOverlay(layername, width, opts) {
        var start = this._index;
        var end = Math.abs(this._renderer.scalePosition(this.original_index + width, layername)) - 1;
        var res = addTextToElement.call(start < end ? this : this._renderer._sequence_els[end], layername, Math.abs(end - start), opts);
        res.aa = this.original_index;
        res.aa_width = width;
        return res;
    };

    var scaledAddToLayerWithLink = function scaledAddToLayerWithLink(layername, url, width) {
        var start = this._index;
        var end = Math.abs(this._renderer.scalePosition(this.original_index + width, layername)) - 1;
        var res = addElementToLayerWithLink.call(start < end ? this : this._renderer._sequence_els[end], layername, url, Math.abs(end - start));
        res.aa = this.original_index;
        return res;
    };

    var scaledAddToLayer = function scaledAddToLayer(layername, opts) {
        var res = addElementToLayer.call(this, layername, opts);
        res.aa = this.original_index;
        res.aa_width = 1;
        return res;
    };

    CondensedSequenceRenderer.prototype.enableScaling = function () {
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this, 'readerRegistered', function (reader) {
            console.log('Enabling scaling for legacy readers');
            var old_result = reader.gotResult;
            var renderer = this;
            reader.gotResult = function () {
                var wanted_id = reader.acc || reader.agi || "";

                var old_get_aas = CondensedSequenceRenderer.prototype.getAminoAcidsByPosition;
                var old_get_pep = CondensedSequenceRenderer.prototype.getAminoAcidsByPeptide;
                var old_sequence = renderer.sequence;
                if (renderer.sequences) {
                    renderer.sequence = (renderer.sequences[renderer.sequences.map(function (seq) {
                        return (seq.agi || seq.acc || "").toLowerCase();
                    }).indexOf(wanted_id.toLowerCase())] || "").toString();
                } else {
                    old_sequence = null;
                }
                renderer.getAminoAcidsByPosition = function (aas, lay, accession) {
                    if (!lay && !accession) {
                        console.log('Guessing scaling identifier as', wanted_id);
                    }
                    return old_get_aas.call(this, aas, lay || wanted_id, accession || wanted_id);
                };
                renderer.getAminoAcidsByPeptide = function (peptide, lay, accession) {
                    if (!lay && !accession) {
                        console.log('Guessing scaling identifier as', wanted_id);
                    }
                    return old_get_pep.call(this, peptide, lay || wanted_id, accession || wanted_id);
                };
                old_result.call(reader);

                if (old_sequence) {
                    renderer.sequence = old_sequence;
                }

                renderer.getAminoAcidsByPosition = old_get_aas;
                renderer.getAminoAcidsByPeptide = old_get_pep;
            };
        });
    };

    CondensedSequenceRenderer.prototype._extendElement = function (el) {
        el.addToLayer = scaledAddToLayer;
        el.addBoxOverlay = scaledAddBoxOverlay;
        el.addShapeOverlay = scaledAddShapeOverlay;
        el.addTextOverlay = scaledAddTextOverlay;
        el.addToLayerWithLink = scaledAddToLayerWithLink;
        el.callout = addCalloutToLayer;
        el['_renderer'] = this;
    };

    CondensedSequenceRenderer.prototype.remove = function (lay, el) {
        if (!el) {
            return false;
        }
        if (this._layer_containers[lay] && this._layer_containers[lay].indexOf(el) >= 0) {
            this._layer_containers[lay].splice(this._layer_containers[lay].indexOf(el), 1);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(el, 'removed');
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
            if (el.tracer && el.tracer.parentNode) {
                el.tracer.parentNode.removeChild(el.tracer);
            }
            if (el.bobble && el.bobble.parentNode) {
                el.bobble.parentNode.removeChild(el.bobble);
            }
            return true;
        }
        return false;
    };

    var mark_groups = function mark_groups(renderer, objects) {
        var group = [];
        var new_objects = [];
        for (i = 0; i < objects.length; i++) {
            var current = objects[i],
                next = null;
            if (!current) {
                continue;
            }
            if (objects[i + 1]) {
                next = objects[i + 1];
            }
            if (!next || parseInt(next.aa) - parseInt(current.aa) > 10 || renderer.sequence.substring(current, next - 1).match(/[ST]/)) {
                if (group.length < 3) {
                    group.push(current);
                } else {
                    group.push(current);
                    group.forEach(function (site) {
                        site.options.zoom_level = 'text';
                    });
                    var coalesce_options = group[0].coalesce || objects[0].coalesce;
                    new_objects.push({
                        'aa': group[0].aa,
                        'type': 'shape',
                        'width': parseInt(current.aa) - parseInt(group[0].aa) + 1,
                        'options': { 'zoom_level': 'summary',
                            'shape': 'roundrect',
                            'fill': coalesce_options.fill,
                            'stroke': coalesce_options.stroke,
                            'stroke_width': coalesce_options.stroke_width,
                            'height': group[0].options.height,
                            'offset': group[0].options.offset
                        }
                    });
                }
                group = [];
            } else {
                group.push(current);
            }
        }
        new_objects.forEach(function (obj) {
            objects.push(obj);
        });
    };

    CondensedSequenceRenderer.prototype.fix_icons = function (icon_ref) {
        if (!this.icons_failed) {
            return icon_ref;
        }
        if (typeof icon_ref === 'string') {
            var vals = icon_ref.split('_');
            if (vals[0] && this.icons_failed[vals[0].replace('#', '')]) {
                vals[0] = this.icons_failed[vals[0].replace('#', '')] + '#';
                var start = vals.shift();
                console.log(icon_ref, start + vals.join('_'));
                return start + vals.join('_');
            }
        }
        return icon_ref;
    };

    CondensedSequenceRenderer.prototype.renderObjects = function (track, objects) {
        var renderer = this;
        if (objects.length > 0 && objects[0].coalesce) {
            mark_groups(renderer, objects);
        }
        var results = [];
        objects.forEach(function (object) {
            var potential_height = object.options ? (object.options.height || renderer._layer_containers[track].track_height) + (object.options.offset + object.options.height || 0) : 0;
            if (object.options && potential_height > renderer._layer_containers[track].track_height) {
                var new_height = renderer._layer_containers[track].track_height + object.options.offset + (object.options.height || renderer._layer_containers[track].track_height);
                if ((renderer._layer_containers[track].fixed_track_height || 0) < new_height) {
                    renderer._layer_containers[track].fixed_track_height = new_height;
                }
            }

            var click_reveal;
            var rendered;
            if (object.aa && !renderer.getAA(parseInt(object.aa), track)) {
                return;
            }
            if (typeof object.aa !== 'undefined' && isNaN(object.aa)) {
                return;
            }
            if (object.type == "text") {
                if (object.aa) {
                    if (object.width) {
                        rendered = renderer.getAA(parseInt(object.aa), track).addTextOverlay(track, object.width, object.options);
                    } else {
                        rendered = renderer.getAA(parseInt(object.aa), track).addTextOverlay(track, 1, object.options);
                    }
                } else if (object.peptide) {
                    rendered = renderer.getAminoAcidsByPeptide(object.peptide, track).addTextOverlay(track, 1, object.options);
                }
            }
            if (object.type === "box") {
                if (object.aa) {
                    rendered = renderer.getAA(parseInt(object.aa), track).addBoxOverlay(track, parseInt(object.width), 1, object.options);
                } else if (object.peptide) {
                    rendered = renderer.getAminoAcidsByPeptide(object.peptide, track).addToLayer(track, 1, object.options);
                }
            }
            if (object.type == "shape") {
                if (object.aa) {
                    rendered = renderer.getAA(parseInt(object.aa), track).addShapeOverlay(track, parseInt(object.width), object.options);
                } else if (object.peptide) {
                    rendered = renderer.getAminoAcidsByPeptide(object.peptide, track)[0].addShapeOverlay(track, object.peptide.length, object.options);
                }
            }
            if (object.type == 'line') {
                rendered = renderer.addValuesToLayer(track, object.values, object.options);
            }
            if (object.type == "marker") {
                var content = (object.options || {}).content;
                var wanted_height = object.options.height;

                if (Array.isArray && Array.isArray(content)) {
                    var cloned_options_array = {};
                    for (var key in object.options) {
                        if (object.options.hasOwnProperty(key)) {
                            cloned_options_array[key] = object.options[key];
                        }
                    }
                    if (object.options.content && Array.isArray(content_data)) {
                        cloned_options_array.content = object.options.content.map(renderer.fix_icons.bind(renderer));
                    }

                    click_reveal = renderer.getAA(parseInt(object.aa), track).addToLayer(track, cloned_options_array);
                    click_reveal = click_reveal[1];
                    click_reveal.style.display = 'none';
                    object.options.content = object.options.alt_content;
                    content = object.options.content;
                }
                if (typeof content == 'object') {
                    var content_el;
                    if (content.type == "circle") {
                        content_el = renderer._canvas.circle(-0.5, -0.5, 1, 1);
                    }
                    if (content.type == 'text_circle') {
                        content_el = renderer._canvas.text_circle(0.5, 0.5, 1, content.text, content.options || {});
                        object.options.break_viewbox = true;
                    }
                    if (content.type == "left_triangle") {
                        content_el = renderer._canvas.poly('-100,0 0,-100 0,100');
                    }
                    if (content.type == "right_triangle") {
                        content_el = renderer._canvas.poly('0,100 100,0 0,-100');
                    }

                    ["fill", "stroke", "stroke-width", "fill-opacity", "stroke-opacity", "opacity"].forEach(function (prop) {
                        if (content[prop]) {
                            content_el.setAttribute(prop, content[prop]);
                        }
                    });
                    object.options.content = content_el;
                }
                var cloned_options = {};
                for (var key in object.options) {
                    if (object.options.hasOwnProperty(key)) {
                        cloned_options[key] = object.options[key];
                    }
                }
                var content_data = (object.options || {}).content;
                if (content_data && typeof content_data === 'string') {
                    cloned_options.content = renderer.fix_icons(content_data);
                }
                if (content_data && Array.isArray(content_data)) {
                    cloned_options.content = content_data.map(renderer.fix_icons.bind(renderer));
                }
                var added = renderer.getAA(parseInt(object.aa), track).addToLayer(track, cloned_options);
                if (click_reveal) {

                    click_reveal.toggleReveal = function (ev) {
                        ev.stopPropagation();
                        if (this.style.display === 'none') {
                            this.parentNode.appendChild(this);
                            this.style.display = 'block';
                        } else {
                            this.style.display = 'none';
                        }
                        renderer.refresh();
                    };
                    added[1].addEventListener('touchstart', click_reveal.toggleReveal.bind(click_reveal), true);
                    added[1].addEventListener('click', click_reveal.toggleReveal.bind(click_reveal), false);
                }
                rendered = added[1];
            }
            if ((object.options || {}).zoom_level) {
                rendered.zoom_level = object.options.zoom_level;
            }
            if (object.identifier) {
                rendered.setAttribute('identifier', object.identifier);
            }
            if ((object.options || {}).events && rendered) {
                object.options.events.forEach(function (ev) {
                    (ev.type || "").split(",").forEach(function (evtype) {
                        if (evtype == 'click' && rendered.style) {
                            rendered.style.cursor = 'pointer';
                        }
                        rendered.addEventListener(evtype, function (e) {
                            e.event_data = ev.data;
                            e.layer = track;
                            e.aa = object.aa;
                        });
                    });
                });
            }
            results.push(rendered);
        });
        return results;
    };

    CondensedSequenceRenderer.prototype.addTextTrack = function (seq, container) {
        var RS = this._RS;
        var renderer = this;
        var max_length = 300;
        var canvas = renderer._canvas;
        var seq_chars = seq.split('');

        var amino_acids = canvas.set();
        var amino_acids_shown = false;
        var x = 0;

        var has_textLength = true;
        var no_op = function no_op() {};
        try {
            var test_el = document.createElementNS(svgns, 'text');
            test_el.setAttribute('textLength', 10);
            no_op(test_el.textLength);
        } catch (e) {
            has_textLength = false;
        }

        /* We used to test to see if there was a touch event
           when doing the textLength method of amino acid
           layout, but iOS seems to support this now.
           
           Test case for textLength can be found here
           
           http://jsfiddle.net/nkmLu/11/embedded/result/
        */

        /* We also need to test for support for adjusting textLength
           while also adjusting the dx value. Internet Explorer 10
           squeezes text when setting a dx value as well as a textLength.
           I.e. the right-most position of the character is calculated to
           be x + textLength, rather than x + dx + textLength.
         */

        var supports_dx = false;
        if (typeof __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].supports_dx !== 'undefined') {
            supports_dx = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].supports_dx;
        } else {
            (function (supports_textLength) {
                if (!supports_textLength) {
                    supports_dx = false;
                    return;
                }
                var test_el = document.createElementNS(svgns, 'text');
                test_el.setAttribute('textLength', 30);

                if (!test_el.getExtentOfChar) {
                    return;
                }
                test_el.setAttribute('x', '0');
                test_el.setAttribute('y', '0');
                test_el.textContent = 'ABC';
                canvas.appendChild(test_el);
                var extent = test_el.getExtentOfChar(2).x;
                test_el.setAttribute('dx', '10');
                if (Math.abs(test_el.getExtentOfChar(2).x - extent) < 9.5) {
                    supports_dx = false;
                } else {
                    supports_dx = true;
                }
                __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].supports_dx = supports_dx;
                test_el.parentNode.removeChild(test_el);
            })(has_textLength);
        }

        var a_text;

        if (has_textLength && 'lengthAdjust' in document.createElementNS(svgns, 'text') && 'textLength' in document.createElementNS(svgns, 'text')) {
            if (seq.length <= max_length) {
                a_text = canvas.text(0, 12, document.createTextNode(seq));
                a_text.setAttribute('textLength', RS * seq.length);
            } else {
                a_text = canvas.text(0, 12, document.createTextNode(seq.substr(0, max_length)));
                a_text.setAttribute('textLength', RS * max_length);
            }
            canvas.insertBefore(a_text, canvas.firstChild.nextSibling);

            a_text.style.fontFamily = "'Lucida Console', 'Courier New', Monaco, monospace";
            a_text.setAttribute('lengthAdjust', 'spacing');
            a_text.setAttribute('text-anchor', 'start');
            a_text.setAttribute('dx', 5);
            a_text.setAttribute('dy', '1.5ex');
            a_text.setAttribute('font-size', RS);
            a_text.setAttribute('fill', '#000000');
            amino_acids.push(a_text);
            container.push(a_text);
        } else {
            for (var i = 0; i < seq_chars.length; i++) {
                a_text = canvas.text(x, 12, seq_chars[i]);
                a_text.firstChild.setAttribute('dy', '1.5ex');
                amino_acids.push(a_text);
                container.push(a_text);
                a_text.style.fontFamily = "'Lucida Console', Monaco, monospace";
                x += 1;
            }
            amino_acids.attr({ 'width': RS, 'text-anchor': 'start', 'height': RS, 'font-size': RS, 'fill': '#000000' });
        }
        var update_sequence = function update_sequence() {
            if (seq.length <= max_length) {
                return;
            }
            var container_width = renderer._container_canvas.parentNode.cached_width;
            if (!container_width) {
                container_width = renderer._container_canvas.parentNode.getBoundingClientRect().width;
                var docwidth = document.documentElement.clientWidth;
                if (docwidth > container_width) {
                    container_width = docwidth;
                }
            }
            let max_size = Math.ceil(10 * container_width * renderer.zoom / RS);
            if (max_size > seq.length) {
                max_size = seq.length;
            }

            a_text.setAttribute('textLength', RS * max_size);

            var start = parseInt(renderer.leftVisibleResidue());
            start -= 50;
            if (start < 0) {
                start = 0;
            }
            if (start + max_size >= seq.length) {
                start = seq.length - max_size;
                if (start < 0) {
                    start = 0;
                }
            }
            a_text.replaceChild(document.createTextNode(seq.substr(start, max_size)), a_text.firstChild);
            a_text.setAttribute(supports_dx ? 'dx' : 'x', 5 + start * RS);
        };
        var panstart = function panstart() {
            if (amino_acids_shown) {
                amino_acids.attr({ 'display': 'none' });
            }
        };
        var panend = function panend() {
            if (amino_acids_shown) {
                amino_acids.attr({ 'display': 'block' });
                update_sequence();
            }
        };
        var zoomchange = function zoomchange() {
            if (canvas.zoom > 3.6) {
                amino_acids.attr({ 'display': 'block' });
                amino_acids_shown = true;
                update_sequence();
            } else if (canvas.zoom > 0.2) {
                amino_acids.attr({ 'display': 'none' });
                amino_acids_shown = false;
            } else {
                amino_acids.attr({ 'display': 'none' });
                amino_acids_shown = false;
            }
        };
        if (!container.panevents) {
            canvas.addEventListener('panstart', panstart, false);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canvas, 'panend', panend);
            container.panevents = true;
        }

        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(canvas, 'zoomChange', zoomchange, false);
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(amino_acids[0], 'removed', function () {
            canvas.removeEventListener('panstart', panstart);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(canvas, 'panend', panend);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(canvas, 'zoomChange', zoomchange);
            delete container.panevents;
        });
        return amino_acids;
    };

    CondensedSequenceRenderer.prototype.renderTextTrack = function (lay, in_text) {
        var layerName = lay;
        if (typeof layerName !== 'string') {
            layerName = lay.name;
        }
        var canvas = this._canvas;
        if (!canvas || typeof layerName == 'undefined') {
            return;
        }
        var renderer = this;
        var container = this._layer_containers[layerName];
        var result = this.addTextTrack(in_text, container);
        return result;
    };
})();

CondensedSequenceRenderer.prototype.EnableHighlights = function () {
    var renderer = this;
    var highlights = [];
    var createNewHighlight = function createNewHighlight() {
        var highlight = renderer._canvas.rect(0, 0, 0, '100%');
        highlight.addEventListener('click', ev => {
            ev.stopPropagation();
            return false;
        });
        highlight.addEventListener('mousedown', ev => {
            ev.stopPropagation();
            return false;
        });

        highlight.addEventListener('touchstart', ev => {
            ev.stopPropagation();
            return false;
        });

        highlight.setAttribute('fill', '#ffdddd');
        highlight.removeAttribute('stroke');
        var pnode = highlight.parentNode;
        pnode.insertBefore(highlight, pnode.firstChild.nextSibling);
        highlights.push(highlight);
    };
    createNewHighlight();

    renderer.moveHighlight = function () {
        var vals = Array.prototype.slice.call(arguments);
        var RS = this._RS;
        var i = 0,
            idx = 0;
        for (i = 0; i < vals.length; i += 2) {
            var from = vals[i];
            var to = vals[i + 1];
            var highlight = highlights[idx];
            if (!highlight) {
                createNewHighlight();
                highlight = highlights[idx];
            }
            if (highlight.previousSibling.previousSibling && highlights.indexOf(highlight.previousSibling.previousSibling) < 0) {
                highlight.parentNode.insertBefore(highlight, highlight.parentNode.firstChild.nextSibling);
            }
            highlight.setAttribute('x', (from - 1) * RS);
            highlight.setAttribute('width', (to - (from - 1)) * RS);
            highlight.setAttribute('visibility', 'visible');
            idx += 1;
        }
        for (i = idx; i < highlights.length; i++) {
            highlights[i].setAttribute('visibility', 'hidden');
        }
    };
};

(function () {

    var bindClick = function bindClick(element, handler) {
        if ("ontouchstart" in window) {
            element.addEventListener('touchstart', function (ev) {
                var startX = ev.touches[0].clientX;
                var startY = ev.touches[0].clientY;
                var reset = function reset() {
                    document.body.removeEventListener('touchmove', move);
                    element.removeEventListener('touchend', end);
                };
                var end = function end(ev) {
                    reset();
                    ev.stopPropagation();
                    ev.preventDefault();
                    if (handler) {
                        handler.call(null, ev);
                    }
                };
                var move = function move(ev) {
                    if (Math.abs(ev.touches[0].clientX - startX) > 10 || Math.abs(ev.touches[0].clientY - startY) > 10) {
                        reset();
                    }
                };
                //FIXME - PASSIVE
                document.body.addEventListener('touchmove', move, { passive: true });
                element.addEventListener('touchend', end, false);
            }, { passive: true });
            //FIXME - PASSIVE
        } else {
            element.addEventListener('click', handler, false);
        }
    };

    var mousePosition = function mousePosition(evt) {
        var posx = 0;
        var posy = 0;
        if (!evt) {
            evt = window.event;
        }

        if (evt.pageX || evt.pageY) {
            posx = evt.pageX - (document.body.scrollLeft + document.documentElement.scrollLeft);
            posy = evt.pageY - (document.body.scrollTop + document.documentElement.scrollTop);
        } else if (evt.clientX || evt.clientY) {
            posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        if (self.targetElement) {
            posx = evt.screenX;
            posy = evt.screenY;
        }
        return [posx, posy];
    };

    var svgPosition = function svgPosition(ev, svgel) {
        var positions = mousePosition(ev.changedTouches ? ev.changedTouches[0] : ev);
        var p = {};
        if (svgel.nodeName == 'svg') {
            p = svgel.createSVGPoint();
            var rootCTM = svgel.getScreenCTM();
            p.x = positions[0];
            p.y = positions[1];

            self.matrix = rootCTM.inverse();
            p = p.matrixTransform(self.matrix);
        } else {
            p.x = positions[0];
            p.y = positions[1];
        }
        return p;
    };

    var notifySelectionToLayers = function notifySelectionToLayers(start, end, renderer) {
        let selections = new WeakMap();
        selections.set(renderer, [start, end]);
        for (let layname of Object.keys(renderer._layer_containers || {})) {
            var lay = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(layname);
            let values = [null, null];
            if (start && end) {
                values = [renderer.scalePosition(start, layname, true), renderer.scalePosition(end, layname, true)];
            }
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(lay, 'selection', values);
            selections.set(lay, values);
        }
        __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(renderer, 'selection', selections);
    };

    CondensedSequenceRenderer.prototype.enableSelection = function (callback) {
        var self = this;

        if (!self._canvas) {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(self, 'sequenceChange', function () {
                self.enableSelection();
            });
            return;
        }

        var canvas = self._canvas;
        var start;
        var end;
        var end_func;
        var local_start;
        var local_end;

        let in_drag = false;

        var moving_func = function moving_func(evt) {
            evt.preventDefault();

            var p = svgPosition(evt, canvas);
            end = p.x;

            if (start > end) {
                local_end = parseInt(start / 50);
                local_start = parseInt(end / 50);
            } else {
                local_end = parseInt(end / 50);
                local_start = parseInt(start / 50);
            }
            self.select(local_start + 1, local_end);
        };

        // Do not send the click event to the canvas
        // this screws up with doing things on the selection
        // Need alternative method to clear selection
        //
        bindClick(canvas, function (evt) {
            if (!self.selecting) {
                return;
            }
        });

        canvas.addEventListener('mousedown', function (evt) {
            if (!self.selecting) {
                return;
            }
            in_drag = true;
            self.select();
            var positions = mousePosition(evt);
            var p = {};
            if (canvas.nodeName == 'svg') {
                p = canvas.createSVGPoint();
                var rootCTM = this.getScreenCTM();
                p.x = positions[0];
                p.y = positions[1];

                self.matrix = rootCTM.inverse();
                p = p.matrixTransform(self.matrix);
            } else {
                p.x = positions[0];
                p.y = positions[1];
            }
            start = p.x;
            end = p.x;
            canvas.addEventListener('mousemove', moving_func, false);
            evt.preventDefault();
        }, false);

        canvas.addEventListener('mouseup', function (evt) {
            if (in_drag) {
                notifySelectionToLayers(local_start === null ? null : local_start + 1, local_end, self);
                local_start = null;
                local_end = null;
                in_drag = false;
            }
            canvas.removeEventListener('mousemove', moving_func);
            evt.preventDefault();
        });

        canvas.addEventListener('touchend', function () {
            if (in_drag) {
                setTimeout(function () {
                    notifySelectionToLayers(local_start === null ? null : local_start + 1, local_end, self);
                    local_start = null;
                    local_end = null;
                    in_drag = false;
                }, 500);
            }
            canvas.removeEventListener('touchmove', moving_func);
        });

        canvas.addEventListener('touchstart', function (evt) {
            if (!self.selecting) {
                return;
            }
            if (evt.changedTouches.length == 1) {
                in_drag = true;
                evt.preventDefault();
                var positions = mousePosition(evt.changedTouches[0]);
                var p = {};
                if (canvas.nodeName == 'svg') {
                    p = canvas.createSVGPoint();
                    var rootCTM = this.getScreenCTM();
                    p.x = positions[0];
                    p.y = positions[1];

                    self.matrix = rootCTM.inverse();
                    p = p.matrixTransform(self.matrix);
                } else {
                    p.x = positions[0];
                    p.y = positions[1];
                }
                start = p.x;
                end = p.x;
                canvas.addEventListener('touchmove', moving_func, { passive: false });
            }
        }, { passive: false });
        //FIXME - PASSIVE
    };
})();

/*
 * Get a canvas set of the visible tracers on this renderer
 */
CondensedSequenceRenderer.prototype._visibleTracers = function () {
    var tracers = null;
    for (var i in __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers) {
        if (this.isLayerActive(i) && this._layer_containers[i] && this._layer_containers[i].tracers) {
            if (!tracers) {
                tracers = this._layer_containers[i].tracers;
            } else {
                tracers.concat(this._layer_containers[i].tracers);
            }
        }
    }
    return tracers;
};

CondensedSequenceRenderer.prototype._resizeContainer = function () {
    var RS = this._RS;
    if (this._container && this._canvas) {

        var width = (this.zoom || 1) * 2 * this.sequence.length;
        var height = (this.zoom || 1) * 2 * (this._canvas._canvas_height / this._RS);
        if (this._canvas_callout_padding) {
            height += this._canvas_callout_padding;
        }
        this._canvas.setAttribute('width', width);
        this._canvas.setAttribute('height', height);
        this.navigation.setDimensions(width, height);

        if (this.grow_container) {
            this._container_canvas.setAttribute('height', height);
            // this._container.style.height = height+'px';        
        } else {
            this._container_canvas.setAttribute('height', '100%');
            this._container_canvas.setAttribute('width', '100%');

            // this._container.style.height = 'auto';
            this.navigation.setZoom(this.zoom);
        }
    }
};

(function (clazz) {

    var vis_change_event = function vis_change_event(renderer, visibility) {
        var self = this;
        if (!renderer._layer_containers[self.name] || renderer._layer_containers[self.name].length <= 0) {
            return;
        }

        if (!visibility) {
            if (renderer._layer_containers[self.name].tracers) {
                renderer._layer_containers[self.name].tracers.hide();
            }
        }
    };

    /**
     * Add a layer to this renderer.
     * @param {Object} layer    Layer object to add. The layer data is used to create a track that can be independently shown/hidden.
     *                          The track itself is by default hidden.
     */
    clazz.prototype.addTrack = function (layer) {
        var RS = this._RS;
        var renderer = this;

        if (!this._canvas) {
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(this, 'sequencechange', function () {
                this.addTrack(layer);
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(this, 'sequencechange', arguments.callee);
            });
            console.log("No canvas, cannot add track, waiting for sequencechange event");
            return;
        }

        var layer_containers = this._layer_containers || [];

        if (!layer_containers[layer.name] || layer_containers[layer.name] === null) {
            layer_containers[layer.name] = this._canvas.set();
            if (!layer_containers[layer.name].track_height) {
                layer_containers[layer.name].track_height = renderer.trackHeight || 4;
            }
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(layer, 'visibilityChange', vis_change_event);
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(layer, 'visibilityChange', vis_change_event);
            var event_names = ['click', 'mouseover', 'mousedown', 'mousemove', 'mouseout', 'mouseup', 'mouseenter', 'mouseleave'];
            var ev_function = function ev_function(ev, original_event, element) {
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(layer, ev.type, [original_event, element.position_start, element.position_end]);
            };
            // for (var i = 0 ; i < event_names.length; i++) {
            //     bean.add(layer_containers[layer.name]._event_proxy,event_names[i],ev_function);
            // }
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(layer, 'removed');
            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(layer, 'removed', function (rend) {
                if (rend) {
                    rend.removeTrack(this);
                } else {
                    renderer.removeTrack(this);
                }
            });
        }

        this._layer_containers = layer_containers;
    };

    clazz.prototype.removeTrack = function (layer) {
        if (!this._layer_containers) {
            return;
        }
        var layer_containers = this._layer_containers || [];
        if (layer_containers[layer.name]) {
            let elements = [].concat(layer_containers[layer.name]);
            for (let el of elements) {
                this.remove(layer.name, el);
            }
            delete this._layer_containers[layer.name];
            layer.disabled = true;
        }
    };

    var refresh_id = 0;
    clazz.prototype.disablePrintResizing = function () {
        delete this._media_func;
    };

    clazz.prototype.enablePrintResizing = function () {
        if (!(this.win() || window).matchMedia) {
            return;
        }
        if (this._media_func) {
            return this._media_func;
        }
        this._media_func = function (matcher) {
            var self = this;
            if (!self._canvas) {
                return;
            }
            if (self.grow_container) {
                if (matcher.matches) {
                    delete self._container_canvas.parentNode.cached_width;
                    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self._canvas, 'panend');
                }
                return;
            }
            var match = matcher;
            if (!match.matches) {
                if (self.old_zoom) {
                    var a_zoom = self.old_zoom;
                    self.old_zoom = null;
                    self.zoomCenter = null;
                    self.withoutRefresh(function () {
                        self.zoom = a_zoom;
                    });
                    self._canvas.setCurrentTranslateXY(self.old_translate, 0);
                    self._container_canvas.setAttribute('viewBox', self.old_viewbox);
                    // self._container.style.height = 'auto';
                    self.old_zoom = null;
                    self.old_translate = null;
                    self.refresh();
                    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self._canvas, 'zoomChange');
                }
                return;
            }
            try {
                var container = self._container;
                self.old_translate = self._canvas.currentTranslateCache.x;
                self._canvas.setCurrentTranslateXY(0, 0);
                var zoomFactor = 0.95 * container.clientWidth / self.sequence.length;
                if (!self.old_zoom) {
                    self.old_zoom = self.zoom;
                    self.old_viewbox = self._container_canvas.getAttribute('viewBox');
                }
                self.zoomCenter = null;
                self._container_canvas.removeAttribute('viewBox');
                self.withoutRefresh(function () {
                    self.zoom = zoomFactor;
                });
                self.refresh();
            } catch (err) {
                console.log(err);
                console.log(err.stack);
            }
        };
        var rend = this;
        if (!rend._bound_media) {
            (this.win() || window).matchMedia('print').addListener(function (matcher) {
                if (rend._media_func) {
                    rend._media_func(matcher);
                }
            });
        }
        rend._bound_media = true;
    };

    /**
     * Cause a refresh of the renderer, re-arranging the tracks on the canvas, and resizing the canvas if necessary.
     * @param {Boolean} animateds Cause this refresh to be an animated refresh
     */
    clazz.prototype.refresh = function (animated) {
        if (!this._canvas) {
            return;
        }

        var layer_containers = this._layer_containers || [];

        var RS = this._RS;
        var track_heights = 0;
        var order = this.trackOrder || [];
        var fixed_font_scale = this.fixedFontScale;

        if (this.navigation) {
            this.navigation.reset();
        }
        for (var i = 0; i < order.length; i++) {

            var name = order[i];
            var container = layer_containers[name];
            if (!container) {
                continue;
            }
            var y_val;
            if (!this.isLayerActive(name)) {
                var attrs = { 'y': -1 * this._axis_height * RS, 'height': RS * container.track_height / this.zoom, 'visibility': 'hidden' };
                //            var attrs = { 'y' : (this._axis_height  + (track_heights - container.track_height )/ this.zoom)*RS, 'height' :  RS * container.track_height / this.zoom ,'visibility' : 'hidden' };
                if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(name).group) {
                    var controller_track = this.navigation.getController(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(name).group);
                    if (controller_track && this.isLayerActive(controller_track)) {
                        attrs.y = layer_containers[controller_track.name].currenty();
                    }
                }

                if (container.fixed_track_height) {
                    delete attrs.height;
                }

                if (animated) {
                    container.animate(attrs);
                } else {
                    container.attr(attrs);
                }
                if (container.tracers) {}
                continue;
            } else {
                // container.attr({ 'opacity' : '1' });
            }

            var tracer_top = track_heights;

            if (container.fixed_track_height) {

                var track_height = container.fixed_track_height;

                y_val = this._axis_height + track_heights / this.zoom;

                if (animated) {
                    container.animate({ 'visibility': 'visible', 'y': y_val * RS, 'height': RS * container.track_height / this.zoom });
                } else {
                    container.attr({ 'visibility': 'visible', 'y': y_val * RS, 'height': RS * container.track_height / this.zoom });
                }
                if (this.navigation) {
                    y_val -= 1 * container.track_height / this.zoom;
                    this.navigation.renderTrack(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(name), y_val * RS, RS * container.fixed_track_height / this.zoom, { 'font-scale': (fixed_font_scale || 1) * 3 * container.track_height / container.fixed_track_height });
                }
                track_heights += container.fixed_track_height + this.trackGap - container.track_height;
            } else {
                y_val = this._axis_height + track_heights / this.zoom;
                if (animated) {
                    container.animate({ 'visibility': 'visible', 'y': y_val * RS, 'height': RS * container.track_height / this.zoom });
                } else {
                    container.attr({ 'visibility': 'visible', 'y': y_val * RS, 'height': RS * container.track_height / this.zoom });
                }
                if (this.navigation) {
                    y_val -= 1 * container.track_height / this.zoom;
                    this.navigation.renderTrack(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(name), y_val * RS, RS * 3 * container.track_height / this.zoom, fixed_font_scale ? { 'font-scale': fixed_font_scale } : null);
                    track_heights += container.track_height;
                }
                track_heights += container.track_height + this.trackGap;
            }
            container.refresh_zoom();

            if (container.tracers) {
                var disp_style = this.isLayerActive(name) && this.zoom > 3.6 ? 'visible' : 'hidden';
                var height = (1.5 + tracer_top / this.zoom) * RS;

                if (animated) {
                    container.tracers.animate({ 'visibility': disp_style, 'y': 0.65 * this._axis_height * RS, 'height': height });
                } else {
                    container.tracers.attr({ 'visibility': disp_style, 'y': 0.65 * this._axis_height * RS, 'height': height });
                }
            }
        }

        var viewBox = [-1, 0, 0, 0];
        viewBox[0] = -2 * RS;
        viewBox[2] = (this.sequence.split('').length + this.padding + 2) * RS;
        viewBox[3] = (this._axis_height + track_heights / this.zoom + this.padding / this.zoom) * RS;
        this._canvas.setAttribute('viewBox', viewBox.join(' '));
        this._canvas._canvas_height = viewBox[3];

        var outer_viewbox = [].concat(viewBox);

        outer_viewbox[0] = 0;
        outer_viewbox[2] = this.zoom * (2 * this.sequence.length) + this.padding;
        outer_viewbox[3] = this.zoom * 2 * (this._axis_height + track_heights / this.zoom + this.padding / this.zoom);
        if (!this.grow_container) {
            this._container_canvas.setAttribute('viewBox', outer_viewbox.join(' '));
        } else {
            this._container_canvas.removeAttribute('viewBox');
        }

        this._resizeContainer();

        viewBox[0] = 0;
        if (this.navigation) {
            if (this.grow_container) {
                this.navigation.nav_width_base = outer_viewbox[3] < 200 ? outer_viewbox[3] : 200;
            }
            this.navigation.move_closer();
            if (this.navigation.visible()) {
                this._canvas.style.GomapScrollLeftMargin = 100 * RS / this.zoom;
            } else {
                this._canvas.style.GomapScrollLeftMargin = 1000;
            }
            this.navigation.setViewBox(viewBox.join(' '));
        }

        if (this.navigation) {
            this.navigation.refresh();
        }
    };

    /*
    
    Modified from:
    
    http://stackoverflow.com/questions/5433806/convert-embedded-svg-to-png-in-place
    
    None of the Safari browsers work with this, giving DOM Exception 18
    
    http://stackoverflow.com/questions/8158312/rasterizing-an-in-document-svg-to-canvas
    
    I think this is the relevant bug.
    
    https://bugs.webkit.org/show_bug.cgi?id=119492
    
    */

    var svgDataURL = function svgDataURL(svg) {
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        var svgAsXML = new XMLSerializer().serializeToString(svg);
        return "data:image/svg+xml," + encodeURIComponent(svgAsXML);
    };

    clazz.prototype.pngURL = function (pngReady, out_width) {
        //var svg = document.getElementById('foobar');//this._canvas;
        var svg_data = this._canvas.cloneNode(true);
        var sequences = svg_data.querySelectorAll('text[data-spaces]');
        for (var i = 0; i < sequences.length; i++) {
            sequences[i].parentNode.removeChild(sequences[i]);
        }

        // Set up the aspect ratio of the output element
        var svg = document.createElementNS(svgns, 'svg');
        svg.setAttribute('width', this._container_canvas.getBoundingClientRect().width);
        svg.setAttribute('height', this._container_canvas.getBoundingClientRect().height);
        svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

        var transform_group = document.createElementNS(svgns, 'g');
        transform_group.setAttribute('transform', this._canvas.parentNode.getAttribute('transform'));
        svg.appendChild(transform_group);
        transform_group.appendChild(svg_data);

        // We are missing the defs elements from the containing node

        var all_defs = this._container_canvas.querySelectorAll('defs');
        for (var i = 0; i < all_defs.length; i++) {
            svg.appendChild(all_defs[i].cloneNode(true));
        }
        var can = document.createElement('canvas');
        var total_width = 2 * parseInt(svg.getAttribute('width'));
        var total_height = 2 * parseInt(svg.getAttribute('height'));
        if (out_width) {
            if (total_width > out_width) {
                var ratio = total_width / out_width;
                total_width = out_width;
                total_height = parseInt(total_height / ratio);
            }
        }
        can.width = total_width;
        can.height = total_height;
        var svgImg = new Image();
        svgImg.width = 1;
        svgImg.height = 1;
        var ctx = can.getContext('2d');
        svgImg.onload = function () {
            ctx.drawImage(svgImg, 0, 0, can.width, can.height);
            pngReady(can.toDataURL());
        };
        svgImg.onerror = function () {
            console.log("Got an error");
        };
        var dataurl = svgDataURL(svg);
        svgImg.src = dataurl;
    };
})(CondensedSequenceRenderer);

/**
 * Zoom level has changed for this renderer
 * @name    CondensedSequenceRenderer#zoomChange
 * @event
 * @param   {Object}    e
 */

CondensedSequenceRenderer.Zoom = function (renderer) {

    /**
     *  @lends CondensedSequenceRenderer.prototype
     *  @property   {Number}    zoom        The zoom level for a renderer. Minimum zoom level is zero, and defaults to the default zoom value
     *  @property   {Array}     trackOrder  The order of tracks on the renderer, an array of layer/group names.
     *  @property   {Number}    padding     Padding to apply to the right and top of plots (default 10).
     *  @property   {Number}    trackGap    Vertical gap between tracks (default 10)
     */
    var timeout = null;
    var start_zoom = null;
    var zoom_level = null;
    var center_residue = null;
    var start_x = null;
    var transformer;
    var shifter;
    var accessors = {
        setZoom: function setZoom(zoomLevel) {
            var container_width = renderer._container.cached_width;
            if (!container_width) {
                container_width = renderer._container.clientWidth;
            }
            if (!renderer.sequence) {
                zoom_level = zoomLevel;
                return;
            }
            var min_zoom_level = container_width / (2 * renderer.sequence.length);
            // if  (! renderer.grow_container ) {
            //     min_zoom_level = 0.3 / 2 * min_zoom_level;
            // }

            // var min_zoom_level = renderer.sequence ? (0.3 / 2) * container_width / renderer.sequence.length : 0.5;
            if (zoomLevel < min_zoom_level) {
                zoomLevel = min_zoom_level;
            }
            if (zoomLevel > 10) {
                zoomLevel = 10;
            }

            var self = this;

            if (zoomLevel == zoom_level) {
                if (this.refresh.suspended && self._canvas && self._canvas.zoom !== parseFloat(zoom_level)) {
                    self._canvas.zoom = parseFloat(zoom_level);
                    self._canvas.setScale(1);

                    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self._canvas, 'zoomChange');
                }
                return;
            }

            if (!self._canvas) {
                zoom_level = zoomLevel;
                return;
            }

            var no_touch_center = false;

            if (self.zoomCenter == 'center') {
                no_touch_center = true;
                self.zoomCenter = { 'x': self._RS * 0.5 * (self.leftVisibleResidue() + self.rightVisibleResidue()) };
            }

            if (self.zoomCenter && !center_residue) {
                start_x = self._canvas.currentTranslateCache.x || 0;
                center_residue = self.zoomCenter ? self.zoomCenter.x : 0;
            } else if (center_residue && !self.zoomCenter) {
                // We should not be zooming if there is a center residue and no zoomCenter;
                return;
            }

            if (timeout) {
                clearTimeout(timeout);
            } else {
                start_zoom = parseFloat(zoom_level || 1);
            }

            zoom_level = parseFloat(zoomLevel);

            var scale_value = Math.abs(parseFloat(zoomLevel) / start_zoom);

            window.cancelAnimationFrame(transformer);
            transformer = window.requestAnimationFrame(function () {
                // Rendering bottleneck
                self._canvas.setScale(scale_value);
            });

            __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self._canvas, '_anim_begin');
            if (document.createEvent) {
                var evObj = document.createEvent('Events');
                evObj.initEvent('panstart', false, true);
                self._canvas.dispatchEvent(evObj);
            }
            var old_x = self._canvas.currentTranslateCache.x;
            if (center_residue) {
                var delta = (start_zoom - zoom_level) / (scale_value * 25) * center_residue;
                delta += start_x / scale_value;
                cancelAnimationFrame(shifter);
                shifter = window.requestAnimationFrame(function () {

                    // Rendering bottleneck
                    self._canvas.setCurrentTranslateXY(delta, (start_zoom - zoom_level) / scale_value * self._axis_height * 2);
                });
            }

            var end_function = function end_function() {
                timeout = null;
                var scale_value = Math.abs(parseFloat(zoom_level) / start_zoom);

                self._canvas.setScale(null);

                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self._canvas, 'panend');
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self._canvas, '_anim_end');
                let zoomchange = function zoomchange() {
                    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].remove(self._canvas, 'zoomChange', zoomchange);
                    self.refresh();
                    if (typeof center_residue != 'undefined') {
                        var delta = (start_zoom - zoom_level) / 25 * center_residue;
                        delta += start_x;

                        self._resizeContainer();

                        if (self._canvas.shiftPosition) {
                            self._canvas.shiftPosition(delta, 0);
                        } else {
                            self._canvas.setCurrentTranslateXY(delta, 0);
                        }
                    }
                    center_residue = null;
                    start_x = null;
                };
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].add(self._canvas, 'zoomChange', zoomchange);

                if (self._canvas) {
                    self._canvas.zoom = parseFloat(zoom_level);
                    __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self._canvas, 'zoomChange');
                }
                __WEBPACK_IMPORTED_MODULE_3__bean__["a" /* default */].fire(self, 'zoomChange');
            };

            if (!this.refresh.suspended) {
                timeout = setTimeout(end_function, 100);
            } else {
                end_function();
            }
        },
        fitZoom: function fitZoom() {
            var container_width = renderer._container.cached_width;
            if (!container_width) {
                container_width = renderer._container.clientWidth;
            }
            var min_zoom_level = 0.5;
            if (renderer.sequence) {
                min_zoom_level = container_width / (2 * renderer.sequence.length);
            }
            renderer.zoom = min_zoom_level;
        },
        getZoom: function getZoom() {
            return zoom_level || 1;
        }
    };

    if (Object.defineProperty && !__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].IE8) {
        Object.defineProperty(renderer, "zoom", {
            get: accessors.getZoom,
            set: accessors.setZoom
        });
    }

    renderer.fitZoom = accessors.fitZoom;
};

/* Add some properties that will trigger a refresh on the renderer when they are changed.
   These are all stateless
 */

(function (clazz) {

    var accessors = {
        getPadding: function getPadding() {
            return this._padding || 10;
        },

        setPadding: function setPadding(padding) {
            this._padding = padding;
            this.refresh();
        },

        getTrackGap: function getTrackGap() {
            if (!this._track_gap) {
                var default_value = "ontouchend" in document ? 20 : 10;
                this._track_gap = this._track_gap || default_value;
            }

            return this._track_gap;
        },

        setTrackGap: function setTrackGap(trackGap) {
            this._track_gap = trackGap;
            this.refresh();
        }
    };

    if (Object.defineProperty && !__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].IE8) {
        Object.defineProperty(clazz.prototype, "padding", {
            get: accessors.getPadding,
            set: accessors.setPadding
        });
        Object.defineProperty(clazz.prototype, "trackGap", {
            get: accessors.getTrackGap,
            set: accessors.setTrackGap
        });
    }
})(CondensedSequenceRenderer);

CondensedSequenceRenderer.Navigation = __WEBPACK_IMPORTED_MODULE_2__CondensedSequenceRendererNavigation__["a" /* default */];

/* harmony default export */ __webpack_exports__["a"] = (CondensedSequenceRenderer);

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bean__ = __webpack_require__(0);


const SVGCanvas = function () {

    var extended_elements = [];
    var DEFAULT_RS = 1;
    var svgns = 'http://www.w3.org/2000/svg';

    function extend_array(an_array, RS) {
        var curr_x, curr_y, curr_transform, targ_disp, a_disp;

        an_array.visibility = function () {
            var curr_disp = 'hidden';

            for (var i = 0; i < an_array.length; i++) {
                if (Array.isArray(an_array[i])) {
                    continue;
                }

                a_disp = an_array[i].getAttribute('visibility');
                if (a_disp && a_disp != 'hidden') {
                    curr_disp = a_disp;
                    break;
                }
            }
            return curr_disp;
        };

        an_array.currenty = function () {
            var a_y;
            var filtered = an_array.filter(function (el) {
                return el && !Array.isArray(el);
            });
            if (filtered[0] && filtered[0].getAttribute('transform')) {
                a_y = /translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)\)/.exec(filtered[0].getAttribute('transform'));
                if (a_y !== null && typeof a_y !== 'undefined') {
                    a_y = a_y[2];
                }
            }
            return filtered[0] ? parseInt(a_y || filtered[0].getAttribute('y') || 0, 10) : 0;
        };

        an_array.animate = function (hsh) {
            if (typeof hsh.y == 'undefined') {
                attr(hsh);
                return;
            }
            if (an_array.length === 0) {
                return;
            }

            var hash = {};
            var key;

            for (key in hsh) {
                if (hsh.hasOwnProperty(key)) {
                    hash[key] = hsh[key];
                }
            }

            setup_anim_clocks();

            if (an_array.animating) {
                for (var i = 0; i < (anim_clock_funcs || []).length; i++) {
                    if (anim_clock_funcs[i].target_set != an_array) {
                        continue;
                    }
                    an_array.animating = false;
                    anim_clock_funcs.splice(i, 1);
                }
            }

            var curr_disp = an_array.visibility();

            var target_disp = hash.visibility;
            if (curr_disp == target_disp && target_disp == 'hidden') {
                attr(hsh);
                return;
            }

            var curr_y = an_array.currenty();

            if (isNaN(parseInt(curr_y, 10))) {
                console.log("Have a NaN y value, skipping");
                return;
            }

            var target_y = parseInt(hash.y, 10);

            delete hash.y;

            if (curr_disp == target_disp && target_disp == 'visible') {
                delete hash.visibility;
                target_disp = null;
                attr({ 'visibility': 'visible' });
            }

            if (hash.visibility == 'hidden') {
                delete hash.visibility;
            }

            attr(hash);
            var counter = 0;

            if (target_y != curr_y) {
                var anim_steps = 1 * (Math.abs(parseInt((target_y - curr_y) / (50 * RS), 10) / rate) + 1);
                var diff = (target_y - curr_y) / anim_steps;
                hash.y = curr_y || 0;
                var orig_func = an_array.animate;
                an_array.animating = true;
                hash.y = curr_y + diff * 1;

                let step_func = function step_func(step) {
                    if (diff < 0 && hash.y < target_y) {
                        hash.y = target_y;
                    }
                    if (diff > 0 && hash.y > target_y) {
                        hash.y = target_y;
                    }
                    attr(hash);
                    counter += step || 1;
                    if (hash.y != target_y) {
                        hash.y = curr_y + diff * (counter + 1);
                        return;
                    }
                    an_array.animating = false;
                    if (target_disp) {
                        attr({ 'visibility': target_disp });
                    }
                    anim_clock_funcs.splice(anim_clock_funcs.indexOf(step_func), 1);
                };

                anim_clock_funcs.push(step_func);
                anim_clock_funcs[anim_clock_funcs.length - 1].target_set = an_array;
            }
            return;
        };

        an_array.attr = function (hsh) {
            if (in_anim) {
                return this.animate(hsh);
            }
            return attr(hsh);
        };

        var attr = function attr(hsh) {
            var hash = {};
            var key;
            for (key in hsh) {
                if (hsh.hasOwnProperty(key)) {
                    hash[key] = hsh[key];
                }
            }

            var curr_disp = an_array.visibility();

            var targ_y = parseInt(hash.y, 10);
            targ_disp = hash.visibility;

            for (key in hash) {
                if (hash.hasOwnProperty(key)) {
                    for (var i = 0; i < an_array.length; i++) {
                        if (!an_array[i]) {
                            continue;
                        }
                        if (Array.isArray(an_array[i])) {
                            continue;
                        }
                        if (an_array[i].style.display == 'none') {
                            continue;
                        }
                        var value = hash[key];
                        if (key == 'style' && an_array[i].hasAttribute('style')) {
                            var curr_style = an_array[i].getAttribute('style');
                            curr_style += '; ' + hash[key];
                            value = curr_style;
                        }
                        var has_translate = an_array[i].hasAttribute('transform') && an_array[i].getAttribute('transform').indexOf('translate') >= 0;

                        if (key == 'height' && an_array[i].setHeight) {
                            //hasAttribute('transform') && ! an_array[i].no_scale) {
                            an_array[i].setHeight(hash[key]);
                        } else if (!(has_translate && (key == 'y' || key == 'x'))) {
                            an_array[i].setAttribute(key, value);
                        }
                        if (key == 'y' && an_array[i].hasAttribute('d')) {
                            var curr_path = an_array[i].getAttribute('d');
                            var re = /M\s*([\d\.]+) ([\d\.]+)/;
                            curr_path = curr_path.replace(re, '');
                            if (isNaN(parseInt(value, 10))) {
                                throw "Error " + key + " is " + hash[key];
                            }
                            an_array[i].setAttribute('d', 'M0 ' + parseInt(value, 10) + ' ' + curr_path);
                        }
                        if (key == 'y' && an_array[i].hasAttribute('cy')) {
                            an_array[i].setAttribute('cy', hash[key]);
                        }

                        if (key == 'y' && an_array[i].hasAttribute('transform')) {
                            curr_transform = an_array[i].getAttribute('transform');

                            curr_x = /translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)?\)/.exec(an_array[i].getAttribute('transform'));
                            if (curr_x === null) {
                                continue;
                            }
                            curr_x = curr_x[1];
                            curr_transform = curr_transform.replace(/translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)?\)/, 'translate(' + curr_x + ',' + value + ')');
                            an_array[i].setAttribute('transform', curr_transform);
                        }
                        if (key == 'x' && an_array[i].hasAttribute('transform')) {
                            curr_transform = an_array[i].getAttribute('transform');

                            curr_y = /translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)\)/.exec(an_array[i].getAttribute('transform'));
                            if (curr_y === null) {
                                continue;
                            }
                            curr_y = curr_y[2];
                            curr_transform = curr_transform.replace(/translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)\)/, 'translate(' + value + ',' + curr_y + ')');
                            an_array[i].setAttribute('transform', curr_transform);
                        }
                        if (key == 'text-anchor' && an_array[i].hasAttribute('style')) {
                            an_array[i].style.textAnchor = hash[key];
                        };
                    }
                }
            }
        };
        an_array.hide = function () {
            this.attr({ 'visibility': 'hidden' });
        };
        an_array.show = function () {
            this.attr({ 'visibility': 'visible' });
        };

        an_array.refresh_zoom = function () {
            for (var i = 0; i < an_array.length; i++) {
                if (Array.isArray(an_array[i])) {
                    continue;
                }

                if (an_array[i].zoom_level && an_array[i].zoom_level == 'text') {
                    if (an_array[i].ownerSVGElement && an_array[i].ownerSVGElement.zoom > 3.5) {
                        an_array[i].setAttribute('display', 'inline');
                        an_array[i].setAttribute('opacity', 1);
                    } else {
                        an_array[i].setAttribute('display', 'none');
                    }
                }

                if (an_array[i].zoom_level && an_array[i].zoom_level == 'summary') {
                    if (an_array[i].ownerSVGElement && an_array[i].ownerSVGElement.zoom <= 3.5) {
                        an_array[i].setAttribute('display', 'inline');
                        an_array[i].setAttribute('opacity', 1);
                    } else {
                        an_array[i].setAttribute('display', 'none');
                    }
                }
            }
        };

        return an_array;
    }

    var anim_clock_funcs = null,
        in_anim = false;
    var anim_clock = null;
    var rate = 75;
    var new_rate = null;

    var setup_anim_clocks = function setup_anim_clocks() {
        if (anim_clock_funcs === null) {
            anim_clock_funcs = [];
        } else {
            anim_clock_funcs.forEach(function (func) {
                func._last_step = null;
            });
            clearInterval(anim_clock);
        }
        if (!in_anim) {
            extended_elements.forEach(function (canv) {
                __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(canv, '_anim_begin');
            });
            in_anim = true;
        }
        var start = null;
        anim_clock = setInterval(function () {
            if (!anim_clock_funcs || anim_clock_funcs.length === 0) {
                clearInterval(anim_clock);
                anim_clock = null;
                anim_clock_funcs = null;
                in_anim = false;
                extended_elements.forEach(function (canv) {
                    __WEBPACK_IMPORTED_MODULE_0__bean__["a" /* default */].fire(canv, '_anim_end');
                });
                return;
            }

            var suspended_ids = [];

            extended_elements.forEach(function (canv) {
                suspended_ids.push(canv.suspendRedraw(5000));
            });
            var tic = new Date().getTime();

            if (!start) {
                start = new Date().getTime();
            }

            for (var i = 0; i < (anim_clock_funcs || []).length; i++) {
                var end = new Date().getTime();
                var step_id = parseInt((end - start) / rate, 10);
                if (new_rate === null && step_id - anim_clock_funcs[i]._last_step > 2) {
                    new_rate = Math.round(1.6 * rate);
                }
                anim_clock_funcs[i].apply(null, [step_id - (anim_clock_funcs[i]._last_step || step_id)]);
                if (anim_clock_funcs && anim_clock_funcs[i]) {
                    anim_clock_funcs[i]._last_step = step_id;
                }
            }
            var toc = new Date().getTime();

            extended_elements.forEach(function (canv) {
                canv.unsuspendRedraw(suspended_ids.shift());
            });

            var actual_speed = toc - tic;
            if (actual_speed < rate && new_rate === null && actual_speed >= 1) {
                rate = Math.round(1.5 * (toc - tic));
                setup_anim_clocks();
            } else if (new_rate !== null && new_rate != rate) {
                rate = new_rate;
                setup_anim_clocks();
            }
        }, rate);
    };
    var scale_re = /scale\((-?\d+\.?\d*)\)/;
    var setHeight = function setHeight(height) {
        var curr_transform = this.getAttribute('transform').toString();

        var curr_scale = scale_re.exec(curr_transform);

        var curr_height = parseFloat(this.getAttribute('height') || 1);

        var new_scale = 1;
        if (curr_scale === null) {
            curr_transform += ' scale(1) ';
            curr_scale = 1;
        } else {
            curr_scale = parseFloat(curr_scale[1]);
        }
        new_scale = parseFloat(height) / curr_height * curr_scale;

        curr_transform = curr_transform.replace(scale_re, 'scale(' + new_scale + ')');

        this.setAttribute('transform', curr_transform);
        this.setAttribute('height', height);
        return new_scale;
    };

    return function (canvas) {

        var RS = canvas.RS || DEFAULT_RS;
        canvas.RS = RS;
        canvas.font_order = 'Helvetica, Verdana, Arial, Sans-serif';
        extended_elements.push(canvas);

        canvas.makeEl = function (name, attributes) {
            var result = canvas.ownerDocument.createElementNS(svgns, name);
            for (var attribute in attributes) {
                if (attributes.hasOwnProperty(attribute)) {
                    result.setAttribute(attribute, attributes[attribute]);
                }
            }
            return result;
        };

        canvas.make_gradient = function (id, x2, y2, stops, opacities) {
            var gradient = this.makeEl('linearGradient', {
                'id': id,
                'x1': '0%',
                'x2': x2,
                'y1': '0%',
                'y2': y2
            });
            var total_stops = stops.length;
            while (stops.length > 0) {
                var stop_id = Math.round((total_stops - stops.length) / total_stops * 100);
                var stop = stops.shift();
                var opacity = opacities.shift();
                gradient.appendChild(this.makeEl('stop', {
                    'offset': stop_id + '%',
                    'style': 'stop-color:' + stop + ';stop-opacity:' + opacity
                }));
            }
            return gradient;
        };

        canvas.path = function (pathdesc) {
            var a_path = document.createElementNS(svgns, 'path');
            a_path.setAttribute('d', pathdesc);
            a_path.setAttribute('stroke', '#000000');
            a_path.setAttribute('stroke-width', '1');
            this.appendChild(a_path);
            return a_path;
        };

        canvas.poly = function (points) {
            var a_poly = document.createElementNS(svgns, 'polygon');
            a_poly.setAttribute('points', points);
            this.appendChild(a_poly);
            return a_poly;
        };

        canvas.circle = function (x, y, radius) {
            var a_circle = document.createElementNS(svgns, 'circle');
            a_circle.setAttribute('cx', typeof x == 'string' ? x : x * RS);
            a_circle.setAttribute('cy', typeof y == 'string' ? y : y * RS);
            a_circle.setAttribute('r', typeof radius == 'string' ? radius : radius * RS);
            a_circle.move = function (new_x) {
                a_circle.setAttribute('cx', new_x * RS);
            };
            this.appendChild(a_circle);
            return a_circle;
        };

        canvas.group = function () {
            var a_g = document.createElementNS(svgns, 'g');
            this.appendChild(a_g);
            a_g.push = function (new_el) {
                a_g.appendChild(new_el);
            };

            return a_g;
        };

        canvas.clipPath = function () {
            var el = document.createElementNS(svgns, 'clipPath');
            this.appendChild(el);
            el.push = function (new_el) {
                el.appendChild(new_el);
            };
            return el;
        };

        canvas.line = function (x, y, x2, y2) {
            var a_line = document.createElementNS(svgns, 'line');
            a_line.setAttribute('x1', typeof x == 'string' ? x : x * RS);
            a_line.setAttribute('y1', typeof y == 'string' ? y : y * RS);
            a_line.setAttribute('x2', typeof x2 == 'string' ? x2 : x2 * RS);
            a_line.setAttribute('y2', typeof y2 == 'string' ? y2 : y2 * RS);
            this.appendChild(a_line);
            return a_line;
        };

        canvas.rect = function (x, y, width, height, opts) {
            if (!opts) {
                opts = {};
            }
            var a_rect = document.createElementNS(svgns, 'rect');
            a_rect.setAttribute('x', typeof x == 'string' ? x : x * RS);
            a_rect.setAttribute('y', typeof y == 'string' ? y : y * RS);
            a_rect.setAttribute('width', typeof width == 'string' ? width : width * RS);
            a_rect.setAttribute('height', typeof height == 'string' ? height : height * RS);
            a_rect.setAttribute('stroke', '#000000');
            this.appendChild(a_rect);
            if (typeof opts.offset !== "undefined") {
                a_rect.offset = opts.offset;
                a_rect.setAttribute('transform', 'translate(' + a_rect.getAttribute('x') + ',' + a_rect.getAttribute('y') + ')');
                a_rect.setAttribute('x', '0');
                a_rect.setAttribute('y', a_rect.offset * RS);
            }

            a_rect.move = function (new_x, new_width) {
                if (typeof this.offset !== "undefined" && this.getAttribute('transform')) {
                    var transform_attr = this.getAttribute('transform');
                    var matches = /translate\(.*[,\s](.*)\)/.exec(transform_attr);
                    if (matches[1]) {
                        this.setAttribute('transform', 'translate(' + new_x * RS + ',' + matches[1] + ')');
                    }
                    this.setAttribute('width', new_width * RS);
                } else {
                    this.setAttribute('x', new_x * RS);
                    this.setAttribute('width', new_width * RS);
                }
            };
            return a_rect;
        };

        canvas.roundRect = function (x, y, width, height, r, opts) {
            var a_rect = this.rect(x, y, width, height, opts);
            if (typeof r != 'object' || !r.x) {
                r = { 'x': r, 'y': r };
            }
            a_rect.setAttribute('rx', r.x * RS);
            a_rect.setAttribute('ry', r.y * RS);
            return a_rect;
        };

        canvas.ellipticalRect = function (x, y, width, height) {
            return this.roundRect(x, y, width, height, { 'x': 0.25 * width, 'y': 0.5 * height });
        };
        canvas.pentagon = function (x, y, width, height, rotate) {
            return this.nagon(x, y, width, height, 5, rotate);
        };
        canvas.hexagon = function (x, y, width, height, rotate) {
            return this.nagon(x, y, width, height, 6, rotate);
        };

        var shape_set_attribute = function shape_set_attribute(attr, val) {
            this.constructor.prototype.setAttribute.call(this, attr, val);
            if (attr == 'height' || attr == 'width' || attr == 'x' || attr == 'y') {
                this.redraw(Math.floor(parseFloat(this.getAttribute('height'))));
            }
        };

        canvas.nagon = function (x, y, width, height, n, rotate) {
            var shape = this.poly("");
            // shape.setAttribute('transform','translate('+(x*RS)+','+(RS*y)+')');
            shape.setAttribute('x', x * RS);
            shape.setAttribute('y', y * RS);
            shape.setAttribute('width', width * RS);
            shape.redraw = function (hght) {
                if (hght) {
                    this.last_height = hght;
                } else {
                    hght = this.last_height;
                }
                var a = 0.5 * Math.floor(parseFloat(shape.getAttribute('width')));
                var b = 0.5 * hght;
                var points = [];
                var min_x = null;
                var max_x = null;
                for (var i = 0; i < n; i++) {
                    var angle = rotate / 360 * 2 * Math.PI + 2 / n * Math.PI * i;
                    var a_x = parseInt(a + a * Math.cos(angle));
                    var a_y = parseInt(b + b * Math.sin(angle));
                    points.push([a_x, a_y]);
                    if (min_x === null || a_x < min_x) {
                        min_x = a_x;
                    }
                    if (max_x === null || a_x > max_x) {
                        max_x = a_x;
                    }
                }
                var x_pos = Math.floor(parseFloat(shape.getAttribute('x')));
                var y_pos = Math.floor(parseFloat(shape.getAttribute('y')));
                points.map(function (points) {
                    if (points[0] == min_x) {
                        points[0] = 0;
                    }
                    if (points[0] == max_x) {
                        points[0] = a * 2;
                    }
                    points[0] += x_pos;
                    points[1] = y_pos + 0.5 * hght * (points[1] / b);
                    return points.join(",");
                });
                this.setAttribute('points', points.join(" "));
            };
            shape.setHeight = shape.redraw;
            shape.move = function (new_x, new_width) {
                var curr_y = /translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)\)/.exec(this.getAttribute('transform'));
                if (curr_y === null) {
                    return;
                }
                curr_y = curr_y[2];
                var curr_transform = this.getAttribute('transform').replace(/translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)\)/, 'translate(' + new_x * RS + ',' + curr_y + ')');
                this.setAttribute('transform', curr_transform);
                a = 0.5 * new_width * RS;
            };
            shape.setAttribute = shape_set_attribute;
            shape.redraw(height * RS);
            return shape;
        };

        canvas.use = function (ref, x, y, width, height) {
            var a_use = document.createElementNS(svgns, 'use');
            a_use.setAttribute('x', typeof x == 'string' ? x : x * RS);
            a_use.setAttribute('y', typeof y == 'string' ? y : y * RS);
            a_use.setAttribute('width', typeof width == 'string' ? width : width * RS);
            a_use.setAttribute('height', typeof height == 'string' ? height : height * RS);
            a_use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', ref);
            this.appendChild(a_use);

            return a_use;
        };

        canvas.a = function (href) {
            var a_anchor = document.createElementNS(svgns, 'a');
            a_anchor.setAttribute('target', '_new');
            a_anchor.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
            this.appendChild(a_anchor);
            return a_anchor;
        };

        canvas.button = function (x, y, width, height, text) {
            var fo = document.createElementNS(svgns, 'foreignObject');
            fo.setAttribute('x', x);
            fo.setAttribute('y', y);
            fo.setAttribute('width', x + width);
            fo.setAttribute('height', y + height);
            if (!fo.style) {
                fo.setAttribute('style', 'position: absolute;');
            } else {
                fo.style.position = 'absolute';
            }
            this.appendChild(fo);
            var button = document.createElement('button');
            button.style.display = 'block';
            button.textContent = text;
            fo.appendChild(button);
            return button;
        };

        canvas.svgbutton = function (x, y, width, height, txt) {
            var button = this.group();
            var back = this.rect(x, y, width, height);
            back.setAttribute('rx', '10');
            back.setAttribute('ry', '10');
            back.setAttribute('stroke', '#ffffff');
            back.setAttribute('stroke-width', '2');
            back.setAttribute('fill', 'url(#simple_gradient)');
            x = back.x.baseVal.value;
            y = back.y.baseVal.value;
            width = back.width.baseVal.value;
            height = back.height.baseVal.value;

            var text = this.text(x + width / 2, y + height / 3, txt);
            text.setAttribute('text-anchor', 'middle');
            text.firstChild.setAttribute('dy', '1.5ex');
            text.setAttribute('font-size', 0.5 * height);
            text.setAttribute('fill', '#ffffff');
            button.push(back);
            button.push(text);
            button.background_element = back;
            button.text_element = text;

            button.setAttribute('cursor', 'pointer');
            var button_trigger = function button_trigger() {
                back.setAttribute('fill', '#999999');
                back.setAttribute('stroke', '#000000');
            };
            button.addEventListener('mousedown', button_trigger, false);
            button.addEventListener('touchstart', button_trigger, false);
            var button_reset = function button_reset() {
                back.setAttribute('stroke', '#ffffff');
                back.setAttribute('fill', 'url(#simple_gradient)');
            };
            button.addEventListener('mouseup', button_reset, false);
            button.addEventListener('mouseout', button_reset, false);
            button.addEventListener('touchend', button_reset, false);
            return button;
        };

        canvas.callout = function (x, y, content, opts) {
            var callout = this.group();
            var back = this.roundRect(-0.5 * (opts.width + 4), 20, opts.width + 4, opts.height + 4, 4);
            back.setAttribute('fill', '#000000');
            var pres_box = this.roundRect(-0.5 * (opts.width + 1), 22, opts.width + 1, opts.height, 4);
            pres_box.setAttribute('fill', '#eeeeee');
            callout.push(back);
            callout.push(pres_box);
            var poly = this.poly('0,500 500,1000 -500,1000');
            poly.setAttribute('fill', '#000000');
            callout.push(poly);
            var fo = document.createElementNS(svgns, 'foreignObject');
            fo.setAttribute('x', -0.5 * (opts.width + 1) * RS);
            fo.setAttribute('y', 22 * RS);
            fo.setAttribute('width', opts.width * RS);
            fo.setAttribute('height', opts.height * RS);
            callout.push(fo);
            var html = document.createElementNS('http://www.w3.org/1999/xhtml', 'html');
            html.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
            var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');
            body.style.fontSize = (opts['font-size'] || 15) * RS + 'px';
            body.style.margin = 5 * RS + 'px';
            body.style.height = opts.height * RS * 10 + 'px';
            html.appendChild(body);
            body.appendChild(content);
            fo.appendChild(html);
            var scale = opts.height / 15;
            callout.setAttribute('transform', 'translate(' + x * RS + ',' + (y + 20) * RS + ') scale(' + scale + ')');
            callout.setHeight = setHeight;
            if (!opts.align) {
                var currVbox = parseFloat(this.getAttribute('viewBox').split(/\s+/)[2]);
                if ((x + 10 + 0.5 * opts.width) * RS > currVbox) {
                    opts.align = 'right';
                }
                if ((x - 0.5 * opts.width) * RS < 0) {
                    opts.align = 'left';
                }
            }
            if (opts.align) {
                var shifter = opts.align == "right" ? -0.5 : 0.5;
                back.setAttribute('transform', 'translate(' + shifter * opts.width * RS + ',0)');
                pres_box.setAttribute('transform', 'translate(' + shifter * opts.width * RS + ',0)');
                poly.setAttribute('transform', 'translate(' + 0 * shifter * opts.width * RS + ',0)');
                poly.setAttribute('points', shifter > 0 ? "0,500 500,1000 0,1000" : "0,500 0,1000 -500,1000");
                fo.setAttribute('transform', 'translate(' + shifter * opts.width * RS + ',0)');
            }
            callout.setAttribute('height', opts.height * RS);
            return callout;
        };

        canvas.growingMarker = function (x, y, symbol, opts) {
            var container = document.createElementNS(svgns, 'svg');
            if (!opts.stretch && !(Array.isArray && Array.isArray(opts.content))) {
                container.setAttribute('viewBox', '-50 -100 200 250');
                container.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            } else {
                container = this.group();
            }
            container.setAttribute('x', x);
            container.setAttribute('y', y);
            var the_marker = this.marker(50 / RS, 50 / RS, 50 / RS, symbol, opts);
            container.appendChild(the_marker);
            container.contentElement = the_marker.contentElement;
            var result = this.group();
            var positioning_group = this.group();
            result.appendChild(positioning_group);
            positioning_group.appendChild(container);
            if (!opts.stretch && !(Array.isArray && Array.isArray(opts.content))) {
                container.setAttribute('width', '200');
                container.setAttribute('height', '250');
            }
            if (opts.angle) {
                result.angle = opts.angle;
            }
            // var rect = document.createElementNS(svgns,'rect');
            // rect.setAttribute('stroke','#f00');
            // rect.setAttribute('stroke-width','10');
            // rect.setAttribute('x','-50');
            // rect.setAttribute('y','-100');
            // rect.setAttribute('width','100%');
            // rect.setAttribute('height','100%');
            // rect.setAttribute('fill','none');
            // container.appendChild(rect);

            // var rect = document.createElementNS(svgns,'rect');
            // rect.setAttribute('stroke','#0f0');
            // rect.setAttribute('stroke-width','10');
            // rect.setAttribute('x','50');
            // rect.setAttribute('y','25');
            // rect.setAttribute('width','50%');
            // rect.setAttribute('height','50%');
            // rect.setAttribute('fill','none');

            // container.appendChild(rect);

            result.setAttribute('height', '250');
            result.setAttribute('transform', 'scale(1)');
            result.setHeight = function (height) {
                // this.setAttribute('height',height);
                var scale_val = setHeight.call(this, height);
                this.setAttribute('height', height);
                var top_offset = this.offset || 0;
                if (!this.angle) {
                    this.angle = 0;
                }
                this.firstChild.setAttribute('transform', 'translate(-100,' + top_offset * RS + ') rotate(' + this.angle + ',100,0)');
            };
            result.container = container;
            return result;
        };

        canvas.marker = function (cx, cy, r, symbol, opts) {
            var units = 0;
            if (typeof cx == 'string') {
                var parts = new RegExp(/(\d+)(.*)/g).exec(cx);
                units = parts[2];
                cx = parseFloat(parts[1]);

                parts = new RegExp(/(\d+)(.*)/g).exec(cy);
                cy = parseFloat(parts[1]);

                parts = new RegExp(/(\d+)(.*)/g).exec(r);
                r = parseFloat(parts[1]);
            }

            var dim = {
                CX: cx + units,
                CY: cy + units,
                R: r + units,
                MIN_X: cx - r + units,
                MAX_X: cx + r + units,
                MIN_Y: cy - r + units,
                MAX_Y: cy + r + units,
                MID_X1: cx - r / 2 + units,
                MID_X2: cx + r / 2 + units,
                MID_Y1: cy - r / 2 + units,
                MID_Y2: cy + r / 2 + units
            };

            var marker = this.group();
            if (!opts) {
                opts = {};
            }
            var fill_color = opts && opts.border ? opts.border : 'rgb(0,0,0)';
            if (!opts.bare_element) {
                if (opts.width) {
                    marker.push(this.roundRect(-0.5 * opts.width - 1, -0.5, opts.width + 2, 3, 1.5));
                    marker.lastChild.setAttribute('fill', fill_color);
                } else {
                    marker.push(this.circle(0, -0.5 * r, r));

                    marker.lastChild.setAttribute('fill', fill_color);
                    marker.lastChild.setAttribute('border', 'true');

                    marker.push(this.circle(0, 1.5 * r, r));

                    marker.lastChild.setAttribute('fill', fill_color);
                    marker.lastChild.setAttribute('border', 'true');
                    var arrow = this.poly(-0.9 * r * RS + ',' + 0 * r * RS + ' 0,' + -2.5 * r * RS + ' ' + 0.9 * r * RS + ',' + 0 * r * RS);

                    arrow.setAttribute('fill', fill_color);
                    arrow.setAttribute('stroke-width', '0');

                    marker.push(arrow);
                    marker.lastChild.setAttribute('border', 'true');
                }
            }
            marker.setAttribute('transform', 'translate(' + cx * RS + ',' + 0.5 * cy * RS + ') scale(1)');
            marker.setHeight = setHeight;
            marker.setAttribute('height', dim.R * RS);
            if (typeof symbol == 'string') {
                if (symbol.match(/^(:?https?:)?\/?.*#/)) {
                    marker.contentElement = this.use(symbol, -r, 0, 2 * r, 2 * r);
                    marker.contentElement.setAttribute('content', 'true');
                } else {
                    marker.contentElement = this.text_circle(0, 0, 2 * r, symbol, opts);
                    marker.contentElement.firstChild.setAttribute('content', 'true');
                }
                marker.push(marker.contentElement);
            } else if (Array.isArray && Array.isArray(symbol)) {
                marker.contentElement = this.group();
                var phase = Math.PI / symbol.length;
                // phase -= (Math.PI / 2);
                var needs_stretch = opts.stretch;
                var nrow = 2;
                symbol.forEach(function (symb, i) {
                    var x_pos = i % nrow;
                    var y_pos = 2 + Math.floor(i / nrow);
                    x_pos *= 2 * r;
                    y_pos *= 2 * r;
                    x_pos -= 0.5 * r;
                    var rotate_amount = 180 * i / symbol.length;
                    rotate_amount -= 0 * 90;
                    rotate_amount = 0;
                    if (needs_stretch) {
                        if (rotate_amount >= -90 && rotate_amount <= 90) {
                            opts.stretch = 'right';
                        } else {
                            opts.stretch = 'left';
                        }
                        if (rotate_amount % 90 == 0 && rotate_amount != 90 && rotate_amount != -90) {
                            if (rotate_amount == 0) {
                                opts.stretch = 'right';
                            }
                            if (symbol.length == 1) {
                                opts.stretch = true;
                            }
                        }
                    }

                    if (rotate_amount > 90 && rotate_amount < 270) {
                        rotate_amount = 180 + rotate_amount;
                    }
                    let new_el = null;
                    if (symb.match(/^(:?https?:)?\/?.*#/)) {
                        new_el = canvas.use(symb, (x_pos - 0.5) * r, (y_pos - 0.5) * r, 2 * r, 2 * r);
                        new_el.setAttribute('pointer-events', 'none');
                        new_el.setAttribute('content', 'true');
                    } else {
                        var opts_copy = JSON.parse(JSON.stringify(opts));
                        opts_copy.no_tracer = true;
                        delete opts_copy.offset;
                        delete opts_copy.height;
                        new_el = canvas.text_circle(x_pos * r, y_pos * r, 1.75 * r, symb, opts_copy);
                        new_el.firstChild.setAttribute('content', 'true');
                    }
                    var curr_transform = new_el.getAttribute('transform') || '';
                    curr_transform = curr_transform + ' rotate(' + rotate_amount + ',' + 0 * r * RS + ',' + y_pos * r * RS + ')';
                    new_el.setAttribute('transform', curr_transform);
                    marker.contentElement.push(new_el);
                });
                marker.push(marker.contentElement);
            } else {
                marker.contentElement = this.group();
                if (!opts.bare_element) {
                    marker.contentElement.push(this.text_circle(0, 0.5 * r, 1.75 * r, "", opts));
                    marker.contentElement.lastChild.firstChild.setAttribute('content', 'true');
                }
                if (symbol) {
                    if (!opts.bare_element) {
                        symbol.setAttribute('transform', 'translate(0,' + 0.5 * r * RS + ')');
                    }
                    symbol.setAttribute('content', 'true');
                    marker.contentElement.push(symbol);
                }
                marker.push(marker.contentElement);
            }
            marker.setAttribute('marker', 'true');
            return marker;
        };

        canvas.text_circle = function (cx, cy, r, txt, opts) {

            if (!opts) {
                opts = {};
            }

            var units = 0;

            if (typeof cx == 'string') {
                var parts = new RegExp(/(\d+)(.*)/g).exec(cx);
                units = parts[2];
                cx = parseFloat(parts[1]);

                parts = new RegExp(/(\d+)(.*)/g).exec(cy);
                cy = parseFloat(parts[1]);

                parts = new RegExp(/(\d+)(.*)/g).exec(r);
                r = parseFloat(parts[1]);
            }
            var dim = {
                CX: cx + units,
                CY: cy + units,
                R: r + units,
                MIN_X: cx - r + units,
                MAX_X: cx + r + units,
                MIN_Y: cy - r + units,
                MAX_Y: cy + r + units,
                MID_X1: cx - r / 2 + units,
                MID_X2: cx + r / 2 + units,
                MID_Y1: cy - r / 2 + units,
                MID_Y2: cy + r / 2 + units
            };

            var marker_group = this.group();

            var text = this.text(0, dim.CY, txt);
            text.setAttribute('font-size', 10 * RS);
            text.setAttribute('font-weight', opts.weight || 'bolder');
            text.setAttribute('fill', opts.text_fill || '#ffffff');
            text.setAttribute('style', 'font-family: sans-serif; text-anchor: middle;');
            text.firstChild.setAttribute('dy', '0.35em');
            text.setAttribute('text-anchor', 'middle');
            var back;

            if (!opts.stretch) {
                back = this.circle(0, dim.CY, 9 / 10 * dim.R);
            } else {
                var text_width = 1.2 * (opts.font_size || r) * text.getBBox().width / (10 * RS);
                var text_height = 3 / 2 * dim.R;
                var left_pos = -0.5 * text_width;
                if (text_width > 3 * dim.R) {
                    left_pos = -0.5 * text_width;

                    if (opts.stretch == 'right') {
                        left_pos = -0.1 * text_width;
                    }
                    if (opts.stretch == 'left') {
                        left_pos = -0.9 * text_width;
                    }
                } else {
                    text_width = 3 * dim.R;
                    left_pos = -0.5 * text_width;
                }
                text.setAttribute('x', (0.5 * text_width + left_pos) * RS);
                back = this.roundRect(left_pos, dim.CY - 0.5 * text_height, text_width, text_height, { 'x': 0.5 * dim.R, 'y': 0.5 * text_height }, {});
            }
            text.setAttribute('font-size', (opts.font_size || r) * RS);

            back.setAttribute('fill', opts.fill || 'url(#simple_gradient)');
            window.matchMedia('print').addListener(function (match) {
                back.setAttribute('fill', match.matches ? '#aaaaaa' : opts.fill || 'url(#simple_gradient)');
            });
            back.setAttribute('stroke', opts.border || '#000000');
            back.setAttribute('stroke-width', r / 10 * RS);

            marker_group.push(back);

            marker_group.push(text);

            marker_group.setAttribute('transform', 'translate(' + dim.CX * RS + ', 1) scale(1)');
            marker_group.setAttribute('height', dim.R / 2 * RS);
            marker_group.setHeight = setHeight;
            return marker_group;
        };

        canvas.crossed_circle = function (cx, cy, r) {

            var units = 0;

            if (typeof cx == 'string') {
                var parts = new RegExp(/(\d+)(.*)/g).exec(cx);
                units = parts[2];
                cx = parseFloat(parts[1]);

                parts = new RegExp(/(\d+)(.*)/g).exec(cy);
                cy = parseFloat(parts[1]);

                parts = new RegExp(/(\d+)(.*)/g).exec(r);
                r = parseFloat(parts[1]);
            }
            var dim = {
                CX: cx + units,
                CY: cy + units,
                R: r + units,
                MIN_X: cx - r + units,
                MAX_X: cx + r + units,
                MIN_Y: cy - r + units,
                MAX_Y: cy + r + units,
                MID_X1: cx - r / 2 + units,
                MID_X2: cx + r / 2 + units,
                MID_Y1: cy - r / 2 + units,
                MID_Y2: cy + r / 2 + units
            };

            var close_group = this.group();

            var close_button = this.circle(dim.CX, dim.CY, dim.R);
            close_button.setAttribute('fill', '#000000');
            close_button.setAttribute('stroke', '#ffffff');
            close_button.setAttribute('stroke-width', '2');

            close_group._button = close_button;

            close_group.push(close_button);

            var a_line = this.line(dim.MID_X1, dim.MID_Y1, dim.MID_X2, dim.MID_Y2);
            a_line.setAttribute('stroke', '#ffffff');
            a_line.setAttribute('stroke-width', '2');

            close_group.push(a_line);

            var first_line = a_line;

            var a_line = this.line(dim.MID_X1, dim.MID_Y2, dim.MID_X2, dim.MID_Y1);
            a_line.setAttribute('stroke', '#ffffff');
            a_line.setAttribute('stroke-width', '2');

            close_group.push(a_line);

            close_group.move = function (cx, cy) {
                close_button.setAttribute('cx', cx);
                dim.MID_X1 = cx - r / 2;
                dim.MID_X2 = cx + r / 2;
                dim.MID_Y1 = cy - r / 2;
                dim.MID_Y2 = cy + r / 2;
                first_line.setAttribute('x1', dim.MID_X1);
                first_line.setAttribute('y1', dim.MID_Y1);
                first_line.setAttribute('x2', dim.MID_X2);
                first_line.setAttribute('y2', dim.MID_Y2);
                a_line.setAttribute('x1', dim.MID_X1);
                a_line.setAttribute('y1', dim.MID_Y2);
                a_line.setAttribute('x2', dim.MID_X2);
                a_line.setAttribute('y2', dim.MID_Y1);
            };
            return close_group;
        };
        canvas.text = function (x, y, text) {
            var a_text = document.createElementNS(svgns, 'text');
            var a_tspan = document.createElementNS(svgns, 'tspan');
            if (typeof text != 'string') {
                a_text.appendChild(text);
            } else {
                a_text.appendChild(a_tspan);
                a_tspan.textContent = text;
                a_tspan.setAttribute('dy', '0');
            }
            a_text.style.fontFamily = this.font_order || 'Helvetica, Verdana, Arial, Sans-serif';
            a_text.setAttribute('x', typeof x == 'string' ? x : x * RS);
            a_text.setAttribute('y', typeof y == 'string' ? y : y * RS);
            a_text.move = function (new_x, new_width) {
                if (typeof this.offset !== "undefined" && this.getAttribute('transform')) {
                    var transform_attr = this.getAttribute('transform');
                    var matches = /translate\(.*[,\s](.*)\)/.exec(transform_attr);
                    if (matches[1]) {
                        this.setAttribute('transform', 'translate(' + new_x * RS + ',' + matches[1] + ')');
                    }
                } else {
                    this.setAttribute('x', new_x * RS);
                }
            };

            this.appendChild(a_text);
            return a_text;
        };
        canvas.plus = function (x, y, height) {
            var g = this.group();
            g.appendChild(this.makeEl('rect', {
                'x': Math.round(0.4 * height * RS).toString(),
                'y': Math.round(0.1 * height * RS).toString(),
                'stroke-width': '1',
                'width': Math.round(0.2 * height * RS).toString(),
                'height': Math.round(0.8 * height * RS).toString(),
                'stroke': '#ffffff',
                'fill': '#ffffff'
            }));

            g.appendChild(this.makeEl('rect', {
                'x': Math.round(0.1 * height * RS).toString(),
                'y': Math.round(0.4 * height * RS).toString(),
                'stroke-width': '1',
                'width': Math.round(0.8 * height * RS).toString(),
                'height': Math.round(0.2 * height * RS).toString(),
                'stroke': '#ffffff',
                'fill': '#ffffff'
            }));
            g.setAttribute('transform', 'translate(' + x * RS + ',' + y * RS + ')');
            return g;
        };
        canvas.minus = function (x, y, height) {
            var g = this.group();

            g.appendChild(this.makeEl('rect', {
                'x': Math.round(0.1 * height * RS).toString(),
                'y': Math.round(0.4 * height * RS).toString(),
                'stroke-width': '1',
                'width': Math.round(0.8 * height * RS).toString(),
                'height': Math.round(0.2 * height * RS).toString(),
                'stroke': '#ffffff',
                'fill': '#ffffff'
            }));
            g.setAttribute('transform', 'translate(' + x * RS + ',' + y * RS + ')');
            return g;
        };

        // Calculate the bounding box of an element with respect to its parent element
        // Thanks to http://stackoverflow.com/questions/10623809/get-bounding-box-of-element-accounting-for-its-transform
        canvas.transformedBoundingBox = function (el) {
            var bb = el.getBBox(),
                svg = el.ownerSVGElement,
                m = el.parentNode.getScreenCTM().inverse().multiply(el.getScreenCTM()).inverse();
            // Create an array of all four points for the original bounding box
            var pts = [svg.createSVGPoint(), svg.createSVGPoint(), svg.createSVGPoint(), svg.createSVGPoint()];
            pts[0].x = bb.x;pts[0].y = bb.y;
            pts[1].x = bb.x + bb.width;pts[1].y = bb.y;
            pts[2].x = bb.x + bb.width;pts[2].y = bb.y + bb.height;
            pts[3].x = bb.x;pts[3].y = bb.y + bb.height;

            // Transform each into the space of the parent,
            // and calculate the min/max points from that.
            var xMin = Infinity,
                xMax = -Infinity,
                yMin = Infinity,
                yMax = -Infinity;
            pts.forEach(function (pt) {
                pt = pt.matrixTransform(m);
                xMin = Math.min(xMin, pt.x);
                xMax = Math.max(xMax, pt.x);
                yMin = Math.min(yMin, pt.y);
                yMax = Math.max(yMax, pt.y);
            });

            // Update the bounding box with the new values
            try {
                bb.x = xMin;bb.width = xMax - xMin;
                bb.y = yMin;bb.height = yMax - yMin;
            } catch (e) {
                bb = { 'x': xMin, 'y': yMin, 'width': xMax - xMin, 'height': yMax - yMin };
            }
            return bb;
        };

        canvas.set = function () {
            var an_array = [];
            extend_array(an_array, RS);
            return an_array;
        };
        canvas.hide = function () {
            this.setAttribute('display', 'none');
        };
        canvas.show = function () {
            this.setAttribute('display', 'inline');
        };
    };
}();

/* harmony default export */ __webpack_exports__["a"] = (SVGCanvas);

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__hammer_js__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__bean__ = __webpack_require__(0);
/**
 *  @fileOverview   Basic classes and defitions for a Gene Ontology ID based map
 */




/**
 * @class       State class for adding panning functionality to an element. Each element that is to be panned needs a new instance
 *              of the Dragger to store state.
 * @author      hjjoshi
 * @requires    svgweb
 */
const Dragger = function Dragger() {
    this.oX = 0;
    this.oY = 0;
    this.dX = 0;
    this.dY = 0;
    this.dragging = false;
    this.targetElement = null;
};

/**
 * Connect this dragger to a particular element. If an SVG element is given, panning occurs within the bounding box of the SVG, and
 * the image is shifted by using the currentTranslate property. If a regular HTML element is given, the scrollLeft and scrollTop attributes
 * are used to move the viewport around. 
 * @param {Element} targetElement Element to enable panning upon.
 */
Dragger.prototype.applyToElement = function (targetElement, enabled) {
    var self = this;
    if (typeof enabled !== 'undefined') {
        self.enabled = enabled;
    }

    var momentum = [];

    if (targetElement.nodeName == 'svg') {
        targetElement.getPosition = function () {
            var translate = targetElement.currentTranslateCache || targetElement.currentTranslate;
            var dX = translate.x;
            var dY = translate.y;

            return [dX, dY];
        };

        targetElement.shiftPosition = function (x, y) {
            var p = { 'x': x, 'y': y };
            var viewBoxScale = 1;
            var vbox = this.getAttribute('viewBox');

            var min_x, min_y, width, height;

            if (vbox) {
                var viewBox = this.getAttribute('viewBox').split(' ');
                viewBoxScale = parseFloat(this.width.baseVal.value) / parseFloat(viewBox[2]);
                min_x = 0;
                min_y = parseInt(viewBox[1], 10);
                width = parseInt(viewBox[2], 10);
                height = parseInt(viewBox[3], 10);
            } else {
                min_x = 0;
                min_y = 0;
                width = targetElement.width;
                height = targetElement.height;
            }

            if (targetElement.style.GomapScrollLeftMargin) {
                min_x += targetElement.style.GomapScrollLeftMargin;
            }

            if (self.dragging) {
                p.x = viewBoxScale * (p.x - self.oX);
                p.y = viewBoxScale * (p.y - self.oY);

                p.x += self.dX;
                p.y += self.dY;
                p.y = 0;
            }

            if (targetElement._snapback) {
                clearTimeout(targetElement._snapback);
                targetElement._snapback = null;
            }

            if (p.x > viewBoxScale * min_x && self.enabled) {
                /* Element has shifted too far to the right
                   Induce some gravity towards the left side
                   of the screen
                */

                let do_snapback = function do_snapback() {
                    var evObj;
                    var translate = targetElement.currentTranslateCache || targetElement.currentTranslate;
                    if (Math.abs(translate.x - viewBoxScale * min_x) > 35) {
                        var new_pos = 0.95 * (translate.x - viewBoxScale * min_x);
                        if (new_pos < viewBoxScale * min_x) {
                            new_pos = viewBoxScale * min_x;
                        }

                        targetElement.setCurrentTranslateXY(new_pos, 0);
                        window.requestAnimationFrame(do_snapback, targetElement);
                        //                        targetElement._snapback = setTimeout(arguments.callee,10);
                        if (document.createEvent) {
                            var evObj = document.createEvent('Events');
                            evObj.initEvent('panstart', false, true);
                            targetElement.dispatchEvent(evObj);
                        }
                    } else {
                        targetElement.setCurrentTranslateXY(viewBoxScale * min_x, 0);
                        if (document.createEvent) {
                            var evObj = document.createEvent('Events');
                            evObj.initEvent('pan', false, true);
                            targetElement.dispatchEvent(evObj);
                        }
                        if (!self.dragging) {
                            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(targetElement, 'panend');
                        }
                        targetElement._snapback = null;
                    }
                };
                targetElement._snapback = setTimeout(do_snapback, 300);
            }

            var min_val = viewBoxScale * (width - 2 * min_x);

            if (min_x === 0) {
                min_val *= 0.90;
            }
            if (p.x < 0 && Math.abs(p.x) > min_val && self.enabled) {
                /* Element has shifted too far to the left
                   Induce some gravity to the right side of the screen
                */
                let do_snapback = function do_snapback() {
                    var evObj;
                    var translate = targetElement.currentTranslateCache || targetElement.currentTranslate;
                    if (Math.abs(translate.x - -1 * min_val) > 35) {
                        var new_pos = 0.95 * translate.x;
                        if (new_pos > -1 * min_val) {
                            new_pos = -1 * min_val;
                        }
                        targetElement.setCurrentTranslateXY(new_pos, 0);
                        window.requestAnimationFrame(do_snapback, targetElement);
                        //                        targetElement._snapback = setTimeout(arguments.callee,10);
                        if (document.createEvent) {
                            evObj = document.createEvent('Events');
                            evObj.initEvent('panstart', false, true);
                            targetElement.dispatchEvent(evObj);
                        }
                    } else {
                        targetElement.setCurrentTranslateXY(-1 * min_val, 0);
                        if (document.createEvent) {
                            evObj = document.createEvent('Events');
                            evObj.initEvent('pan', false, true);
                            targetElement.dispatchEvent(evObj);
                        }
                        if (!self.dragging) {
                            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(targetElement, 'panend');
                        }
                        targetElement._snapback = null;
                    }
                };
                targetElement._snapback = setTimeout(do_snapback, 300);
            }

            if (p.y > viewBoxScale * min_y) {
                p.y = viewBoxScale * min_y;
            }
            if (Math.abs(p.y) > 0.50 * viewBoxScale * height) {
                p.y = -0.50 * viewBoxScale * height;
            }
            if (this.setCurrentTranslateXY) {
                this.setCurrentTranslateXY(p.x, p.y);
            } else if (this.currentTranslate.setXY) {
                this.currentTranslate.setXY(p.x, p.y);
            } else {
                this.currentTranslate.x = p.x;
                this.currentTranslate.y = p.y;
            }

            if (document.createEvent) {
                var evObj = document.createEvent('Events');
                evObj.initEvent('pan', false, true);
                this.dispatchEvent(evObj);
            }
        };
    } else {
        targetElement.getPosition = function () {
            return [this.scrollLeft, this.scrollTop];
        };
        targetElement.shiftPosition = function (x, y) {
            this.scrollLeft = self.dX + (self.oX - x);
            this.scrollTop = self.dY + (self.oY - y);

            if (document.createEvent) {
                var evObj = document.createEvent('Events');
                evObj.initEvent('pan', false, true);
                this.dispatchEvent(evObj);
            }
        };
    }

    var stationary;

    var svgMouseDown = function svgMouseDown(evt) {
        if (!self.enabled) {
            return true;
        }

        var targ = self.targetElement ? self.targetElement : targetElement;
        var positions = mousePosition(evt);
        self.dragging = true;
        self.moved = false;
        targ.setAttribute('dragging', 'true');

        if (self.targetElement) {

            self.oX = positions[0];
            self.oY = positions[1];
            self.dX = self.targetElement.scrollLeft;
            self.dY = self.targetElement.scrollTop;
            evt.preventDefault(true);
            return;
        }

        var p = targetElement.createSVGPoint();
        positions = mousePosition(evt);
        p.x = positions[0];
        p.y = positions[1];

        var rootCTM = this.firstElementChild.getScreenCTM();
        self.matrix = rootCTM.inverse();

        p = p.matrixTransform(self.matrix);

        self.dX = targetElement.getPosition()[0];
        self.dY = targetElement.getPosition()[1];

        self.oX = p.x;
        self.oY = p.y;

        evt.preventDefault(true);

        if (document.createEvent) {
            self.clicktimeout = setTimeout(function () {
                var evObj = document.createEvent('Events');
                self.clicktimeout = null;
                evObj.initEvent('panstart', false, true);
                targ.dispatchEvent(evObj);
            }, 200);
        }
    };

    var mousePosition = function mousePosition(evt) {
        var posx = 0;
        var posy = 0;
        if (!evt) {
            evt = window.event;
        }
        if (evt.pageX || evt.pageY) {
            posx = evt.pageX;
            posy = evt.pageY;
        } else if (evt.clientX || evt.clientY) {
            posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        if (self.targetElement) {
            posx = evt.screenX;
            posy = evt.screenY;
        }
        return [posx, posy];
    };

    var mouseMove = function mouseMove(evt) {
        var positions = mousePosition(evt);
        if (self.clicktimeout && Math.abs(positions[0] - self.oX) < 10) {
            mouseUp();
        }
        if (!self.dragging) {
            return;
        }

        targetElement.shiftPosition(positions[0], positions[1]);

        evt.preventDefault(true);
    };

    var mouseDown = function mouseDown(evt) {
        self.dragging = true;
        self.moved = false;
        var positions = mousePosition(evt);
        self.oX = positions[0];
        self.oY = positions[1];
        self.dX = targetElement.getPosition()[0];
        self.dY = targetElement.getPosition()[1];
        evt.preventDefault(true);
        var targ = self.targetElement ? self.targetElement : targetElement;
        targ.setAttribute('dragging', 'true');
        if (document.createEvent) {
            var evObj = document.createEvent('Events');
            evObj.initEvent('panstart', false, true);
            targ.dispatchEvent(evObj);
        }
    };

    var svgMouseMove = function svgMouseMove(evt) {
        if (!self.enabled) {
            return true;
        }
        // this.style.cursor = 'url(http://maps.gstatic.com/intl/en_us/mapfiles/openhand_8_8.cur), move';
        if (!self.dragging) {
            return;
        }

        // if (stationary) {
        //     clearTimeout(stationary);
        //     stationary = null;
        // }
        // 
        // stationary = window.setTimeout(function() {
        //     self.dragging = false;
        // },200);        

        doMouseMove.call(this, evt);
    };

    var doMouseMove = function doMouseMove(evt) {
        var positions = mousePosition(evt);
        // this.style.cursor = 'url(http://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur), -moz-grabbing';

        if (self.targetElement) {
            self.targetElement.shiftPosition(positions[0], positions[1]);
            self.moved = true;
            return;
        }

        var p = targetElement._cachedpoint || targetElement.createSVGPoint();
        targetElement._cachedpoint = p;

        positions = mousePosition(evt);

        p.x = positions[0];
        p.y = positions[1];

        var rootCTM = targetElement._cachedrctm || targetElement.firstElementChild.getScreenCTM();
        targetElement._cachedrctm = rootCTM;

        p = p.matrixTransform(self.matrix);
        targetElement.shiftPosition(p.x, p.y);
        self.moved = true;
        //        momentum = p.x;        
    };

    var captureClick = function captureClick(evt) {
        evt.stopPropagation();
        this.removeEventListener('click', captureClick, true);
    };

    var mouseUp = function mouseUp(evt) {
        if (self.clicktimeout) {
            clearTimeout(self.clicktimeout);
            self.clicktimeout = null;
        }
        if (!self.enabled) {
            return true;
        }
        self.oX = 0;
        self.oY = 0;
        self.dX = null;
        self.dY = null;
        self.dragging = false;
        evt.preventDefault(true);

        var targ = self.targetElement ? self.targetElement : targetElement;

        targ.removeAttribute('dragging');

        if (!targ._snapback) {
            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(targ, 'panend', true);
        }

        if (evt.type == 'mouseup' && self.moved) {
            targ.addEventListener('click', captureClick, true);
        }
        self.moved = false;
    };

    var mouseOut = function mouseOut(e) {
        if (!self.dragging || !self.enabled) {
            return true;
        }
        if (this == self.targetElement) {
            mouseUp(e);
        }

        if (e.target != this && !e.currentTarget) {
            return;
        }

        var toTarget = e.relatedTarget ? e.relatedTarget : e.toElement;

        while (toTarget !== null) {
            if (toTarget == this) {
                return;
            }
            toTarget = toTarget.parentNode;
        }
        mouseUp(e);
    };

    if (!targetElement.addEventListener) {
        targetElement.addEventListener = function (name, func, bool) {
            this.attachEvent(name, func);
        };
    }

    targetElement.addEventListener('touchstart', function (e) {
        if (!self.enabled) {
            return;
        }
        var targ = self.targetElement ? self.targetElement : targetElement;
        if (self.momentum) {
            window.clearTimeout(self.momentum);
            self.momentum = null;
        }
        if (e.touches.length == 1) {
            var positions = mousePosition(e.touches[0]);
            var p;
            if (targ.nodeName == 'svg') {
                p = targ.createSVGPoint();
                p.x = positions[0];
                p.y = positions[1];
                var rootCTM = this.getScreenCTM();
                self.matrix = rootCTM.inverse();
                p = p.matrixTransform(self.matrix);
            } else {
                p.x = positions[0];
                p.y = positions[1];
            }
            self.oX = p.x;
            self.oY = p.y;

            self.dragging = true;
            self.dX = targ.getPosition()[0];
            self.dY = targ.getPosition()[1];

            self._momentum_shrinker = setInterval(function () {
                momentum.shift();
            }, 20);
            if (document.createEvent) {
                var evObj = document.createEvent('Events');
                evObj.initEvent('panstart', false, true);
                targ.dispatchEvent(evObj);
            }
            e.preventDefault();
        }
    }, false);

    // document.addEventListener('touchmove',function(e) {
    //     console.log('touchmove for the document');
    //     console.log(self.dragging);
    //     if ( ! self.dragging ) {
    //         return;
    //     }
    //     console.log("Ending the drag for document move");
    //     self.oX = 0;
    //     self.oY = 0;
    //     self.dX = null;
    //     self.dY = null;
    //     self.dragging = false;
    // 
    //     var targ = self.targetElement ? self.targetElement : targetElement;      
    // 
    //     if (document.createEvent) {
    //         var evObj = document.createEvent('Events');
    //         evObj.initEvent('panend',false,true);
    //         targ.dispatchEvent(evObj);
    //     }      
    // },false);

    targetElement.addEventListener('touchmove', function (e) {
        if (self.drag_zoom) {
            return;
        }
        if (self.momentum) {
            window.clearTimeout(self.momentum);
            self.momentum = null;
        }

        if (e.touches.length != 1) {
            self.dragging = false;
        }

        var targ = self.targetElement ? self.targetElement : targetElement;

        var positions = mousePosition(e.touches[0]);

        if (!positions || !self.matrix) {
            return;
        }

        var p;
        if (targ.nodeName == 'svg') {
            p = targ.createSVGPoint();
            p.x = positions[0];
            p.y = positions[1];
            p = p.matrixTransform(self.matrix);
        } else {
            p.x = positions[0];
            p.y = positions[1];
        }

        if (self.dragging && 6 * Math.abs(self.oX - p.x) > Math.abs(self.oY - p.y)) {
            // FIXME - PASSIVE
            // e.preventDefault();
        }

        if (!self.dragging) {
            self.oX = 0;
            self.oY = 0;
            self.dX = null;
            self.dY = null;
            return;
        }
        if (momentum.length > 3) {
            momentum.splice(2);
        }
        targ.shiftPosition(p.x, p.y);
        momentum.push(targ.getPosition()[0] - self.dX);
    }, { passive: true });
    // FIXME - PASSIVE

    var momentum_func = function momentum_func(e) {
        if (!self.enabled) {
            return true;
        }
        if (!self.dragging) {
            clearInterval(self._momentum_shrinker);
            mouseUp(e);
            return;
        }
        var targ = self.targetElement ? self.targetElement : targetElement;
        var delta = 0;

        if (momentum.length > 0) {
            var last_val = momentum[0];
            momentum.forEach(function (m) {
                if (typeof last_val != 'undefined') {
                    delta += m - last_val;
                }
                last_val = m;
            });
            delta = delta / momentum.length;
        }
        var start = targ.getPosition()[0];
        var start_delta = delta;
        self.dragging = false;
        if (self.momentum) {
            window.clearTimeout(self.momentum);
        }
        self.momentum = 1;
        let moment = function moment() {
            start = targ.getPosition()[0];
            if (self.dragging) {
                start += self.oX - self.dX;
            } else {
                self.oX = 0;
                self.dX = 0;
            }
            targ.shiftPosition(start + delta, 0);
            start = start + delta;
            delta = delta * 0.5;

            if (delta > 0 && Math.abs(start_delta / delta) < 10) {
                window.requestAnimationFrame(moment, targ);
                //                window.setTimeout(arguments.callee,50);
            } else {
                self.momentum = null;
                clearInterval(self._momentum_shrinker);
                mouseUp(e);
            }
        };

        moment();
    };

    targetElement.addEventListener('touchend', momentum_func, false);

    if (targetElement.nodeName == 'svg') {
        targetElement.addEventListener('mousedown', svgMouseDown, false);
        targetElement.addEventListener('mousemove', svgMouseMove, false);
        targetElement.addEventListener('mouseup', mouseUp, false);
        targetElement.addEventListener('mouseout', mouseOut, false);
        if (self.targetElement) {
            self.targetElement.addEventListener('mouseout', mouseOut, false);
        }
        // targetElement.addEventListener('click',function(ev) { ev.preventDefault(); ev.stopPropagation(); },false);
    } else {
        targetElement.addEventListener('mousedown', mouseDown, false);
        targetElement.addEventListener('mousemove', mouseMove, false);
        targetElement.addEventListener('mouseup', mouseUp, false);
        targetElement.addEventListener('mouseout', mouseOut, false);
    }
};

Dragger.addTouchZoomControls = function (zoomElement, touchElement, controller) {
    if (!controller) {
        controller = { "enabled": true };
    }
    Dragger.prototype.addTouchZoomControls.call(controller, zoomElement, touchElement);
    return controller;
};

Dragger.prototype.addTouchZoomControls = function (zoomElement, touchElement) {
    var self = this;
    var last_touch_start = null;
    var xform = null;
    var max_y = null;
    var mousePosition = function mousePosition(evt) {
        var posx = 0;
        var posy = 0;
        if (!evt) {
            evt = window.event;
        }
        if (evt.pageX || evt.pageY) {
            posx = evt.pageX;
            posy = evt.pageY;
        } else if (evt.clientX || evt.clientY) {
            posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        if (self.targetElement) {
            posx = evt.screenX;
            posy = evt.screenY;
        }
        return [posx, posy];
    };

    var drag_zoom_move = function drag_zoom_move(evt) {
        if (!self.enabled || !self.drag_zoom) {
            return;
        }
        if (evt.touches.length == 1) {
            var positions = mousePosition(evt.touches[0]);
            var p = {};
            p.x = positions[0];
            p.y = positions[1];

            if (touchElement.nodeName == 'svg') {
                p = touchElement.createSVGPoint();
                p.x = positions[0];
                p.y = positions[1];
                p = p.matrixTransform(xform);
            }
            zoomElement.zoom = self.zoom_start * Math.pow(10, (p.y - zoomElement.zoomCenter.y) / max_y);
        }
    };

    var drag_zoom_end = function drag_zoom_end(evt) {
        touchElement.removeEventListener('touchmove', drag_zoom_move);
        touchElement.removeEventListener('touchend', drag_zoom_end);
        self.drag_zoom = false;
    };

    touchElement.addEventListener('touchstart', function (e) {
        if (!self.enabled) {
            return;
        }
        if (e.touches.length == 1) {
            if (new Date().getTime() - last_touch_start <= 300) {
                self.drag_zoom = true;
                self.zoom_start = zoomElement.zoom;

                var positions = mousePosition(e.touches[0]);
                var positions2 = mousePosition(e.touches[0]);
                var p;
                if (touchElement.nodeName == 'svg') {
                    p = touchElement.createSVGPoint();
                    p.x = 0.5 * (positions[0] + positions2[0]);
                    p.y = 0.5 * (positions[1] + positions2[1]);
                    var rootCTM = this.getScreenCTM();
                    xform = rootCTM.inverse();
                    p = p.matrixTransform(xform);
                    max_y = parseInt(touchElement.getAttribute('viewBox').split(' ')[3]);
                } else {
                    p.x = 0.5 * (positions[0] + positions2[0]);
                    p.y = 0.5 * (positions[1] + positions2[1]);
                }
                zoomElement.zoomCenter = p;
                touchElement.addEventListener('touchmove', drag_zoom_move, { passive: true });
                touchElement.addEventListener('touchend', drag_zoom_end, false);
                e.preventDefault();
                return;
            }

            last_touch_start = new Date().getTime();
            return;
        }
        if (e.touches.length == 2) {
            var positions = mousePosition(e.touches[0]);
            var positions2 = mousePosition(e.touches[1]);
            var p;
            if (touchElement.nodeName == 'svg') {
                p = touchElement.createSVGPoint();
                p.x = 0.5 * (positions[0] + positions2[0]);
                p.y = 0.5 * (positions[1] + positions2[1]);
                var rootCTM = this.getScreenCTM();
                self.matrix = rootCTM.inverse();
                p = p.matrixTransform(self.matrix);
            } else {
                p.x = 0.5 * (positions[0] + positions2[0]);
                p.y = 0.5 * (positions[1] + positions2[1]);
            }
            zoomElement.zoomCenter = p;
            e.preventDefault();
        }
    }, false);

    // touchElement.addEventListener('gesturestart',function(e) {
    Hammer(touchElement).on("touch", function (e) {
        if (!self.enabled) {
            return;
        }
        // zoomElement.zoomLeft = null;
        var zoomStart = zoomElement.zoom;

        var zoomscale = function zoomscale(ev) {
            if (zoomElement.zoomCenter) {
                zoomElement.zoom = zoomStart * ev.gesture.scale;
            }
            ev.preventDefault();
        };
        Hammer(touchElement).on('pinch', zoomscale, false);
        let hammer_release = function hammer_release(ev) {
            Hammer(touchElement).off('pinch', zoomscale);
            Hammer(touchElement).off('release', hammer_release);
            zoomElement.zoomCenter = null;
            zoomElement.zoomLeft = null;
            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(zoomElement, 'gestureend');
        };
        Hammer(touchElement).on('release', hammer_release, false);
        e.preventDefault();
    }, false);
};

/**
 * Given an element that implements a zoom attribute, creates a div that contains controls for controlling the zoom attribute. The
 * zoomElement must have a zoom attribute, and can fire the zoomChange event whenever the zoom value is changed on the object. The
 * scrollwheel is connected to this element so that when the mouse hovers over the controls, it can control the zoom using only
 * the scroll wheel.
 * @param {Object} zoomElement Element to control the zooming for.
 * @param {Number} min Minimum value for the zoom attribute (default 0)
 * @param {Number} max Maximum value for the zoom attribute (default 10)
 * @param {Number} precision Step precision for the zoom control (default 0.5)
 * @param {Number} value Default value for this control
 * @returns DIV element containing the controls
 * @type Element
 * @see GOMap.Diagram#event:zoomChange
 */
Dragger.addZoomControls = function (zoomElement, min, max, precision, value) {
    min = min || 0;
    max = max || 10;
    precision = precision || 0.5;
    value = value || zoomElement.zoom || min;

    var controls_container = document.createElement('div');

    var zoomIn = document.createElement('input');
    zoomIn.setAttribute('type', 'button');
    zoomIn.setAttribute('value', '+');
    var zoomOut = document.createElement('input');
    zoomOut.setAttribute('type', 'button');
    zoomOut.setAttribute('value', '-');
    var reset = document.createElement('input');
    reset.setAttribute('type', 'button');
    reset.setAttribute('value', 'Reset');

    controls_container.appendChild(reset);

    reset.addEventListener('click', function () {
        zoomElement.zoom = zoomElement.defaultZoom || value;
    }, false);

    var range = document.createElement('input');
    range.setAttribute('min', min);
    range.setAttribute('max', max);
    range.setAttribute('step', precision);
    range.setAttribute('value', value);
    range.setAttribute('type', 'range');
    range.setAttribute('style', '-webkit-appearance: slider-horizontal; width: 100%; position: absolute; top: 0px; bottom: 0px; margin-top: 0.5em; left: 100%; margin-left: -0.5em;');

    if (range.type == 'range') {

        range.addEventListener('change', function () {
            zoomElement.zoom = this.value;
        }, false);

        var evFunction = null;
        if (zoomElement.addEventListener) {
            evFunction = zoomElement.addEventListener;
        } else if (zoomElement.bind) {
            evFunction = zoomElement.bind;
        }

        evFunction.apply(zoomElement, ['zoomChange', function () {
            range.value = zoomElement.zoom;
        }, false]);

        reset.style.margin = '0px';
        reset.style.display = 'block';
        reset.style.position = 'absolute';
        reset.style.top = '0px';

        controls_container.appendChild(range);
        controls_container.style.height = '100%';
    } else {
        if (!zoomIn.addEventListener) {
            var addevlis = function addevlis(name, func) {
                this.attachEvent(name, func);
            };
            zoomIn.addEventListener = addevlis;
            reset.addEventListener = addevlis;
            zoomOut.addEventListener = addevlis;
        }
        zoomIn.addEventListener('click', function () {
            zoomElement.zoom += precision;
        }, false);
        zoomOut.addEventListener('click', function () {
            zoomElement.zoom -= precision;
        }, false);

        zoomIn.style.margin = '0px';
        zoomIn.style.display = 'block';
        zoomIn.style.position = 'absolute';
        zoomIn.style.top = '0px';
        zoomIn.style.left = '29px';

        zoomOut.style.margin = '0px';
        zoomOut.style.display = 'block';
        zoomOut.style.position = 'absolute';
        zoomOut.style.top = '0px';

        reset.style.margin = '0px';
        reset.style.display = 'block';
        reset.style.position = 'absolute';
        reset.style.top = '23px';
        reset.style.left = '3px';

        controls_container.appendChild(zoomOut);
        controls_container.appendChild(zoomIn);
        controls_container.appendChild(reset);
    }

    this.addScrollZoomControls(zoomElement, controls_container, precision);

    return controls_container;
};

Dragger.addScrollBar = function (target, controlElement, scrollContainer) {
    return;
    var scroller = document.createElement('div');
    while (scrollContainer.childNodes.length > 0) {
        scrollContainer.removeChild(scrollContainer.firstChild);
    }
    scrollContainer.appendChild(scroller);
    if (!scrollContainer.style.position) {
        scrollContainer.style.position = 'relative';
    }
    scrollContainer.style.overflowX = 'scroll';
    scrollContainer.style.overflowY = 'hidden';

    scroller.style.position = 'absolute';
    scroller.style.left = '0px';
    scroller.style.width = '100%';
    scroller.style.height = '100%';

    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(scrollContainer, 'scroll');
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(scrollContainer, 'mouseenter');
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(scrollContainer, 'mouseenter', function () {
        var size = 100 * target.getTotalLength() / target.getVisibleLength();
        scroller.cached_width = scroller.clientWidth / size;
        disabled = true;
        scrollContainer.scrollLeft += 1;
        scrollContainer.scrollLeft -= 1;
        setTimeout(function () {
            disabled = false;
        }, 0);
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(scrollContainer, 'scroll', scroll_func);
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(scrollContainer, 'scroll', scroll_func);
    });
    var disabled = false;

    if (window.matchMedia) {
        window.matchMedia('print').addListener(function (matcher) {
            disabled = true;
            setTimeout(function () {
                disabled = false;
            }, 0);
        });
    }
    var scroll_func = function scroll_func() {
        if (disabled || !console) {
            return;
        }
        if (document.createEvent) {
            var evObj = document.createEvent('Events');
            evObj.initEvent('panstart', false, true);
            controlElement.dispatchEvent(evObj);
        }
        var size = 100 * target.getTotalLength() / target.getVisibleLength();
        var width = scroller.cached_width ? parseInt(scroller.cached_width * size) : scroller.clientWidth;
        target.setLeftPosition(parseInt(scrollContainer.scrollLeft * target.getTotalLength() / width));
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(controlElement, 'panend');
    };

    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(scrollContainer, 'scroll', scroll_func);

    var left_setter;

    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(controlElement, 'pan', function () {
        cancelAnimationFrame(left_setter);
        var size = 100 * target.getTotalLength() / target.getVisibleLength();
        scroller.style.width = parseInt(size) + '%';
        var width = scroller.cached_width ? parseInt(scroller.cached_width * size) : scroller.clientWidth;
        scroller.cached_width = width / size;

        var left_shift = parseInt(width * (target.getLeftPosition() / target.getTotalLength()));
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(scrollContainer, 'scroll', scroll_func);
        left_setter = requestAnimationFrame(function () {
            // Rendering bottleneck
            scrollContainer.scrollLeft = left_shift;
        });
    });
};

/**
 * Connect the scroll wheel to the controls to control zoom
 */
Dragger.addScrollZoomControls = function (target, controlElement, precision) {
    precision = precision || 0.5;
    var self;

    if (this.enabled === null) {
        self = { 'enabled': true };
    } else {
        self = this;
    }
    var hookEvent = function hookEvent(element, eventName, callback) {
        if (typeof element == 'string') {
            element = document.getElementById(element);
        }

        if (element === null) {
            return;
        }

        if (element.addEventListener) {
            if (eventName == 'mousewheel') {
                element.addEventListener('DOMMouseScroll', callback, false);
                element.addEventListener('wheel', callback, false);
            }
            element.addEventListener(eventName, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + eventName, callback);
        }
    };

    var mousePosition = function mousePosition(evt) {
        if (!self.enabled) {
            return;
        }
        var posx = 0;
        var posy = 0;
        if (!evt) {
            evt = window.event;
        }
        if (evt.pageX || evt.pageY) {
            posx = evt.pageX;
            posy = evt.pageY;
        } else if (evt.clientX || evt.clientY) {
            posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        var p = {};

        if (controlElement.nodeName == 'svg') {
            p = controlElement.createSVGPoint();
            p.x = posx;
            p.y = posy;
            /* Fix for mouse position in firefox - http://jsfiddle.net/JNKgR/6/ */
            var rootCTM = controlElement.firstElementChild.getScreenCTM();
            self.matrix = rootCTM.inverse();
            p = p.matrixTransform(self.matrix);
        } else {
            p.x = posx;
            p.y = posy;
        }
        return p;
    };

    var mouseWheel = function mouseWheel(e) {
        if (!self.enabled) {
            return;
        }
        e = e ? e : window.event;
        var wheelData = e.detail ? e.detail * -1 : e.wheelDelta;
        if (!wheelData) {
            wheelData = e.deltaY;
        }
        target.zoomCenter = mousePosition(e);

        if (wheelData > 0) {
            target.zoom = target.zoom += precision;
        } else {
            target.zoom = target.zoom -= precision;
        }

        if (e.preventDefault) {
            e.preventDefault();
        }

        e.returnValue = false;
        e.stopPropagation();

        return false;
    };

    var isFF = false;

    if (navigator.userAgent.indexOf('Gecko') >= 0) {
        isFF = parseFloat(navigator.userAgent.split('Firefox/')[1]) || undefined;
    }

    if (isFF && typeof svgweb != 'undefined' && svgweb.getHandlerType() == 'native') {
        hookEvent(controlElement, 'mousewheel', mouseWheel);
    } else {
        hookEvent(controlElement, 'mousewheel', mouseWheel);
    }

    hookEvent(controlElement, 'mousemove', function (e) {
        if (!self.enabled) {
            return;
        }
        if (target.zoomCenter && Math.abs(target.zoomCenter.x - mousePosition(e).x) > 100) {
            target.zoomCenter = null;
            target.zoomLeft = null;
        }
    });

    return self;
};

/* harmony default export */ __webpack_exports__["a"] = (Dragger);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(15);


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__gator__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_mascp_jstools__ = __webpack_require__(4);




const retrieve_uniprot = function retrieve_uniprot(uniprot) {
  return __WEBPACK_IMPORTED_MODULE_1_mascp_jstools__["a" /* default */].GatorDataReader.authenticate().then(function (url_base) {
    let a_reader = new __WEBPACK_IMPORTED_MODULE_1_mascp_jstools__["a" /* default */].UniprotReader();
    return new Promise((resolve, reject) => {
      a_reader.retrieve(uniprot, function (err) {
        resolve(this.result._raw_data.data[0]);
      });
    });
  });
};

const session_ready = new Promise(resolve => {
  $(document).on('shiny:sessioninitialized', resolve);
});

const notify_sequence = function notify_sequence(el, seq) {
  if (HTMLWidgets.shinyMode) {
    Shiny.setInputValue('sequenceChange', seq, { priority: "event" });
  }
};

const set_sequence = function set_sequence(el, uniprot) {
  return retrieve_uniprot(uniprot).then(seq => {
    let viewer = el.querySelector('x-protviewer');
    viewer.uniprot = uniprot;
    return new Promise(resolve => {
      let resolver = () => {
        viewer.renderer.unbind('sequenceChange', resolver);
        viewer.refreshTracks();
        viewer.fitToZoom();
        for (let track of viewer.querySelectorAll('x-gatortrack')) {
          track.setAttribute('scale', uniprot);
        }
        session_ready.then(() => {
          notify_sequence(el, seq);
        });
        resolve();
      };
      viewer.renderer.bind('sequenceChange', resolver);
      viewer.renderer.setSequence(seq);
    });
  });
};

const tmpl = document.createElement('template');

tmpl.innerHTML = `
<x-protviewer id="protview" interactive>
    <x-gatortrack name="domains" fullname="Domains" scale="uniprot" ></x-gatortrack>
    <x-gatortrack name="ptms" fullname="PTMS" scale="uniprot" ></x-gatortrack>
    <x-gatortrack name="data" fullname="Data" scale="uniprot" ></x-gatortrack>
</x-protviewer>
<x-trackrenderer track="domains" renderer="protview"></x-trackrenderer>
<x-trackrenderer track="ptms" renderer="protview"></x-trackrenderer>
<x-trackrenderer track="data" renderer="protview"></x-trackrenderer>
`;

const render_domains = (el, value) => {
  return Object(__WEBPACK_IMPORTED_MODULE_0__gator__["a" /* getData */])('glycodomain', value).then(dat => {
    el.querySelector('x-trackrenderer[track="domains"]').data = dat._raw_data.data;
  });
};

const render_ptm_data = (el, value) => {
  return Object(__WEBPACK_IMPORTED_MODULE_0__gator__["a" /* getData */])('combined', value).then(dat => {
    el.querySelector('x-trackrenderer[track="ptms"]').data = dat._raw_data.data;
  });
};

const METHODS = {
  setUniprot: (el, params) => {
    let value_uc = params.uniprot.toUpperCase();
    set_sequence(el, value_uc).then(() => {
      render_domains(el, value_uc);
      render_ptm_data(el, value_uc);
    });
  },
  showRange: (el, params) => {
    el.querySelector('x-protviewer').renderer.showResidues(params.min, params.max);
  },
  showData: (el, params) => {
    el.querySelector('x-trackrenderer[track="data"]').data = HTMLWidgets.dataframeToD3(params.dataframe);
  }
};

HTMLWidgets.widget({

  name: 'SeqViewer',

  type: 'output',

  factory: function factory(el, width, height) {

    let viewer = null;

    return {

      renderValue: function renderValue(input) {

        if (!viewer) {
          let new_viewer = tmpl.content.cloneNode(true);
          el.appendChild(new_viewer);
          viewer = el.getElementsByTagName('x-protviewer').protview;
        }

        let params = input.message;

        if (params.interactive) {
          viewer.setAttribute('interactive', '');
        }

        if (!params.ptms) {
          let ptm_track = el.querySelector('x-gatortrack[name="ptms"]');
          ptm_track.parentNode.removeChild(ptm_track);
        }

        if (!params.domains) {
          let domain_track = el.querySelector('x-gatortrack[name="domains"]');
          domain_track.parentNode.removeChild(domain_track);
        }

        // https://github.com/ramnathv/htmlwidgets/issues/71

        el.querySelector('x-trackrenderer[track="domains"]').setAttribute('src', HTMLWidgets.getAttachmentUrl('renderers', 'glycodomain.packed'));
        el.querySelector('x-trackrenderer[track="ptms"]').setAttribute('src', HTMLWidgets.getAttachmentUrl('renderers', 'msdata.packed'));
        el.querySelector('x-trackrenderer[track="data"]').setAttribute('src', HTMLWidgets.getAttachmentUrl('renderers', 'customdata.packed'));

        if (HTMLWidgets.shinyMode) {
          for (let method of Object.keys(METHODS)) {
            Shiny.addCustomMessageHandler(`seqviewer:${method}`, message => {
              var el = document.getElementById(message.id);
              if (el) {
                METHODS[method](el, message);
              }
            });
          }
        }
      },

      resize: function resize(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export getMetadata */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return getData; });
/* unused harmony export getExpression */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_mascp_jstools__ = __webpack_require__(4);


__WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GatorDataReader.anonymous = true;

__WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GatorDataReader.server = 'https://glycodomain.glycomics.ku.dk';

__WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].AUTH0_CLIENT_ID = 'fNED1UGvPaP0XlrcEvWsHXIODIKy6WVB';
__WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GATOR_CLIENT_ID = __WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].AUTH0_CLIENT_ID;

let getData = function getData(dataset, accession) {
  return __WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GatorDataReader.authenticate().then(function (url_base) {
    let a_reader = __WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GatorDataReader.createReader(dataset);
    a_reader.datasetname = dataset;
    return new Promise((resolve, reject) => {
      a_reader.retrieve(accession, function (err) {
        resolve(this.result);
      });
    });
  });
};

let getMetadata = function getMetadata(dataset) {
  return __WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GatorDataReader.authenticate().then(function (url_base) {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + __WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GATOR_AUTH_TOKEN);
    headers.append('x-api-key', __WEBPACK_IMPORTED_MODULE_0_mascp_jstools__["a" /* default */].GATOR_CLIENT_ID);
    let req_params = {
      method: 'GET',
      headers: headers
    };
    let req = new Request(`${url_base}/metadata/${dataset}`, req_params);
    return fetch(req).then(resp => resp.json());
  });
};

let hydrate_expression = (metadata, dat) => {
  let values = dat._raw_data.data;
  let locations = metadata.locations;
  locations.forEach((loc, idx) => loc.expression = values[idx]);
  return locations;
};

let getExpression = (dataset, geneid) => {
  return getMetadata(dataset).then(meta => {
    return getData(dataset, geneid).then(hydrate_expression.bind(null, meta));
  });
};



/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__MASCP__ = __webpack_require__(1);




var get_db_data, store_db_data, search_service, clear_service, find_latest_data, data_timestamps, sweep_cache, cached_accessions, begin_transaction, end_transaction, first_accession;

var max_age = 0,
    min_age = 0;

class CachingService extends __WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */] {}

CachingService.BeginCaching = function () {
    CachingService.CacheService(CachingService.prototype);
};

// To do 7 days ago, you do
// var date = new Date();
// date.setDate(date.getDate() - 1);
// Service.SetMinimumFreshnessAge(date);

// Set the minimum age if you want nothing OLDER than this date
CachingService.SetMinimumAge = function (date) {
    if (date === 0) {
        min_age = 0;
    } else {
        min_age = date.getTime();
    }
};

// Set the maximum age if you want nothing NEWER than this date
CachingService.SetMaximumAge = function (date) {
    if (date === 0) {
        max_age = 0;
    } else {
        max_age = date.getTime();
    }
};

CachingService.SweepCache = function (date) {
    if (!date) {
        date = new Date();
    }
    sweep_cache(date.getTime());
};

CachingService.CacheService = function (reader) {
    if (reader.prototype && reader.prototype.retrieve.caching || reader.retrieve.caching) {
        return;
    }
    var _oldRetrieve = reader.retrieve;
    var has_avoid;
    reader.retrieve = function (agi, cback) {
        var self = this;
        var id = agi ? agi : self.agi;
        if (!id) {
            _oldRetrieve.call(self, id, cback);
            return self;
        }

        id = id.toLowerCase();
        self.agi = id;

        if (self.avoid_database) {
            if (has_avoid) {
                return;
            }
            has_avoid = self._dataReceived;
            self._dataReceived = function () {
                return function (dat) {
                    var res = has_avoid.call(this, dat);
                    var id = self.agi;
                    if (res && this.result && this.result._raw_data !== null) {
                        store_db_data(id, this.toString(), this.result._raw_data || {});
                    }
                    dat = {};
                    return res;
                };
            }();
            cback.call(self);
            return;
        }
        if (has_avoid && !self.avoid_database) {
            self._dataReceived = has_avoid;
            has_avoid = null;
            cback.call(self);
            return;
        }

        get_db_data(id, self.toString(), function (err, data) {
            if (data) {
                if (cback) {
                    self.result = null;
                    var done_func = function done_func(err) {
                        bean.remove(self, "resultReceived", arguments.callee);
                        bean.remove(self, "error", arguments.callee);
                        cback.call(self, err);
                    };
                    bean.add(self, "resultReceived", done_func);
                    bean.add(self, "error", done_func);
                }

                var received_flag = self._dataReceived(data, "db");

                if (received_flag) {
                    self.gotResult();
                }

                if (received_flag !== null) {
                    self.requestComplete();
                } else {
                    self.requestIncomplete();
                }
            } else {
                var old_received = self._dataReceived;
                self._dataReceived = function () {
                    return function (dat, source) {
                        var res = old_received.call(this, dat, source);
                        if (res && this.result && this.result._raw_data !== null) {
                            store_db_data(id, this.toString(), this.result._raw_data || {});
                        }
                        this._dataReceived = null;
                        this._dataReceived = old_received;
                        dat = {};
                        return res;
                    };
                }();
                var old_url = self._endpointURL;
                // If we have a maximum age, i.e. we don't want anything newer than a date
                // we should not actually do a request that won't respect that.
                // We can set a minimum age, since the latest data will be, by definition be the latest!
                if (max_age !== 0) {
                    self._endpointURL = null;
                }
                _oldRetrieve.call(self, id, cback);
                self._endpointURL = old_url;
            }
        });
        return self;
    };
    reader.retrieve.caching = true;
};

CachingService.FindCachedService = function (service, cback) {
    var serviceString = service.toString();
    search_service(serviceString, cback);
    return true;
};

CachingService.CachedAgis = function (service, cback) {
    var serviceString = service.toString();
    cached_accessions(serviceString, cback);
    return true;
};

CachingService.FirstAgi = function (service, cback) {
    var serviceString = service.toString();
    first_accession(serviceString, cback);
    return true;
};

CachingService.ClearCache = function (service, agi, callback) {
    var serviceString = service.toString();
    if (!callback) {
        callback = function callback() {};
    }
    clear_service(serviceString, agi, callback);
    return true;
};

CachingService.HistoryForService = function (service, cback) {
    var serviceString = service.toString();
    data_timestamps(serviceString, null, cback);
};

CachingService.Snapshot = function (service, date, wanted, cback) {
    var serviceString = service.toString();
    get_snapshot(serviceString, null, wanted, cback);
};

var transaction_ref_count = 0;
var waiting_callbacks = [];
CachingService.BulkOperation = function (callback) {
    transaction_ref_count++;
    var trans = function trans(callback) {
        if (!callback) {
            callback = function callback() {};
        }
        transaction_ref_count--;
        waiting_callbacks.push(callback);
        if (transaction_ref_count == 0) {
            end_transaction(function (err) {
                waiting_callbacks.forEach(function (cback) {
                    cback(err);
                });
                waiting_callbacks = [];
            });
        }
    };
    begin_transaction(callback, trans);
    return trans;
};

var setup_idb = function setup_idb(idb) {
    var transaction_store_db;
    var transaction_find_latest;
    var transaction_data = [];
    begin_transaction = function begin_transaction(callback, trans) {
        if (transaction_store_db != null) {
            setTimeout(function () {
                callback.call({ "transaction": trans });
            }, 0);
            return false;
        }
        transaction_store_db = store_db_data;
        store_db_data = function store_db_data(acc, service, data) {
            transaction_data.push([acc, service, data]);
        };
        setTimeout(function () {
            callback.call({ "transaction": trans });
        }, 0);
        return true;
    };

    end_transaction = function end_transaction(callback) {
        if (transaction_store_db === null) {
            callback(null);
            return;
        }
        store_db_data = transaction_store_db;
        transaction_store_db = null;
        var trans = idb.transaction(["cached"], "readwrite");
        var store = trans.objectStore("cached");
        trans.oncomplete = function (event) {
            callback(null);
        };
        trans.onerror = function (event) {
            callback(event.target.errorCode);
        };
        while (transaction_data.length > 0) {
            var row = transaction_data.shift();
            var acc = row[0];
            var service = row[1];
            var data = row[2];
            if (typeof data != 'object' || data.constructor.name !== 'Object' || typeof Document != 'undefined' && data instanceof Document) {
                continue;
            }
            var dateobj = data.retrieved ? data.retrieved : new Date();
            if (typeof dateobj === 'string' || typeof dateobj === 'number') {
                dateobj = new Date(dateobj);
            }
            dateobj.setUTCHours(0);
            dateobj.setUTCMinutes(0);
            dateobj.setUTCSeconds(0);
            dateobj.setUTCMilliseconds(0);
            var reporter = insert_report_func(acc, service);
            var datetime = dateobj.getTime();
            data.id = [acc, service, datetime];
            data.acc = acc;
            data.service = service;
            if (window.msIndexedDB) {
                data.serviceacc = service + acc;
            }
            data.retrieved = datetime;
            var req = store.put(data);
            req.onerror = reporter;
        }
    };

    var insert_report_func = function insert_report_func(acc, service) {
        return function (err, rows) {
            if (!err && rows) {}
        };
    };

    store_db_data = function store_db_data(acc, service, data) {
        var trans = idb.transaction(["cached"], "readwrite");
        var store = trans.objectStore("cached");
        if (typeof data != 'object' || typeof Document != 'undefined' && data instanceof Document) {
            return;
        }
        var dateobj = data.retrieved ? data.retrieved : new Date();
        if (typeof dateobj === 'string' || typeof dateobj === 'number') {
            dateobj = new Date(dateobj);
        }
        dateobj.setUTCHours(0);
        dateobj.setUTCMinutes(0);
        dateobj.setUTCSeconds(0);
        dateobj.setUTCMilliseconds(0);
        var reporter = insert_report_func(acc, service);
        var datetime = dateobj.getTime();
        data.id = [acc, service, datetime];
        data.acc = acc;
        if (window.msIndexedDB) {
            data.serviceacc = service + acc;
        }
        data.service = service;
        data.retrieved = datetime;
        var req = store.put(data);
        // req.onsuccess = reporter;
        req.onerror = reporter;
    };

    get_db_data = function get_db_data(acc, service, cback) {
        var timestamps = max_age ? [min_age, max_age] : [min_age, new Date().getTime()];
        return find_latest_data(acc, service, timestamps, cback);
    };

    find_latest_data = function find_latest_data(acc, service, timestamps, cback) {
        if (!acc) {
            cback.call();
            return;
        }
        var trans = idb.transaction(["cached"], "readonly");
        var store = trans.objectStore("cached");
        var idx = store.index(window.msIndexedDB ? "entries-ms" : "entries");
        var max_stamp = -1;
        var result = null;
        var range = IDBKeyRange.only(window.msIndexedDB ? service + acc : [acc, service]);
        idx.openCursor(range).onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                var ts = window.msIndexedDB ? cursor.value.retrieved : cursor.primaryKey[2];
                var c_acc = window.msIndexedDB ? cursor.value.acc : cursor.primaryKey[0];
                var serv = window.msIndexedDB ? cursor.value.service : cursor.primaryKey[1];
                if (ts >= timestamps[0] && ts <= timestamps[1]) {
                    if (ts > max_stamp && c_acc == acc && serv == service) {
                        result = cursor.value;
                        max_stamp = ts;
                        result.retrieved = new Date(ts);
                    }
                }
                cursor.continue();
            } else {
                if (result) {
                    // result = result.data
                }
                cback.call(null, null, result);
            }
        };
    };

    sweep_cache = function sweep_cache(timestamp) {
        var trans = idb.transaction(["cached"], "readwrite");
        var store = trans.objectStore("cached");
        var idx = store.index("timestamps");
        var results = [];
        idx.openKeyCursor(null, "nextunique").onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (timestamp >= cursor.key[1]) {
                    store.delete(cursor.primaryKey);
                }
                cursor.continue();
            }
        };
    };

    data_timestamps = function data_timestamps(service, timestamps, cback) {

        if (!timestamps || typeof timestamps != 'object' || !timestamps.length) {
            timestamps = [0, new Date().getTime()];
        }

        var trans = idb.transaction(["cached"], "readonly");
        var store = trans.objectStore("cached");
        var idx = store.index("timestamps");
        var results = [];
        idx.openKeyCursor(null, "nextunique").onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (cursor.key[0] == service && timestamps[0] <= cursor.key[1] && timestamps[1] >= cursor.key[1]) {
                    results.push(new Date(parseInt(cursor.key[1])));
                }
                cursor.continue();
            } else {
                cback.call(null, results);
            }
        };
    };

    clear_service = function clear_service(service, acc, callback) {
        var trans = idb.transaction(["cached"], "readwrite");
        var store = trans.objectStore("cached");
        var idx = store.index("services");
        var range = IDBKeyRange.only(service);
        idx.openCursor(range).onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (!acc || cursor.value.acc == acc) {
                    if (window.msIndexedDB) {
                        store.delete(cursor.value.serviceacc);
                    } else {
                        store.delete(cursor.value.id ? cursor.value.id : cursor.primaryKey);
                    }
                }
                cursor.continue();
            }
        };
        trans.oncomplete = function () {
            callback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */]);
        };
    };

    search_service = function search_service(service, cback) {
        var trans = idb.transaction(["cached"], "readonly");
        var store = trans.objectStore("cached");
        var idx = store.index("services");
        var results = [];
        var range = IDBKeyRange.only(service);
        idx.openKeyCursor(range, "nextunique").onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                results.push(cursor.key);
                cursor.continue();
            } else {
                cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], results);
            }
        };
    };
    first_accession = function first_accession(service, cback) {
        var trans = idb.transaction(["cached"], "readonly");
        var store = trans.objectStore("cached");
        var idx = store.index("services");
        var range = IDBKeyRange.only(service);
        idx.openCursor(range, "nextunique").onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], cursor.value.acc);
            } else {
                cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], null);
            }
        };
    };
    cached_accessions = function cached_accessions(service, cback) {
        var trans = idb.transaction(["cached"], "readonly");
        var store = trans.objectStore("cached");
        var idx = store.index("services");
        var results = [];
        var range = IDBKeyRange.only(service);
        idx.openCursor(range).onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value.acc);
                cursor.continue();
            } else {
                cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], results);
            }
        };
    };
};
var setup_websql = function setup_websql(db) {
    db.all('SELECT version from versions where tablename = "datacache"', function (err, rows) {
        var version = rows && rows.length > 0 ? rows[0].version : null;
        if (version == 1.3) {
            if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events) {
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events.emit('ready');
            }
            if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready) {
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready();
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
            } else {
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
            }
            return;
        }

        if (!version || version == "" || version < 1.0) {
            db.exec('CREATE TABLE if not exists versions (version REAL, tablename TEXT);');
            db.exec('CREATE TABLE if not exists "datacache" (agi TEXT,service TEXT,retrieved REAL,data TEXT);', function (err) {
                if (err && err != "Error: not an error") {
                    throw err;
                }
            });
            db.exec('DELETE FROM versions where tablename = "datacache"');
            db.exec('INSERT INTO versions(version,tablename) VALUES(1.1,"datacache");', function (err, rows) {
                if (!err) {
                    //                        console.log("Upgrade to 1.1 completed");
                }
            });
            version = 1.1;
        }
        if (version < 1.2) {
            db.exec('DROP TABLE if exists datacache_tmp;');
            db.exec('CREATE TABLE if not exists datacache_tmp (acc TEXT,service TEXT,retrieved REAL,data TEXT);');
            db.exec('INSERT INTO datacache_tmp(acc,service,retrieved,data) SELECT agi,service,retrieved,data FROM datacache;');
            db.exec('DROP TABLE datacache;');
            db.exec('ALTER TABLE datacache_tmp RENAME TO datacache;');
            db.exec('CREATE INDEX accessions on datacache(acc);');
            db.exec('CREATE INDEX accessions_service on datacache(acc,service);');
            db.exec('DELETE FROM versions where tablename = "datacache"');
            db.exec('INSERT INTO versions(version,tablename) VALUES(1.2,"datacache");', function (err, rows) {
                if (!err) {
                    //                          console.log("Upgrade to 1.2 completed");
                }
            });
            version = 1.2;
        }
        if (version < 1.3) {
            db.exec('CREATE INDEX if not exists services on datacache(service);');
            db.exec('DELETE FROM versions where tablename = "datacache"');
            db.exec('INSERT INTO versions(version,tablename) VALUES(1.3,"datacache");', function (err, rows) {
                if (!err) {
                    if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events) {
                        __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events.emit('ready');
                    }
                    if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready) {
                        __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready();
                        __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
                    } else {
                        __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
                    }
                }
            });
            version = 1.3;
        }
    });

    begin_transaction = function begin_transaction(callback, trans) {
        callback.call({ "transaction": trans });
    };
    end_transaction = function end_transaction(callback) {
        callback();
    };

    sweep_cache = function sweep_cache(timestamp) {
        db.all("DELETE from datacache where retrieved <= ? ", [timestamp], function () {});
    };

    clear_service = function clear_service(service, acc, callback) {
        var servicename = service;
        servicename += "%";
        if (!acc) {
            db.all("DELETE from datacache where service like ? ", [servicename], function () {
                callback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */]);
            });
        } else {
            db.all("DELETE from datacache where service like ? and acc = ?", [servicename, acc.toLowerCase()], function () {
                callback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */]);
            });
        }
    };

    search_service = function search_service(service, cback) {
        db.all("SELECT distinct service from datacache where service like ? ", [service + "%"], function (err, records) {
            var results = {};
            if (records && records.length > 0) {
                records.forEach(function (record) {
                    results[record.service] = true;
                });
            }
            var uniques = [];
            for (var k in results) {
                if (results.hasOwnProperty(k)) {
                    uniques.push(k);
                }
            }
            cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], uniques);
            return uniques;
        });
    };

    first_accession = function first_accession(service, cback) {
        db.all("SELECT distinct acc from datacache where service = ? limit 1", [service], function (err, records) {
            if (!records || records.length < 1) {
                cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], null);
            } else {
                cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], records[0].acc);
            }
        });
    };

    cached_accessions = function cached_accessions(service, cback) {
        db.all("SELECT distinct acc from datacache where service = ?", [service], function (err, records) {
            var results = [];
            for (var i = 0; i < records.length; i++) {
                results.push(records[i].acc);
            }
            cback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */], results);
        });
    };

    get_snapshot = function get_snapshot(service, timestamps, wanted, cback) {
        if (!timestamps || typeof timestamps != 'object' || !timestamps.length) {
            timestamps = [0, new Date().getTime()];
        }
        var sql;
        var args = [service, timestamps[0], timestamps[1]];
        if (wanted && Array.isArray(wanted)) {
            var question_marks = new Array(wanted.length + 1).join(',?').substring(1);
            args = args.concat(wanted);
            sql = "SELECT * from datacache where service = ? AND retrieved >= ? AND retrieved <= ? AND acc in (" + question_marks + ") ORDER BY retrieved ASC";
        } else {
            if (wanted && /^\d+$/.test(wanted.toString())) {
                sql = "SELECT * from datacache where service = ? AND retrieved >= ? AND retrieved <= ? LIMIT ? ORDER BY retrieved ASC";
                args = args.concat(parseInt(wanted.toString()));
            } else {
                sql = "SELECT * from datacache where service = ? AND retrieved >= ? AND retrieved <= ? ORDER BY retrieved ASC";
            }
        }
        db.all(sql, args, function (err, records) {
            records = records || [];
            var results = {};
            records.forEach(function (record) {
                var data = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                if (data) {
                    data.retrieved = new Date(parseInt(record.retrieved));
                }
                if (results[record.acc] && results[record.acc].retrieved > record.retrieved) {
                    return;
                }
                results[record.acc] = record;
            });
            cback.call(null, null, results);
        });
    };

    get_db_data = function get_db_data(acc, service, cback) {
        var timestamps = max_age ? [min_age, max_age] : [min_age, new Date().getTime()];
        return find_latest_data(acc, service, timestamps, cback);
    };

    var insert_report_func = function insert_report_func(acc, service) {
        return function (err, rows) {
            if (!err && rows) {
                //                    console.log("Caching result for "+acc+" in "+service);
            }
        };
    };

    store_db_data = function store_db_data(acc, service, data) {
        if (typeof data != 'object' || typeof Document != 'undefined' && data instanceof Document) {
            return;
        }
        var str_rep;
        try {
            str_rep = JSON.stringify(data);
        } catch (err) {
            return;
        }
        var dateobj = data.retrieved ? data.retrieved : new Date();
        if (typeof dateobj == 'string') {
            dateobj = new Date();
        }
        dateobj.setUTCHours(0);
        dateobj.setUTCMinutes(0);
        dateobj.setUTCSeconds(0);
        dateobj.setUTCMilliseconds(0);
        var datetime = dateobj.getTime();
        data = {};
        db.all("INSERT INTO datacache(acc,service,retrieved,data) VALUES(?,?,?,?)", [acc, service, datetime, str_rep], insert_report_func(acc, service));
    };

    find_latest_data = function find_latest_data(acc, service, timestamps, cback) {
        var sql = "SELECT * from datacache where acc=? and service=? and retrieved >= ? and retrieved <= ? ORDER BY retrieved DESC LIMIT 1";
        var args = [acc, service, timestamps[0], timestamps[1]];
        db.all(sql, args, function (err, records) {
            if (records && records.length > 0 && typeof records[0] != "undefined") {
                var data = typeof records[0].data === 'string' ? JSON.parse(records[0].data) : records[0].data;
                if (data) {
                    data.retrieved = new Date(parseInt(records[0].retrieved));
                }
                cback.call(null, null, data);
            } else {
                cback.call(null, null, null);
            }
        });
    };

    data_timestamps = function data_timestamps(service, timestamps, cback) {
        if (!timestamps || typeof timestamps != 'object' || !timestamps.length) {
            timestamps = [0, new Date().getTime()];
        }
        var sql = "SELECT distinct retrieved from datacache where service=? and retrieved >= ? and retrieved <= ? ORDER BY retrieved ASC";
        var args = [service, timestamps[0], timestamps[1]];
        db.all(sql, args, function (err, records) {
            var result = [];
            if (records && records.length > 0 && typeof records[0] != "undefined") {
                for (var i = records.length - 1; i >= 0; i--) {
                    result.push(new Date(parseInt(records[i].retrieved)));
                }
            }
            cback.call(null, result);
        });
    };
};
var setup_localstorage = function setup_localstorage() {
    sweep_cache = function sweep_cache(timestamp) {
        if ("localStorage" in window) {
            var keys = [];
            for (var i = 0, len = localStorage.length; i < len; i++) {
                keys.push(localStorage.key(i));
            }
            var key = keys.shift();
            while (key) {
                if (new RegExp("^MASCP.*").test(key)) {
                    var data = localStorage[key];
                    if (data && typeof data === 'string') {
                        var datablock = JSON.parse(data);
                        datablock.retrieved = timestamp;
                        localStorage.removeItem(key);
                    }
                }
                key = keys.shift();
            }
        }
    };

    clear_service = function clear_service(service, acc, callback) {
        if ("localStorage" in window) {
            var keys = [];
            for (var i = 0, len = localStorage.length; i < len; i++) {
                keys.push(localStorage.key(i));
            }
            var key = keys.shift();
            while (key) {
                if (new RegExp("^" + service + ".*" + (acc ? "#" + acc.toLowerCase() + "$" : "")).test(key)) {
                    localStorage.removeItem(key);
                    if (acc) {
                        return;
                    }
                }
                key = keys.shift();
            }
            callback.call(__WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */]);
        }
    };

    search_service = function search_service(service, cback) {
        var results = {};
        if ("localStorage" in window) {
            var key;
            var re = new RegExp("^" + service + ".*");
            for (var i = 0, len = localStorage.length; i < len; i++) {
                key = localStorage.key(i);
                if (re.test(key)) {
                    results[key.replace(/\.#.*$/g, '')] = true;
                }
            }
        }

        var uniques = [];
        for (var k in results) {
            if (results.hasOwnProperty(k)) {
                uniques.push(k);
            }
        }

        cback.call(CachingService, uniques);

        return uniques;
    };

    first_accession = function first_accession(service, cback) {
        if ("localStorage" in window) {
            var key;
            var re = new RegExp("^" + service);
            for (var i = 0, len = localStorage.length; i < len; i++) {
                key = localStorage.key(i);
                if (re.test(key)) {
                    key = key.replace(service, '');
                    cback.call(CachingService, key);
                    return;
                }
            }
        }
        cback.call(CachingService, null);
    };

    cached_accessions = function cached_accessions(service, cback) {
        if ("localStorage" in window) {
            var key;
            var re = new RegExp("^" + service);
            for (var i = 0, len = localStorage.length; i < len; i++) {
                key = localStorage.key(i);
                if (re.test(key)) {
                    key = key.replace(service, '');
                    results[key] = true;
                }
            }
        }

        var uniques = [];
        for (var k in results) {
            if (results.hasOwnProperty(k)) {
                uniques.push(k);
            }
        }

        cback.call(CachingService, uniques);
    };

    get_db_data = function get_db_data(acc, service, cback) {
        var data = localStorage[service.toString() + ".#" + (acc || '').toLowerCase()];
        if (data && typeof data === 'string') {
            var datablock = JSON.parse(data);
            datablock.retrieved = new Date(parseInt(datablock.retrieved));
            cback.call(null, null, datablock);
        } else {
            cback.call(null, null, null);
        }
    };

    store_db_data = function store_db_data(acc, service, data) {
        if (data && (typeof data !== 'object' || data instanceof Document || data.nodeName)) {
            return;
        }
        data.retrieved = new Date().getTime();
        localStorage[service.toString() + ".#" + (acc || '').toLowerCase()] = JSON.stringify(data);
    };

    find_latest_data = function find_latest_data(acc, service, timestamp, cback) {
        // We don't actually retrieve historical data for this
        return get_db_data(acc, service, cback);
    };

    data_timestamps = function data_timestamps(service, timestamp, cback) {
        cback.call(null, []);
    };

    begin_transaction = function begin_transaction(callback) {
        // No support for transactions here. Do nothing.
        setTimeout(function () {
            callback.call();
        }, 0);
    };
    end_transaction = function end_transaction(callback) {
        // No support for transactions here. Do nothing.
        setTimeout(function () {
            callback();
        }, 0);
    };

    if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events) {
        __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events.emit('ready');
    }
    setTimeout(function () {
        if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready) {
            __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready();
            __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
        } else {
            __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
        }
    }, 100);
};

var db, idb;

if ("openDatabase" in window || "indexedDB" in window) {

    if ("indexedDB" in window) {

        /* Versioning of DB schema */

        var change_func = function change_func(version, transaction) {
            var db = transaction.db;
            if (db.objectStoreNames && db.objectStoreNames.contains("cached")) {
                db.deleteObjectStore("cached");
            }
            var keypath = window.msIndexedDB ? "serviceacc" : "id";
            var store = db.createObjectStore("cached", { keyPath: keypath });
            store.createIndex("entries", ["acc", "service"], { unique: false });
            if (window.msIndexedDB) {
                store.createIndex("entries-ms", "serviceacc", { unique: false });
            }
            store.createIndex("timestamps", ["service", "retrieved"], { unique: false });
            store.createIndex("services", "service", { unique: false });
            transaction.oncomplete = function () {
                database_ready(db);
                database_ready = function database_ready() {};
            };
        };

        idb = true;
        var db_version = 2;
        var req = indexedDB.open("datacache", db_version);

        req.onupgradeneeded = function (e) {
            var transaction = req.transaction;
            change_func(e.oldVersion, transaction);
        };

        var database_ready = function database_ready(db) {
            if (db) {
                idb = db;
            }
            setup_idb(idb);

            if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events) {
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].events.emit("ready");
            }
            if (__WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready) {
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready();
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
            } else {
                __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].ready = true;
            }
        };
        req.onerror = function (e) {
            console.log("Error loading Database");
            setup_localstorage();
            // setTimeout(function() {
            //     indexedDB.deleteDatabase("datacache").onsuccess = function() {

            //     }
            // },0);
        };
        req.onsuccess = function (e) {
            idb = e.target.result;
            var version = db_version;
            if (idb.version != Number(version)) {
                var versionRequest = db.setVersion(ver);
                versionRequest.onsuccess = function (e) {
                    var transaction = versionRequest.result;
                    change_func(oldVersion, transaction);
                };
            } else {
                database_ready();
            }
        };
    } else {
        try {
            db = openDatabase("cached", "", "MASCP Gator cache", 1024 * 1024);
        } catch (err) {
            throw err;
        }
        db.all = function (sql, args, callback) {
            this.exec(sql, args, callback);
        };
        db.exec = function (sql, args, callback) {
            var self = this;
            var sqlargs = args;
            var cback = callback;
            if (typeof cback == 'undefined' && sqlargs && Object.prototype.toString.call(sqlargs) != '[object Array]') {
                cback = args;
                sqlargs = null;
            }
            self.transaction(function (tx) {
                tx.executeSql(sql, sqlargs, function (tx, result) {
                    var res = [];
                    for (var i = 0; i < result.rows.length; i++) {
                        res.push(result.rows.item(i));
                    }
                    if (cback) {
                        cback.call(db, null, res);
                    }
                }, function (tx, err) {
                    if (cback) {
                        cback.call(db, err);
                    }
                });
            });
        };
    }
}
if (typeof idb !== 'undefined') {
    // Do nothing
} else if (typeof db !== 'undefined') {
    setup_websql(db);
} else if ("localStorage" in window) {
    setup_localstorage();
} else {

    sweep_cache = function sweep_cache(timestamp) {};

    clear_service = function clear_service(service, acc) {};

    search_service = function search_service(service, cback) {};

    cached_accessions = function cached_accessions(service, cback) {
        cback.call(CachingService, []);
    };

    get_db_data = function get_db_data(acc, service, cback) {
        cback.call(null, null, null);
    };

    store_db_data = function store_db_data(acc, service, data) {};

    find_latest_data = function find_latest_data(acc, service, timestamp, cback) {
        // We don't actually retrieve historical data for this
        cback.call(null, []);
    };

    data_timestamps = function data_timestamps(service, timestamp, cback) {
        cback.call(null, []);
    };

    begin_transaction = function begin_transaction(callback, trans) {
        // No support for transactions here. Do nothing.
        setTimeout(function () {
            callback({ "transaction": trans });
        }, 0);
    };
    end_transaction = function end_transaction(callback) {
        // No support for transactions here. Do nothing.
        setTimeout(function () {
            callback();
        }, 0);
    };
}

/* harmony default export */ __webpack_exports__["a"] = (CachingService);

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Service__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__MASCP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ClustalRunner__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__UniprotReader__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__bean__ = __webpack_require__(0);
/**
 * @fileOverview    Retrieve data from the Gator web service
 */







var localhosts = ['localhost', '10.0.2.2'];
var url_base = localhosts.indexOf(window.location.hostname) >= 0 ? 'https://test.glycocode.com/api' : '/api';
var cloudfront_host = '';

const set_reducer = (data_by_mime, set) => {
  var mimetype = set.metadata.mimetype;
  if (!mimetype) {
    return;
  }
  if (!data_by_mime['samples']) {
    data_by_mime['samples'] = {};
  }
  set.data.forEach(dat => {
    dat.dataset = set.dataset;
    dat.acc = set.acc;
    if (set.metadata.sample) {
      dat.species = set.metadata.sample.species;
    }
  });
  data_by_mime['samples'][set.dataset] = set.metadata.sample;

  data_by_mime[mimetype] = (data_by_mime[mimetype] || []).concat(set.data);
};

var data_parser = function data_parser(data) {
  var doc = this.datasetname || (data || {}).datasetname || 'combined';
  if (!data || !data.data) {
    return this;
  }
  var actual_data = data.data.filter(function (set) {
    return set.dataset.indexOf(doc) >= 0;
  })[0] || { 'data': [] };

  if (doc.split(',').length > 1) {
    doc = doc.split(',');
    var data_by_mime = {};
    data.data.filter(set => doc.indexOf(set.dataset) >= 0).forEach(set_reducer.bind(null, data_by_mime));
    actual_data = { 'data': data_by_mime };
  }

  if (doc == 'glycodomain') {
    actual_data = data.data.filter(function (set) {
      return set.metadata.mimetype == 'application/json+glycodomain';
    })[0] || { 'data': [] };
    console.log(actual_data);
  }
  if (doc == 'combined' || doc == 'homology' || doc == 'predictions') {
    var data_by_mime = {};
    data.data.forEach(set_reducer.bind(null, data_by_mime));
    actual_data = { 'data': data_by_mime };
  }
  if (doc == 'homology') {
    actual_data.alignments = data.data.filter(function (set) {
      return set.dataset == 'homology_alignment';
    })[0].data;
  }
  this._raw_data = actual_data;
  return this;
};

/** Default class constructor
 */
const GatorDataReader = __WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */].buildService(data_parser);

GatorDataReader.prototype.requestData = function () {
  var reader_conf = {
    type: "GET",
    dataType: "json",
    data: {}
  };
  var acc = (this._requestset || 'combined') + '/' + (this.agi || this.acc).toLowerCase();
  var gatorURL = (this._endpointURL || GatorDataReader.server).slice(-1) == '/' ? this._endpointURL + acc : this._endpointURL + '/' + acc;
  reader_conf.auth = __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].GATOR_AUTH_TOKEN;
  reader_conf.api_key = __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].GATOR_CLIENT_ID;
  reader_conf.session_cache = true;
  reader_conf.url = gatorURL;
  return reader_conf;
};

var id_token;

Object.defineProperty(GatorDataReader, 'server', {
  get: function get() {
    return url_base.replace('/api', '');
  },
  set: function set(url) {
    url_base = url.replace('/$', '') + '/api';
  }
});

Object.defineProperty(GatorDataReader, 'ID_TOKEN', {
  get: function get() {
    return id_token;
  },
  set: function set(token) {
    id_token = token;
    authenticating_promise = null;
    __WEBPACK_IMPORTED_MODULE_4__bean__["a" /* default */].fire(GatorDataReader, 'idtoken');
  }
});

var is_anonymous;

Object.defineProperty(GatorDataReader, 'anonymous', {
  get: function get() {
    return is_anonymous;
  },
  set: function set(anon) {
    is_anonymous = anon;
    id_token = null;
    authenticating_promise = null;
  }
});

var authenticating_promise;

var anonymous_login = function anonymous_login() {
  return new Promise(function (resolve, reject) {
    __WEBPACK_IMPORTED_MODULE_0__Service__["a" /* default */].request({ 'url': url_base + '/login?cachebuster=' + new Date().getTime(),
      'type': 'GET'
    }, function (err, token) {
      if (err) {
        reject(err);
      } else {
        var auth_token = JSON.parse(token);
        if (typeof auth_token == 'string') {
          auth_token = { id_token: auth_token };
        }
        GatorDataReader.ID_TOKEN = auth_token.id_token;
        resolve(url_base);
      }
    }, true);
  });
};

var reading_was_ok = true;

var reauth_reader = function reauth_reader(reader_class) {
  var current_retrieve = reader_class.prototype.retrieve;
  reader_class.prototype.retrieve = function () {
    console.log('Retrieve with auth retry');
    var current_arguments = [].slice.call(arguments);
    var self = this;
    this.bind('error', function (err) {
      if (err.status == 401 || err.status == 403) {
        if (!self.tried_auth) {
          self.unbind('error');
          self.tried_auth = true;
          if (reading_was_ok) {
            delete __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].GATOR_AUTH_TOKEN;
            GatorDataReader.ID_TOKEN = null;
            authenticating_promise = null;
            __WEBPACK_IMPORTED_MODULE_4__bean__["a" /* default */].fire(GatorDataReader, 'unauthorized');
            reading_was_ok = false;
          }
          authenticate_gator().catch(function (err) {
            console.log("Error after auth", err);
            throw err;
          }).then(function () {
            reading_was_ok = true;
            self.retrieve.apply(self, current_arguments);
          }).catch(function (err) {
            console.log("Died on doing the reauth", err);
          });
        }
      }
    });
    current_retrieve.apply(self, current_arguments);
  };
};

reauth_reader(GatorDataReader);

window.addEventListener("unhandledrejection", function (err, promise) {
  if (err.reason && err.reason.message == 'Unauthorized' && !err.reason.handled) {
    err.reason.handled = true;
    __WEBPACK_IMPORTED_MODULE_4__bean__["a" /* default */].fire(GatorDataReader, 'unauthorized');
    return;
  }
  console.log(err);
});

var authenticate_gator = function authenticate_gator() {
  if (authenticating_promise) {
    return authenticating_promise;
  }
  // Need to put this somewhere for the moment
  // Temporary code until we move to a single host
  __WEBPACK_IMPORTED_MODULE_2__ClustalRunner__["a" /* default */].SERVICE_URL = url_base + '/tools/clustal';
  __WEBPACK_IMPORTED_MODULE_3__UniprotReader__["a" /* default */].SERVICE_URL = url_base + '/data/latest/uniprot';
  if (!__WEBPACK_IMPORTED_MODULE_3__UniprotReader__["a" /* default */].reauthed) {
    reauth_reader(__WEBPACK_IMPORTED_MODULE_3__UniprotReader__["a" /* default */]);
  }
  __WEBPACK_IMPORTED_MODULE_3__UniprotReader__["a" /* default */].reauthed = true;

  if (!GatorDataReader.ID_TOKEN && GatorDataReader.anonymous) {
    console.log("Doing an anonymous login");
    authenticating_promise = anonymous_login().then(function () {
      authenticating_promise = null;
    }).then(authenticate_gator);
    return authenticating_promise;
  }

  if (!GatorDataReader.ID_TOKEN && !GatorDataReader.anonymous) {
    console.log("We cannot log in without an ID TOKEN, waiting for token");

    authenticating_promise = new Promise(function (resolve, reject) {
      var resolver = function resolver() {
        console.log("Got a new ID token");
        __WEBPACK_IMPORTED_MODULE_4__bean__["a" /* default */].remove(GatorDataReader, 'idtoken', resolver);
        __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].GATOR_AUTH_TOKEN = GatorDataReader.ID_TOKEN;
        resolve(url_base);
      };
      __WEBPACK_IMPORTED_MODULE_4__bean__["a" /* default */].add(GatorDataReader, 'idtoken', resolver);
      setTimeout(function () {
        console.log("Timed out logging in");
        reject(new Error('Timed out'));
      }, 5000);
    });
    return authenticating_promise;
  }

  authenticating_promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      __WEBPACK_IMPORTED_MODULE_1__MASCP__["a" /* default */].GATOR_AUTH_TOKEN = GatorDataReader.ID_TOKEN;
      __WEBPACK_IMPORTED_MODULE_4__bean__["a" /* default */].fire(GatorDataReader, 'auth', [url_base]);
      resolve(url_base);
    }, 0);
  });

  return authenticating_promise;
};

GatorDataReader.prototype.setupSequenceRenderer = function (renderer) {
  var self = this;
  if (this.datasetname !== 'homology') {
    return;
  }
  renderer.forceTrackAccs = true;
  renderer.addAxisScale('homology', function (pos, accession, inverse) {
    if (!self.result || self.agi === accession.name || self.acc === accession.name) {
      return pos;
    }
    if (inverse) {
      return self.result.calculateSequencePositionFromPosition(self.agi || self.acc, accession.name.toLowerCase(), pos);
    }
    return self.result.calculatePositionForSequence(self.agi || self.acc, accession.name.toLowerCase(), pos);
  });
};

(function () {
  var normalise_insertions = function normalise_insertions(inserts) {
    var pos;
    var positions = [];
    var result_data = {};
    for (pos in inserts) {
      if (inserts.hasOwnProperty(pos) && parseInt(pos) >= -1) {
        positions.push(parseInt(pos));
      }
    }
    positions = positions.sort(function sortfunction(a, b) {
      return a - b;
    });

    // From highest to lowest position, loop through and
    // subtract the lengths of previous subtratctions from
    // the final position value.

    for (var i = positions.length - 1; i >= 0; i--) {
      var j = i - 1;
      pos = parseInt(positions[i]);
      var value = inserts[pos];
      while (j >= 0) {
        pos -= inserts[positions[j]].length;
        j--;
      }
      if (!value.match(/^\s+$/)) {
        result_data[pos + 1] = value + (result_data[pos + 1] || '');
      }
    }
    //    delete result_data[0];
    return result_data;
  };

  var splice_char = function splice_char(seqs, index, insertions) {
    for (var i = 0; i < seqs.length; i++) {
      var seq = seqs[i].toString();
      if (seq.charAt(index) != '-') {
        if (!insertions[i]) {
          insertions[i] = {};
          insertions[i][-1] = '';
        }
        insertions[i][index - 1] = seq.charAt(index);
        if (insertions[i][index] && insertions[i][index].match(/\w/)) {
          insertions[i][index - 1] += insertions[i][index];
          delete insertions[i][index];
        }
      } else {
        if (insertions[i]) {
          insertions[i][index - 1] = ' ';
          if ((insertions[i][index] || '').match(/^\s+$/)) {
            insertions[i][index - 1] += insertions[i][index];
            delete insertions[i][index];
          }
        }
      }
      seqs[i] = seq.slice(0, index) + seq.slice(index + 1);
    }
  };

  GatorDataReader.Result.prototype.makeSequences = function (ref_acc, alignments) {
    var seqs = [];
    var insertions = [];
    var accs = [];
    var ref_cigar = '';
    alignments.forEach(function (align) {
      if (!align.cigar && align.cigar_line) {
        align.cigar = align.cigar_line;
        delete align.cigar_line;
      }
      // If the cigar line hasn't already been revivified
      if (!align.cigar.match(/^[\-\.]*$/)) {
        // Expand out the cigar line replacing M with . and D with -
        align.cigar = align.cigar.match(/\d*[MD]/g).map(function (bit) {
          return new Array((parseInt(bit.slice(0, -1)) || 1) + 1).join(bit.slice(-1) == 'M' ? '.' : '-');
        }).join('');
      }
      if (align.uniprot !== ref_acc.toUpperCase()) {
        accs.push(align.uniprot);
        seqs.push(align.cigar);
      } else {
        ref_cigar = align.cigar;
      }
    });
    var aligning_seq = ref_cigar,
        i = aligning_seq.length - 1;
    for (i; i >= 0; i--) {
      if (aligning_seq.charAt(i) == '-') {
        splice_char(seqs, i, insertions);
      }
    }
    for (i = 0; i < seqs.length; i++) {
      if (insertions[i]) {
        insertions[i] = normalise_insertions(insertions[i]);
        var seq = seqs[i];
        seqs[i] = { 'sequence': seq, 'insertions': insertions[i] };
        seqs[i].toString = function () {
          return this.sequence;
        };
      }
    }
    var result = {};
    accs.forEach(function (acc, idx) {
      result[acc.toLowerCase()] = seqs[idx];
    });
    result[ref_acc.toLowerCase()] = ref_cigar.replace('-', '');
    return result;
  };
})();

GatorDataReader.Result.prototype.calculatePositionForSequence = function (ref_acc, idx, pos) {
  if (ref_acc.toLowerCase() === idx.toLowerCase()) {
    return pos;
  }
  if (!this.sequences) {
    this.sequences = this.makeSequences(ref_acc, this._raw_data.alignments);
  }

  var inserts = this.sequences[idx.toLowerCase()].insertions || {};
  var result = pos;
  var actual_position = 0;
  var seq = this.sequences[idx.toLowerCase()].toString();
  for (var i = 0; i < seq.length; i++) {
    if (inserts[i]) {
      actual_position += inserts[i].length;
    }
    actual_position += 1;
    if (seq.charAt(i) == '-') {
      actual_position -= 1;
    }
    if (pos <= actual_position) {
      if (pos == actual_position) {
        return i + 1;
      } else {
        if (i == 0) {
          i = 1;
        }
        return -1 * i;
      }
    }
  }
  return -1 * seq.length;
};

GatorDataReader.Result.prototype.calculateSequencePositionFromPosition = function (ref_acc, idx, pos) {
  if (ref_acc.toLowerCase() === idx.toLowerCase()) {
    return pos;
  }
  if (!this.sequences) {
    this.sequences = this.makeSequences(ref_acc, this._raw_data.alignments);
  }
  var inserts = this.sequences[idx.toLowerCase()].insertions || {};
  var result = pos;
  var actual_position = 0;
  var seq = this.sequences[idx.toLowerCase()].toString();
  for (var i = 0; i < pos; i++) {
    if (inserts[i]) {
      actual_position += inserts[i].length;
    }
    actual_position += 1;
    if (seq.charAt(i) == '-') {
      actual_position -= 1;
    }
  }
  if (actual_position == 0) {
    actual_position += 1;
  }
  return actual_position;
};

var default_result = GatorDataReader.Result;

Object.defineProperty(GatorDataReader.prototype, 'datasetname', {
  get: function get() {
    return this._datasetname;
  },
  set: function set(value) {
    this._datasetname = value;
    this._requestset = value === 'homology' ? 'homology' : 'combined';
    let alt_result = class extends default_result {
      constructor(data) {
        data.datasetname = value;
        super(data);
        return this;
      }
    };
    this.Result = alt_result;
  }
});
GatorDataReader.authenticate = function () {
  return authenticate_gator();
};

var running_promises = {};

var new_retrieve = function new_retrieve(acc) {
  var self = this;
  var orig_arguments = [].slice.call(arguments);
  if (running_promises[acc + '-' + this._requestset]) {
    running_promises[acc + '-' + this._requestset].then(function (result) {
      GatorDataReader.prototype.retrieve.apply(self, orig_arguments);
    }).catch(function (err) {
      authenticate_gator().then(function () {
        new_retrieve.apply(self, orig_arguments);
      });
    });
    return;
  }
  running_promises[acc + '-' + this._requestset] = new Promise(function (resolve, reject) {
    self.bind('resultReceived', resolve);
    self.once('error', reject);
  });

  running_promises[acc + '-' + this._requestset].catch(function (err) {
    authenticate_gator().then(function () {
      running_promises[acc + '-' + self._requestset] = null;
    });
  });

  GatorDataReader.prototype.retrieve.apply(self, orig_arguments);
};

GatorDataReader.createReader = function (doc) {
  // Do the auth dance here

  var reader = new GatorDataReader(null, url_base + '/data/latest/');
  console.log(doc);
  reader.datasetname = doc;
  // MASCP.Service.CacheService(reader);

  authenticate_gator().then(function () {
    reader.retrieve = new_retrieve;
    __WEBPACK_IMPORTED_MODULE_4__bean__["a" /* default */].fire(reader, 'ready');
  });

  return reader;
};

/* harmony default export */ __webpack_exports__["a"] = (GatorDataReader);

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__MASCP__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__bean__ = __webpack_require__(0);
/**
 * @fileOverview    Read in sequences to be re-rendered in a block that can be easily annotated.
 */




/**
 * @class   Reformatter for sequences in html pages. The object retrieves the amino acid sequence from the 
 *          given element, and then reformats the display of the sequence so that rendering layers can be
 *          applied to it. 
 * @author  hjjoshi
 * @param   {Element} sequenceContainer Container element that the sequence currently is found in, and also 
 *                                      the container that data will be re-inserted into.
 */
const SequenceRenderer = function () {

    /**
     *  @lends SequenceRenderer.prototype
     *  @property   {Array}     trackOrder  The order of tracks on the renderer, an array of layer/group names.
     */
    var setupTrackOrder = function setupTrackOrder(renderer) {
        var renderer_track_order = [];

        var accessors = {

            getTrackOrder: function getTrackOrder() {
                return renderer_track_order;
            },

            setTrackOrder: function setTrackOrder(in_order) {
                var track_order = [];
                var order = in_order;
                if (!order instanceof Array) {
                    order = [in_order];
                }
                for (var i = 0; i < order.length; i++) {
                    var a_track = order[i];
                    if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(a_track)) {
                        while (track_order.indexOf(a_track) >= 0) {
                            track_order.splice(track_order.indexOf(a_track), 1);
                        }
                        track_order.push(a_track);
                    }
                    if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(a_track)) {
                        let insert_idx = i + 1;
                        __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(order[i]).eachLayer(function (grp_lay) {
                            while (track_order.indexOf(grp_lay.name) >= 0) {
                                track_order.splice(track_order.indexOf(grp_lay.name), 1);
                            }
                            order.splice(insert_idx, 0, grp_lay.name);
                            insert_idx += 1;
                        });
                    }
                }
                for (i = (renderer_track_order || []).length - 1; i >= 0; i--) {
                    if (track_order.indexOf(renderer_track_order[i]) < 0) {
                        this.hideLayer(renderer_track_order[i]);
                        this.hideGroup(renderer_track_order[i]);
                        if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(renderer_track_order[i])) {
                            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(renderer_track_order[i]), 'removed', [renderer]);
                        }
                        if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(renderer_track_order[i])) {
                            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(renderer_track_order[i]), 'removed', [renderer]);
                        }
                    }
                }
                renderer_track_order = track_order;

                if (this.refresh) {
                    this.refresh(true);
                }
                __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(renderer, 'orderChanged', [track_order]);
            }
        };

        if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].IE) {
            renderer.setTrackOrder = accessors.setTrackOrder;
        }

        if (typeof Object.defineProperty == 'function' && !__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].IE8) {
            Object.defineProperty(renderer, "trackOrder", {
                get: accessors.getTrackOrder,
                set: accessors.setTrackOrder
            });
        }
    };

    return function (sequenceContainer) {
        if (!sequenceContainer) {
            return this;
        }
        if (typeof sequenceContainer !== 'undefined') {
            this._container = sequenceContainer;
            if (!this._container.style.position) {
                this._container.style.position = 'relative';
            }
            //        this._container.style.width = '100%';

            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(this, 'sequenceChange', function (e) {
                while (sequenceContainer.firstChild) {
                    sequenceContainer.removeChild(sequenceContainer.firstChild);
                }
                this._sequence_els.forEach(function (el) {
                    sequenceContainer.appendChild(el);
                });
                var float_clear = document.createElement('div');
                float_clear.setAttribute('style', 'clear: both; float: none; height: 0px; width: 100%;');
                sequenceContainer.appendChild(float_clear);
                sequenceContainer.style.width = this._sequence_els.length + 'em';
                //            this.showRowNumbers();            
            });

            this.setSequence(sequenceContainer.textContent || '');
        }

        setupTrackOrder(this);

        return this;
    };
}();

/**
 * Event fired when a layer is registered with the global layer registry
 * @name    MASCP.layerRegistered
 * @event
 * @param   {Object}    e
 * @param   {Object}    layer Layer just registered
 */

/**
 * Event fired when a group is registered with the global group registry
 * @name    MASCP.groupRegistered
 * @event
 * @param   {Object}    e
 * @param   {Object}    group Group just registered
 */

/**
 * Event fired when the sequence is changed in a sequence renderer
 * @name    SequenceRenderer#sequenceChange
 * @event
 * @param   {Object}    e
 */

/**
 * Event fired when a result is rendered on this renderer
 * @name    SequenceRenderer#resultsRendered
 * @event
 * @param   {Object}    e
 * @param   {MASCP.Service} reader  Reader that rendered the result.
 */

/**
 * @name    MASCP.Group#visibilityChange
 * @event
 * @param   {Object}    e
 * @param   {Object}    renderer
 * @param   {Boolean}   visibility
 */

/**
 * @name    MASCP.Layer#visibilityChange
 * @event
 * @param   {Object}    e
 * @param   {Object}    renderer
 * @param   {Boolean}   visibility
 */

/**
 *  @lends SequenceRenderer.prototype
 *  @property   {String}  sequence  Sequence to mark up.
 */
SequenceRenderer.prototype = {
    sequence: null
};

if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].IE) {
    SequenceRenderer.prototype.prototype = document.createElement('div');
}

/**
 * Set the sequence for this renderer. Fires the sequenceChange event when the sequence is set.
 * @param {String} sequence Sequence to render
 * @see SequenceRenderer#event:sequenceChange
 */
SequenceRenderer.prototype.setSequence = function (sequence) {
    this.sequence = this._cleanSequence(sequence);
    var sequence_els = [];
    var renderer = this;
    if (!this.sequence) {
        return;
    }
    var seq_chars = this.sequence.split('');
    for (var i = 0; i < seq_chars.length; i++) {
        var aa = seq_chars[i];
        if (aa.match(/[A-Za-z]/)) {
            var span_el = document.createElement('span');
            span_el.textContent = aa;
            sequence_els.push(span_el);
        }
    }

    sequence_els.forEach(function (el, i) {
        // if ( (i % 10) == 0 && i > 0 && ((i % 50) != 0)) {
        //     this.style.margin = '0px 0px 0px 1em';
        // }
        // if ( (i % 50) == 0 && i > 0 ) {
        //     if (MASCP.IE7) {
        //         sequence_els[i-1].style.styleFloat = 'none';
        //         sequence_els[i-1].style.width = '1em';
        //     }
        //     this.style.clear = 'both';
        // }

        el._index = i;

        el.style.display = 'block';
        el.style.cssFloat = 'left';
        el.style.styleFloat = 'left';
        el.style.height = '1.1em';
        el.style.position = 'relative';

        el.addToLayer = SequenceRenderer.addElementToLayer;
        el.addBoxOverlay = SequenceRenderer.addBoxOverlayToElement;
        el.addToLayerWithLink = SequenceRenderer.addElementToLayerWithLink;
        el._renderer = renderer;
    });
    this._sequence_els = sequence_els;
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(this, 'sequenceChange');
};

/**
 * Color some residues on this residue
 * @param {Array} indexes Indexes to apply the given color to
 * @param {String} color Color to use to highlight the residues
 * @returns ID for the layer that is created
 * @type String
 */
SequenceRenderer.prototype.colorResidues = function (indexes, color) {
    var layer_id = Math.floor(Math.random() * 1000).toString();
    __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].registerLayer(layer_id, { 'color': color || '#ff0000' });
    var aas = this.getAminoAcidsByPosition(indexes);
    for (var i = 0; i < aas.length; i++) {
        aas[i].addToLayer(layer_id);
    }
    return __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(layer_id);
};

SequenceRenderer.prototype._cleanSequence = function (sequence) {
    if (!sequence) {
        return sequence;
    }
    var cleaned_sequence = sequence;
    cleaned_sequence = cleaned_sequence.replace(new RegExp(String.fromCharCode(160), "g"), '');
    cleaned_sequence = cleaned_sequence.replace(/[\n\t\s\d]+/mgi, '');
    cleaned_sequence = cleaned_sequence.replace(/\(.*\)/g, '');
    return cleaned_sequence;
};

/**
 * Retrieve the HTML Elements that contain the amino acids at the given positions. The first amino acid is found at position 1.
 * @param {Array} indexes Indexes to retrieve elements for
 * @returns Elements representing each amino acid at the given positions
 * @type Array
 */
SequenceRenderer.prototype.getAminoAcidsByPosition = function (indexes) {
    var sequence_els = this._sequence_els;
    return indexes.map(function (index) {
        if (index < 0) {
            return null;
        }
        return sequence_els[index - 1];
    });
};

SequenceRenderer.prototype.getAA = function (index) {
    return this.getAminoAcidsByPosition([index]).shift();
};

/**
 * Retrieve the HTML Elements that contain the amino acids contained in the given peptide sequence.
 * @param {String} peptideSequence Peptide sequence used to look up the amino acids
 * @returns Elements representing each amino acid at the given positions
 * @type Array
 */
SequenceRenderer.prototype.getAminoAcidsByPeptide = function (peptideSequence) {
    var start = this.sequence.indexOf(peptideSequence);
    var results = [];

    if (start < 0) {
        results.addToLayer = function () {};
        return results;
    }
    results = results.concat(this._sequence_els.slice(start, start + peptideSequence.length));
    if (results.length) {
        results.addToLayer = function (layername, fraction, options) {
            return results[0].addBoxOverlay(layername, results.length, fraction, options);
        };
    } else {
        results.addToLayer = function () {};
    }

    return results;
};

/**
 * Toggle the display of the given layer
 * @param {String|Object} layer Layer name, or layer object
 * @see MASCP.Layer#event:visibilityChange
 */
SequenceRenderer.prototype.toggleLayer = function (layer, consumeChange) {
    var layerName = layer;
    if (typeof layer != 'string') {
        layerName = layer.name;
    } else {
        layer = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers[layer];
    }
    this._container.classList.toggle(layerName + '_active');
    this._container.classList.toggle(layerName + '_inactive');
    if (!consumeChange) {
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(layer, 'visibilityChange', [this, this.isLayerActive(layer)]);
    }
    return this;
};

/**
 * Show the given layer
 * @param {String|Object} layer Layer name, or layer object
 * @see MASCP.Layer#event:visibilityChange
 */
SequenceRenderer.prototype.showLayer = function (lay, consumeChange) {
    var layer = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(lay);

    if (!layer || layer.disabled) {
        return;
    }
    this._container.classList.add(layer.name + '_active');
    this._container.classList.add('active_layer');
    this._container.classList.remove(layer.name + '_inactive');
    if (!consumeChange) {
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(layer, 'visibilityChange', [this, true]);
    }
    return this;
};

/**
 * Hide the given layer
 * @param {String|Object} layer Layer name, or layer object
 * @see MASCP.Layer#event:visibilityChange
 */
SequenceRenderer.prototype.hideLayer = function (lay, consumeChange) {
    var layer = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(lay);

    if (!layer || layer.disabled) {
        return;
    }

    this._container.classList.remove(layer.name + '_active');
    this._container.classList.remove('active_layer');
    this._container.classList.add(layer.name + '_inactive');
    if (!consumeChange) {
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(layer, 'visibilityChange', [this, false]);
    }
    return this;
};

/**
 * Register a layer with this renderer. Actually is a proxy on to the global registry method
 * @see MASCP#registerLayer
 */
SequenceRenderer.prototype.registerLayer = function (layer, options) {
    return __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].registerLayer(layer, options);
};

/**
 * Hide or show a group. Fires an event when this method is called.
 * @param {Object} grp Group to set the visibility for
 * @param {Boolean} visibility True for visible, false for hidden
 * @see MASCP.Group#event:visibilityChange
 */
SequenceRenderer.prototype.setGroupVisibility = function (grp, visibility, consumeChange) {
    var group = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(grp);
    if (!group) {
        return;
    }
    var groupName = group.name;

    var renderer = this;

    group.eachLayer(function (layer) {
        if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(layer) === layer) {
            // We can skip explicitly setting the visibility of groups here, since
            // any sub-groups should have a controller.
            return;
        }
        if (this.disabled && visibility) {
            renderer.hideLayer(layer.name);
            return;
        }
        if (visibility === true) {
            renderer.showLayer(layer.name);
        } else if (visibility === false) {
            renderer.hideLayer(layer.name);
        } else {
            renderer.toggleLayer(layer.name);
        }
    });
    if (visibility !== null && !consumeChange) {
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(group, 'visibilityChange', [renderer, visibility]);
    }
};

/**
 * Hide a group. Fires an event when this method is called.
 * @param {Object} grp Group to set the visibility for
 * @see MASCP.Group#event:visibilityChange
 */
SequenceRenderer.prototype.hideGroup = function (group, consumeChange) {
    this.setGroupVisibility(group, false, consumeChange);
};

/**
 * Show a group. Fires an event when this method is called.
 * @param {Object} grp Group to set the visibility for
 * @see MASCP.Group#event:visibilityChange
 */
SequenceRenderer.prototype.showGroup = function (group, consumeChange) {
    this.setGroupVisibility(group, true, consumeChange);
};

/**
 * Toggle the visibility for a group. Fires an event when this method is called.
 * @param {Object} grp Group to set the visibility for
 * @see MASCP.Group#event:visibilityChange
 */
SequenceRenderer.prototype.toggleGroup = function (group, consumeChange) {
    this.setGroupVisibility(group, consumeChange);
};

/**
 * Check if the given layer is active
 * @param {String|Object} layer Layer name, or layer object
 * @returns Whether this layer is active on this renderer
 * @type Boolean
 */
SequenceRenderer.prototype.isLayerActive = function (layer) {
    var layerName = layer;
    if (typeof layer != 'string') {
        layerName = layer.name;
    }
    return !layer.disabled && this._container.classList.contains(layerName + '_active');
};

/**
 * Deprecated until there's a better implementation for the CondensedSequenceRenderer
 * @private
 */

SequenceRenderer.prototype._setHighlight = function (layer, isHighlighted) {
    return;
};

/**
 * Create a layer controller for this sequence renderer. Attach the controller to the containing box, and shift the box across 20px.
 */
SequenceRenderer.prototype.createLayerController = function () {
    console.log("createLayerController is deprected");
    return;
};

/**
 * Create a checkbox that is used to control the given layer
 * @param {String|Object} layer Layer name or layer object that a controller should be generated for
 * @param {Object} inputElement Optional input element to bind events to. If no element is given, a new one is created.
 * @returns Checkbox element that when checked will toggle on the layer, and toggle it off when unchecked
 * @type Object
 */
SequenceRenderer.prototype.createLayerCheckbox = function (layer, inputElement, exclusive) {
    console.log("createLayerCheckbox is deprecated");
    return;
};

SequenceRenderer.prototype._removeOtherBindings = function (object, inputElement) {
    var renderer = this;

    for (var i = 0; i < inputElement._current_bindings.length; i++) {
        if (inputElement._current_bindings[i].renderer != renderer) {
            continue;
        }
        var cb = inputElement._current_bindings[i];

        if (cb.layer && cb.layer != object.name) {
            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(cb.layer), 'visibilityChange', cb.object_function);
            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(inputElement, 'change', cb.input_function);
        }

        if (cb.group && cb.group != object.name) {
            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(cb.group), 'visibilityChange', cb.object_function);
            __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(inputElement, 'change', cb.input_function);
        }
        cb.group = null;
        cb.layer = null;
    }
};

/**
 * Create a layer based controller for a group. This layer can act as a proxy for the other layers
 * @param {Object} lay Layer to turn into a group controller
 * @param {Object} grp Group to be controlled by this layer.
 */

SequenceRenderer.prototype.createGroupController = function (lay, grp) {
    var layer = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(lay);
    var group = __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getGroup(grp);

    var self = this;
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(layer, 'visibilityChange', function (rend, visible) {
        if (rend == self) {
            self.setGroupVisibility(group, visible);
            self.refresh();
        }
    });
};

/**
 * Function to be added to Amino acid elements to facilitate adding elements to layers
 * @private
 * @param {String} layerName The layer that this amino acid should be added to
 * @returns Itself
 * @type Element
 */
SequenceRenderer.addElementToLayer = function (layerName) {
    this.addBoxOverlay(layerName, 1);
    return this;
};

/**
 * Function to be added to Amino acid elements to facilitate adding elements to layers with a link
 * @private
 * @param {String} layerName The layer that this amino acid should be added to
 * @param {String} url URL to link to
 * @returns Itself
 * @type Element
 */
SequenceRenderer.addElementToLayerWithLink = function (layerName, url, width) {
    this.classList.add(layerName);
    var anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.classList.add(layerName + '_overlay');
    anchor.setAttribute('style', 'display: box; left: 0px; top: 0px; width: 100%; position: absolute; height: 100%;');
    anchor.textContent = '&nbsp;';
    this.appendChild(anchor);
    while (width && width > 0) {
        this._renderer._sequence_els[this._index + width].addToLayerWithLink(layerName, url);
        width -= 1;
    }
    if (this._z_indexes && this._z_indexes[layerName]) {
        anchor.style.zIndex = this._z_indexes[layerName];
    }
    return this;
};

/**
 * Function to be added to Amino acid elements to facilitate adding box overlays to elements
 * @private
 * @param {String} layerName The layer that this amino acid should be added to, as well as the fraction opacity to use for this overlay
 * @returns Itself
 * @type Element
 */
SequenceRenderer.addBoxOverlayToElement = function (layerName, width, fraction) {
    if (typeof fraction == 'undefined') {
        fraction = 1;
    }

    this.classList.add(layerName);
    var new_el = document.createElement('div');
    new_el.classList.add(layerName + '_overlay');
    new_el.setAttribute('style', 'top: 0px; width: 100%; position: absolute; height: 100%; opacity:' + fraction + ';');
    this.appendChild(new_el);
    while (width && width > 1) {
        this._renderer._sequence_els[this._index + width - 1].addBoxOverlay(layerName, 0, fraction);
        width -= 1;
    }
    if (this._z_indexes && this._z_indexes[layerName]) {
        new_el.style.zIndex = this._z_indexes[layerName];
    }
    var event_names = ['mouseover', 'mousedown', 'mousemove', 'mouseout', 'click', 'dblclick', 'mouseup', 'mouseenter', 'mouseleave'];
    for (var i = 0; i < event_names.length; i++) {
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(new_el, event_names[i], function () {
            return function (e) {
                __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].getLayer(layerName), e.type, [e, 'SequenceRenderer']);
            };
        }(i));
    }
    return this;
};

/**
 * Reset this renderer. Hide all groups and layers, disabling them in the registry.
 */
SequenceRenderer.prototype.reset = function () {
    while (this._container.classList.length > 0) {
        this._container.classList.remove(this._container.classList.item(0));
    }
    for (var group in __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].groups) {
        if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].groups.hasOwnProperty(group)) {
            this.hideGroup(group);
        }
    }
    for (var layer in __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers) {
        if (__WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers.hasOwnProperty(layer)) {
            if (!this.keeptracks) {
                this.hideLayer(layer, true);
                __WEBPACK_IMPORTED_MODULE_0__MASCP__["a" /* default */].layers[layer].disabled = true;
            }
        }
    }

    if (this.resetAnnotations) {
        this.resetAnnotations();
    }
};

/**
 * Execute the given block of code (in the renderer context) moving the refresh method away so that it is not called
 * @param {Function} func Function that contains operations to run without refreshing the renderer
 */
SequenceRenderer.prototype.withoutRefresh = function (func) {
    var curr_refresh = this.refresh;
    this.refresh = function () {};
    this.refresh.suspended = true;
    func.apply(this);
    this.refresh = curr_refresh;
};

/**
 * Refresh the display for this sequence renderer
 */
SequenceRenderer.prototype.refresh = function () {
    var z_index = -2;
    if (!this._z_indexes) {
        this._z_indexes = {};
    }
    for (var i = 0; i < (this.trackOrder || []).length; i++) {
        if (!this.isLayerActive(this.trackOrder[i])) {
            continue;
        }
        Array.prototype.slice.call(document.querySelectorAll('.' + this.trackOrder[i] + '_overlay')).forEach(function (el) {
            el.style.zIndex = z_index;
        });
        this._z_indexes[this.trackOrder[i]] = z_index;
        z_index -= 1;
    }
};

/**
 * Bind a function to execute on a particular event for this object
 * @param {String} ev Event name
 * @param {Function} func Function to execute
 */

SequenceRenderer.prototype.bind = function (ev, func) {
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(this, ev, func);
};

SequenceRenderer.prototype.unbind = function (ev, func) {
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(this, ev, func);
};

SequenceRenderer.prototype.trigger = function (ev, args) {
    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(this, ev, args);
};

/* harmony default export */ __webpack_exports__["a"] = (SequenceRenderer);

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__SVGCanvas__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__bean__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__MASCP__ = __webpack_require__(1);

const svgns = 'http://www.w3.org/2000/svg';





var touch_scale = 1,
    touch_enabled = false;
if ("ontouchend" in document) {
    touch_scale = window.devicePixelRatio > 1 ? 2 : 1;
    touch_enabled = true;
}

var Navigation = function Navigation(parent_canvas, renderer) {
    Object(__WEBPACK_IMPORTED_MODULE_0__SVGCanvas__["a" /* default */])(parent_canvas);

    this.win = function () {
        return renderer.win();
    };

    buildNavPane.call(this, parent_canvas);

    var track_group = parent_canvas.group();

    parent_canvas.insertBefore(track_group, parent_canvas.lastChild);

    var track_canvas = document.createElementNS(svgns, 'svg');
    buildTrackPane.call(this, track_canvas, connectRenderer.call(this, renderer));

    track_group.appendChild(track_canvas);

    track_group.setAttribute('clip-path', 'url(#' + this.clipping_id + ')');

    this.disable = function () {
        parent_canvas.style.display = 'none';
        track_canvas.style.display = 'none';
    };

    this.enable = function () {
        parent_canvas.style.display = 'block';
        track_canvas.style.display = 'block';
    };

    this.demote = function () {
        track_canvas.hide();
        return;
    };

    this.promote = function () {
        if (this.visible()) {
            track_canvas.show();
        } else {
            track_canvas.hide();
        }
    };

    this.setDimensions = function (width, height) {
        parent_canvas.setAttribute('width', width);
        parent_canvas.setAttribute('height', height);
    };
};

var connectRenderer = function connectRenderer(renderer) {

    /**
     * Create a layer based controller for a group. Clicking on the nominated layer will animate out the expansion of the
     * group.
     * @param {Object} lay Layer to turn into a group controller
     * @param {Object} grp Group to be controlled by this layer.
     */

    var controller_map = {};
    var expanded_map = {};

    var old_remove_track = renderer.removeTrack;

    renderer.removeTrack = function (layer) {
        old_remove_track.call(this, layer);
        delete controller_map[layer.name];
        delete expanded_map[layer.name];
    };

    this.isController = function (layer) {
        if (controller_map[layer.name]) {
            return true;
        } else {
            return false;
        }
    };

    this.getController = function (group) {
        for (var lay in controller_map) {
            if (controller_map.hasOwnProperty(lay) && controller_map[lay] == group) {
                return __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(lay);
            }
        }
        return null;
    };

    this.isControllerExpanded = function (layer) {
        return expanded_map[layer.name];
    };

    renderer.createGroupController = function (lay, grp) {
        var layer = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(lay);
        var group = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getGroup(grp);

        if (!layer || !group) {
            return;
        }

        if (controller_map[layer.name]) {
            return;
        }

        controller_map[layer.name] = group;

        expanded_map[layer.name] = false;

        var self = this;

        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(layer, 'removed', function (ev, rend) {
            self.setGroupVisibility(group);
        });

        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(layer, 'visibilityChange', function (rend, visible) {
            if (group.size() > 0) {
                if (!expanded_map.hasOwnProperty(layer.name)) {
                    expanded_map[layer.name] = false;
                }
                self.setGroupVisibility(group, expanded_map[layer.name] && visible, true);
                renderer.refresh();
            }
        });
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(group, 'visibilityChange', function (rend, visible) {
            if (visible) {
                self.showLayer(layer, true);
                expanded_map[layer.name] = true;
            }
        });
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].remove(layer, '_expandevent');
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(layer, '_expandevent', function (ev) {
            expanded_map[layer.name] = !expanded_map[layer.name];
            self.withoutRefresh(function () {
                self.setGroupVisibility(group, expanded_map[layer.name]);
            });
            self.refresh(true);
        });
    };

    return DragAndDrop(function (track, before, after) {
        var t_order = renderer.trackOrder;

        t_order.trackIndex = function (tr) {
            if (!tr) {
                return this.length;
            }
            return this.indexOf(tr.name);
        };

        if (after && !before) {
            before = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(t_order[t_order.trackIndex(after) + 1]);
        }

        t_order.splice(t_order.trackIndex(track), 1);
        var extra_to_push = [];
        if (controller_map[track.name]) {
            let layer_func = function layer_func(lay) {
                if (__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getGroup(lay) === lay) {
                    __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getGroup(lay).eachLayer(layer_func);
                }
                if (t_order.trackIndex(lay) >= 0) {
                    extra_to_push = [t_order.splice(t_order.trackIndex(lay), 1)[0]].concat(extra_to_push);
                }
            };
            __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getGroup(controller_map[track.name]).eachLayer(layer_func);
        }
        if (before) {
            t_order.splice(t_order.trackIndex(before), 1, track.name, before ? before.name : undefined);
            for (var i = 0; i < extra_to_push.length; i++) {
                if (extra_to_push[i]) {
                    t_order.splice(t_order.trackIndex(before), 0, extra_to_push[i]);
                }
            }
        } else {
            renderer.hideLayer(track);
            __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(track).disabled = true;

            extra_to_push.forEach(function (lay) {

                renderer.hideLayer(lay);
                __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(lay).disabled = true;
            });
            t_order.push(track.name);
            t_order = t_order.concat(extra_to_push);
        }

        renderer.trackOrder = t_order;
    });
};

var DragAndDrop = function DragAndDrop(spliceFunction) {
    var targets = [];
    var in_drag = false,
        drag_el;

    var splice_before, splice_after, trackToSplice;

    var last_target;

    var timeouts = {};

    var nav_reset_set = null;

    let spliceBefore;
    let spliceAfter;

    var drag_func = function drag_func(handle, element, track, canvas) {
        var nav = this;

        var old_reset = nav.reset;
        if (nav_reset_set === null) {
            nav.reset = function () {
                targets = [];
                old_reset.call(this);
            };
            nav_reset_set = true;
        }
        var resetDrag = function resetDrag() {
            window.clearTimeout(timeouts.anim);
            window.clearTimeout(timeouts.hover);
            for (var i = 0; i < targets.length; i++) {
                if (targets[i] != drag_el) {
                    targets[i].removeAttribute('dragging');
                    targets[i].removeAttribute('transform');
                    targets[i].setAttribute('pointer-events', 'all');
                }
            }
        };

        targets.push(element);
        element.track = track;

        var single_touch_event = function single_touch_event(fn) {
            return function (e) {
                if (e.touches && e.touches.length == 1) {
                    fn.call(this, e);
                }
            };
        };

        var beginDragging = function beginDragging(ev, tr, lbl_grp) {

            if (drag_disabled()) {
                return;
            }

            var target = canvas.nearestViewportElement;

            if (in_drag) {
                return;
            }
            lbl_grp.setAttribute('dragging', 'true');

            spliceBefore = null;
            spliceAfter = null;

            var p_orig = lbl_grp.nearestViewportElement.createSVGPoint();

            p_orig.x = ev.clientX || window.pageXOffset + ev.touches[0].clientX;
            p_orig.y = ev.clientY || window.pageYOffset + ev.touches[0].clientY;

            var rootCTM = lbl_grp.nearestViewportElement.getScreenCTM();
            var matrix = rootCTM.inverse();

            p_orig = p_orig.matrixTransform(matrix);

            var oX = p_orig.x;
            var oY = p_orig.y;

            var dragfn = function dragfn(e) {
                var p = lbl_grp.nearestViewportElement.createSVGPoint();
                p.x = e.clientX || window.pageXOffset + e.touches[0].clientX;
                p.y = e.clientY || window.pageYOffset + e.touches[0].clientY;
                p = p.matrixTransform(matrix);

                var dX = p.x - oX;
                var dY = p.y - oY;
                var curr_transform = lbl_grp.getAttribute('transform') || '';
                curr_transform = curr_transform.replace(/\s?translate\([^\)]+\)/, '');
                curr_transform += ' translate(' + dX + ',' + dY + ') ';
                curr_transform = curr_transform.replace(/\s*$/, '');
                lbl_grp.setAttribute('transform', curr_transform);
                targets.forEach(function (targ) {
                    var bb = targ.getBBox();
                    if (bb.y < p.y && bb.y > p.y - bb.height && bb.x < p.x && bb.x > p.x - bb.width) {
                        el_move.call(targ, e, targ.track);
                    }
                });
                e.stopPropagation();
                e.preventDefault();
                return false;
            };
            if (touch_enabled) {
                dragfn = single_touch_event(dragfn);
            }

            var enddrag = function enddrag(e) {
                if (e.relatedTarget && (e.relatedTarget == lbl_grp || e.relatedTarget.nearestViewportElement == lbl_grp.nearestViewportElement || e.relatedTarget.nearestViewportElement == target)) {
                    if (in_drag && targets.indexOf(e.relatedTarget) >= 0) {
                        resetDrag();
                    }
                    return;
                }

                if (in_drag && (e.type == 'mouseup' || e.type == 'touchend')) {
                    if (spliceBefore || spliceAfter) {
                        spliceFunction(trackToSplice, spliceBefore, spliceAfter);
                    }
                }
                target.removeEventListener('touchmove', dragfn, false);
                target.removeEventListener('mousemove', dragfn, false);
                target.removeEventListener('touchend', enddrag, false);
                target.removeEventListener('mouseup', enddrag, false);
                target.removeEventListener('mouseout', enddrag, false);
                if (in_drag) {
                    lbl_grp.setAttributeNS(null, 'pointer-events', 'all');
                    lbl_grp.removeAttribute('transform');
                    resetDrag();
                    in_drag = false;
                    last_target = null;
                }
            };
            lbl_grp.setAttributeNS(null, 'pointer-events', 'none');
            lbl_grp.addEventListener('touchmove', dragfn, false);
            lbl_grp.addEventListener('touchend', enddrag, false);
            target.addEventListener('mousemove', dragfn, false);
            target.addEventListener('mouseup', enddrag, false);
            target.addEventListener('mouseout', enddrag, false);

            in_drag = track;
            drag_el = lbl_grp;
        };

        var handle_start = function handle_start(e) {
            beginDragging(e, track, element);
        };

        var el_move = function el_move(e, trk) {
            var trck = trk ? trk : track;
            var elem = this ? this : element;

            if (in_drag && in_drag != trck && trck != last_target) {
                last_target = trck;
                if (timeouts.hover) {
                    window.clearTimeout(timeouts.hover);
                }
                timeouts.hover = window.setTimeout(function () {
                    if ((in_drag.group || trck.group) && (in_drag.group ? trck.group : !trck.group)) {
                        if (in_drag.group.name != trck.group.name) {
                            return;
                        }
                    } else {
                        if (in_drag.group || trck.group) {
                            return;
                        }
                    }

                    if (timeouts.anim) {
                        window.clearInterval(timeouts.anim);
                        timeouts.anim = null;
                    }

                    resetDrag();

                    var current_sibling = elem;

                    var elements_to_shift = [];

                    while (current_sibling !== null) {
                        if (current_sibling != drag_el && targets.indexOf(current_sibling) >= 0) {
                            elements_to_shift.push(current_sibling);
                        }
                        current_sibling = current_sibling.nextSibling;
                        if (current_sibling == drag_el) {
                            break;
                        }
                    }

                    current_sibling = elem.previousSibling;

                    var elements_to_shift_up = [];

                    while (current_sibling !== null) {
                        if (current_sibling != drag_el && targets.indexOf(current_sibling) >= 0) {
                            elements_to_shift_up.push(current_sibling);
                        }
                        current_sibling = current_sibling.previousSibling;
                        if (current_sibling == drag_el) {
                            break;
                        }
                    }
                    var anim_steps = 1;
                    var height = drag_el.getBBox().height / 4;
                    timeouts.anim = window.setInterval(function () {
                        var curr_transform,
                            i = 0;

                        if (anim_steps < 5) {
                            for (i = 0; i < elements_to_shift.length; i++) {
                                curr_transform = elements_to_shift[i].getAttribute('transform') || '';
                                curr_transform = curr_transform.replace(/\s?translate\([^\)]+\)/, '');
                                curr_transform += ' translate(0,' + anim_steps * height + ')';
                                elements_to_shift[i].setAttribute('transform', curr_transform);
                            }

                            for (i = 0; elements_to_shift.length > 0 && i < elements_to_shift_up.length; i++) {

                                curr_transform = elements_to_shift_up[i].getAttribute('transform') || '';
                                curr_transform = curr_transform.replace(/\s?translate\([^\)]+\)/, '');
                                curr_transform += ' translate(0,' + anim_steps * -1 * height + ')';
                                elements_to_shift_up[i].setAttribute('transform', curr_transform);
                            }

                            anim_steps += 1;
                        } else {
                            spliceBefore = trck;
                            trackToSplice = in_drag;
                            window.clearInterval(timeouts.anim);
                            timeouts.anim = null;
                        }
                    }, 30);
                }, 300);
            }
        };

        handle.addEventListener('mousedown', handle_start, false);
        handle.addEventListener('touchstart', single_touch_event(handle_start), false);
    };

    var drag_disabled = function drag_disabled() {
        return drag_func.disabled;
    };

    drag_func.spliceFunction = spliceFunction;

    return drag_func;
};

var setElementTransform = function setElementTransform(el, transform) {
    var ua = window.navigator.userAgent;
    if (ua.indexOf('Edge/') >= 0) {
        transform = transform.replace(/px/g, '');
        el.setAttribute('transform', transform);
    } else {
        el.style.transform = transform;
    }
};

var buildNavPane = function buildNavPane(back_canvas) {
    var self = this;
    self.zoom = 1;
    self.nav_width_base = 200;
    var nav_width = self.nav_width_base;
    self.nav_width = self.nav_width_base;
    var panel_back = back_canvas.group();
    var button_group = back_canvas.group();

    var rect = back_canvas.rect(-10, 0, nav_width.toString(), '100%');
    var base_rounded_corner = [12 * touch_scale, 10 * touch_scale];
    rect.setAttribute('rx', base_rounded_corner[0].toString());
    rect.setAttribute('ry', base_rounded_corner[1].toString());
    if (!touch_enabled) {
        rect.setAttribute('opacity', '0.8');
    }
    rect.style.stroke = '#000000';
    rect.style.strokeWidth = '2px';
    rect.style.fill = '#000000';
    rect.id = 'nav_back';

    panel_back.push(rect);

    self.clipping_id = 'nav_clipping' + new Date().getTime();
    var clipping = document.createElementNS(svgns, 'clipPath');
    clipping.id = self.clipping_id;
    var rect2 = rect.cloneNode();
    rect2.removeAttribute('id');
    rect2.removeAttribute('opacity');
    rect2.setAttribute('x', '0');
    rect2.setAttribute('width', "" + (parseInt(rect2.getAttribute('width')) - 10));
    rect2.removeAttribute('style');
    rect2.setAttribute('height', '10000');

    back_canvas.insertBefore(clipping, back_canvas.firstChild);
    clipping.appendChild(rect2);

    var close_group = back_canvas.crossed_circle(nav_width - (10 + touch_scale * 11), 12 * touch_scale, 10 * touch_scale);

    close_group.style.cursor = 'pointer';
    if (typeof matchMedia !== 'undefined') {
        (this.win() || window).matchMedia('print').addListener(function (match) {
            if (match.matches) {
                close_group.setAttribute('display', 'none');
                tracks_button.setAttribute('display', 'none');
            } else {
                close_group.setAttribute('display', 'block');
                tracks_button.setAttribute('display', 'none');
            }
        });
    }

    button_group.push(close_group);

    var tracks_button = __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].IE ? back_canvas.svgbutton(10, 5, 65, 25, 'Edit') : back_canvas.button(10, 5, 65, 25, 'Edit');
    tracks_button.id = 'controls';
    tracks_button.parentNode.setAttribute('clip-path', 'url(#' + self.clipping_id + ')');

    panel_back.push(__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].IE ? tracks_button : tracks_button.parentNode);

    tracks_button.addEventListener('click', function () {
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(self, 'toggleEdit');
        __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(self, 'click');
    }, false);

    panel_back.setAttribute('style', 'transition: all 0.25s;');

    var old_tracks_style = tracks_button.getAttribute('style');
    var transform_origin = "" + (nav_width - (10 + touch_scale * 11)) + "px " + 12 * touch_scale + "px";
    var translate = function translate(amount, rotate) {
        var trans = " translate3d(" + amount + "px,0px,0px)";
        if (rotate) {
            trans = trans + " rotate(" + rotate + ")";
        }
        return "-webkit-transform:" + trans + "; -moz-transform:" + trans + "; -ms-transform:" + trans.replace('3d', '').replace(',0px)', ')') + "; transform: " + trans + ";";
    };

    tracks_button.setAttribute('style', old_tracks_style + " transition: all 0.25s;");
    close_group.style.transition = 'all 0.25s';
    close_group.style.transformOrigin = transform_origin;
    var visible = true;

    var toggler = function toggler(vis, interactive) {
        visible = vis === false || vis === true ? vis : !visible;
        var close_transform;
        var needs_transition = interactive ? "all ease-in-out 0.4s" : "";
        let parent_transform = back_canvas.parentNode.style.transform;
        let scaleval;
        let yscale = touch_scale;
        if (scaleval = parent_transform.match(/scale\(([\d\.]+)\)/)) {
            yscale = 1;
        }
        var transform_origin = "" + (self.nav_width_base - (10 + touch_scale * 11)) + "px " + 12 * yscale + "px";

        if (visible) {
            self.promote();
            setElementTransform(panel_back, 'translate(0,0)');
            panel_back.style.transition = needs_transition;

            close_group._button.removeAttribute('filter');
            if ("ontouchend" in window || window.getComputedStyle(close_group).getPropertyValue("-ms-transform")) {
                setElementTransform(close_group, '');
            }
            setElementTransform(close_group, 'translate(0,0)');
            close_group.style.transition = needs_transition;
            close_group.style.transformOrigin = close_group.getBoundingClientRect().left + 'px ' + close_group.getBoundingClientRect().top + ' px';
            self.refresh();
        } else {
            self.demote();
            // Chrome bug Jan 2015 with the drop shadow
            //close_group._button.setAttribute('filter','url(#drop_shadow)');
            close_group.style.transition = needs_transition;
            close_group.style.transition = needs_transition;
            // close_group.style.transformOrigin = transform_origin;
            close_group.style.transformOrigin = close_group.getBoundingClientRect().left + 'px ' + close_group.getBoundingClientRect().top + ' px';

            setElementTransform(close_group, 'translate(' + -0.75 * self.nav_width_base + 'px,0) rotate(405deg)');
            if ("ontouchend" in window) {
                // No longer special casing IE
                setElementTransform(close_group, 'translate(' + -0.75 * self.nav_width_base + 'px,0) rotate(45,' + (self.nav_width_base - (10 + touch_scale * 11)) + 'px,' + 12 * touch_scale + 'px)');
                setElementTransform(panel_back, 'translate(' + -1 * self.nav_width * self.zoom + 'px,0)');
                panel_back.style.transition = needs_transition;
            } else {
                setElementTransform(panel_back, 'translate(' + -1 * self.nav_width * self.zoom + 'px,0)');
                panel_back.style.transition = needs_transition;
            }
        }
        return true;
    };

    self.move_closer = function () {
        if (visible) {
            return;
        }
        setElementTransform(close_group, 'translate(' + -0.75 * self.nav_width_base + 'px,0) rotate(405deg)');
        if ("ontouchend" in window) {
            // No longer special casing IE
            setElementTransform(close_group, 'translate(' + -0.75 * self.nav_width_base + 'px,0) rotate(45,' + (self.nav_width_base - (10 + touch_scale * 11)) + 'px,' + 12 * touch_scale + 'px)');
        }
    };

    self.hide = function (interactive) {
        toggler.call(this, false, interactive);
    };
    self.show = function (interactive) {
        toggler.call(this, true, interactive);
    };

    self.visible = function () {
        return visible;
    };

    self.setZoom = function (zoom) {
        self.nav_width = self.nav_width_base / zoom;
        close_group.setAttribute('transform', 'scale(' + zoom + ',' + zoom + ') ');
        let parent_transform = back_canvas.parentNode.style.transform;
        let scaleval;
        let yscale = touch_scale;
        if (scaleval = parent_transform.match(/scale\(([\d\.]+)\)/)) {
            yscale = 1;
        }
        var transform_origin = "" + (self.nav_width_base - (10 + touch_scale * 11)).toFixed(2) + "px " + 12 * yscale + "px";

        close_group.style.transformOrigin = transform_origin;

        close_group.move(self.nav_width_base - (10 + touch_scale * 11), 12 * touch_scale);
        rect.setAttribute('transform', 'scale(' + zoom + ',1) ');
        rect.setAttribute('ry', base_rounded_corner[1].toString());
        rect.setAttribute('rx', (base_rounded_corner[0] / zoom).toString());
        rect.setAttribute('x', parseInt(-10 / zoom).toString());
        rect.setAttribute('width', self.nav_width.toString());
        self.zoom = zoom;
        toggler.call(this, visible);
        self.refresh();
    };

    close_group.addEventListener('click', function () {
        if (visible) {
            self.hide(true);
        } else {
            self.show(true);
        }
    }, false);
};

var buildTrackPane = function buildTrackPane(track_canvas, draganddrop) {
    var self = this;

    var close_buttons, controller_buttons, edit_enabled;

    var nav_width_track_canvas_ctm = 0;

    Object(__WEBPACK_IMPORTED_MODULE_0__SVGCanvas__["a" /* default */])(track_canvas);
    track_canvas.setAttribute('preserveAspectRatio', 'xMinYMin meet');

    var track_rects = [];

    self.reset = function () {
        while (track_canvas.firstChild) {
            track_canvas.removeChild(track_canvas.firstChild);
        }
        track_rects = [];
        ctm_refresh = [];
        //            self.refresh();
    };

    var ctm_refresh = [];

    self.isEditing = function () {
        return edit_enabled;
    };

    self.refresh = function () {
        (close_buttons || []).forEach(function (button) {
            button.setAttribute('visibility', edit_enabled ? 'visible' : 'hidden');
        });
        (controller_buttons || []).forEach(function (button) {
            button.setAttribute('visibility', edit_enabled ? 'hidden' : 'visible');
        });
        if (edit_enabled) {
            toggleMouseEvents.call(this, true);
        } else {
            toggleMouseEvents.call(this, false);
        }

        if (track_canvas.getAttribute('display') == 'none' || track_canvas.style.display == 'none') {
            return;
        }
        if (ctm_refresh.length < 1) {
            return;
        }
        var nav_back = track_canvas.ownerSVGElement.getElementById('nav_back');

        var ctm = nav_back.getScreenCTM().inverse().multiply(track_canvas.getScreenCTM()).inverse();
        var back_width = nav_back.getBBox().width + nav_back.getBBox().x;
        var point = track_canvas.createSVGPoint();
        point.x = back_width;
        point.y = 0;
        nav_width_track_canvas_ctm = point.matrixTransform(ctm).x;
        ctm_refresh.forEach(function (el) {
            var width = 0;
            try {
                width = el.getBBox().width;
            } catch (err) {
                // This is a bug with Firefox on some elements getting
                // the bounding box. We silently fail here, as I can't
                // figure out why the call to getBBox fails.
            }
            if (width > 0) {
                var a_y = /translate\((-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)\)/.exec(el.getAttribute('transform') || '');
                if (typeof a_y != 'undefined') {
                    a_y = a_y[2];
                } else {
                    return;
                }

                var new_x = nav_width_track_canvas_ctm - 1.5 * parseInt(el.getAttribute('width'), 10);
                el.setAttribute('transform', 'translate(' + new_x + ',' + a_y + ')');
            }
        });
    };

    var toggleMouseEvents = function toggleMouseEvents(on) {
        if (track_rects) {
            (track_rects || []).forEach(function (el) {
                el.setAttribute('opacity', on ? '1' : touch_enabled ? "0.5" : "0.1");
                el.setAttribute('pointer-events', on ? 'all' : 'none');
                on ? el.parentNode.setAttribute('dragenabled', 'true') : el.parentNode.removeAttribute('dragenabled');
            });
        }
    };

    __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].add(self, 'toggleEdit', function () {
        edit_enabled = typeof edit_enabled == 'undefined' ? true : !edit_enabled;
        draganddrop.disabled = !edit_enabled;
        toggleMouseEvents.call(self, edit_enabled);

        self.hide();
        self.show();

        (close_buttons || []).forEach(function (button) {
            button.setAttribute('visibility', edit_enabled ? 'visible' : 'hidden');
        });
        (controller_buttons || []).forEach(function (button) {
            button.setAttribute('visibility', edit_enabled ? 'hidden' : 'visible');
        });
    });

    this.setViewBox = function (viewBox) {
        track_canvas.setAttribute('viewBox', viewBox);
    };

    track_canvas.style.height = '100%';
    track_canvas.style.width = '100%';
    track_canvas.setAttribute('height', '100%');
    track_canvas.setAttribute('width', '100%');

    this.renderTrack = function (track, y, height, options) {
        var label_group = track_canvas.group();
        var a_rect = track_canvas.rect(0, y, '100%', height);
        a_rect.setAttribute('stroke', '#000000');
        a_rect.setAttribute('stroke-width', '2');
        a_rect.setAttribute('fill', 'url(#simple_gradient)');
        a_rect.setAttribute('opacity', touch_enabled ? '0.5' : '0.1');
        a_rect.setAttribute('pointer-events', 'none');
        track_rects = track_rects || [];

        track_rects.push(a_rect);

        label_group.push(a_rect);

        // Use these for debugging positioning

        // var r = track_canvas.rect(0,y-height,height,height);
        // r.setAttribute('fill','#ff0000');
        // label_group.push(r);
        // 
        // r = track_canvas.rect(0,y+height,height,height);
        // r.setAttribute('fill','#ff0000');
        // label_group.push(r);


        var text_scale = options && options['font-scale'] ? options['font-scale'] : 1;
        var text_left = 4 / 3 * touch_scale * height * text_scale;
        var a_text = track_canvas.text(text_left, y + 0.5 * height, track.fullname || track.name);
        a_text.setAttribute('height', height);
        a_text.setAttribute('width', height);
        a_text.setAttribute('font-size', 0.6 * height * text_scale);
        a_text.setAttribute('fill', '#ffffff');
        a_text.setAttribute('stroke', '#ffffff');
        a_text.setAttribute('stroke-width', '0');
        a_text.firstChild.setAttribute('dy', '0.5ex');

        // r = track_canvas.rect(3*height*text_scale,y+0.5*height,2*height,2*height);
        // r.setAttribute('fill','#00ff00');
        // label_group.push(r);

        label_group.push(a_text);

        a_text.setAttribute('pointer-events', 'none');

        var circ;

        if (track.href) {
            a_anchor = track_canvas.a(track.href);
            var icon_name = null;
            var icon_metrics = [0.5 * height * text_scale, 0, height * text_scale * touch_scale];
            icon_metrics[1] = -0.5 * (icon_metrics[2] - height);

            circ = track_canvas.circle(icon_metrics[0] + 0.5 * icon_metrics[2], 0.5 * height, 0.5 * icon_metrics[2]);
            circ.setAttribute('fill', '#ffffff');
            circ.setAttribute('opacity', '0.1');
            a_anchor.appendChild(circ);

            var url_type = track.href;
            if (typeof url_type === 'string' && url_type.match(/^javascript\:/)) {
                icon_name = '#plus_icon';
            } else if (typeof url_type === 'function') {
                icon_name = '#plus_icon';
                a_anchor.setAttribute('href', '#');
                a_anchor.removeAttribute('target');
                a_anchor.addEventListener('click', function (e) {
                    url_type.call();

                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnResult = false;
                    }
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    } else {
                        e.cancelBubble = true;
                    }

                    return false;
                }, false);
            } else {
                icon_name = '#new_link_icon';
            }
            if (track.icon) {
                icon_name = track.icon;
            }
            var a_use = track_canvas.use(icon_name, icon_metrics[0], icon_metrics[1], icon_metrics[2], icon_metrics[2]);
            a_use.style.cursor = 'pointer';
            a_anchor.appendChild(a_use);
            a_anchor.setAttribute('transform', 'translate(' + (nav_width_track_canvas_ctm - 1.5 * icon_metrics[2]) + ',' + y + ')');
            a_anchor.setAttribute('width', icon_metrics[2].toString());
            ctm_refresh.push(a_anchor);
        }

        label_group.addEventListener('touchstart', function () {
            label_group.onmouseover = undefined;
            label_group.onmouseout = undefined;
        }, false);

        label_group.addEventListener('touchend', function () {
            label_group.onmouseover = undefined;
            label_group.onmouseout = undefined;
        }, false);

        draganddrop.call(this, a_rect, label_group, track, track_canvas);

        (function () {

            if (track.group) {
                return;
            }

            var t_height = 0.5 * height * touch_scale;

            if (!close_buttons) {
                close_buttons = [];
            }

            var closer = track_canvas.crossed_circle(1.5 * t_height, 0, t_height);
            closer.setAttribute('transform', 'translate(0,' + (y + 0.5 * height) + ') scale(' + text_scale + ')');
            closer.firstChild.setAttribute('fill', 'url(#red_3d)');
            for (var nodes = closer.childNodes, i = 0, len = nodes.length; i < len; i++) {
                nodes[i].setAttribute('stroke-width', (t_height / 4).toString());
            }
            closer.addEventListener('click', function () {
                draganddrop.spliceFunction(track);
            }, false);
            label_group.push(closer);
            close_buttons.push(closer);
            closer.setAttribute('visibility', 'hidden');
        })();
        if (this.isController(track)) {
            if (!controller_buttons) {
                controller_buttons = [];
            }

            var t_height = 0.5 * height * touch_scale;
            var expander = track_canvas.group();
            circ = track_canvas.circle(1.5 * t_height, 0, t_height);
            circ.setAttribute('fill', '#ffffff');
            circ.setAttribute('opacity', '0.1');
            expander.push(circ);

            var t_metrics = [1.1 * t_height, -1.25 * t_height, 2.25 * t_height, -0.5 * t_height, 1.1 * t_height, 0.25 * t_height];

            t_metrics[1] += 0.5 * (t_height - 0 * height);
            t_metrics[3] += 0.5 * (t_height - 0 * height);
            t_metrics[5] += 0.5 * (t_height - 0 * height);

            var group_toggler = track_canvas.poly('' + t_metrics[0] + ',' + t_metrics[1] + ' ' + t_metrics[2] + ',' + t_metrics[3] + ' ' + t_metrics[4] + ',' + t_metrics[5]);
            if (this.isControllerExpanded(track)) {
                expander.setAttribute('transform', 'translate(0,' + (y + 0.5 * height) + ') scale(' + text_scale + ') rotate(90,' + 1.5 * t_height + ',' + t_metrics[3] + ')');
            } else {
                expander.setAttribute('transform', 'translate(0,' + (y + 0.5 * height) + ') scale(' + text_scale + ')');
            }
            group_toggler.setAttribute('height', 1.75 * t_height);
            group_toggler.setAttribute('font-size', 1.5 * t_height);
            group_toggler.setAttribute('fill', '#ffffff');
            group_toggler.setAttribute('pointer-events', 'none');

            expander.push(group_toggler);

            expander.style.cursor = 'pointer';
            expander.addEventListener('click', function (e) {
                e.stopPropagation();
                __WEBPACK_IMPORTED_MODULE_1__bean__["a" /* default */].fire(track, '_expandevent');
                if (self.isControllerExpanded(track)) {
                    expander.setAttribute('transform', 'translate(0,' + (y + 0.5 * height) + ') scale(' + text_scale + ') rotate(90,' + 1.5 * t_height + ',' + t_metrics[3] + ')');
                } else {
                    expander.setAttribute('transform', 'translate(0,' + (y + 0.5 * height) + ') scale(' + text_scale + ')');
                }
            }, false);
            label_group.push(expander);

            controller_buttons.push(expander);
            expander.setAttribute('visibility', 'hidden');
        }
    };
};

/* harmony default export */ __webpack_exports__["a"] = (Navigation);

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {/*! Hammer.JS - v1.0.7dev - 2014-01-15
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

const Hammer = function (window, undefined) {
  'use strict';

  /**
   * Hammer
   * use this to create instances
   * @param   {HTMLElement}   element
   * @param   {Object}        options
   * @returns {Hammer.Instance}
   * @constructor
   */

  var Hammer = function Hammer(element, options) {
    return new Hammer.Instance(element, options || {});
  };

  // default settings
  Hammer.defaults = {
    // add styles and attributes to the element to prevent the browser from doing
    // its native behavior. this doesnt prevent the scrolling, but cancels
    // the contextmenu, tap highlighting etc
    // set to false to disable this
    stop_browser_behavior: {
      // this also triggers onselectstart=false for IE
      userSelect: 'none',
      // this makes the element blocking in IE10 >, you could experiment with the value
      // see for more options this issue; https://github.com/EightMedia/hammer.js/issues/241
      touchAction: 'none',
      touchCallout: 'none',
      contentZooming: 'none',
      userDrag: 'none',
      tapHighlightColor: 'rgba(0,0,0,0)'

      //
      // more settings are defined per gesture at gestures.js
      //
    } };

  // detect touchevents
  Hammer.HAS_POINTEREVENTS = window.navigator.pointerEnabled || window.navigator.msPointerEnabled;
  Hammer.HAS_TOUCHEVENTS = 'ontouchstart' in window;

  // dont use mouseevents on mobile devices
  Hammer.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android|silk/i;
  Hammer.NO_MOUSEEVENTS = Hammer.HAS_TOUCHEVENTS && window.navigator.userAgent.match(Hammer.MOBILE_REGEX);

  // eventtypes per touchevent (start, move, end)
  // are filled by Hammer.event.determineEventTypes on setup
  Hammer.EVENT_TYPES = {};

  // direction defines
  Hammer.DIRECTION_DOWN = 'down';
  Hammer.DIRECTION_LEFT = 'left';
  Hammer.DIRECTION_UP = 'up';
  Hammer.DIRECTION_RIGHT = 'right';

  // pointer type
  Hammer.POINTER_MOUSE = 'mouse';
  Hammer.POINTER_TOUCH = 'touch';
  Hammer.POINTER_PEN = 'pen';

  // touch event defines
  Hammer.EVENT_START = 'start';
  Hammer.EVENT_MOVE = 'move';
  Hammer.EVENT_END = 'end';

  // hammer document where the base events are added at
  Hammer.DOCUMENT = window.document;

  // plugins and gestures namespaces
  Hammer.plugins = Hammer.plugins || {};
  Hammer.gestures = Hammer.gestures || {};

  // if the window events are set...
  Hammer.READY = false;

  /**
   * setup events to detect gestures on the document
   */
  function setup() {
    if (Hammer.READY) {
      return;
    }

    // find what eventtypes we add listeners to
    Hammer.event.determineEventTypes();

    // Register all gestures inside Hammer.gestures
    Hammer.utils.each(Hammer.gestures, function (gesture) {
      Hammer.detection.register(gesture);
    });

    // Add touch events on the document
    Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);
    Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);

    // Hammer is ready...!
    Hammer.READY = true;
  }

  Hammer.utils = {
    /**
     * extend method,
     * also used for cloning when dest is an empty object
     * @param   {Object}    dest
     * @param   {Object}    src
     * @parm  {Boolean}  merge    do a merge
     * @returns {Object}    dest
     */
    extend: function extend(dest, src, merge) {
      for (var key in src) {
        if (dest[key] !== undefined && merge) {
          continue;
        }
        dest[key] = src[key];
      }
      return dest;
    },

    /**
     * for each
     * @param obj
     * @param iterator
     */
    each: function each(obj, iterator, context) {
      var i, length;
      // native forEach on arrays
      if ('forEach' in obj) {
        obj.forEach(iterator, context);
      }
      // arrays
      else if (obj.length !== undefined) {
          for (i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === false) {
              return;
            }
          }
        }
        // objects
        else {
            for (i in obj) {
              if (obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj) === false) {
                return;
              }
            }
          }
    },

    /**
     * find if a node is in the given parent
     * used for event delegation tricks
     * @param   {HTMLElement}   node
     * @param   {HTMLElement}   parent
     * @returns {boolean}       has_parent
     */
    hasParent: function hasParent(node, parent) {
      while (node) {
        if (node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    },

    /**
     * get the center of all the touches
     * @param   {Array}     touches
     * @returns {Object}    center
     */
    getCenter: function getCenter(touches) {
      var valuesX = [],
          valuesY = [];

      Hammer.utils.each(touches, function (touch) {
        // I prefer clientX because it ignore the scrolling position
        valuesX.push(typeof touch.clientX !== 'undefined' ? touch.clientX : touch.pageX);
        valuesY.push(typeof touch.clientY !== 'undefined' ? touch.clientY : touch.pageY);
      });

      return {
        pageX: (Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2,
        pageY: (Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2
      };
    },

    /**
     * calculate the velocity between two points
     * @param   {Number}    delta_time
     * @param   {Number}    delta_x
     * @param   {Number}    delta_y
     * @returns {Object}    velocity
     */
    getVelocity: function getVelocity(delta_time, delta_x, delta_y) {
      return {
        x: Math.abs(delta_x / delta_time) || 0,
        y: Math.abs(delta_y / delta_time) || 0
      };
    },

    /**
     * calculate the angle between two coordinates
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {Number}    angle
     */
    getAngle: function getAngle(touch1, touch2) {
      var y = touch2.pageY - touch1.pageY,
          x = touch2.pageX - touch1.pageX;
      return Math.atan2(y, x) * 180 / Math.PI;
    },

    /**
     * angle to direction define
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {String}    direction constant, like Hammer.DIRECTION_LEFT
     */
    getDirection: function getDirection(touch1, touch2) {
      var x = Math.abs(touch1.pageX - touch2.pageX),
          y = Math.abs(touch1.pageY - touch2.pageY);

      if (x >= y) {
        return touch1.pageX - touch2.pageX > 0 ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;
      } else {
        return touch1.pageY - touch2.pageY > 0 ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;
      }
    },

    /**
     * calculate the distance between two touches
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {Number}    distance
     */
    getDistance: function getDistance(touch1, touch2) {
      var x = touch2.pageX - touch1.pageX,
          y = touch2.pageY - touch1.pageY;
      return Math.sqrt(x * x + y * y);
    },

    /**
     * calculate the scale factor between two touchLists (fingers)
     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
     * @param   {Array}     start
     * @param   {Array}     end
     * @returns {Number}    scale
     */
    getScale: function getScale(start, end) {
      // need two fingers...
      if (start.length >= 2 && end.length >= 2) {
        return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
      }
      return 1;
    },

    /**
     * calculate the rotation degrees between two touchLists (fingers)
     * @param   {Array}     start
     * @param   {Array}     end
     * @returns {Number}    rotation
     */
    getRotation: function getRotation(start, end) {
      // need two fingers
      if (start.length >= 2 && end.length >= 2) {
        return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
      }
      return 0;
    },

    /**
     * boolean if the direction is vertical
     * @param    {String}    direction
     * @returns  {Boolean}   is_vertical
     */
    isVertical: function isVertical(direction) {
      return direction == Hammer.DIRECTION_UP || direction == Hammer.DIRECTION_DOWN;
    },

    /**
     * stop browser default behavior with css props
     * @param   {HtmlElement}   element
     * @param   {Object}        css_props
     */
    stopDefaultBrowserBehavior: function stopDefaultBrowserBehavior(element, css_props) {
      if (!css_props || !element || !element.style) {
        return;
      }

      // with css properties for modern browsers
      Hammer.utils.each(['webkit', 'khtml', 'moz', 'Moz', 'ms', 'o', ''], function (vendor) {
        Hammer.utils.each(css_props, function (value, prop) {
          // vender prefix at the property
          if (vendor) {
            prop = vendor + prop.substring(0, 1).toUpperCase() + prop.substring(1);
          }
          // set the style
          if (prop in element.style) {
            element.style[prop] = value;
          }
        });
      });

      // also the disable onselectstart
      if (css_props.userSelect == 'none') {
        element.onselectstart = function () {
          return false;
        };
      }

      // and disable ondragstart
      if (css_props.userDrag == 'none') {
        element.ondragstart = function () {
          return false;
        };
      }
    }
  };

  /**
   * create new hammer instance
   * all methods should return the instance itself, so it is chainable.
   * @param   {HTMLElement}       element
   * @param   {Object}            [options={}]
   * @returns {Hammer.Instance}
   * @constructor
   */
  Hammer.Instance = function (element, options) {
    var self = this;

    // setup HammerJS window events and register all gestures
    // this also sets up the default options
    setup();

    this.element = element;

    // start/stop detection option
    this.enabled = true;

    // merge options
    this.options = Hammer.utils.extend(Hammer.utils.extend({}, Hammer.defaults), options || {});

    // add some css to the element to prevent the browser from doing its native behavoir
    if (this.options.stop_browser_behavior) {
      Hammer.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior);
    }

    // start detection on touchstart
    Hammer.event.onTouch(element, Hammer.EVENT_START, function (ev) {
      if (self.enabled) {
        Hammer.detection.startDetect(self, ev);
      }
    });

    // return instance
    return this;
  };

  Hammer.Instance.prototype = {
    /**
     * bind events to the instance
     * @param   {String}      gesture
     * @param   {Function}    handler
     * @returns {Hammer.Instance}
     */
    on: function onEvent(gesture, handler) {
      var gestures = gesture.split(' ');
      Hammer.utils.each(gestures, function (gesture) {
        this.element.addEventListener(gesture, handler, false);
      }, this);
      return this;
    },

    /**
     * unbind events to the instance
     * @param   {String}      gesture
     * @param   {Function}    handler
     * @returns {Hammer.Instance}
     */
    off: function offEvent(gesture, handler) {
      var gestures = gesture.split(' ');
      Hammer.utils.each(gestures, function (gesture) {
        this.element.removeEventListener(gesture, handler, false);
      }, this);
      return this;
    },

    /**
     * trigger gesture event
     * @param   {String}      gesture
     * @param   {Object}      [eventData]
     * @returns {Hammer.Instance}
     */
    trigger: function triggerEvent(gesture, eventData) {
      // optional
      if (!eventData) {
        eventData = {};
      }

      // create DOM event
      var event = Hammer.DOCUMENT.createEvent('Event');
      event.initEvent(gesture, true, true);
      event.gesture = eventData;

      // trigger on the target if it is in the instance element,
      // this is for event delegation tricks
      var element = this.element;
      if (Hammer.utils.hasParent(eventData.target, element)) {
        element = eventData.target;
      }

      element.dispatchEvent(event);
      return this;
    },

    /**
     * enable of disable hammer.js detection
     * @param   {Boolean}   state
     * @returns {Hammer.Instance}
     */
    enable: function enable(state) {
      this.enabled = state;
      return this;
    }
  };

  /**
   * this holds the last move event,
   * used to fix empty touchend issue
   * see the onTouch event for an explanation
   * @type {Object}
   */
  var last_move_event = null;

  /**
   * when the mouse is hold down, this is true
   * @type {Boolean}
   */
  var enable_detect = false;

  /**
   * when touch events have been fired, this is true
   * @type {Boolean}
   */
  var touch_triggered = false;

  Hammer.event = {
    /**
     * simple addEventListener
     * @param   {HTMLElement}   element
     * @param   {String}        type
     * @param   {Function}      handler
     */
    bindDom: function bindDom(element, type, handler) {
      var types = type.split(' ');
      Hammer.utils.each(types, function (type) {
        element.addEventListener(type, handler, false);
      });
    },

    /**
     * touch events with mouse fallback
     * @param   {HTMLElement}   element
     * @param   {String}        eventType        like Hammer.EVENT_MOVE
     * @param   {Function}      handler
     */
    onTouch: function onTouch(element, eventType, handler) {
      var self = this;

      this.bindDom(element, Hammer.EVENT_TYPES[eventType], function bindDomOnTouch(ev) {
        var sourceEventType = ev.type.toLowerCase();

        // onmouseup, but when touchend has been fired we do nothing.
        // this is for touchdevices which also fire a mouseup on touchend
        if (sourceEventType.match(/mouse/) && touch_triggered) {
          return;
        }

        // mousebutton must be down or a touch event
        else if (sourceEventType.match(/touch/) || // touch events are always on screen
          sourceEventType.match(/pointerdown/) || // pointerevents touch
          sourceEventType.match(/mouse/) && ev.which === 1 // mouse is pressed
          ) {
              enable_detect = true;
            }

            // mouse isn't pressed
          else if (sourceEventType.match(/mouse/) && !ev.which) {
              enable_detect = false;
            }

        // we are in a touch event, set the touch triggered bool to true,
        // this for the conflicts that may occur on ios and android
        if (sourceEventType.match(/touch|pointer/)) {
          touch_triggered = true;
        }

        // count the total touches on the screen
        var count_touches = 0;

        // when touch has been triggered in this detection session
        // and we are now handling a mouse event, we stop that to prevent conflicts
        if (enable_detect) {
          // update pointerevent
          if (Hammer.HAS_POINTEREVENTS && eventType != Hammer.EVENT_END) {
            count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
          }
          // touch
          else if (sourceEventType.match(/touch/)) {
              count_touches = ev.touches.length;
            }
            // mouse
            else if (!touch_triggered) {
                count_touches = sourceEventType.match(/up/) ? 0 : 1;
              }

          // if we are in a end event, but when we remove one touch and
          // we still have enough, set eventType to move
          if (count_touches > 0 && eventType == Hammer.EVENT_END) {
            eventType = Hammer.EVENT_MOVE;
          }
          // no touches, force the end event
          else if (!count_touches) {
              eventType = Hammer.EVENT_END;
            }

          // store the last move event
          if (count_touches || last_move_event === null) {
            last_move_event = ev;
          }

          // trigger the handler
          handler.call(Hammer.detection, self.collectEventData(element, eventType, self.getTouchList(last_move_event, eventType), ev));

          // remove pointerevent from list
          if (Hammer.HAS_POINTEREVENTS && eventType == Hammer.EVENT_END) {
            count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
          }
        }

        // on the end we reset everything
        if (!count_touches) {
          last_move_event = null;
          enable_detect = false;
          touch_triggered = false;
          Hammer.PointerEvent.reset();
        }
      }, { passive: true });
      // FIXME - PASSIVE
    },

    /**
     * we have different events for each device/browser
     * determine what we need and set them in the Hammer.EVENT_TYPES constant
     */
    determineEventTypes: function determineEventTypes() {
      // determine the eventtype we want to set
      var types;

      // pointerEvents magic
      if (Hammer.HAS_POINTEREVENTS) {
        types = Hammer.PointerEvent.getEvents();
      }
      // on Android, iOS, blackberry, windows mobile we dont want any mouseevents
      else if (Hammer.NO_MOUSEEVENTS) {
          types = ['touchstart', 'touchmove', 'touchend touchcancel'];
        }
        // for non pointer events browsers and mixed browsers,
        // like chrome on windows8 touch laptop
        else {
            types = ['touchstart mousedown', 'touchmove mousemove', 'touchend touchcancel mouseup'];
          }

      Hammer.EVENT_TYPES[Hammer.EVENT_START] = types[0];
      Hammer.EVENT_TYPES[Hammer.EVENT_MOVE] = types[1];
      Hammer.EVENT_TYPES[Hammer.EVENT_END] = types[2];
    },

    /**
     * create touchlist depending on the event
     * @param   {Object}    ev
     * @param   {String}    eventType   used by the fakemultitouch plugin
     */
    getTouchList: function getTouchList(ev /*, eventType*/) {
      // get the fake pointerEvent touchlist
      if (Hammer.HAS_POINTEREVENTS) {
        return Hammer.PointerEvent.getTouchList();
      }
      // get the touchlist
      else if (ev.touches) {
          return ev.touches;
        }
        // make fake touchlist from mouse position
        else {
            ev.identifier = 1;
            return [ev];
          }
    },

    /**
     * collect event data for Hammer js
     * @param   {HTMLElement}   element
     * @param   {String}        eventType        like Hammer.EVENT_MOVE
     * @param   {Object}        eventData
     */
    collectEventData: function collectEventData(element, eventType, touches, ev) {
      // find out pointerType
      var pointerType = Hammer.POINTER_TOUCH;
      if (ev.type.match(/mouse/) || Hammer.PointerEvent.matchType(Hammer.POINTER_MOUSE, ev)) {
        pointerType = Hammer.POINTER_MOUSE;
      }

      return {
        center: Hammer.utils.getCenter(touches),
        timeStamp: new Date().getTime(),
        target: ev.target,
        touches: touches,
        eventType: eventType,
        pointerType: pointerType,
        srcEvent: ev,

        /**
         * prevent the browser default actions
         * mostly used to disable scrolling of the browser
         */
        preventDefault: function preventDefault() {
          if (this.srcEvent.preventManipulation) {
            this.srcEvent.preventManipulation();
          }

          if (this.srcEvent.preventDefault) {
            this.srcEvent.preventDefault();
          }
        },

        /**
         * stop bubbling the event up to its parents
         */
        stopPropagation: function stopPropagation() {
          this.srcEvent.stopPropagation();
        },

        /**
         * immediately stop gesture detection
         * might be useful after a swipe was detected
         * @return {*}
         */
        stopDetect: function stopDetect() {
          return Hammer.detection.stopDetect();
        }
      };
    }
  };

  Hammer.PointerEvent = {
    /**
     * holds all pointers
     * @type {Object}
     */
    pointers: {},

    /**
     * get a list of pointers
     * @returns {Array}     touchlist
     */
    getTouchList: function getTouchList() {
      var self = this;
      var touchlist = [];

      // we can use forEach since pointerEvents only is in IE10
      Hammer.utils.each(self.pointers, function (pointer) {
        touchlist.push(pointer);
      });

      return touchlist;
    },

    /**
     * update the position of a pointer
     * @param   {String}   type             Hammer.EVENT_END
     * @param   {Object}   pointerEvent
     */
    updatePointer: function updatePointer(type, pointerEvent) {
      if (type == Hammer.EVENT_END) {
        this.pointers = {};
      } else {
        pointerEvent.identifier = pointerEvent.pointerId;
        this.pointers[pointerEvent.pointerId] = pointerEvent;
      }

      return Object.keys(this.pointers).length;
    },

    /**
     * check if ev matches pointertype
     * @param   {String}        pointerType     Hammer.POINTER_MOUSE
     * @param   {PointerEvent}  ev
     */
    matchType: function matchType(pointerType, ev) {
      if (!ev.pointerType) {
        return false;
      }

      var pt = ev.pointerType,
          types = {};
      types[Hammer.POINTER_MOUSE] = pt === ev.MSPOINTER_TYPE_MOUSE || pt === Hammer.POINTER_MOUSE;
      types[Hammer.POINTER_TOUCH] = pt === ev.MSPOINTER_TYPE_TOUCH || pt === Hammer.POINTER_TOUCH;
      types[Hammer.POINTER_PEN] = pt === ev.MSPOINTER_TYPE_PEN || pt === Hammer.POINTER_PEN;
      return types[pointerType];
    },

    /**
     * get events
     */
    getEvents: function getEvents() {
      return ['pointerdown MSPointerDown', 'pointermove MSPointerMove', 'pointerup pointercancel MSPointerUp MSPointerCancel'];
    },

    /**
     * reset the list
     */
    reset: function reset() {
      this.pointers = {};
    }
  };

  Hammer.detection = {
    // contains all registred Hammer.gestures in the correct order
    gestures: [],

    // data of the current Hammer.gesture detection session
    current: null,

    // the previous Hammer.gesture session data
    // is a full clone of the previous gesture.current object
    previous: null,

    // when this becomes true, no gestures are fired
    stopped: false,

    /**
     * start Hammer.gesture detection
     * @param   {Hammer.Instance}   inst
     * @param   {Object}            eventData
     */
    startDetect: function startDetect(inst, eventData) {
      // already busy with a Hammer.gesture detection on an element
      if (this.current) {
        return;
      }

      this.stopped = false;

      this.current = {
        inst: inst, // reference to HammerInstance we're working for
        startEvent: Hammer.utils.extend({}, eventData), // start eventData for distances, timing etc
        lastEvent: false, // last eventData
        name: '' // current gesture we're in/detected, can be 'tap', 'hold' etc
      };

      this.detect(eventData);
    },

    /**
     * Hammer.gesture detection
     * @param   {Object}    eventData
     */
    detect: function detect(eventData) {
      if (!this.current || this.stopped) {
        return;
      }

      // extend event data with calculations about scale, distance etc
      eventData = this.extendEventData(eventData);

      // instance options
      var inst_options = this.current.inst.options;

      // call Hammer.gesture handlers
      Hammer.utils.each(this.gestures, function (gesture) {
        // only when the instance options have enabled this gesture
        if (!this.stopped && inst_options[gesture.name] !== false) {
          // if a handler returns false, we stop with the detection
          if (gesture.handler.call(gesture, eventData, this.current.inst) === false) {
            this.stopDetect();
            return false;
          }
        }
      }, this);

      // store as previous event event
      if (this.current) {
        this.current.lastEvent = eventData;
      }

      // endevent, but not the last touch, so dont stop
      if (eventData.eventType == Hammer.EVENT_END && !eventData.touches.length - 1) {
        this.stopDetect();
      }

      return eventData;
    },

    /**
     * clear the Hammer.gesture vars
     * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
     * to stop other Hammer.gestures from being fired
     */
    stopDetect: function stopDetect() {
      // clone current data to the store as the previous gesture
      // used for the double tap gesture, since this is an other gesture detect session
      this.previous = Hammer.utils.extend({}, this.current);

      // reset the current
      this.current = null;

      // stopped!
      this.stopped = true;
    },

    /**
     * extend eventData for Hammer.gestures
     * @param   {Object}   ev
     * @returns {Object}   ev
     */
    extendEventData: function extendEventData(ev) {
      var startEv = this.current.startEvent;

      // if the touches change, set the new touches over the startEvent touches
      // this because touchevents don't have all the touches on touchstart, or the
      // user must place his fingers at the EXACT same time on the screen, which is not realistic
      // but, sometimes it happens that both fingers are touching at the EXACT same time
      if (startEv && (ev.touches.length != startEv.touches.length || ev.touches === startEv.touches)) {
        // extend 1 level deep to get the touchlist with the touch objects
        startEv.touches = [];
        Hammer.utils.each(ev.touches, function (touch) {
          startEv.touches.push(Hammer.utils.extend({}, touch));
        });
      }

      var delta_time = ev.timeStamp - startEv.timeStamp,
          delta_x = ev.center.pageX - startEv.center.pageX,
          delta_y = ev.center.pageY - startEv.center.pageY,
          velocity = Hammer.utils.getVelocity(delta_time, delta_x, delta_y),
          interimAngle,
          interimDirection;

      // end events (e.g. dragend) don't have useful values for interimDirection & interimAngle
      // because the previous event has exactly the same coordinates
      // so for end events, take the previous values of interimDirection & interimAngle
      // instead of recalculating them and getting a spurious '0'
      if (ev.eventType === 'end') {
        interimAngle = this.current.lastEvent && this.current.lastEvent.interimAngle;
        interimDirection = this.current.lastEvent && this.current.lastEvent.interimDirection;
      } else {
        interimAngle = this.current.lastEvent && Hammer.utils.getAngle(this.current.lastEvent.center, ev.center);
        interimDirection = this.current.lastEvent && Hammer.utils.getDirection(this.current.lastEvent.center, ev.center);
      }

      Hammer.utils.extend(ev, {
        deltaTime: delta_time,

        deltaX: delta_x,
        deltaY: delta_y,

        velocityX: velocity.x,
        velocityY: velocity.y,

        distance: Hammer.utils.getDistance(startEv.center, ev.center),

        angle: Hammer.utils.getAngle(startEv.center, ev.center),
        interimAngle: interimAngle,

        direction: Hammer.utils.getDirection(startEv.center, ev.center),
        interimDirection: interimDirection,

        scale: Hammer.utils.getScale(startEv.touches, ev.touches),
        rotation: Hammer.utils.getRotation(startEv.touches, ev.touches),

        startEvent: startEv
      });

      return ev;
    },

    /**
     * register new gesture
     * @param   {Object}    gesture object, see gestures.js for documentation
     * @returns {Array}     gestures
     */
    register: function register(gesture) {
      // add an enable gesture options if there is no given
      var options = gesture.defaults || {};
      if (options[gesture.name] === undefined) {
        options[gesture.name] = true;
      }

      // extend Hammer default options with the Hammer.gesture options
      Hammer.utils.extend(Hammer.defaults, options, true);

      // set its index
      gesture.index = gesture.index || 1000;

      // add Hammer.gesture to the list
      this.gestures.push(gesture);

      // sort the list by index
      this.gestures.sort(function (a, b) {
        if (a.index < b.index) {
          return -1;
        }
        if (a.index > b.index) {
          return 1;
        }
        return 0;
      });

      return this.gestures;
    }
  };

  /**
   * Drag
   * Move with x fingers (default 1) around on the page. Blocking the scrolling when
   * moving left and right is a good practice. When all the drag events are blocking
   * you disable scrolling on that area.
   * @events  drag, drapleft, dragright, dragup, dragdown
   */
  Hammer.gestures.Drag = {
    name: 'drag',
    index: 50,
    defaults: {
      drag_min_distance: 10,

      // Set correct_for_drag_min_distance to true to make the starting point of the drag
      // be calculated from where the drag was triggered, not from where the touch started.
      // Useful to avoid a jerk-starting drag, which can make fine-adjustments
      // through dragging difficult, and be visually unappealing.
      correct_for_drag_min_distance: true,

      // set 0 for unlimited, but this can conflict with transform
      drag_max_touches: 1,

      // prevent default browser behavior when dragging occurs
      // be careful with it, it makes the element a blocking element
      // when you are using the drag gesture, it is a good practice to set this true
      drag_block_horizontal: false,
      drag_block_vertical: false,

      // drag_lock_to_axis keeps the drag gesture on the axis that it started on,
      // It disallows vertical directions if the initial direction was horizontal, and vice versa.
      drag_lock_to_axis: false,

      // drag lock only kicks in when distance > drag_lock_min_distance
      // This way, locking occurs only when the distance has become large enough to reliably determine the direction
      drag_lock_min_distance: 25
    },

    triggered: false,
    handler: function dragGesture(ev, inst) {
      // current gesture isnt drag, but dragged is true
      // this means an other gesture is busy. now call dragend
      if (Hammer.detection.current.name != this.name && this.triggered) {
        inst.trigger(this.name + 'end', ev);
        this.triggered = false;
        return;
      }

      // max touches
      if (inst.options.drag_max_touches > 0 && ev.touches.length > inst.options.drag_max_touches) {
        return;
      }

      switch (ev.eventType) {
        case Hammer.EVENT_START:
          this.triggered = false;
          break;

        case Hammer.EVENT_MOVE:
          // when the distance we moved is too small we skip this gesture
          // or we can be already in dragging
          if (ev.distance < inst.options.drag_min_distance && Hammer.detection.current.name != this.name) {
            return;
          }

          // we are dragging!
          if (Hammer.detection.current.name != this.name) {
            Hammer.detection.current.name = this.name;
            if (inst.options.correct_for_drag_min_distance && ev.distance > 0) {
              // When a drag is triggered, set the event center to drag_min_distance pixels from the original event center.
              // Without this correction, the dragged distance would jumpstart at drag_min_distance pixels instead of at 0.
              // It might be useful to save the original start point somewhere
              var factor = Math.abs(inst.options.drag_min_distance / ev.distance);
              Hammer.detection.current.startEvent.center.pageX += ev.deltaX * factor;
              Hammer.detection.current.startEvent.center.pageY += ev.deltaY * factor;

              // recalculate event data using new start point
              ev = Hammer.detection.extendEventData(ev);
            }
          }

          // lock drag to axis?
          if (Hammer.detection.current.lastEvent.drag_locked_to_axis || inst.options.drag_lock_to_axis && inst.options.drag_lock_min_distance <= ev.distance) {
            ev.drag_locked_to_axis = true;
          }
          var last_direction = Hammer.detection.current.lastEvent.direction;
          if (ev.drag_locked_to_axis && last_direction !== ev.direction) {
            // keep direction on the axis that the drag gesture started on
            if (Hammer.utils.isVertical(last_direction)) {
              ev.direction = ev.deltaY < 0 ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;
            } else {
              ev.direction = ev.deltaX < 0 ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;
            }
          }

          // first time, trigger dragstart event
          if (!this.triggered) {
            inst.trigger(this.name + 'start', ev);
            this.triggered = true;
          }

          // trigger normal event
          inst.trigger(this.name, ev);

          // direction event, like dragdown
          inst.trigger(this.name + ev.direction, ev);

          // block the browser events
          if (inst.options.drag_block_vertical && Hammer.utils.isVertical(ev.direction) || inst.options.drag_block_horizontal && !Hammer.utils.isVertical(ev.direction)) {
            ev.preventDefault();
          }
          break;

        case Hammer.EVENT_END:
          // trigger dragend
          if (this.triggered) {
            inst.trigger(this.name + 'end', ev);
          }

          this.triggered = false;
          break;
      }
    }
  };

  /**
   * Hold
   * Touch stays at the same place for x time
   * @events  hold
   */
  Hammer.gestures.Hold = {
    name: 'hold',
    index: 10,
    defaults: {
      hold_timeout: 500,
      hold_threshold: 1
    },
    timer: null,
    handler: function holdGesture(ev, inst) {
      switch (ev.eventType) {
        case Hammer.EVENT_START:
          // clear any running timers
          clearTimeout(this.timer);

          // set the gesture so we can check in the timeout if it still is
          Hammer.detection.current.name = this.name;

          // set timer and if after the timeout it still is hold,
          // we trigger the hold event
          this.timer = setTimeout(function () {
            if (Hammer.detection.current.name == 'hold') {
              inst.trigger('hold', ev);
            }
          }, inst.options.hold_timeout);
          break;

        // when you move or end we clear the timer
        case Hammer.EVENT_MOVE:
          if (ev.distance > inst.options.hold_threshold) {
            clearTimeout(this.timer);
          }
          break;

        case Hammer.EVENT_END:
          clearTimeout(this.timer);
          break;
      }
    }
  };

  /**
   * Release
   * Called as last, tells the user has released the screen
   * @events  release
   */
  Hammer.gestures.Release = {
    name: 'release',
    index: Infinity,
    handler: function releaseGesture(ev, inst) {
      if (ev.eventType == Hammer.EVENT_END) {
        inst.trigger(this.name, ev);
      }
    }
  };

  /**
   * Swipe
   * triggers swipe events when the end velocity is above the threshold
   * @events  swipe, swipeleft, swiperight, swipeup, swipedown
   */
  Hammer.gestures.Swipe = {
    name: 'swipe',
    index: 40,
    defaults: {
      // set 0 for unlimited, but this can conflict with transform
      swipe_min_touches: 1,
      swipe_max_touches: 1,
      swipe_velocity: 0.7
    },
    handler: function swipeGesture(ev, inst) {
      if (ev.eventType == Hammer.EVENT_END) {
        // max touches
        if (inst.options.swipe_max_touches > 0 && ev.touches.length < inst.options.swipe_min_touches && ev.touches.length > inst.options.swipe_max_touches) {
          return;
        }

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if (ev.velocityX > inst.options.swipe_velocity || ev.velocityY > inst.options.swipe_velocity) {
          // trigger swipe events
          inst.trigger(this.name, ev);
          inst.trigger(this.name + ev.direction, ev);
        }
      }
    }
  };

  /**
   * Tap/DoubleTap
   * Quick touch at a place or double at the same place
   * @events  tap, doubletap
   */
  Hammer.gestures.Tap = {
    name: 'tap',
    index: 100,
    defaults: {
      tap_max_touchtime: 250,
      tap_max_distance: 10,
      tap_always: true,
      doubletap_distance: 20,
      doubletap_interval: 300
    },
    handler: function tapGesture(ev, inst) {
      if (ev.eventType == Hammer.EVENT_END && ev.srcEvent.type != 'touchcancel') {
        // previous gesture, for the double tap since these are two different gesture detections
        var prev = Hammer.detection.previous,
            did_doubletap = false;

        // when the touchtime is higher then the max touch time
        // or when the moving distance is too much
        if (ev.deltaTime > inst.options.tap_max_touchtime || ev.distance > inst.options.tap_max_distance) {
          return;
        }

        // check if double tap
        if (prev && prev.name == 'tap' && ev.timeStamp - prev.lastEvent.timeStamp < inst.options.doubletap_interval && ev.distance < inst.options.doubletap_distance) {
          inst.trigger('doubletap', ev);
          did_doubletap = true;
        }

        // do a single tap
        if (!did_doubletap || inst.options.tap_always) {
          Hammer.detection.current.name = 'tap';
          inst.trigger(Hammer.detection.current.name, ev);
        }
      }
    }
  };

  /**
   * Touch
   * Called as first, tells the user has touched the screen
   * @events  touch
   */
  Hammer.gestures.Touch = {
    name: 'touch',
    index: -Infinity,
    defaults: {
      // call preventDefault at touchstart, and makes the element blocking by
      // disabling the scrolling of the page, but it improves gestures like
      // transforming and dragging.
      // be careful with using this, it can be very annoying for users to be stuck
      // on the page
      prevent_default: false,

      // disable mouse events, so only touch (or pen!) input triggers events
      prevent_mouseevents: false
    },
    handler: function touchGesture(ev, inst) {
      if (inst.options.prevent_mouseevents && ev.pointerType == Hammer.POINTER_MOUSE) {
        ev.stopDetect();
        return;
      }

      if (inst.options.prevent_default) {
        ev.preventDefault();
      }

      if (ev.eventType == Hammer.EVENT_START) {
        inst.trigger(this.name, ev);
      }
    }
  };

  /**
   * Transform
   * User want to scale or rotate with 2 fingers
   * @events  transform, pinch, pinchin, pinchout, rotate
   */
  Hammer.gestures.Transform = {
    name: 'transform',
    index: 45,
    defaults: {
      // factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
      transform_min_scale: 0.01,
      // rotation in degrees
      transform_min_rotation: 1,
      // prevent default browser behavior when two touches are on the screen
      // but it makes the element a blocking element
      // when you are using the transform gesture, it is a good practice to set this true
      transform_always_block: false
    },
    triggered: false,
    handler: function transformGesture(ev, inst) {
      // current gesture isnt drag, but dragged is true
      // this means an other gesture is busy. now call dragend
      if (Hammer.detection.current.name != this.name && this.triggered) {
        inst.trigger(this.name + 'end', ev);
        this.triggered = false;
        return;
      }

      // atleast multitouch
      if (ev.touches.length < 2) {
        return;
      }

      // prevent default when two fingers are on the screen
      if (inst.options.transform_always_block) {
        ev.preventDefault();
      }

      switch (ev.eventType) {
        case Hammer.EVENT_START:
          this.triggered = false;
          break;

        case Hammer.EVENT_MOVE:
          var scale_threshold = Math.abs(1 - ev.scale);
          var rotation_threshold = Math.abs(ev.rotation);

          // when the distance we moved is too small we skip this gesture
          // or we can be already in dragging
          if (scale_threshold < inst.options.transform_min_scale && rotation_threshold < inst.options.transform_min_rotation) {
            return;
          }

          // we are transforming!
          Hammer.detection.current.name = this.name;

          // first time, trigger dragstart event
          if (!this.triggered) {
            inst.trigger(this.name + 'start', ev);
            this.triggered = true;
          }

          inst.trigger(this.name, ev); // basic transform event

          // trigger rotate event
          if (rotation_threshold > inst.options.transform_min_rotation) {
            inst.trigger('rotate', ev);
          }

          // trigger pinch event
          if (scale_threshold > inst.options.transform_min_scale) {
            inst.trigger('pinch', ev);
            inst.trigger('pinch' + (ev.scale < 1 ? 'in' : 'out'), ev);
          }
          break;

        case Hammer.EVENT_END:
          // trigger dragend
          if (this.triggered) {
            inst.trigger(this.name + 'end', ev);
          }

          this.triggered = false;
          break;
      }
    }
  };

  // Based off Lo-Dash's excellent UMD wrapper (slightly modified) - https://github.com/bestiejs/lodash/blob/master/lodash.js#L5515-L5543
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if (typeof define == 'function' && __webpack_require__(22)) {
    // define as an anonymous module
    define(function () {
      return Hammer;
    });
  }

  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (typeof module === 'object' && module.exports) {
      module.exports = Hammer;
    } else {
      window.Hammer = Hammer;
    }

  return Hammer;
}(window);

/* unused harmony default export */ var _unused_webpack_default_export = (Hammer);
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(6)(module)))

/***/ }),
/* 22 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__GenomeReader__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GatorComponent__ = __webpack_require__(3);




const last_retrieved_gene = Symbol('last_retrieved_gene');

class GeneComponent extends __WEBPACK_IMPORTED_MODULE_1__GatorComponent__["a" /* default */] {
  static get observedAttributes() {
    return ['geneid'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    setup_renderer.call(this);
    if (this.geneid) {
      retrieve_data.call(this);
    }
  }

  attributeChangedCallback(name, old, newval) {
    if (name === 'geneid' && this.renderer) {
      retrieve_data.call(this);
      return;
    }
  }

  get geneid() {
    return this.getAttribute('geneid');
  }
  set geneid(id) {
    this.setAttribute('geneid', id);
  }
}

let reader_has_data = function reader_has_data() {
  if (!this.geneid) {
    return;
  }
  if (this[last_retrieved_gene] === this.geneid) {
    return;
  }
  this[last_retrieved_gene] = this.geneid;

  console.log('Getting data for ', this.geneid);
  var reader = new __WEBPACK_IMPORTED_MODULE_0__GenomeReader__["a" /* default */]();
  reader.geneid = this.geneid;
  if (this.hasAttribute('reviewed')) {
    reader.reviewed = true;
  }
  // reader.uniprot = 'Q10472';
  reader.exon_margin = 300; //..this.exonmargin || 300;
  if (this.nt_mapping) {
    reader.nt_mapping = this.nt_mapping;
  }
  if (!this.ready) {
    reader.registerSequenceRenderer(this.renderer);
    reader.bind('requestComplete', () => {
      this.renderer.hideAxis();
      this.renderer.fitZoom();
    });
    this.ready = new Promise(resolve => {
      reader.bind('requestComplete', () => {
        this.uniprots = Object.keys(reader.result._raw_data.data).map(up => up.toUpperCase());
        if (reader.reviewed) {
          this.uniprots = this.uniprots.filter(up => up === reader.swissprot.toUpperCase());
        }
        this.refreshTracks();
        resolve();
        delete this.ready;
        var event = new Event('ready', { bubbles: true });
        this.dispatchEvent(event);
      });
    });
  }

  reader.retrieve(this.accession || "" + this.geneid);
};

let setup_renderer = function setup_renderer() {
  this.renderer.trackOrder = [];
  this.renderer.reset();
};

let retrieve_data = function retrieve_data() {
  this.renderer.bind('sequenceChange', reader_has_data.bind(this));
  this.renderer.setSequence('M');
};

customElements.define('x-geneviewer', GeneComponent);

/* harmony default export */ __webpack_exports__["a"] = (GeneComponent);

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__GatorComponent__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__jsandbox__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__MASCP__ = __webpack_require__(1);
var _this = this;





const SANDBOXES = new Map();

let retrieve_renderer = function retrieve_renderer() {
  let renderer_url = this.getAttribute('src');
  return fetch(renderer_url).then(dat => dat.text());
};

function WrapHTML() {
  return Reflect.construct(HTMLElement, [], Object.getPrototypeOf(this).constructor);
}
Object.setPrototypeOf(WrapHTML.prototype, HTMLElement.prototype);
Object.setPrototypeOf(WrapHTML, HTMLElement);

let get_renderer_sequence = (renderer, accession) => {
  return new Promise(resolve => {
    (function () {
      var obj = { "gotResult": function gotResult() {
          resolve(renderer.sequence);
        }, "acc": accession };
      renderer.trigger('readerRegistered', [obj]);
      obj.gotResult();
    })();
  });
};

let set_basic_offset = (objects, basic_offset) => {
  objects.forEach(function (obj) {
    if (obj.options) {
      if (obj.options.offset) {
        obj.options.offset += basic_offset;
        return;
      }
      obj.options.offset = basic_offset;
    } else {
      obj.options = { "offset": basic_offset };
    }
  });
};

let apply_rendering = (renderer, default_track, objects) => {
  if (Array.isArray(objects)) {
    var temp_objects = {};
    console.log('No accession provided');
    temp_objects['DEFAULTACC'] = objects;
    objects = temp_objects;
  }
  for (let acc of Object.keys(objects)) {
    let r = objects[acc];
    set_basic_offset(r, 0);

    renderer.renderObjects(default_track, r.filter(function (item) {
      return !item.track;
    }));

    var items_by_track = {};
    r.filter(function (item) {
      return item.track;
    }).forEach(function (item) {
      items_by_track[item.track] = items_by_track[item.track] || [];
      items_by_track[item.track].push(item);
    });
    Object.keys(items_by_track).forEach(function (track) {
      if (__WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(track)) {
        __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].registerLayer(track, {}, [renderer]);
        // We force a refresh of the track order
        // to pick up any layers that have been re-enabled
        renderer.trackOrder = renderer.trackOrder;
        renderer.renderObjects(track, items_by_track[track]);
      }
    });
    renderer.trigger('resultsRendered', [_this]);
    renderer.refresh();
  }
};

let do_rendering = (renderer, script, data, default_track) => {
  const SANDBOX = SANDBOXES.get(script) || new __WEBPACK_IMPORTED_MODULE_1__jsandbox__["a" /* default */]();
  SANDBOXES.set(script, SANDBOX);
  get_renderer_sequence(renderer).then(sequence => {
    SANDBOX.eval(script, () => {
      SANDBOX.eval({ 'data': 'renderData(input.sequence,input.data,input.acc,input.track)',
        'input': { 'sequence': sequence, 'data': data, 'track': default_track },
        'onerror': message => {
          throw new Error(message);
        },
        'callback': apply_rendering.bind(null, renderer, default_track)
      });
    });
  });
};

class TrackRendererComponent extends WrapHTML {
  static get observedAttributes() {
    return ['track', 'src'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.script = retrieve_renderer.call(this);
  }

  render(renderer, data, track) {
    this.script.then(script => {
      do_rendering(renderer, script, data, track);
    });
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data;
    this.render(this.ownerDocument.getElementById(this.getAttribute('renderer')).renderer, this._data, this.getAttribute('track'));
  }

  attributeChangedCallback(name) {
    if (this.hasAttribute('renderer') && this.data && name === 'track') {
      this.render(document.getElementById(this.getAttribute('renderer')).renderer, this._data, this.getAttribute('track'));
    }
    if (name === 'src') {
      this.script = retrieve_renderer.call(this);
    }
  }
}

customElements.define('x-trackrenderer', TrackRendererComponent);

let create_track = function create_track() {
  __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].registerLayer(this.name, {});
  __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(this.name).fullname = this.fullname || this.name;
  __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(this.name).scales.clear();
  for (let scale of this.scale) {
    __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(this.name).scales.add(scale);
  }
};

class TrackComponent extends WrapHTML {
  static get observedAttributes() {
    return ['name', 'fullname', 'scale'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    create_track.call(this);
  }

  get name() {
    return this.getAttribute('name');
  }

  set name(name) {
    return this.setAttribute('name', name);
  }

  get layer() {
    return __WEBPACK_IMPORTED_MODULE_2__MASCP__["a" /* default */].getLayer(this.name);
  }

  get fullname() {
    return this.getAttribute('fullname');
  }

  set fullname(name) {
    return this.setAttribute('fullname', name);
  }

  get scale() {
    return (this.getAttribute('scale') || '').split(',');
  }

  set scale(scale) {
    return this.setAttribute('scale', scale);
  }

  attributeChangedCallback(name) {
    create_track.call(this);
  }
}

customElements.define('x-gatortrack', TrackComponent);

/* harmony default export */ __webpack_exports__["a"] = (TrackRendererComponent);

/***/ })
/******/ ]);
//# sourceMappingURL=SeqViewer.js.map