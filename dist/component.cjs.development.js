'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/*
 * In keeping with Elm, we'd like to have high quality error messages
 */
var libName = '@elm-react/component';

function link(anchor) {
  if (anchor === 'issues') {
    return 'https://github.com/Parasrah/elm-react-component/issues';
  }

  if (anchor) {
    return "https://github.com/Parasrah/elm-react-component#" + anchor;
  }

  return 'https://github.com/Parasrah/elm-react-component';
} // we format these as javascript types, as it's more likely they are
// familiar with js


var common = {
  wrapDefinition: 'wrap(elm: ElmInstance, opts?: Options)',
  missingOpt: 'It looks like some options are missing!',
  expectedOpt: "We expected your opts to look like this:\n  {\n    path?: string[]\n  }",
  internalError: function internalError(code) {
    return "\n    " + libName + " has experienced an internal error. please consider visiting\n    " + link('issues') + " and opening an issue with the following format:\n\n    title: internal error: " + code + "\n\n    description: <empty>\n    ";
  }
};
var errors = {
  missingRef: /*#__PURE__*/common.internalError(1),
  duplicateInstance: /*#__PURE__*/common.internalError(2),
  missingInstance: /*#__PURE__*/common.internalError(3),
  missingPath: "\n  " + common.missingOpt + "\n\n  " + common.expectedOpt + "\n\n  \"path\" is only optional when you only have a single elm module. If you're seeing\n  this error, you've probably passed in more than one. You can figure out your path\n  by looking at the top of your elm module (file).\n\n  `module Elements.Button` translates to `path: ['Elements', 'Button']`\n\n  check out the readme for more information: " + /*#__PURE__*/link() + "\n  ",
  invalidElmInstance: "\n  \"wrap\" expects the following arguments:\n\n  " + common.wrapDefinition + "\n\n  The provided Elm instance does not match what we expected. Maybe you passed in\n  arguments in the wrong order?\n\n  You can view " + /*#__PURE__*/link('usage') + " for help\n  ",
  invalidPath: "\n  The path provided to " + libName + "#wrap could not be\n  resolved to an Elm module.\n\n  For more information, please read " + /*#__PURE__*/link('opts') + "\n  ",
  pathRequired: "\n  There seems to be multiple elm modules in the elm instance\n  passed to " + libName + "#wrap\n\n  For more information, please read " + /*#__PURE__*/link('opts') + "\n  ",
  missingPort: function missingPort(name) {
    return "\n    " + libName + ": Unable to find a port for " + name + "\n\n    Maybe you passed in a function for an incoming port,\n    or an object/primitive for an outgoing port?\n\n    For more information, please read:\n\n    " + link('usage') + "\n\n    It's also possible an unforseen prop is being passed\n    into the elm component. You can read more here:\n\n    " + link('common-pitfalls') + "\n    ";
  },
  invalidProps: "\n  " + libName + ": Elm components expect props to be an object\n  ",
  invalidOpts: "\n  The provided opts to " + libName + "#wrap did not match what we expected.\n\n  Please provide opts in the following format:\n\n  " + common.expectedOpt + "\n  "
};

/* -------------- Type Guards -------------- */

function isObject(test) {
  if (isUndefinedOrNull(test)) {
    return false;
  }

  if (typeof test === 'function') return false;
  if (typeof test !== 'object') return false;
  return true;
}

function isElmStep(test, key) {
  if (isUndefinedOrNull(test)) {
    return false;
  }

  if (typeof test !== 'object') {
    return false;
  }

  if (key === '') {
    return false;
  }

  if (key) {
    var value = test[key];
    return isElmStep(value) || isElmModule(value);
  }

  if (!Object.keys(test).length) {
    return false;
  }

  return true;
}

function isElm(test) {
  if (isUndefinedOrNull(test)) {
    return false;
  }

  if (typeof test !== 'object') {
    return false;
  }

  if (test.Elm === null) {
    return false;
  }

  if (typeof test.Elm !== 'object') {
    return false;
  }

  return true;
}

function isElmModule(test) {
  if (isUndefinedOrNull(test)) {
    return false;
  }

  if (typeof test !== 'object') {
    return false;
  }

  if (typeof test.init !== 'function') {
    return false;
  }

  return true;
}

function isTruthyString(test) {
  return typeof test === 'string' && !!test.length;
}

function isUndefinedOrNull(test) {
  return test === null || typeof test === 'undefined';
}

function isOptions(options) {
  if (isUndefinedOrNull(options)) {
    return false;
  }

  if (typeof options !== 'object') {
    return false;
  }

  var path = options.path;

  if (!(isUndefinedOrNull(path) || Array.isArray(path) && path.every(isTruthyString))) {
    return false;
  }

  return true;
}
/* ----------------- State ----------------- */


