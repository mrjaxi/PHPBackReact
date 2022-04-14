import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _class, _temp;

/**
 * Created by wanli on 2017/9/15.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Item from './FinderItem';
import HeaderColumn from './FinderColumnHeader';
import { SortableContainer as sortableContainer } from 'react-sortable-hoc';

var FinderColumn = (_temp = _class = function (_PureComponent) {
    _inherits(FinderColumn, _PureComponent);

    function FinderColumn() {
        _classCallCheck(this, FinderColumn);

        return _possibleConstructorReturn(this, (FinderColumn.__proto__ || Object.getPrototypeOf(FinderColumn)).apply(this, arguments));
    }

    _createClass(FinderColumn, [{
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


            return React.createElement(
                'div',
                { className: 'react-finder-column' },
                renderHeaderColumn ? React.createElement(HeaderColumn, {
                    renderHeaderColumn: renderHeaderColumn,
                    parentOpenedKey: parentOpenedKey,
                    openedKey: openedKey,
                    selectedKey: selectedKey
                }) : '',
                dataSource && dataSource.map(function (data, index) {
                    return React.createElement(Item, {
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
}(PureComponent), _class.propTypes = {
    nodeKey: PropTypes.string,
    dataSource: PropTypes.arrayOf(PropTypes.object),
    selectedKey: PropTypes.any,
    openedKey: PropTypes.any,
    parentOpenedKey: PropTypes.any,
    renderItem: PropTypes.func,
    renderHeaderColumn: PropTypes.func,
    onSelect: PropTypes.func,
    checkIsLeaf: PropTypes.func.isRequired,
    shouldDragDisabled: PropTypes.func
}, _class.defaultProps = {
    dataSource: [],
    selectedKey: null,
    isLast: false
}, _temp);


export default sortableContainer(FinderColumn);