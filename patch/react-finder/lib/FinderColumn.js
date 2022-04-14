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

var _FinderColumnHeader = require('./FinderColumnHeader');

var _FinderColumnHeader2 = _interopRequireDefault(_FinderColumnHeader);

var _reactSortableHoc = require('react-sortable-hoc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var FinderColumn = (_temp = _class = function (_PureComponent) {
    (0, _inherits3['default'])(FinderColumn, _PureComponent);

    function FinderColumn() {
        (0, _classCallCheck3['default'])(this, FinderColumn);
        return (0, _possibleConstructorReturn3['default'])(this, (FinderColumn.__proto__ || Object.getPrototypeOf(FinderColumn)).apply(this, arguments));
    }

    (0, _createClass3['default'])(FinderColumn, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                dataSource = _props.dataSource,
                selectedKey = _props.selectedKey,
                renderItem = _props.renderItem,
                nodeKey = _props.nodeKey,
                openedKey = _props.openedKey,
                onSelect = _props.onSelect,
                checkIsLeaf = _props.checkIsLeaf,
                parentOpenedKey = _props.parentOpenedKey,
                renderHeaderColumn = _props.renderHeaderColumn,
                shouldDragDisabled = _props.shouldDragDisabled;


            return _react2['default'].createElement(
                'div',
                { className: 'react-finder-column' },
                renderHeaderColumn ? _react2['default'].createElement(_FinderColumnHeader2['default'], {
                    renderHeaderColumn: renderHeaderColumn,
                    parentOpenedKey: parentOpenedKey,
                    openedKey: openedKey,
                    selectedKey: selectedKey
                }) : '',
                dataSource && dataSource.map(function (data, index) {
                    return _react2['default'].createElement(_FinderItem2['default'], {
                        disabled: shouldDragDisabled && shouldDragDisabled({ data: data }),
                        key: data[nodeKey],
                        index: index,
                        data: data,
                        render: renderItem,
                        selected: selectedKey === data[nodeKey],
                        opened: openedKey === data[nodeKey],
                        onSelect: onSelect,
                        checkIsLeaf: checkIsLeaf
                    });
                })
            );
        }
    }]);
    return FinderColumn;
}(_react.PureComponent), _class.propTypes = {
    nodeKey: _propTypes2['default'].string,
    dataSource: _propTypes2['default'].arrayOf(_propTypes2['default'].object),
    selectedKey: _propTypes2['default'].any,
    openedKey: _propTypes2['default'].any,
    parentOpenedKey: _propTypes2['default'].any,
    renderItem: _propTypes2['default'].func,
    renderHeaderColumn: _propTypes2['default'].func,
    onSelect: _propTypes2['default'].func,
    checkIsLeaf: _propTypes2['default'].func.isRequired,
    shouldDragDisabled: _propTypes2['default'].func
}, _class.defaultProps = {
    dataSource: [],
    selectedKey: null,
    isLast: false
}, _temp);
exports['default'] = (0, _reactSortableHoc.SortableContainer)(FinderColumn);
module.exports = exports['default'];