import 'antd/dist/antd.less';
import './sass/app.scss';
import './sass/main-component.scss'

import './sass/user.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Layout, Button, Tooltip, notification} from 'antd';
import {
    Router,
    Switch,
    Route,
} from "react-router-dom";
import routesAdmin from "../../config/routes_react_admin";
import routesUser from "../../config/routes_react_user";
import routesGuest from "../../config/routes_react_guest";

import {createBrowserHistory} from "history";
import {
    LogoutOutlined,
    CheckOutlined,
    WarningOutlined,
    CloseOutlined,
} from "@ant-design/icons";

import { UserHeader } from './User/Components';
import ProfileEdit from "./User/ProfileEdit";
import ApiRoutes from "./Routes/ApiRoutes";

const axios = require('axios');
const {Header, Content} = Layout;

global.host = '';
global.lang = '/ru';
global.profile = null;
global.app = null;
global._history = createBrowserHistory();
global.getProfile = null;

String.prototype.format = String.prototype.f = function(){
    let args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m,n){
        return args[n] ? args[n] : m;
    });
};

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
};

global.openNotification = function(message, description = '', type = 'success') {
    notification.open({
        message: message,
        description: description,
        icon: type === 'success' ? <CheckOutlined style={{ color: '#108ee9' }} /> : (type === 'warn' ? <WarningOutlined  style={{color: 'darkorange'}} /> : <CloseOutlined style={{color:"red"}} />) ,
    });
};

global.numWord = (number, words, returnNum=true) => {
    let num = Math.abs(number) % 100;
    if(num > 19) {
        num = num % 10
    }
    let out = (returnNum) ? `${num} ` : ""
    switch (num) {
        case 1:  out += words[0]; break;
        case 2:
        case 3:
        case 4:  out += words[1]; break;
        default: out += words[2]; break;
    }
    return out;
}

axios.defaults.headers.common = {
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
};

global.user = {};
global.layout = false;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layout: false,
            wait: true,
        };

        global.app = this;
    }

    componentDidMount() {
        this.setState({wait: true});
        global.getProfile = () => axios.post(ApiRoutes.API_LOGIN)
            .then(response => {
                switch (response.data?.state) {
                    case "success":
                        global.user = response.data?.profile;
                        if (global.user?.is_active === true) {
                            if (global.user.roles.indexOf('ROLE_ADMIN') > -1 || global.user.roles.indexOf('ROLE_DEVELOPER') > -1) {
                                this.setState({layout: 'admin'});
                                global.layout = 'admin';
                            } else if (global.user.roles.indexOf('ROLE_USER') > -1) {
                                this.setState({layout: 'user'});
                                global.layout = 'user';
                            } else {
                                this.setState({layout: 'guest'});
                                global.layout = 'guest';
                            }
                        }
                        break;
                    default:
                        this.setState({layout: 'guest'});
                        global.layout = 'guest';
                        break;
                }
                this.setState({wait: false})
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
        if (this.state.layout && this.state.onlyProfile) {
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