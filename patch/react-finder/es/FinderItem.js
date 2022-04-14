import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _class, _temp;

/**
 * Created by wanli on 2017/9/16.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SortableElement as sortableElement } from 'react-sortable-hoc';

var FinderItem = (_temp = _class = function (_PureComponent) {
  _inherits(FinderItem, _PureComponent);

  function FinderItem() {
    _classCallCheck(this, FinderItem);

    return _possibleConstructorReturn(this, (FinderItem.__proto__ || Object.getPrototypeOf(FinderItem)).apply(this, arguments));
  }

  _createClass(FinderItem, [{
    key: 'renderDefault',
    value: function renderDefault() {
      return React.createElement(
        'span',
        null,
        this.props.data.name,
        ' ',
        React.createElement(
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

      return React.createElement(
        'div',
        { className: classList.join(' '), onClick: function onClick() {
            return onSelect && onSelect({ data: data });
          } },
        render ? render({ data: data, isLeaf: checkIsLeaf(data) }) : this.renderDefault()
      );
    }
  }]);

  return FinderItem;
}(PureComponent), _class.propTypes = {
  render: PropTypes.func,
  data: PropTypes.object,
  // 0: false, 1: remaining, 2: true
  selected: PropTypes.bool,
  opened: PropTypes.bool,
  onSelect: PropTypes.func,
  checkIsLeaf: PropTypes.func.isRequired
}, _class.defaultProps = {
  data: {},
  selected: false,
  opened: false
}, _temp);


export default sortableElement(FinderItem);