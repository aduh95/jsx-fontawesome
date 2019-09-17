(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fortawesome/fontawesome-svg-core'), require('prop-types'), require('@aduh95/async-jsx')) :
  typeof define === 'function' && define.amd ? define(['exports', '@fortawesome/fontawesome-svg-core', 'prop-types', '@aduh95/async-jsx'], factory) :
  (global = global || self, factory(global['jsx-fontawesome'] = {}, global.FontAwesome, global.PropTypes, global.h));
}(this, function (exports, fontawesomeSvgCore, PropTypes, asyncJsx) { 'use strict';

  PropTypes = PropTypes && PropTypes.hasOwnProperty('default') ? PropTypes['default'] : PropTypes;

  /**
   * Removes any hypens, underscores, and whitespace characters, and uppercases the first character that follows.
   * @see https://github.com/domchristie/humps
   * @param {string} string
   * @returns {string} camelized string
   */
  function camelize(string) {
    if (typeof string !== 'string') {
      return string;
    }

    string = string.replace(/[-_\s]+(.)?/g, function (match, chr) {
      return chr ? chr.toUpperCase() : '';
    }); // Ensure 1st char is always lowercase

    return string.charAt(0).toLowerCase() + string.substring(1);
  }

  function capitalize(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
  }

  function styleToObject(style) {
    return style.split(';').map(s => s.trim()).filter(s => s).reduce((acc, pair) => {
      const i = pair.indexOf(':');
      const prop = camelize(pair.slice(0, i));
      const value = pair.slice(i + 1).trim();
      prop.startsWith('webkit') ? acc[capitalize(prop)] = value : acc[prop] = value;
      return acc;
    }, {});
  }

  function convert(createElement, element, extraProps = {}) {
    if (typeof element === 'string') {
      return element;
    }

    const children = (element.children || []).map(child => {
      return convert(createElement, child);
    });
    const mixins = Object.keys(element.attributes || {}).reduce((acc, key) => {
      const val = element.attributes[key];

      switch (key) {
        case 'class':
          acc.attrs.className = val;
          delete element.attributes.class;
          break;

        case 'style':
          acc.attrs.style = styleToObject(val);
          break;

        default:
          if (key.indexOf('aria-') === 0 || key.indexOf('data-') === 0) {
            acc.attrs[key.toLowerCase()] = val;
          } else {
            acc.attrs[camelize(key)] = val;
          }

      }

      return acc;
    }, {
      attrs: {}
    });
    const {
      style: existingStyle = {},
      ...remaining
    } = extraProps;
    mixins.attrs.style = { ...mixins.attrs.style,
      ...existingStyle
    };
    return createElement(element.tag, { ...mixins.attrs,
      ...remaining
    }, ...children);
  }

  let PRODUCTION = false;

  try {
    PRODUCTION = process.env.NODE_ENV === 'production';
  } catch (e) {}

  function log (...args) {
    if (!PRODUCTION && console && typeof console.error === 'function') {
      console.error(...args);
    }
  }

  function objectWithKey(key, value) {
    return Array.isArray(value) && value.length > 0 || !Array.isArray(value) && value ? {
      [key]: value
    } : {};
  }

  function classList(props) {
    const classes = {
      'fa-spin': props.spin,
      'fa-pulse': props.pulse,
      'fa-fw': props.fixedWidth,
      'fa-inverse': props.inverse,
      'fa-border': props.border,
      'fa-li': props.listItem,
      'fa-flip-horizontal': props.flip === 'horizontal' || props.flip === 'both',
      'fa-flip-vertical': props.flip === 'vertical' || props.flip === 'both',
      [`fa-${props.size}`]: props.size !== null,
      [`fa-rotate-${props.rotation}`]: props.rotation !== null,
      [`fa-pull-${props.pull}`]: props.pull !== null
    };
    return Object.keys(classes).map(key => classes[key] ? key : null).filter(key => key);
  }

  function normalizeIconArgs(icon) {
    if (icon === null) {
      return null;
    }

    if (typeof icon === 'object' && icon.prefix && icon.iconName) {
      return icon;
    }

    if (Array.isArray(icon) && icon.length === 2) {
      return {
        prefix: icon[0],
        iconName: icon[1]
      };
    }

    if (typeof icon === 'string') {
      return {
        prefix: 'fas',
        iconName: icon
      };
    }
  }

  function FontAwesomeIcon(props) {
    const {
      icon: iconArgs,
      mask: maskArgs,
      symbol,
      className,
      title
    } = props;
    const iconLookup = normalizeIconArgs(iconArgs);
    const classes = objectWithKey('classes', [...classList(props), ...(className || '').split(' ')]);
    const transform = objectWithKey('transform', typeof props.transform === 'string' ? fontawesomeSvgCore.parse.transform(props.transform) : props.transform);
    const mask = objectWithKey('mask', normalizeIconArgs(maskArgs));
    const renderedIcon = fontawesomeSvgCore.icon(iconLookup, { ...classes,
      ...transform,
      ...mask,
      symbol,
      title
    });

    if (!renderedIcon) {
      log('Could not find icon', iconLookup);
      return null;
    }

    const {
      abstract
    } = renderedIcon;
    const extraProps = {};
    Object.keys(props).filter(key => !(key in FontAwesomeIcon.defaultProps)).forEach(key => {
      extraProps[key] = props[key];
    });
    return convertCurry(abstract[0], extraProps);
  }
  FontAwesomeIcon.displayName = 'FontAwesomeIcon';
  FontAwesomeIcon.propTypes = {
    border: PropTypes.bool,
    className: PropTypes.string,
    mask: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    fixedWidth: PropTypes.bool,
    inverse: PropTypes.bool,
    flip: PropTypes.oneOf(['horizontal', 'vertical', 'both']),
    icon: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    listItem: PropTypes.bool,
    pull: PropTypes.oneOf(['right', 'left']),
    pulse: PropTypes.bool,
    rotation: PropTypes.oneOf([90, 180, 270]),
    size: PropTypes.oneOf(['lg', 'xs', 'sm', '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x']),
    spin: PropTypes.bool,
    symbol: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    title: PropTypes.string,
    transform: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  };
  FontAwesomeIcon.defaultProps = {
    border: false,
    className: '',
    mask: null,
    fixedWidth: false,
    inverse: false,
    flip: null,
    icon: null,
    listItem: false,
    pull: null,
    pulse: false,
    rotation: null,
    size: null,
    spin: false,
    symbol: false,
    title: '',
    transform: null
  };
  const convertCurry = convert.bind(null, asyncJsx.h);

  exports.FontAwesomeIcon = FontAwesomeIcon;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
