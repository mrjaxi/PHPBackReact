'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp; /**
                    * Created by wanli on 2017/9/16.
                    */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactSortableHoc = require('react-sortable-hoc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var FinderItem = (_temp = _class = function (_PureComponent) {
  (0, _inherits3['default'])(FinderItem, _PureComponent);

  function FinderItem() {
    (0, _classCallCheck3['default'])(this, FinderItem);
    return (0, _possibleConstructorReturn3['default'])(this, (FinderItem.__proto__ || Object.getPrototypeOf(FinderItem)).apply(this, arguments));
  }

  (0, _createClass3['default'])(FinderItem, [{
    key: 'renderDefault',
    value: function renderDefault() {
      return _react2['default'].createElement(
        'span',
        null,
        this.props.data.name,
        ' ',
        _react2['default'].createElement(
          'span',
          null,
          '>'
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          data = _props.data,
          render = _props.render,
          onSelect = _props.onSelect,
          selected = _props.selected,
          opened = _props.opened,
          checkIsLeaf = _props.checkIsLeaf;


      var classList = ['react-finder-item'];
      if (selected) classList.push('selected');else if (opened) classList.push('opened');

      return _react2['default'].createElement(
        'div',
        { className: classList.join(' '), onClick: function onClick() {
            return onSelect && onSelect({ data: data });
          } },
        render ? render({ data: data, isLeaf: checkIsLeaf(data) }) : this.renderDefault()
      );
    }
  }]);
  return FinderItem;
}(_react.PureComponent), _class.propTypes = {
  render: _propTypes2['default'].func,
  data: _propTypes2['default'].object,
  // 0: false, 1: remaining, 2: true
  selected: _propTypes2['default'].bool,
  opened: _propTypes2['default'].bool,
  onSelect: _propTypes2['default'].func,
  checkIsLeaf: _propTypes2['default'].func.isRequired
}, _class.defaultProps = {
  data: {},
  selected: false,
  opened: false
}, _temp);
exports['default'] = (0, _reactSortableHoc.SortableElement)(FinderItem);
module.exports = exports['default'];