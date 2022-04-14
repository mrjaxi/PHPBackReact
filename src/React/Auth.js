import React from 'react';
import {Form, Input, Button, Checkbox, Row, Col, Layout, Typography, Divider, Tooltip, Tabs} from 'antd';
import Animate from 'rc-animate';
import Icon, {LockOutlined} from '@ant-design/icons';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

const querystring = require('querystring');
const axios = require('axios');
const {Content, Sider} = Layout;
const {Title, Text} = Typography;
const {TabPane} = Tabs;

export default class Auth extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            activeKey: '1',
            show: 'user',
            wait: true,
            validate: false,
            help: false,
        }
    }

    componentDidMount() {
        //console.log('auth');
    }

    _form = () => {
        return (
            <div style={{maxWidth: '300px'}}>
                <Form
                    name="login"
                    initialValues={{
                        remember: true,
                    }}
                    // onError={(err)=>{console.log(err);}}
                    onFinishFailed={(errorInfo) => {
                        this.setState({validate: 'error'});
                    }}
                    onFinish={(values) => {
                        this.setState({validate: 'validating', help: false});
                        axios.post(global.lang + '/login', global.serialize(Object.assign({as_an_administrator: this.state.show === 'admin'}, values)), {withCredentials: true})
                            .then(response => {
                                if (response.data.state === "success") {

                                    global.profile = response.data.profile;
                                    if (response.data.profile.is_active === true) {
                                        console.log(this.state.show);
                                        console.log(response.data.profile);
                                        if (this.state.show === 'admin') {
                                            if (response.data.profile.roles.indexOf('ROLE_ADMIN') > -1) {
                                                cookies.set('layout', 'admin', {path: '/'});
                                                global.app.setState({layout: 'admin', validate: false});
                                                global._history.replace(global.lang + '/admin/maps/');
                                            } else {
                                                this.setState({
                                                    validate: 'error',
                                                    help: 'Доступ запрещен'
                                                })
                                                axios.post(global.lang + '/logout');
                                            }
                                        } else if (this.state.show === 'user') {
                                            if (response.data.profile.roles.indexOf('ROLE_USER') > -1 || response.data.profile.roles.indexOf('ROLE_ADMIN') > -1) {
                                                cookies.set('layout', 'user', {path: '/'});
                                                global.app.setState({layout: 'user', validate: false});
                                                global._history.replace(global.lang + '/user/');
                                            } else {
                                                this.setState({
                                                    validate: 'error',
                                                    help: 'Доступ запрещен'
                                                })
                                                axios.post(global.lang + '/logout');
                                            }

                                            if (global._history.location.pathname.replace(global.lang, '') == '/user/') {
                                                if(global.profile.system_list.length > 0){
                                                    global._history.push(global.lang + '/user/systems-list');
                                                } else {
                                                    global._history.push(global.lang + '/user/settings');
                                                }
                                            }
                                        }
                                    } else {
                                        this.setState({
                                            validate: 'error',
                                            help: 'Аккаунт заблокирован'
                                        })
                                        axios.post(global.lang + '/logout');
                                    }

                                } else {
                                    this.setState({
                                        validate: 'error',
                                        help: response.data.message
                                    })
                                    axios.post(global.lang + '/logout');
                                }
                            })
                    }}
                >
                    <Form.Item
                        label={<></>}
                        validateStatus={this.state.validate}
                        name="username"
                        rules={[
                            {
                                required: true,
                                // message: 'Пожалуйста, введите логин!',
                            },
                        ]}
                    >
                        <Input placeholder={"Электронная почта"}/>
                    </Form.Item>

                    <Form.Item
                        label={<></>}
                        help={this.state.help}
                        validateStatus={this.state.validate}
                        name="password"
                        rules={[
                            {
                                required: true,
                                // message: 'Пожалуйста, введите пароль!',
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder={"Пароль"}/>
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Запомнить меня</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" shape="round" size="large"
                                loading={this.state.validate === 'validating'}>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
    callback = (key) => {
        this.setState({activeKey: key});
        // console.log(key);
    }
    render() {
        return (
            <Layout style={{height: '100vh'}}>
                <Content style={{backgroundImage: 'url(/i/default-background.png)', backgroundSize: 'cover'}}>
                    <div style={{width: '100%', height: '100%', backgroundColor: '#1790FF', opacity: '0.48'}}></div>
                </Content>
                <Sider className={'login-sider'}>
                    <Row type="flex" justify="center" align="middle" style={{height: '100vh'}}>
                        <Col span={18} style={{position: 'relative'}}>
                            <Tabs className={"auth-tabs"} activeKey={this.state.activeKey} animated={true} onChange={this.callback}>
                                <TabPane tab="Tab 1" key="1" onChange={this.callback}>
                                    <Title style={{fontSize: '48px', marginBottom: '80px'}} level={1}>Авторизация</Title>
                                    <div style={{position: 'absolute', left: '-24px', top: '70px'}}>
                                        <Text style={{fontSize: '22px'}}>— Обучение и интеграция сотрудников </Text>
                                    </div>
                                    {this._form()}
                                    <Divider style={{margin: '40px 0'}}/>
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            marginRight: '40px',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        <Tooltip title={'В разработке'} placement={'bottom'}>
                                            <img src={'/i/app-store.svg'}
                                                 width={'150px'}
                                                 height={'50px'}/>
                                        </Tooltip>
                                    </div>
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        <Tooltip title={'В разработке'} placement={'bottom'}>
                                            <img src={'/i/google-play.svg'}
                                                 width={'150px'}
                                                 height={'50px'}/>
                                        </Tooltip>
                                    </div>
                                    <div style={{width: '100%', color: '#CCD1D9', marginTop: '100px'}}>
                                        <div style={{display: 'inline-block', textAlign: 'left', width: '80%'}}>© «Атма»,
                                            2021–{global.curDate.getFullYear()}
                                        </div>
                                        <div style={{display: 'inline-block', textAlign: 'right', width: '19%'}}>
                                            <LockOutlined
                                                style={{
                                                    fontSize: '20px'
                                                }}
                                                onClick={() => {
                                                    this.setState({show: 'admin', activeKey: '2', validate: false, help: false})
                                                }}
                                            />
                                        </div>
                                    </div>
                                </TabPane>
                                <TabPane tab="Tab 2" key="2">
                                    <Title style={{fontSize: '48px', marginBottom: '80px'}} level={1}>atmaguru</Title>
                                    <div style={{position: 'absolute', left: '-24px', top: '70px'}}><Text
                                        style={{fontSize: '22px'}}>— Войти как администратор </Text></div>
                                    {this._form()}
                                    <Divider style={{margin: '40px 0'}}/>

                                    <Button type="default" shape="round" size="large"
                                            onClick={() => {
                                                this.setState({show: 'user', activeKey: '1', validate: false, help: false})
                                            }}
                                    >Назад</Button>
                                </TabPane>
                                <TabPane tab="Tab 3" key="3">
                                    Content of Tab Pane 3
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </Sider>
            </Layout>
        );
    }
}
