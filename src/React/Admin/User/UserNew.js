import React from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Row,
    Col,
    Typography,
    notification,
    Upload,
    Tag,
    TreeSelect,
    Space, Checkbox,
    Switch,
    Tabs,
    Divider
} from 'antd';
import Icon, {CheckOutlined, PlusOutlined, LoadingOutlined, MinusCircleOutlined, CloseOutlined, ExclamationOutlined} from "@ant-design/icons";
import {
    Link, NavLink
} from "react-router-dom";
import RefreshIcon from '../../../../public/i/overwrite-icon.svg';
const {Option} = Select
const {Title} = Typography;
const { TabPane } = Tabs;
const axios = require('axios');
const tailLayout = {
    wrapperCol: {
        offset: 0,
        span: 4,
    },
};

export default class UserNew extends React.Component {
    formRef = React.createRef();
    constructor(props) {
        global.app.setState({pageTitle:'Добавление сотрудников', viewHeader: true});
        super(props);
        this.state = {
            wait: true,
            sending: false,
            values: { users: [ { email: '', name: '', fname: '' } ] },
            divisions: [],
            divisionsParent: [],
            divisionsBreadcrumbs: [],
            loading: false,
            imageUrl: '/i/imageUser.png',
            selectedPost: false
        }
    }

    componentDidMount() {
        axios.get('/api/admin/users/get-tree-division/?add_list=1', {withCredentials: true})
            .then(response => {
                if (response.data.state === "success") {
                    if (response.data.tree.length > 0) {
                        this.setState({divisions: response.data.tree, divisionsParent: response.data.list, wait: false});
                    }
                } else {
                    alert('error');
                }
            })
    }

    send = (values) => {
        let users = [];
        if (typeof values.list !== 'undefined') {
            let hasError = false,
                users_d = values.list.split(',');
            if (users_d.length > 0) {
                users_d.map((email)=>{
                    if (!email.trim().match(
                        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )) {
                        hasError = true;
                    }
                    users.push({email: email})
                })
                if (hasError) {
                    global.openNotification('Предупреждение', 'Один или несколько email введены неверно', 'warn')
                    return;
                }
            }
        }
        if (typeof values.users !== 'undefined') {
            users = values.users;
        }

        if (users && users.length) {
            this.setState({loading: true});
            axios.post('/api/admin/users/new/', {values: {users: users, post: this.state.selectedPost}}, {withCredentials: true})
                .then(response => {
                    this.setState({loading: false});
                    if (response.data.state === "success") {
                        global.openNotification('Сохранено', 'Всем пользователям отправлены ссылки для входа');
                        this.formRef.current.resetFields();
                    }
                    else if (response.data.state === 'trouble') {
                        let trouble_emails = '';
                        if (typeof response.data.trouble_emails !== 'undefined' && response.data.trouble_emails.length) {
                            response.data.trouble_emails.map((value, index)=>{
                                trouble_emails += value + (typeof response.data.trouble_emails[index+1] !== 'undefined' ? ', ' : '');
                            })
                        }
                        global.openNotification('Сохранено', 'Некоторые пользователи уже найдены в системе (' + trouble_emails + '), остальным отправлены приглашения', 'warn');
                        this.formRef.current.resetFields();
                    }
                    else {
                        global.openNotification('Ошибка', 'Что-то пошло не так', 'error');
                    }
                }).catch(()=>{
                    this.setState({loading: false});
                    global.openNotification('Ошибка', 'Что-то пошло не так', 'error');
                })
        }
        else  {
            global.openNotification('Предупреждение', 'Добавьте хотя бы одного пользователя', 'warn')
        }
    }

    onChangeTabs = (key) => {
        console.log(key);
    }

    onChangeDivision = (value = '') => {
        this.setState({selectedPost: value});
        console.log(value);
        // let history = [];
        // let {divisionsParent, divisionsBreadcrumbs} = this.state;
        // let id = value.replace('division_', '');
        // let ready = true;
        //
        //
        //
        //
        // if(divisionsParent[id]){
        //     // history.push(divisionsParent[id]);
        //     while (ready === true) { // выводит 0, затем 1, затем 2
        //         history.push(divisionsParent[id].title);
        //         id = divisionsParent[id].parent_id;
        //
        //         if(id === null){
        //             ready = false;
        //         }
        //     }
        //     this.setState({ divisionsBreadcrumbs: history.reverse() });
        //     // console.log(history.reverse());
        // }
    }

