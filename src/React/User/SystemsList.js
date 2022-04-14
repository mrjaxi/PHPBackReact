    import React from 'react';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Row,
    Col,
    Layout,
    Typography,
    Divider,
    Tooltip,
    Tabs,
    Select,
    InputNumber,
    Avatar,
    List
} from 'antd';

import InfiniteScroll from 'react-infinite-scroll-component';
import Icon, {LockOutlined, UserOutlined, ArrowRightOutlined} from '@ant-design/icons';
import Cookies from 'universal-cookie';
import ReCAPTCHA from "react-google-recaptcha";
import {NavLink} from "react-router-dom";
const cookies = new Cookies();

const querystring = require('querystring');
const axios = require('axios');
const {Content, Sider} = Layout;
const {Title, Text} = Typography;
const {TabPane} = Tabs;
const { Option } = Select;
const data = [
    {
        title: 'dev.atmaguru.ru',
        description: 'Последний вход — 15 декабря 2021',
        link: null
    },
    {
        title: 'prod.atmaguru.ru',
        description: 'Последний вход — 20 января 2022',
        link: null
    },
    {
        title: 'test.atmaguru.ru',
        description: 'Последний вход — 17 октября 2021',
        link: null
    }
];


export default class Settings extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            activeKey: '1',
            show: 'user',
            wait: true,
            validate: false,
            help: false,
            account: {}
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            global.getProfile();
            this.forceUpdate();

        }, 5000);
    }

    componentWillUnmount() {
        if(this.interval){
            clearInterval(this.interval);
        }
    }

    renderButton(link) {
        if(link != null){
            return  <form action={ link + '/ru/login' } method="post" target="_blank">
                        <input type="hidden" name="username" value={global.profile.username} />
                        <input type="hidden" name="password" value={global.profile.open_password} />
                        <input type="hidden" name="as_an_administrator" value="true" />
                        <input type="hidden" name="remember" value="true" />

                        <Button htmlType="submit" shape="circle" icon={<ArrowRightOutlined />} size="large"
                            // onClick={()=>{
                            //        // window.location.assign(link);
                            // }}
                        />
                    </form>
        } else {

            return <Button disabled={true} shape={"round"} name={'Подготовка...'} icon={<ArrowRightOutlined />} size="large" loading >Подготовка...</Button>
        }
    }

    render() {
        return (
            <Layout style={{height: '100vh'}}>
                <Content style={{backgroundImage: 'url(/i/default-background.png)', backgroundSize: 'cover', width: 'calc(100% - 870px)'}}>
                    <div style={{width: '100%', height: '100%', backgroundColor: '#1790FF', opacity: '0.48'}}></div>
                </Content>
                <Sider className={'login-sider user'}>
                    <div style={{position: 'relative', display: 'inline-block', width: '570px', padding: '20px 50px 20px 50px', verticalAlign: 'top', height: '100%'}}>
                            <div style={{maxWidth: '600px', height: '100%'}}>
                                <table align="center" valign="middle" cellPadding={0} cellSpacing={0} style={{width: '100%', height: '100%'}}>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <div style={{margin: '0 0 20px 0', backgroundImage: 'url(/i/atmaguru-logo.svg)', width: '210px', height: '50px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div>
                                            <Text style={{fontSize: '23px'}}>Вы авторизованы как</Text>
                                            <div style={{margin: '40px 0 30px 0'}}>
                                                <Avatar size={80} src={''} icon={<UserOutlined />} style={{display:"inline-block", verticalAlign: 'top'}}/>
                                                <div style={{display: 'inline-block', padding: '10px 0 10px 20px'}}>
                                                    <div><Text style={{fontSize: '16px'}}>{ global.profile.first_name + ' ' + global.profile.last_name }</Text></div>
                                                    <div><Text style={{fontSize: '12px', color: '#AAB2BD'}} italic>{global.profile.email}</Text></div>
                                                </div>
                                            </div>
                                            <div id="scrollableDiv" className={'system-list-list'}>
                                                <List
                                                    itemLayout="horizontal"
                                                    dataSource={global.profile.system_list}
                                                    renderItem={item => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                title={<Title level={3} style={{ marginBottom: 0 }}>{ item.title }</Title>}
                                                                description={<Text style={{fontSize: '12px', color: '#AAB2BD'}}>{item.description}</Text>}
                                                            />
                                                            <div>{ this.renderButton(item.link) }</div>
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                            <div style={{ marginTop: '40px' }}>
                                                <Button className={'btn-system-list'} size="large" type="primary" shape="round"
                                                        onClick={()=>{
                                                            //window.location.assign(global.lang + '/user/settings');
                                                            global._history.push(global.lang + '/user/settings');
                                                        }}
                                                >Создать новый Атмагуру</Button>
                                                <Button className={'btn-system-list'} style={{ marginLeft: '20px' }} size="large" type="link"
                                                        onClick={()=>{
                                                            axios.post(global.lang + '/logout', )
                                                                .then(response =>{
                                                                    global.profile = null;
                                                                    global.app.setState({layout: 'guest'});
                                                                    global._history.replace('/auth');
                                                                })
                                                        }}>Сменить авторизацию</Button>
                                            </div>

                                            <div style={{width: '100%', color: '#CCD1D9', marginTop: '100px'}}>
                                                <div style={{display: 'inline-block', textAlign: 'left', width: '80%', position: 'absolute', bottom: '20px'}}>© «Атма»,
                                                    2021–{global.curDate.getFullYear()}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                </Sider>
            </Layout>
        );
    }
}