var _ref = /*#__PURE__*/function () {
  var currentId = 1;
  var instances = [];

  function createClosure(_ref2) {
    var listeners = _ref2.listeners,
        app = _ref2.app;
    return {
      sendData: function sendData(name, payload) {
        if (app.ports[name]) {
          var _app$ports$name;

          if (listeners[name]) {
            // we know this exists, because it was subscribed
            app.ports[name].unsubscribe(listeners[name]);
            delete listeners[name];
          }

          if ((_app$ports$name = app.ports[name]) === null || _app$ports$name === void 0 ? void 0 : _app$ports$name.send) {
            // we just proved this exists
            app.ports[name].send(payload);
          } else {
            console.warn(errors.missingPort(name));
          }
        }
      },
      addListener: function addListener(name, listener) {
        var _app$ports$name2;

        if (!((_app$ports$name2 = app.ports[name]) === null || _app$ports$name2 === void 0 ? void 0 : _app$ports$name2.subscribe)) {
          console.warn(errors.missingPort(name));
        } else if (listeners[name] === listener) ; else {
          if (listeners[name]) {
            // we know this exists because it was subscribed
            app.ports[name].unsubscribe(listeners[name]);
          } // we know this exists because we did type check above


          app.ports[name].subscribe(listener);
          listeners[name] = listener;
        }
      },
      clean: function clean(currentProps) {
        Object.keys(listeners).forEach(function (name) {
          if (!currentProps.includes(name)) {
            // we know this exists because we subscribed
            app.ports[name].unsubscribe(listeners[name]);
            delete listeners[name];
          }
        });
      }
    };
  }

  return {
    getClosure: function getClosure(key) {
      return createClosure(instances[key]);
    },
    createInstance: function createInstance(key, app) {
      if (instances[key]) {
        throw new Error(errors.duplicateInstance);
      }

      var instance = {
        app: app,
        listeners: {},
        subscriptions: [],
        timing: 5
      };
      instances[key] = instance;
      return instance;
    },
    hasInstance: function hasInstance(key) {
      return !!instances[key];
    },
    getId: function getId() {
      return ++currentId;
    },
    teardown: function teardown(id) {
      var _instances$id = instances[id],
          listeners = _instances$id.listeners,
          app = _instances$id.app;
      Object.keys(listeners).forEach(function (name) {
        // we know this exists because it was subscribed
        app.ports[name].unsubscribe(listeners[name]);
      });
    }
  };
}(),
    getClosure = _ref.getClosure,
    createInstance = _ref.createInstance,
    hasInstance = _ref.hasInstance,
    getId = _ref.getId,
    teardown = _ref.teardown;
/* -------------- Utilities -------------- */


function getOnlyValue(obj) {
  var values = Object.values(obj);

  if (values.length > 1) {
    return false;
  }

  if (values.length < 1) {
    return false;
  }

  return values[0] || false;
}

function getOnlyModule(step) {
  if (isElmModule(step)) {
    return step;
  }

  var deeper = getOnlyValue(step);

  if (!deeper) {
    return false;
  } // wouldn't tail call optimization be nice :P


  return getOnlyModule(deeper);
}

function resolvePath(path, step) {
  if (path === void 0) {
    path = [];
  }

  var resolve = function resolve(path, step) {
    if (path.length === 0 && isElmModule(step)) {
      return step;
    }

    if (path.length === 0 || typeof step === 'undefined') {
      return false;
    }

    var key = path[0],
        rest = path.slice(1);

    if (!isElmStep(step, key)) {
      return false;
    }

    return resolve(rest, step[key]);
  };

  return resolve(path, step);
}
/* -------------- Implementation -------------- */


function wrap(elm, opts) {
  if (opts === void 0) {
    opts = {};
  }

  if (!isElm(elm)) {
    throw new Error(errors.invalidElmInstance);
  }

  if (!isUndefinedOrNull(opts) && !isOptions(opts)) {
    throw new Error(errors.invalidOpts);
  }

  return function (props) {
    if (!isObject(props)) {
      throw new Error(errors.invalidProps);
    }

    var _React$useState = React.useState(getId()),
        id = _React$useState[0];

    var node = React.useRef(null); // mount & cleanup

    React.useEffect(function () {
      if (!node.current) {
        return;
      } // should only run once, setup instance


      var consumed = document.createElement('div');
      node.current.appendChild(consumed);

      var elmModule = function () {
        var _opts$path;

        if ((_opts$path = opts.path) === null || _opts$path === void 0 ? void 0 : _opts$path.length) {
          var _resolved = resolvePath(opts.path, elm.Elm);

          if (_resolved) {
            return _resolved;
          }

          throw new Error(errors.invalidPath);
        }

        var resolved = getOnlyModule(elm.Elm);

        if (resolved) {
          return resolved;
        }

        throw new Error(errors.pathRequired);
      }();

      var app = elmModule.init({
        node: consumed,
        flags: function () {
          var flags = {};

          for (var prop in props) {
            if (typeof props[prop] !== 'function') {
              flags[prop] = props[prop];
            }
          }

          return flags;
        }()
      });
      createInstance(id, app);
      return function () {
        return teardown(id);
      };
    }, [node]); // on update

    React.useEffect(function () {
      if (hasInstance(id)) {
        var _getClosure = getClosure(id),
            addListener = _getClosure.addListener,
            sendData = _getClosure.sendData,
            clean = _getClosure.clean;

        var propKeys = Object.keys(props);
        propKeys.filter(function (key) {
          return typeof props[key] !== 'function';
        }).forEach(function (key) {
          return sendData(key, props[key]);
        });
        propKeys.filter(function (key) {
          return typeof props[key] === 'function';
        }).forEach(function (key) {
          return addListener(key, props[key]);
        });
        clean(propKeys);
      } else {
        console.error(errors.missingInstance);
      }
    });
    return React.createElement("div", {
      ref: node
    });
  };
}

exports.default = wrap;
//# sourceMappingURL=component.cjs.development.js.map
