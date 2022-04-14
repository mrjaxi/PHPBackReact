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
                    * Created by wanli on 2017/9/15.
                    */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _FinderItem = require('./FinderItem');

var _FinderItem2 = _interopRequireDefault(_FinderItem);

var _reactSortableHoc = require('react-sortable-hoc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var FinderColumnHeader = (_temp = _class = function (_PureComponent) {
    (0, _inherits3['default'])(FinderColumnHeader, _PureComponent);

    function FinderColumnHeader() {
        (0, _classCallCheck3['default'])(this, FinderColumnHeader);
        return (0, _possibleConstructorReturn3['default'])(this, (FinderColumnHeader.__proto__ || Object.getPrototypeOf(FinderColumnHeader)).apply(this, arguments));
    }

    (0, _createClass3['default'])(FinderColumnHeader, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                selectedKey = _props.selectedKey,
                openedKey = _props.openedKey,
                renderHeaderColumn = _props.renderHeaderColumn,
                parentOpenedKey = _props.parentOpenedKey;


            return _react2['default'].createElement(
                'div',
                { className: 'react-finder-column-header' },
                renderHeaderColumn({ parentOpenedKey: parentOpenedKey, openedKey: openedKey, selectedKey: selectedKey })
            );
        }
    }]);
    return FinderColumnHeader;
}(_react.PureComponent), _class.propTypes = {
    nodeKey: _propTypes2['default'].string,
    dataSource: _propTypes2['default'].arrayOf(_propTypes2['default'].object),
    selectedKey: _propTypes2['default'].any,
    openedKey: _propTypes2['default'].any,
    parentOpenedKey: _propTypes2['default'].any
}, _class.defaultProps = {
    dataSource: [],
    selectedKey: null,
    isLast: false
}, _temp);
exports['default'] = (0, _reactSortableHoc.SortableContainer)(FinderColumnHeader);
module.exports = exports['default'];