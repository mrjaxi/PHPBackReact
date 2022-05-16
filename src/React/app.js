import 'antd/dist/antd.less';
import './sass/app.scss';
import './sass/main-component.scss'

import './sass/user.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Layout, Row, Col, Avatar, Typography, Button, Tooltip, notification} from 'antd';
import {
    Router,
    Switch,
    Route,
    Link,
} from "react-router-dom";
import routesAdmin from "../../config/routes_react_admin";
import routesUser from "../../config/routes_react_user";
import routesGuest from "../../config/routes_react_guest";

import Cookies from 'universal-cookie';
const cookies = new Cookies();


import {default as LeftMenu} from "./Admin/LeftMenu";
import {createBrowserHistory} from "history";
import {
    UserOutlined,
    LogoutOutlined,
    CheckOutlined,
    WarningOutlined,
    CloseOutlined,
} from "@ant-design/icons";

import { UserHeader } from './User/Components';
import ProfileEdit from "./User/ProfileEdit";

const {Header, Content, Sider} = Layout;
const {Title} = Typography;

global.host = '';
global.lang = '/ru';
global.profile = null;
global.app = null
global._history = createBrowserHistory();
global.getProfile = null;

global.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
global.convertArrayToObject = function (arr) {
    let result = {};
    for (let i = 0; i < arr.length; i++) {
        result[arr[i].key] = arr[i];
    }
    return result;
}
global.serialize = function(obj, prefix) {
    let str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

global.openNotification = function(message, description = '', type = 'success') {
    notification.open({
        message: message,
        description: description,
        icon: type === 'success' ? <CheckOutlined style={{ color: '#108ee9' }} /> : (type === 'warn' ? <WarningOutlined  style={{color: 'darkorange'}} /> : <CloseOutlined style={{color:"red"}} />) ,
    });
}
const axios = require('axios');
axios.defaults.headers.common = {
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
};

let today = new Date();
global.curDate = today;
global.user = {};
global.layout = false;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layout: false,
        };

        global.app = this;
    }

    componentDidMount() {
        global.getProfile = () => axios.post("http://127.0.0.1:8000/ru/login").then(response => {
            if (response.data.state === "success") {
                global.user = response.data.profile;

                if (response.data.profile.is_active === true) {
                    if (response.data.profile.roles.indexOf('ROLE_ADMIN') > -1 || response.data.profile.roles.indexOf('ROLE_DEV') > -1) {
                        this.setState({layout: 'admin'});
                        global.layout = 'admin';
                    } else if (response.data.profile.roles.indexOf('ROLE_USER') > -1) {
                        this.setState({layout: 'user'});
                        global.layout = 'user';
                    } else {
                        this.setState({layout: 'guest'});
                        global.layout = 'guest';
                    }
                }
            } else {
                this.setState({layout: 'guest'});
                global.layout = 'guest';
            }

            console.log(global.layout)
        });
        global.getProfile();
    }

    _layoutAdmin() {
        return (
            <Switch>
                {this._renderRoute(routesAdmin, true)}
            </Switch>
        );
    }

    _layoutUser() {
        return (
            <Switch>
                {this._renderRoute(routesUser, true)}
            </Switch>
        );
    }

    _layoutGuest() {
        return (
            <Switch>
                {this._renderRoute(routesGuest, false)}
            </Switch>
        );
    }

    _renderRoute(routes, breadcrumbs = false) {
        let _items = [];

        routes.map(({path, name, Component, viewBreadcrumbs}, key) => {

            if (Component.name === 'Auth' && false) {
                // _items.push(
                //     <Route exact={} path="/" key={key} >
                //         <Component />
                //     </Route>
                // )
            }
            else {
                _items.push(
                    <Route
                        exact
                        path={'/:locale(ru|en)?' + path}
                        key={key}
                        render={props => {
                            //Формируется нужный массив для breadcrumbs
                            props.crumbs = routes
                                .filter(({path}) => props.match.path.includes(path))
                                .map(({path, ...rest}) => ({
                                    path: Object.keys(props.match.params).length
                                        ? Object.keys(props.match.params).reduce(
                                            (path, param) => path.replace(
                                                `:${param}`, props.match.params[param]
                                            ), path
                                        )
                                        : path,
                                    ...rest
                                }));

                            return (
                                <>
                                    <Component {...props} />
                                </>
                            );

                        }}
                    />
                )
            }
        });
        return _items;
    }

    render() {

        if (!this.state.layout) {
            return (
                <></>
            )
        }
        else if (this.state.layout && this.state.onlyProfile) {
            return (
                <Layout>
                    <Router history={global._history}>
                        <div className={'u'}>
                        <Layout style={{height: '100vh'}}>
                            <Header className={ 'u_header' }>
                                <UserHeader searchBarVisibility={false} />
                            </Header>
                            <Content className={'u_content' + (!this.state.hideUserPadding ? ' u_content_padding' : '')}>

                                <Tooltip placement={'top'} title={'Выйти'}>
                                    <Button type="link" className={'u_logout'} danger
                                            style={{display: (!this.state.hideUserPadding ? 'block' : 'none')}}
                                            onClick={()=>{
                                                // axios.post(global.lang + '/logout', )
                                                //     .then(response =>{
                                                //         console.log(response);
                                                //         // if (response.state === "success") {
                                                //         global.profile = null;
                                                //         global.app.setState({layout: 'guest'});
                                                //         global._history.replace('/auth');
                                                //         // }
                                                //     })
                                            }}
                                    >
                                        <LogoutOutlined rotate={180} style={{fontSize:'24px'}} />
                                    </Button>
                                </Tooltip>
                                <ProfileEdit {...this.props} />
                            </Content>
                        </Layout>
                    </div>
                    </Router>
                </Layout>
            )
        }
        return (
            <Router history={global._history}>
                <Layout>
                    {this.state.layout === 'user' && this._layoutUser()}
                    {this.state.layout === 'admin' && this._layoutAdmin()}
                    {this.state.layout === 'guest' && this._layoutGuest()}
                </Layout>
            </Router>
        );

    }
}

ReactDOM.render(<App/>, document.getElementById('app'));