import React from 'react';
import {Form, Input, Button, Checkbox, Row, Col, Layout, Typography, Divider, Tooltip, Tabs} from 'antd';
import Animate from 'rc-animate';
import Icon, {LockOutlined} from '@ant-design/icons';
import Cookies from 'universal-cookie';
import ReCAPTCHA from "react-google-recaptcha";
import {NavLink} from "react-router-dom";

const cookies = new Cookies();


const querystring = require('querystring');
const axios = require('axios');
const {Content, Sider} = Layout;
const {Title, Text} = Typography;
const {TabPane} = Tabs;

const recaptchaRef = React.createRef();
const form = React.createRef();

export default class Registration extends React.Component {

    constructor(props) {
        super(props);

        this.verifyCallback = this.verifyCallback.bind(this);

        this.state = {
            activeKey: '1',
            show: 'user',
            wait: true,
            validate: false,
            help: false,
            isVerify: false,
            verifyResp: null,
            isDisableSubmit: false
        }
    }

    componentDidMount() {

    }

    onSubmit = () => {
        const recaptchaValue = recaptchaRef.current.getValue();
        this.props.onSubmit(recaptchaValue);
    }

    verifyCallback(response) {
        if (response) {
            this.setState({isVerify: true, verifyResp: response});
        }
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
                            <Title style={{fontSize: '48px', marginBottom: '30px'}} level={1}>Регистрация</Title>
                            <div style={{maxWidth: '300px'}}>
                                <Form
                                    ref={form}
                                    autoComplete={'off'}
                                    colon={false}
                                    name="register"
                                    initialValues={{
                                        remember: true,
                                        username: null,
                                        first_name: null,
                                        phone: null,
                                        password: null,
                                        'g-recaptcha-response': null
                                    }}
                                    // onError={(err)=>{console.log(err);}}
                                    onFinishFailed={(errorInfo) => {
                                        this.setState({validate: 'error'});
                                    }}
                                    onFinish={(values) => {
                                        if (this.state.isVerify) {
                                            this.setState({validate: 'validating', help: false});
                                            axios.post(global.lang + '/signup', global.serialize(values), {withCredentials: true})
                                                .then(response => {
                                                    if (response.data.state === "success") {
                                                        cookies.set('layout', 'user', {path: '/'});
                                                        global.app.setState({layout: 'user', validate: false});
                                                        //global._history.replace(global.lang + '/user/');
                                                        global._history.push(global.lang + '/user/settings');
                                                    } else {
                                                        // global.openNotification('Ошибка', response.data.message, 'error');
                                                        this.setState({validate: 'error', help: response.data.message, isDisableSubmit: false});
                                                    }
                                                })
                                        }
                                    }}
                                    onChange={(values) => {
                                        let fields = form.current.getFieldsValue();
                                        let isDisableSubmit = true;

                                        for (let k in fields) {
                                            if (fields[k] === null || form.current.getFieldError(k).length > 0) {
                                                isDisableSubmit = false;
                                            }
                                        }
                                        if(this.state.validate === 'errors'){
                                            isDisableSubmit = false;
                                        }

                                        this.setState({ isDisableSubmit });
                                    }}

                                >
                                    <Form.Item
                                        validateStatus={this.state.validate}
                                        name="username"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Пожалуйста, введите email',
                                            },
                                        ]}
                                        help={this.state.help}
                                        requiredmark={''}
                                    >
                                        <Input placeholder={"Ваш email"} />
                                    </Form.Item>

                                    <Form.Item
                                        validateStatus={this.state.validate}
                                        name="first_name"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Пожалуйста, введите имя',
                                            },
                                        ]}
                                        requiredmark={''}
                                    >
                                        <Input placeholder={"Ваше имя"} />
                                    </Form.Item>

                                    <Form.Item
                                        validateStatus={this.state.validate}
                                        name="phone"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Пожалуйста, введите телефон',
                                            },
                                        ]}
                                        requiredmark={''}
                                    >
                                        <Input placeholder={"+7"} />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Пожалуйста, введите пароль',
                                            },
                                        ]}
                                        requiredmark={''}
                                    >
                                        <Input.Password placeholder={"Придумайте пароль"} />
                                    </Form.Item>
                                    <Form.Item onSubmit={this.onSubmit}
                                               name='g-recaptcha-response'
                                               rules={[
                                                   {
                                                       required: true,
                                                       message: 'Мы должны убедиться, что вы не робот',
                                                   },
                                               ]}
                                    >
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey="6LevtPkeAAAAAD-DevviNVTyTkKfsxWu9BsAiJQx"
                                            onChange={this.verifyCallback}
                                        />
                                    </Form.Item>
                                    <Form.Item onSubmit={this.onSubmit}
                                               name='agree'
                                               rules={[
                                                   {
                                                       required: true,
                                                       message: 'Отметьте если согласны с условиями'
                                                   },
                                               ]}
                                               valuePropName="checked"
                                    >
                                        <Checkbox>Регистрируясь, вы соглашаетесь с&nbsp;<a
                                            href="/terms_of_service.pdf" target="_blank">Условиями предоставления услуг</a>, <a href={'/policy_personal_data.pdf'} target="_blank">Политикой
                                            конфиденциальности и&nbsp;использования файлов cookie</a></Checkbox>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary"
                                                htmlType="submit"
                                                shape="round"
                                                size="large"
                                                loading={this.state.validate === 'validating'}
                                                disabled={!this.state.isDisableSubmit }
                                        >
                                            Зарегистрироваться
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>

                            <div style={{width: '100%', color: '#CCD1D9', marginTop: '100px'}}>
                                <div style={{display: 'inline-block', textAlign: 'left', width: '80%'}}>© «Атма»,
                                    2021–{global.curDate.getFullYear()}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Sider>
            </Layout>
        );
    }
}
