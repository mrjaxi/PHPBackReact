'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp; /* eslint no-loop-func:0 */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _FinderColumn = require('./FinderColumn');

var _FinderColumn2 = _interopRequireDefault(_FinderColumn);

var _utils = require('./utils');

var _reactSortableHoc = require('react-sortable-hoc');

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _set = require('lodash/set');

var _set2 = _interopRequireDefault(_set);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var ReactFinder = (_temp = _class = function (_PureComponent) {
    (0, _inherits3['default'])(ReactFinder, _PureComponent);

    function ReactFinder(props) {
        (0, _classCallCheck3['default'])(this, ReactFinder);

        var _this = (0, _possibleConstructorReturn3['default'])(this, (ReactFinder.__proto__ || Object.getPrototypeOf(ReactFinder)).call(this, props));

        _this.state = {
            selectedKey: null,
            openedKeys: []
        };

        _this.checkIsLeaf = function (data) {
            var _this$props = _this.props,
                isLeaf = _this$props.isLeaf,
                childrenPropName = _this$props.childrenPropName;

            if (isLeaf) {
                return isLeaf(data);
            }
            return !data[childrenPropName];
        };

        _this.shouldDragDisabled = function () {
            var _this$props2 = _this.props,
                draggable = _this$props2.draggable,
                shouldDragDisabled = _this$props2.shouldDragDisabled;


            if (!draggable) return true;

            return shouldDragDisabled && shouldDragDisabled.apply(undefined, arguments);
        };

        _this.state.selectedKey = props.selectedKey || props.defaultSelectedKey;
        _this.state.openedKeys = _this.calcOpenedKeysBySelectedKey(_this.state.selectedKey);
        return _this;
    }

    /**
     * compatible react@15 & react@16
     * todo: write in [getDerivedStateFromProps](https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops)
     */


    (0, _createClass3['default'])(ReactFinder, [{
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var selectedKey = this.props.selectedKey;

            if ('selectedKey' in this.props && selectedKey !== this.state.selectedKey) {
                /* eslint-disable react/no-did-update-set-state */
                this.setState({
                    selectedKey: selectedKey,
                    openedKeys: this.calcOpenedKeysBySelectedKey(selectedKey)
                });
                /* eslint-enable react/no-did-update-set-state */
            }
        }
    }, {
        key: 'getRenderColumns',
        value: function getRenderColumns() {
            var _props = this.props,
                dataSource = _props.dataSource,
                nodeKey = _props.nodeKey,
                childrenPropName = _props.childrenPropName;
            var openedKeys = this.state.openedKeys;


            var result = [dataSource];
            openedKeys.forEach(function (key, i) {
                var openedNode = (0, _find2['default'])(result[i], function (node) {
                    return node[nodeKey] === key;
                });
                if (openedNode) result.push(openedNode[childrenPropName]);
            });
            return result;
        }
    }, {
        key: 'calcOpenedKeysBySelectedKey',
        value: function calcOpenedKeysBySelectedKey(selectedKey) {
            var _props2 = this.props,
                dataSource = _props2.dataSource,
                childrenPropName = _props2.childrenPropName,
                nodeKey = _props2.nodeKey;


            if (!selectedKey) return [];

            var loc = (0, _utils.findInTree)(dataSource, function (node) {
                return node[nodeKey] === selectedKey;
            }, { childrenName: childrenPropName, withAppendData: true }).loc;

            var nodeList = (0, _utils.atTreePath)(dataSource, loc, { childrenName: childrenPropName });
            if (nodeList.length > 0 && this.checkIsLeaf(nodeList[nodeList.length - 1])) nodeList.pop();

            return nodeList.map(function (node) {
                return node[nodeKey];
            });
        }
    }, {
        key: 'handleSelect',
        value: function handleSelect(data) {
            var _props3 = this.props,
                onSelect = _props3.onSelect,
                nodeKey = _props3.nodeKey;

            if (!('selectedKey' in this.props)) {
                this.setState({
                    selectedKey: data[nodeKey]
                });
            }
            if (onSelect) onSelect(data[nodeKey], { data: data });
        }
    }, {
        key: 'renderDetail',
        value: function renderDetail() {
            var _props4 = this.props,
                renderDetail = _props4.renderDetail,
                dataSource = _props4.dataSource,
                nodeKey = _props4.nodeKey,
                childrenPropName = _props4.childrenPropName;
            var selectedKey = this.state.selectedKey;


            var el = renderDetail && renderDetail({
                selectedKey: selectedKey,
                selectedData: (0, _utils.findInTree)(dataSource, function (n) {
                    return n[nodeKey] === selectedKey;
                }, { childrenName: childrenPropName })
            });
            if (el) {
                return _react2['default'].createElement(
                    'div',
                    { className: 'react-finder-detail' },
                    el
                );
            }
            return null;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props5 = this.props,
                renderItem = _props5.renderItem,
                nodeKey = _props5.nodeKey,
                style = _props5.style,
                sortableContainerProps = _props5.sortableContainerProps,
                onDragEnd = _props5.onDragEnd,
                dataSource = _props5.dataSource,
                childrenPropName = _props5.childrenPropName,
                renderHeaderColumn = _props5.renderHeaderColumn;
            var _state = this.state,
                selectedKey = _state.selectedKey,
                openedKeys = _state.openedKeys;


            var columns = this.getRenderColumns();

            return _react2['default'].createElement(
                'div',
                { className: 'react-finder react-finder-container', style: style },
                columns.map(function (col, i) {
                    var appendProps = typeof sortableContainerProps === 'function' ? sortableContainerProps({ column: col, index: i }) : sortableContainerProps;

                    return _react2['default'].createElement(_FinderColumn2['default'], (0, _extends3['default'])({
                        renderHeaderColumn: renderHeaderColumn,
                        key: i,
                        dataSource: col,
                        distance: 8,
                        selectedKey: selectedKey,
                        parentOpenedKey: openedKeys[i - 1],
                        openedKey: openedKeys[i],
                        renderItem: renderItem,
                        nodeKey: nodeKey,
                        onSelect: function onSelect(_ref) {
                            var data = _ref.data;

                            var newOpenKeys = openedKeys.slice(0, i);
                            // if not leaf, add to openedKeys
                            if (!_this2.checkIsLeaf(data)) newOpenKeys.push(data[nodeKey]);

                            _this2.setState({ openedKeys: newOpenKeys });
                            _this2.handleSelect(data);
                        },
                        checkIsLeaf: _this2.checkIsLeaf,
                        shouldDragDisabled: _this2.shouldDragDisabled,
                        onSortEnd: function onSortEnd(_ref2) {
                            var oldIndex = _ref2.oldIndex,
                                newIndex = _ref2.newIndex;

                            var sortedData = void 0;
                            if (i <= 0) sortedData = (0, _reactSortableHoc.arrayMove)(col, oldIndex, newIndex);else {
                                var keys = openedKeys.slice(0, i - 1);
                                sortedData = (0, _cloneDeep2['default'])(dataSource);
                                var acc = sortedData;

                                var _loop = function _loop(j) {
                                    var key = keys[j];
                                    var node = (0, _find2['default'])(acc, function (data) {
                                        return data[nodeKey] === key;
                                    });
                                    if (!node) {
                                        console.error('can not find key ' + key + ' in', acc);
                                        return {
                                            v: void 0
                                        };
                                    }
                                    acc = node[childrenPropName];
                                };

                                for (var j = 0; j < keys.length; j++) {
                                    var _ret = _loop(j);

                                    if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3['default'])(_ret)) === "object") return _ret.v;
                                }
                                (0, _set2['default'])((0, _find2['default'])(acc, function (data) {
                                    return data[nodeKey] === openedKeys[i - 1];
                                }), childrenPropName, (0, _reactSortableHoc.arrayMove)(col, oldIndex, newIndex));
                            }

                            if (onDragEnd) onDragEnd(sortedData, { oldIndex: oldIndex, newIndex: newIndex, column: col, index: i });
                        }
                    }, appendProps));
                }),
                this.renderDetail()
            );
        }
    }]);
    return ReactFinder;
}(_react.PureComponent), _class.propTypes = {
    nodeKey: _propTypes2['default'].string, // 某一个节点的唯一key的标识符
    dataSource: _propTypes2['default'].arrayOf(_propTypes2['default'].object), // 数据源
    childrenPropName: _propTypes2['default'].string, // 子节点参数的名称
    renderItem: _propTypes2['default'].func, // ({ data, isLeaf }) => ReactElement
    renderHeaderColumn: _propTypes2['default'].func,
    renderDetail: _propTypes2['default'].func, // ({ data, isLeaf }) => ReactElement
    isLeaf: _propTypes2['default'].func, // check if is leaf node. (data) => bool
    selectedKey: _propTypes2['default'].any,
    defaultSelectedKey: _propTypes2['default'].any,
    shouldDragDisabled: _propTypes2['default'].func, // (data) => bool
    style: _propTypes2['default'].object,
    draggable: _propTypes2['default'].bool,
    onDragEnd: _propTypes2['default'].func,
    onSelect: _propTypes2['default'].func, // (selectedKey, { data }) => {}
    // ({ column, index }) => Object
    sortableContainerProps: _propTypes2['default'].oneOfType([_propTypes2['default'].object, _propTypes2['default'].func])
}, _class.defaultProps = {
    nodeKey: 'key',
    dataSource: [],
    childrenPropName: 'children',
    isLeaf: null,
    style: {},
    sortableContainerProps: {},
    draggable: false
}, _temp);
exports['default'] = ReactFinder;
module.exports = exports['default'];