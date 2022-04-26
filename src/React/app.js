import 'antd/dist/antd.less';
import './sass/app.scss';
import './sass/main-component.scss'

import './sass/user.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Layout, Row, Col, Input, Avatar, Typography, Button, Tooltip, Form, Checkbox, notification} from 'antd';
import {ReactFlowProvider} from 'react-flow-renderer';
import {
    Router,
    Switch,
    Route,
    Link,
    NavLink
} from "react-router-dom";
import routesAdmin from "../../config/routes_react_admin";
import routesUser from "../../config/routes_react_user";
import routesGuest from "../../config/routes_react_guest";

import {default as LeftMenu} from "./Admin/LeftMenu";
import {default as SystemsPanel} from "./Admin/SystemsPanel";
import {default as Breadcrumbs} from "./Admin/Breadcrumbs";
import {createBrowserHistory} from "history";
import {
    QuestionCircleOutlined,
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
    CheckOutlined,
    WarningOutlined,
    CloseOutlined,
    SwapOutlined
} from "@ant-design/icons";
// import { ReducerProvider } from './Admin/Map/ReactFlow/ReducerContext';

import { UserHeader } from './User/Components';
import {Search} from "./User/Components";
import Cookies from 'universal-cookie';
import ProfileEdit from "./User/ProfileEdit";
const cookies = new Cookies();

