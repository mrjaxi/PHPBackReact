import React from 'react';
import {Button, Col, Menu, Tooltip} from 'antd';
import {NavLink} from "react-router-dom";
import routesAdmin from "../.././../config/routes_react_admin";

const ICONS = require("@ant-design/icons");

const axios = require('axios');

export default class LeftMenu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            wait: true,
            items: [],
            selected: []
        }
    }

    renderItems() {
        let _items = [];
        if (routesAdmin.length > 0) {
            routesAdmin.map((item, i)=>{
                if (typeof item.left_menu != 'undefined' && item.left_menu){
                    let CurIcon = ICONS[item.icon];
                    if (typeof item.disabled !== 'undefined' && item.disabled === true) {
                        _items.push(
                            <Tooltip  placement={'right'} key={i} title={'В разработке'}><span style={{cursor:'not-allowed'}} className="left_menu" ><CurIcon /></span></Tooltip>
                        );
                    }
                    else {
                        _items.push(
                            <Tooltip placement={'right'} key={i} title={item.name}><NavLink to={global.lang + item.path} className="left_menu" activeClassName="active"><CurIcon /></NavLink></Tooltip>
                        );
                    }
                }
            })
        }

        return _items;
    }

    componentDidMount(){
        let selected = this.props.location.pathname.slice(7).split('/');
        this.setState({wait : false, selected : [selected[0]]});
    }

    render() {
        return (
            <>
                {this.renderItems()}
            </>

        );
    }
}
