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


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchData: [],
            layout: 'guest',
            loading: true,
            pageTitle: '',
            viewHeader: true,
            hideUserPadding: false,
            onlyProfile: false,
        };
        global.app = this;
    }

    componentDidMount() {
        axios.post("http://127.0.0.1:8000/ru/login").then(response => {
            if (response.data.state === "success"){
                global.user = response.data.profile
            }
        });
        // let exceptions = [
        //     global.lang + '/auth/',
        //     global.lang + '/registration/',
        // ];
        //
        // global.getProfile = () => axios.get('/api/profile/', {withCredentials: true}).then((response) => {
        //     if (response.data.state === "success") {
        //         global.profile = response.data.profile;
        //
        //         if (global.profile.is_active === true) {
        //             this.setState({onlyProfile: (global.profile.first_name.length === 0 /*|| global.profile.last_name.length === 0*/)});
        //             let layout = cookies.get('layout');
        //             if (!layout) {
        //                 // axios.post(global.lang + '/logout');
        //                 global.app.setState({layout: 'guest'});
        //             }
        //             if (layout === 'admin') {
        //                 if (response.data.profile.roles.indexOf('ROLE_ADMIN') > -1) {
        //                     global.app.setState({layout: 'admin'});
        //                     if (global._history.location.pathname.length < 8) {
        //                         global._history.push(global.lang + '/admin/');
        //                     }
        //                 }
        //                 else {
        //                     // axios.post(global.lang + '/logout');
        //                     global.app.setState({layout: 'guest'});
        //                 }
        //             }
        //             else if (layout === 'user') {
        //                 if (response.data.profile.roles.indexOf('ROLE_USER') > -1 || response.data.profile.roles.indexOf('ROLE_ADMIN') > -1) {
        //                     global.app.setState({layout: 'user'});
        //                     if (global._history.location.pathname.length < 8 || global._history.location.pathname.indexOf('/registration') > -1) {
        //                         global._history.push(global.lang + '/user/');
        //                     }
        //                 }
        //                 else {
        //                     // axios.post(global.lang + '/logout');
        //                     global.app.setState({layout: 'guest'});
        //                 }
        //             }
        //
        //             if (exceptions.indexOf(global._history.location.pathname) >= 0) {
        //                 // global._history.replace(global.lang + '/admin/users/');
        //             }
        //         } else {
        //             this.setState({layout: 'guest'});
        //         }
        //
        //     } else if (response.data.state === "error") {
        //         // axios.post(global.lang + '/logout');
        //         global.profile = null;
        //         this.setState({layout: 'guest'});
        //         if (exceptions.indexOf(global._history.location.pathname) === -1) {
        //             global._history.replace(global.lang + '/auth/');
        //         }
        //         alert(response.data.message);
        //     }
        // }).catch((e) => {
        //
        //     if ((typeof e.response != 'undefined') && e.response.status === 401) {
        //         this.setState({layout: 'guest'});
        //         if (exceptions.indexOf(global._history.location.pathname) === -1) {
        //             global._history.replace(global.lang + '/');
        //         }
        //     }
        // });
        //
        //
        // global.getProfile();
    }

    _layoutAdmin() {
        return (
            <div style={{height: '100vh', width: '100vw'}}>
                <Sider theme="light" className="sider-menu">
                    <Route path={global.lang + '/admin'} component={LeftMenu} />
                    <Tooltip placement={'right'} title={'Выйти'}>
                        <Button type="link" className="logout" danger
                                onClick={()=>{
                                    // axios.post(global.lang + '/logout', )
                                    //     .then(response =>{
                                    //         global.profile = null;
                                    //         global.app.setState({layout: 'guest'});
                                    //         global._history.replace('/auth');
                                    //     })
                                }}
                        >
                            <LogoutOutlined rotate={180} style={{fontSize:'24px'}} />
                        </Button>
                    </Tooltip>
                </Sider>
                <Layout className="site-layout" style={{marginLeft: '92px', backgroundColor: '#FFFFFF', height: '100vh'}}>
                    <Header style={{display: this.state.viewHeader ? 'block' : 'none', padding: 0, marginBottom: '100px', zIndex: '999', width: 'calc(100% - 92px)', position: 'fixed', minWidth: '1100px'}} className="header" >
                        <Row style={{alignItems: 'center', height: '84px', backgroundColor: '#FFFFFF'}}>
                            <Col><Title level={4} className={"page_title"}>{this.state.pageTitle}</Title></Col>
                        </Row>

                    </Header>
                    <Header style={{display: this.state.viewHeader ? 'block' : 'none', padding: 0, width: 'calc(100% - 92px)', minWidth: '1100px'}} className="header" >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Title level={4} className={"page_title"}>{this.state.pageTitle}</Title>
                            <div style={{ paddingRight: '25px' }}>
                                {/*<NavLink to={global.lang + '/'} className="top_icon" ><QuestionCircleOutlined /></NavLink>*/}
                                {/*<NavLink to={global.lang + '/'} className="top_icon" ><BellOutlined /></NavLink>*/}
                                <Link to={global.lang + '/admin/users/' + global.profile.id + '/edit'} className="top_icon" ><Avatar src={global.profile.image} icon={<UserOutlined />} size="large"/></Link>
                            </div>
                        </div>

                    </Header>
                    <Content style={{overflow: 'initial', padding: '0 5px 0 0', marginTop: '10px'}}>
                        <Switch>
                            {this._renderRoute(routesAdmin, true)}
                        </Switch>
                    </Content>
                </Layout>
            </div>
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