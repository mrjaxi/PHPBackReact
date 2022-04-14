import React from 'react';
import {Form, Input, Button, Layout, Typography, Tooltip, Tabs, Select, InputNumber, Checkbox} from 'antd';
import Icon, {ReloadOutlined} from '@ant-design/icons';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

const querystring = require('querystring');
const axios = require('axios');
const {Content, Sider} = Layout;
const {Title, Text} = Typography;
const {TabPane} = Tabs;
const { Option } = Select;

const cancelTokenSource = axios.CancelToken;
let cancel;

export default class Settings extends React.Component {
    formRef = React.createRef();
    constructor(props) {
        super(props);

        this.state = {
            activeKey: '1',
            show: 'user',
            wait: true,
            validate: false,
            help: false,
            settingsBranch: [],
            settingsPosition: [],
            domainValue: ''
       }
    }


    componentDidMount() {
        axios.get('/api/system/settings/')
            .then(response => {
                if (response.data.state === "success") {
                    this.setState({settingsBranch: response.data.settingsData.branch});
                    this.setState({settingsPosition: response.data.settingsData.position});
                }
            });

        this.generateDomain();
    }

    renderOptions(items) {
        let _options = [];
        if (items.length > 0) {
            items.map((item) => {
                _options.push(
                    <Option value={item.key} key={item.key}>{item.title}</Option>
                );
            })
        }
        return _options;
    }
    checkDomain(value){
        if(value.length >= 2){
            if (cancel !== undefined) {
                cancel();
            }
            axios.get('/api/system/check-domain/?domain=' + value, {withCredentials: true, cancelToken: new cancelTokenSource(function executor(c) {cancel = c;}) })
                .then(response => {
                    if (response.data.state === "success") {
                        this.setState({
                            validateStatus: 'success',
                            help: false
                        });
                    } else {
                        this.setState({
                            validateStatus: 'error',
                            help: response.data.error
                        });
                    }
                });
        }
    }
    generateDomain(){
        axios.get('/api/system/check-domain/?is_gen=1')
            .then(response => {
                if (response.data.state === "success") {
                    this.formRef.current.setFieldsValue({
                        id: 0,
                        domain: response.data.domain
                    });
                    // this.setState({
                    //     validateStatus: 'success',
                    //     help: null
                    // });
                }
            });
    }

