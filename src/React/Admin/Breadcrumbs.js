import React from 'react';
import {Breadcrumb, Menu, Row} from 'antd';
import {NavLink} from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";
const cookies = new Cookies();

const ICONS = require("@ant-design/icons");

export default class Breadcrumbs extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            wait: true,
            layout: cookies.get('layout'),
            crumbs: []
        }
    }

    renderItems() {
        let _items = [];
        if (this.state.crumbs.length) {
            this.state.crumbs.map((item, i) => {
                let CurIcon = undefined;
                if (typeof item.icon != 'undefined') {
                    CurIcon = ICONS[item.icon];
                }
                // console.log(item);
                if (i === this.state.crumbs.length-1) {
                    _items.push(
                        <Breadcrumb.Item key={i}>
                            {typeof item.icon != 'undefined' && typeof CurIcon != 'undefined' && <CurIcon style={{marginRight: '6px'}}/>}
                            <span>{item.name}</span>
                        </Breadcrumb.Item>
                    )
                }
                else {
                    _items.push(
                        <Breadcrumb.Item key={i}>
                            <NavLink key={i} to={global.lang + item.path} style={{color: '#1790FF'}}>
                                {typeof item.icon != 'undefined' && typeof CurIcon != 'undefined' && <CurIcon style={{marginRight: '6px'}}/>}
                                <span>{item.name}</span>
                            </NavLink>
                        </Breadcrumb.Item>
                    )
                }

            })
        }

        return _items;
    }

    componentDidMount() {
        // console.log(this.props.crumbs);
        if (this.props.crumbs.length) {
            axios.post('/api/web/get-name-breadcrumbs/', this.props.crumbs, {withCredentials: true})
                .then(response => {
                    if (response.data.state === 'success') {
                        this.setState({crumbs: response.data.crumbs, wait: false})
                    } else {

                    }
                });
        }
    }

    render() {
        if (this.state.wait) {
            return (<></>);
        }

        if (this.state.layout === 'user'  ) {
            return (
                <div style={{
                    position: 'fixed',
                    top: '30px',
                    left: '230px',
                    zIndex: '999'
                }}>
                    <Breadcrumb>
                        {this.renderItems()}
                    </Breadcrumb>
                </div>
            )
        }

        return (
            <Row type="flex" justify="left" align="left" className="admin-breadcrumbs">
                <Breadcrumb>
                    {this.renderItems()}
                </Breadcrumb>
            </Row>
        );
    }
}
