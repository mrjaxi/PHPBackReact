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
import { SortableContainer as sortableContainer } from 'react-sortable-hoc';

var FinderColumnHeader = (_temp = _class = function (_PureComponent) {
    _inherits(FinderColumnHeader, _PureComponent);

    function FinderColumnHeader() {
        _classCallCheck(this, FinderColumnHeader);

        return _possibleConstructorReturn(this, (FinderColumnHeader.__proto__ || Object.getPrototypeOf(FinderColumnHeader)).apply(this, arguments));
    }

    _createClass(FinderColumnHeader, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                selectedKey = _props.selectedKey,
                openedKey = _props.openedKey,
                renderHeaderColumn = _props.renderHeaderColumn,
                parentOpenedKey = _props.parentOpenedKey;


            return React.createElement(
                'div',
                { className: 'react-finder-column-header' },
                renderHeaderColumn({ parentOpenedKey: parentOpenedKey, openedKey: openedKey, selectedKey: selectedKey })
            );
        }
    }]);

    return FinderColumnHeader;
}(PureComponent), _class.propTypes = {
    nodeKey: PropTypes.string,
    dataSource: PropTypes.arrayOf(PropTypes.object),
    selectedKey: PropTypes.any,
    openedKey: PropTypes.any,
    parentOpenedKey: PropTypes.any
}, _class.defaultProps = {
    dataSource: [],
    selectedKey: null,
    isLast: false
}, _temp);


export default sortableContainer(FinderColumnHeader);