import _extends from 'babel-runtime/helpers/extends';
import _typeof from 'babel-runtime/helpers/typeof';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _class, _temp;

/* eslint no-loop-func:0 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Column from './FinderColumn';
import { findInTree, atTreePath } from './utils';
import { arrayMove } from 'react-sortable-hoc';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

var ReactFinder = (_temp = _class = function (_PureComponent) {
    _inherits(ReactFinder, _PureComponent);

    function ReactFinder(props) {
        _classCallCheck(this, ReactFinder);

        var _this = _possibleConstructorReturn(this, (ReactFinder.__proto__ || Object.getPrototypeOf(ReactFinder)).call(this, props));

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


    _createClass(ReactFinder, [{
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
                var openedNode = find(result[i], function (node) {
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

            var loc = findInTree(dataSource, function (node) {
                return node[nodeKey] === selectedKey;
            }, { childrenName: childrenPropName, withAppendData: true }).loc;

            var nodeList = atTreePath(dataSource, loc, { childrenName: childrenPropName });
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
                selectedData: findInTree(dataSource, function (n) {
                    return n[nodeKey] === selectedKey;
                }, { childrenName: childrenPropName })
            });
            if (el) {
                return React.createElement(
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

            return React.createElement(
                'div',
                { className: 'react-finder react-finder-container', style: style },
                columns.map(function (col, i) {
                    var appendProps = typeof sortableContainerProps === 'function' ? sortableContainerProps({ column: col, index: i }) : sortableContainerProps;

                    return React.createElement(Column, _extends({
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
                            if (i <= 0) sortedData = arrayMove(col, oldIndex, newIndex);else {
                                var keys = openedKeys.slice(0, i - 1);
                                sortedData = cloneDeep(dataSource);
                                var acc = sortedData;

                                var _loop = function _loop(j) {
                                    var key = keys[j];
                                    var node = find(acc, function (data) {
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

                                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                                }
                                set(find(acc, function (data) {
                                    return data[nodeKey] === openedKeys[i - 1];
                                }), childrenPropName, arrayMove(col, oldIndex, newIndex));
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
}(PureComponent), _class.propTypes = {
    nodeKey: PropTypes.string, // 某一个节点的唯一key的标识符
    dataSource: PropTypes.arrayOf(PropTypes.object), // 数据源
    childrenPropName: PropTypes.string, // 子节点参数的名称
    renderItem: PropTypes.func, // ({ data, isLeaf }) => ReactElement
    renderHeaderColumn: PropTypes.func,
    renderDetail: PropTypes.func, // ({ data, isLeaf }) => ReactElement
    isLeaf: PropTypes.func, // check if is leaf node. (data) => bool
    selectedKey: PropTypes.any,
    defaultSelectedKey: PropTypes.any,
    shouldDragDisabled: PropTypes.func, // (data) => bool
    style: PropTypes.object,
    draggable: PropTypes.bool,
    onDragEnd: PropTypes.func,
    onSelect: PropTypes.func, // (selectedKey, { data }) => {}
    // ({ column, index }) => Object
    sortableContainerProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
}, _class.defaultProps = {
    nodeKey: 'key',
    dataSource: [],
    childrenPropName: 'children',
    isLeaf: null,
    style: {},
    sortableContainerProps: {},
    draggable: false
}, _temp);


export default ReactFinder;