    render() {
        return (
            <Layout style={{height: '100vh'}}>
                <Content style={{backgroundImage: 'url(/i/default-background.png)', backgroundSize: 'cover', width: 'calc(100% - 870px)'}}>
                    <div style={{width: '100%', height: '100%', backgroundColor: '#1790FF', opacity: '0.48'}}></div>
                </Content>
                <Sider className={'login-sider user setting'}>
                    <div style={{height: '100vh', verticalAlign: 'top', borderRadius: '30px 0 0 30px'}}>
                        <div style={{position: 'relative', display: 'inline-block', width: '619px', padding: '20px 50px 20px 50px', verticalAlign: 'top', height: '100%'}}>
                            <div style={{maxWidth: '600px', height: '100%'}}>
                                <table align="center" valign="middle" cellPadding={0} cellSpacing={0} style={{width: '100%', height: '100%'}}>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <Title style={{marginBottom: '30px'}} level={3}>Пожалуйста, ответьте на 7 вопросов для настройки вашего аккаунта</Title>
                                            <Form
                                                labelCol={{ span: 10 }}
                                                wrapperCol={{ span: 14 }}
                                                name="setting"
                                                ref={this.formRef}
                                                labelAlign="left"
                                                labelWrap
                                                colon={false}
                                                initialValues={{
                                                    name: null,
                                                    domain: null,
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
                                                    this.setState({validate: 'validating', help: false});
                                                    axios.post('/api/system/settings/', global.serialize(values), {withCredentials: true}).then(response => {
                                                        if (response.data.state === "success") {
                                                            //global._history.push(global.lang + '/user/systems-list');
                                                            window.location.assign(global.lang + '/user/systems-list');
                                                        } else {
                                                            global.openNotification('Ошибка', response.data.message, 'error');
                                                        }
                                                    });
                                                }}
                                            >
                                                <Form.Item
                                                    label={"Название компании"}
                                                    validateStatus={this.state.validate}
                                                    name="name"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Пожалуйста, введите название',
                                                        },
                                                    ]}
                                                    requiredmark={''}
                                                >
                                                    <Input className={'name-input'} />
                                                </Form.Item>

                                                <Form.Item className={'domain-input-wrap'}
                                                    label={"Домен"}
                                                    validateStatus={this.state.validateStatus}
                                                    help={this.state.help}
                                                    name="domain"
                                                    onChange={(e)=>{this.checkDomain(e.target.value)}}
                                                    rules={[

                                                        {
                                                            pattern: /^[a-z0-9]+$/,
                                                            message: 'Использовать только строчные латинские буквы и цифры',
                                                        },
                                                        {
                                                            min: 3,
                                                            message: 'Длина домена не менее 3 символов',
                                                        },
                                                        {
                                                            required: true,
                                                            message: 'Пожалуйста, введите домен',
                                                        },
                                                    ]}
                                                >
                                                    <Input className={'domain-input'} addonAfter={'.atmaguru.online'} addonBefore={<Tooltip placement="bottom" title={'Сгенерировать'}><span className={"generate-domain-before"} onClick={() => this.generateDomain()}><ReloadOutlined /></span></Tooltip>} />
                                                </Form.Item>
                                                <Form.Item
                                                    label={"Отрасль"}
                                                    validateStatus={this.state.validate}
                                                    name="branch"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Пожалуйста, выберите отрасль',
                                                        },
                                                    ]}
                                                    requiredmark={''}
                                                >
                                                    <Select  placeholder={"Не выбрана"} dropdownStyle={{borderRadius: '8px'}} size="large" onChange={(e)=>{console.log(e);}}>
                                                        {this.renderOptions(this.state.settingsBranch)}
                                                        {/*<Option value="jack">Jack</Option>*/}
                                                    </Select>
                                                </Form.Item>

                                                <Form.Item
                                                    label={"Ваша роль в компании"}
                                                    validateStatus={this.state.validate}
                                                    name="position"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Пожалуйста, выберите роль',
                                                        }
                                                    ]}
                                                >
                                                    <Select placeholder={"Не выбрана"} onChange={(e)=>{console.log(e);}}>
                                                        {this.renderOptions(this.state.settingsPosition)}
                                                    </Select>
                                                </Form.Item>

                                                <Form.Item
                                                    label={<>Количество сотрудников <br/> в компании</>}
                                                    name="count_staff"
                                                    rules={[
                                                        {
                                                            type: "integer",
                                                            required: false,
                                                            message: 'Пожалуйста, введите количество!',
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber min={1} max={500000} />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<>Сколько людей <br /> будут пользоваться</>}
                                                    name="count_user"
                                                    rules={[
                                                        {
                                                            type: "integer",
                                                            required: false,
                                                            message: 'Пожалуйста, введите количество',
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber min={1} max={500000} />

                                                </Form.Item>

                                                <Form.Item
                                                    name="experience_lms"
                                                    rules={[
                                                        {
                                                            required: false,
                                                            message: 'Пожалуйста, выберите вариант',
                                                        },
                                                    ]}
                                                    valuePropName="checked"
                                                >
                                                    <Checkbox>Есть опыт работы с LMS</Checkbox>
                                                </Form.Item>

                                                <Form.Item>
                                                    <Button
                                                            type="primary"
                                                            htmlType="submit"
                                                            shape="round"
                                                            size="large"
                                                            loading={this.state.validate === 'validating'}>
                                                        Завершить регистрацию
                                                    </Button>
                                                </Form.Item>
                                            </Form>
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
                        <div style={{position: 'relative', display: 'inline-block', width: '350px', padding: '50px', minWidth: '350px', maxWidth:'320px', height: '100vh', backgroundColor: '#1790FF', borderRadius: '30px 0 0 30px'}}>
                            <table align="center" valign="middle" cellPadding={0} cellSpacing={0} style={{width: '100%', height: '100%'}}>
                                <tbody>
                                <tr>
                                    <td>
                                        <Title level={3} style={{color: '#FFFFFF'}}>Зачем это нужно?</Title>
                                        <div style={{color: '#FFFFFF', marginBottom:'30px'}}>
                                            Пожалуйста, завершите
                                            регистрацию и&nbsp;укажите роль
                                            в&nbsp;компании и&nbsp;информацию
                                            чем вы&nbsp;занимаетесь. Эти
                                            данные нам помогут лучше
                                            понимать профиль наших
                                            клиентов и&nbsp;сделать продукт
                                            еще лучше.
                                        </div>
                                        <div style={{color: '#FFFFFF', marginBottom:'20px'}}>
                                            14&nbsp;дней бесплатно, без обязательных начальных платежей</div>
                                        <div style={{color: '#FFFFFF', marginBottom:'20px'}}>Полный функционал без ограничений</div>
                                        <div style={{color: '#FFFFFF'}}>Ваши данные надежно защищены</div>
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