const {Header, Content, Footer, Sider} = Layout;
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

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchData: [],
            layout: false,
            loading: true,
            pageTitle: '',
            viewHeader: true,
            hideUserPadding: false,
            onlyProfile: false,
        };
        global.app = this;
    }

    componentDidMount() {
        let exceptions = [
            global.lang + '/auth/',
            global.lang + '/registration/',
        ];

        global.getProfile = () => axios.get('/api/profile/', {withCredentials: true}).then((response) => {
            if (response.data.state === "success") {
                global.profile = response.data.profile;

                if (global.profile.is_active === true) {
                    this.setState({onlyProfile: (global.profile.first_name.length === 0 /*|| global.profile.last_name.length === 0*/)});
                    let layout = cookies.get('layout');
                    if (!layout) {
                        axios.post(global.lang + '/logout');
                        global.app.setState({layout: 'guest'});
                    }
                    if (layout === 'admin') {
                        if (response.data.profile.roles.indexOf('ROLE_ADMIN') > -1) {
                            global.app.setState({layout: 'admin'});
                            if (global._history.location.pathname.length < 8) {
                                global._history.push(global.lang + '/admin/');
                            }
                        }
                        else {
                            axios.post(global.lang + '/logout');
                            global.app.setState({layout: 'guest'});
                        }
                    }
                    else if (layout === 'user') {
                        if (response.data.profile.roles.indexOf('ROLE_USER') > -1 || response.data.profile.roles.indexOf('ROLE_ADMIN') > -1) {
                            global.app.setState({layout: 'user'});
                            if (global._history.location.pathname.length < 8 || global._history.location.pathname.indexOf('/registration') > -1) {
                                global._history.push(global.lang + '/user/');
                            }
                        }
                        else {
                            axios.post(global.lang + '/logout');
                            global.app.setState({layout: 'guest'});
                        }
                    }

                    if (exceptions.indexOf(global._history.location.pathname) >= 0) {
                        // global._history.replace(global.lang + '/admin/users/');
                    }
                } else {
                    this.setState({layout: 'guest'});
                }

            } else if (response.data.state === "error") {
                axios.post(global.lang + '/logout');
                global.profile = null;
                this.setState({layout: 'guest'});
                if (exceptions.indexOf(global._history.location.pathname) === -1) {
                    global._history.replace(global.lang + '/auth/');
                }
                alert(response.data.message);
            }
        }).catch((e) => {

            if ((typeof e.response != 'undefined') && e.response.status === 401) {
                this.setState({layout: 'guest'});
                if (exceptions.indexOf(global._history.location.pathname) === -1) {
                    global._history.replace(global.lang + '/');
                }
            }
        });


        global.getProfile();
    }

    _layoutAdmin() {
        return (
            <div style={{height: '100vh', width: '100vw'}}>
                <Sider theme="light" className="sider-menu">
                    <Route path={global.lang + '/admin'} component={LeftMenu} />
                    <Tooltip placement={'right'} title={'Выйти'}>
                        <Button type="link" className="logout" danger
                                onClick={()=>{
                                    axios.post(global.lang + '/logout', )
                                        .then(response =>{
                                            global.profile = null;
                                            global.app.setState({layout: 'guest'});
                                            global._history.replace('/auth');
                                        })
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


                            // if (Component.name === 'MapHooks') {
                            //     return (
                            //         <>
                            //             {viewBreadcrumbs && breadcrumbs && <Breadcrumbs {...props}/>}
                            //             <Row type="flex" justify="left" align="left" style={{minHeight: '100%'}}>
                            //                 <Col className="main-container">
                            //                     <ReducerProvider>
                            //                         <ReactFlowProvider>
                            //                             <Component {...props} />
                            //                         </ReactFlowProvider>
                            //                     </ReducerProvider>
                            //                 </Col>
                            //             </Row>
                            //         </>
                            //     );
                            // }

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
                                                axios.post(global.lang + '/logout', )
                                                    .then(response =>{
                                                        console.log(response);
                                                        // if (response.state === "success") {
                                                        global.profile = null;
                                                        global.app.setState({layout: 'guest'});
                                                        global._history.replace('/auth');
                                                        // }
                                                    })
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


/*
import './sass/app.scss'
import ReactDOM from 'react-dom';
import React from 'react';
import {Form, Input, Button, Checkbox, Layout} from 'antd';
import axios from "axios";
const {Header, Footer, Sider, Content} = Layout;
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
export default class Dashboard extends React.Component {

    componentDidMount() {
        this.state = {
            token: false
        }
    }

    click = () => {
        axios.post('/api/app_login', {username:'root', password: 'freelord'}, {headers: {'Content-Type': 'application/json'}, withCredentials: true})
            .then(response =>{
                if (response.data.token) {
                    this.setState({token: response.data.token});
                }
                console.log(response);
            })
    }
    click2 = () => {
        if (this.state.token) {
            axios.get('/api/app/profile/', {headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.state.token}, withCredentials: true})
                .then(response =>{
                    console.log(response);
                })
        }
    }
    click3 = () => {
        // let data = {"json":{"id":"97100c9f-d274-4959-9cd9-52e6f858d4b1","type":"test","options":[],"exercise_version":1,"exercise_items":[{"item_version":1,"question":"<p>sdf</p>","type":"radio","testing_id":"688ee69b-6888-4319-9211-8f1026dae2d9","answers":[{"id":39,"title":"sdfsdf","is_checked":true},{"id":40,"title":"sdf","is_checked":false},{"id":41,"title":"sdsd","is_checked":false},{"id":48,"title":"sdfsdf","is_checked":false}]},{"item_version":1,"question":"<p>sdf</p>","type":"checkbox","testing_id":"a761926e-cbfc-46b3-a89e-b230d68f3aa1","answers":[{"id":42,"title":"sdf","is_checked":true},{"id":43,"title":"sdf"},{"id":44,"title":"ssdfd","is_checked":true}]}],"lessonId":"fab76309-3ca8-4759-9673-9bc3f7dc180e"}};
        let data = {"json":{"id":"0ab6c519-d921-4cb6-b29c-9f64304fc827","type":"essay","options":[],"exercise_version":1,"exercise_items":[{"question":"<p><span style=\"color:#000000\"><span style=\"font-size:15px\"><span style=\"background-color:#ffffff\">Маховик, на первый взгляд, аккумулирует далекий Каллисто, а оценить проницательную способность вашего телескопа поможет следующая формула: Mпр.= 2,5lg Dмм + 2,5lg Гкрат + 4. Текстура иллюстрирует друмлин, тем не менее, Дон Еманс включил в список всего 82-е Великие Кометы. Исходя из астатической системы координат Булгакова, неконсервативная сила даёт более простую систему дифференциальных уравнений, если исключить эрозионный Тукан, что обусловлено не только первичными неровностями эрозионно-тектонического рельефа поверхности кристаллических пород, но и проявлениями долее поздней блоковой тектоники. Присоединение органического вещества пластично трансформирует основной уход гироскопа. Кварц, оценивая блеск освещенного металического шарика, учитывает гравитационный радиант.</span></span></span></p>","type":"essay","result":"Это текст который написал я. И он скорее всего неверный"}],"lessonId":"fab76309-3ca8-4759-9673-9bc3f7dc180e"}};
        if (this.state.token) {
            axios.post('/api/app/map-item/fab76309-3ca8-4759-9673-9bc3f7dc180e/save/', data, {headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.state.token}, withCredentials: true})
                .then(response =>{
                    console.log(response);
                })
        }
    }
    render() {
        return (
            <>
                <Button onClick={this.click}>Start</Button>
                <Button onClick={this.click2}>Profile</Button>
                <Button onClick={this.click3}>Send</Button>
            </>
        );
    }
}

ReactDOM.render(<Dashboard/>, document.getElementById('app'));

*/
/*
import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const props = {
    name: 'file',
    action: '/api/app/save-file/',
    headers: {
        authorization: 'authorization-text',
    },
    onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};

ReactDOM.render(
    <Upload {...props}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
    </Upload>,
    document.getElementById('app'),
);
*/
