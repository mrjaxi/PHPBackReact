import _extends from 'babel-runtime/helpers/extends';
import isEmpty from 'lodash/isEmpty';

function mockArray(maxLength) {
    return Array.apply(null, new Array(Math.floor(Math.random() * maxLength)));
}

var noop = function noop() {};

export function mockTree() {
    var deep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

    if (deep > 0) {
        return mockArray(100).map(function (_, i) {
            return {
                key: deep + '-' + i + '-' + Math.random(),
                children: mockTree(deep - 1)
            };
        });
    }
}

/**
 * 遍历树，DFS
 * @param tree array e.g. [{ a: 1, children: [{ a: 2, children: [] }, ...] }, ...]
 * @param callback function (node, loc, parentNode) => {} return false explicitly will end travel.
 * @param options object { childrenName, parentLoc }
 * @return boolean if travel to end
 */
export function travelTree(tree) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _options$childrenName = options.childrenName,
        childrenName = _options$childrenName === undefined ? 'children' : _options$childrenName,
        _options$parentLoc = options.parentLoc,
        parentLoc = _options$parentLoc === undefined ? [] : _options$parentLoc,
        _options$parentNode = options.parentNode,
        parentNode = _options$parentNode === undefined ? null : _options$parentNode;


    if (!tree) return false;
    for (var i = 0; i < tree.length; i++) {
        var node = tree[i];
        var curLoc = parentLoc.concat(i);
        if (callback(node, curLoc, parentNode) === false) {
            return false;
        }
        if (!isEmpty(node[childrenName])) {
            if (travelTree(node[childrenName], callback, _extends({}, options, { parentLoc: curLoc, parentNode: node })) === false) {
                return false;
            }
        }
    }
    return true;
}

/**
 * 在树中找到某个节点
 * @param tree
 * @param predicate function (node, loc, parentNode) => bool
 * @param options see travelTree
 */
export function findInTree(tree) {
    var predicate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _options$withAppendDa = options.withAppendData,
        withAppendData = _options$withAppendDa === undefined ? false : _options$withAppendDa;

    var result = { loc: [] };
    travelTree(tree, function (node, loc, parentNode) {
        if (predicate(node, loc, parentNode)) {
            result = { node: node, loc: loc, parentNode: parentNode };
            return false;
        }
        return true;
    }, options);

    if (withAppendData) return result;
    return result.node;
}

/**
 * 根据位置信息得到路径上的所有节点
 * @param tree
 * @param loc
 * @param options
 */
export function atTreePath(tree) {
    var loc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _options$childrenName2 = options.childrenName,
        childrenName = _options$childrenName2 === undefined ? 'children' : _options$childrenName2;


    var result = [];
    for (var i = 0; i < loc.length; i++) {
        var index = loc[i];
        var targetList = tree;
        if (result.length > 0) targetList = result[result.length - 1][childrenName];
        result.push(targetList[index]);
    }
    return result;
}