    render() {
        if (!this.state.wait) {
            return (
                <div className={'user_new'} style={{margin: '35px', maxWidth: '775px'}}>
                    <div style={{margin: '0 0 10px 0'}}>С привязкой к должности:</div>
                        <TreeSelect
                            ref={(o)=>this.devisionInput = o}
                            style={{ width: 'calc(100% - 3.666666%)', marginBottom: 20 }}
                            value={this.state.selectedPost}
                            dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                            treeData={this.state.divisions}
                            placeholder="Выберите подразделение"
                            treeDefaultExpandAll
                            onChange={this.onChangeDivision}
                        />

                        <ul className={'division_breadcrumbs'}>{
                            this.state.divisionsBreadcrumbs.map((title, i)=>(
                                <li key={'dbread' + i}>{ title }</li>
                            ))
                        }</ul>

                        <Divider/>

                        <Tabs defaultActiveKey="1" onChange={this.onChangeTabs}>
                            <TabPane tab="E-mail" key="1">
                                <Form
                                    initialValues={this.state.values}
                                    labelCol={{span: 22}}
                                    wrapperCol={{span: 22}}
                                    layout="vertical"
                                    size="large"
                                    ref={this.formRef}
                                    onFinish={(values) => {this.send(values)}}

                                >
                                    <Form.List name={['users']} >
                                        {(fields, {add, remove}, {errors}) => (
                                            <>
                                                {fields.map((field, index) => (
                                                    <div key={index} style={{ position: 'relative' }}>
                                                        <Row style={{ width: '100%' }}>
                                                            <Col style={{ width: '33%' }}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'email']}
                                                                    fieldKey={[field.fieldKey, 'email']}
                                                                    key={[field.fieldKey, 'email']}
                                                                    rules={[{required: true,type: 'email' }]}
                                                                    style={{width: '100%'}}
                                                                >
                                                                    <Input placeholder="E-mail" style={{width: '100%'}} />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col style={{ width: '33%' }}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'name']}
                                                                    fieldKey={[field.fieldKey, 'name']}
                                                                    key={[field.fieldKey, 'name']}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            whitespace: true,
                                                                            message: "Обязательное поле",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input placeholder="Имя" style={{width: '100%'}} />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col style={{ width: '33%' }}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'fname']}
                                                                    fieldKey={[field.fieldKey, 'fname']}
                                                                    key={[field.fieldKey, 'fname']}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            whitespace: true,
                                                                            message: "Обязательное поле",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input placeholder="Фамилия" style={{width: '100%'}} />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                        <div style={{position: 'absolute', right: 0, top: 0}}>

                                                            {
                                                                fields && fields.length > 1 && (
                                                                    <CloseOutlined
                                                                        style={{color:'red', marginTop:'12px'}}
                                                                        className="dynamic-delete-button"
                                                                        onClick={() => {
                                                                            if(fields && fields.length > 1){
                                                                                remove(field.name);
                                                                            }
                                                                        }}

                                                                    />
                                                                )
                                                            }

                                                        </div>
                                                    </div>
                                                ))}
                                                <Form.Item noStyle>
                                                    <Button
                                                        type="default"
                                                        onClick={() => add()}
                                                        style={{height: '40px', width: 'calc(100% - 3.666666%)', borderColor: '#1790FF', color: '#1790FF'}}
                                                    >
                                                        Еще
                                                    </Button>
                                                    <Form.ErrorList errors={errors}/>
                                                </Form.Item>
                                            </>
                                        )}
                                    </Form.List>
                                    <Form.Item {...tailLayout}>
                                        <Button type="primary" htmlType="submit" shape="round" style={{ marginTop: 32 }} loading={this.state.loading}>
                                            Отправить приглашения
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                            <TabPane tab="Массовое приглашение" key="2" style={{ paddingBottom: 40 }}>
                                <div style={{ paddingTop: 30 }}>
                                    <Form
                                        initialValues={this.state.values}
                                        labelCol={{span: 22}}
                                        wrapperCol={{span: 22}}
                                        layout="vertical"
                                        size="large"
                                        ref={this.formRef}
                                        onFinish={(values) => {this.send(values)}}

                                    >
                                        <div style={{ color: '#d9d9d9', fontSize: 13, marginBottom: 8  }}>Введите адреса электронной почты сотрудников через пробел или запятую</div>
                                        <Form.Item
                                            style={{width: '100%'}}
                                            noStyle
                                            name={['list']}
                                        >
                                            <Input.TextArea placeholder="mail1@mail.com, mail2@mail.com" style={{width: '100%'}} rows={5} />
                                        </Form.Item>
                                        <Form.Item {...tailLayout}>
                                            <Button type="primary" htmlType="submit" shape="round" style={{ marginTop: 32 }} loading={this.state.loading}>
                                                Отправить приглашения
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </div>
                            </TabPane>
                            {/*<TabPane tab="Ссылка" key="3" style={{ paddingBottom: 40 }}>*/}
                            {/*    <div style={{ paddingTop: 30 }}>*/}
                            {/*        <div style={{ marginBottom: 30 }}><label><Switch /><span style={{ display: 'inline-block',*/}
                            {/*            verticalAlign: 'middle', marginLeft: 10, fontSize: 16, lineHeight: '16px' }}>Запрашивать подтверждение на вход</span></label></div>*/}
                            {/*        <Input.Group compact>*/}
                            {/*            <Input style={{ width: 'calc(80% - 200px)' }} defaultValue="https://ant.design" disabled />*/}
                            {/*            <Button type="primary">Копировать</Button>*/}
                            {/*        </Input.Group>*/}
                            {/*        <Button className={'refresh_btn'} icon={<Icon component={RefreshIcon} />} type={'link'} style={{ color: '#AAB2BD', padding: 0 }}>Обновить ссылку</Button>*/}
                            {/*    </div>*/}
                            {/*</TabPane>*/}
                        </Tabs>
                </div>
            );
        }

        return (
            <>
                <Row type="flex" justify="left" align="left" style={{minHeight: '85vh'}}>
                    <Col span={10}></Col>
                </Row>
            </>
        );

    }
}
