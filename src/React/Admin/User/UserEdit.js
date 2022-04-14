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
    Checkbox,
    Divider
} from 'antd';
import {CheckOutlined, PlusOutlined, LoadingOutlined} from "@ant-design/icons";

const {Option} = Select
const {Title} = Typography;
const axios = require('axios');
const tailLayout = {
    wrapperCol: {
        offset: 3,
        span: 4,
    },
};

export default class UserEdit extends React.Component {

    constructor(props) {
        global.app.setState({pageTitle:'Редактирование пользователя', viewHeader: true});
        super(props);
        this.state = {
            wait: false,
            sending: false,
            values: false,
            industry: [],
            posts: [],
            loading: false,
            imageUrl: '',
            divisions: [],
            divisionsParent: [],
            divisionsBreadcrumbs: [],
            new_post: ''
        }
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

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.setState({wait: true})
            axios.get('/api/admin/users/' + this.props.match.params.id + '/').then((response) => {
                if (response.data.state === "success" && typeof response.data.profile !== 'undefined') {
                    this.setState({values: response.data.profile, wait: false, imageUrl : response.data.profile.image});
                }
            })
        }
    }

    componentDidMount() {

        axios.get('/api/admin/posts/', {withCredentials: true})
            .then(response => {
                if (response.data.state === "success") {
                    if (response.data.items.length > 0) {
                        this.setState({posts: response.data.items});
                    }
                } else {
                    alert(response.data.message);
                }
            })
        axios.get('/api/admin/division/get-tree/?add_list=1', {withCredentials: true})
            .then(response => {
                if (response.data.state === "success") {
                    if (response.data.tree.length > 0) {
                        this.setState({divisions: response.data.tree, divisionsParent: response.data.list });
                    }
                } else {
                    alert('error');
                }
            })
        axios.get('/api/admin/users/' + this.props.match.params.id + '/').then((response) => {
            if (response.data.state === "success" && typeof response.data.profile !== 'undefined') {
                this.setState({values: response.data.profile, wait: false, imageUrl : response.data.profile.image});
            }
        })

    }

    beforeUpload = (file) => {
        let isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Вы можете загрузить только JPG/PNG файлы!');
        }
        let isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Размер изображения не должен превышать 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }
    handleChange = (info) => {
        if (info.file.status === 'uploading') {
            console.log(info.file, info.fileList);
            this.setState({loading: true});
            return;
        }
        if (info.file.status === 'done') {
            if (info.file.response.state === 'success') {
                this.setState({
                    imageUrl : info.file.response.filename,
                    loading: false,
                });
                axios.post('/api/admin/users/save/' + this.props.match.params.id + '/?avatar=1', {avatar: this.state.imageUrl}, {withCredentials: true})
                    .then(response => {
                        if (response.data.state === "success") {
                            global.openNotification('Сохранено');
                        }
                    })
            }
            else {
                message.error(`${info.file.name} ошибка загрузки файла.`);
            }

        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} ошибка загрузки файла.`);
        }
    }
    tagRender = (props) => {
        let { label, value, closable, onClose } = props;
        let onPreventMouseDown = event => {
            event.preventDefault();
            event.stopPropagation();
        };

        let color = '#FFFFFF';
        if (value === 'ROLE_REDACTOR') {
            color = 'red'
        } else if (value === 'ROLE_MENTOR') {
            color = 'cyan'
        } else if (value === 'ROLE_ADMIN') {
            color = 'green'
        } else if (value === 'ROLE_USER') {
            color = 'purple'
        }

        return (
            <Tag
                color={color}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
            >
                {label}
            </Tag>
        );
    }
    send = (values) => {
        axios.post('/api/admin/users/save/' + this.props.match.params.id + '/', {values}, {withCredentials: true})
            .then(response => {
                if (response.data.state === "success") {
                    global.openNotification('Сохранено');
                }
            })
    }



    onChange = (value = '') => {
        let history = [];
        let {divisionsParent, divisionsBreadcrumbs} = this.state;
        let id = value.replace('division_', '');
        let ready = true;

        if(divisionsParent[id]){
            // history.push(divisionsParent[id]);
            while (ready === true) { // выводит 0, затем 1, затем 2
                history.push(divisionsParent[id].title);
                id = divisionsParent[id].parent_id;

                if(id === null){
                    ready = false;
                }
            }
            this.setState({ divisionsBreadcrumbs: history.reverse() });
            // console.log(history.reverse());
        }
    }

    addPost = () => {
        if (this.state.new_post.length > 0) {
            axios.post('/api/admin/posts/new/', {title: this.state.new_post}, {withCredentials: true})
                .then(response => {
                    if (response.data.state === "success") {
                        this.setState({posts: response.data.items, new_post: ''});
                        global.openNotification('Добавлено');
                    }
                })
        }

    }

    render() {
        if (!this.state.wait && this.state.posts.length > 0 && this.state.values) {
            return (
                // <div className={'form_inputs_title_top user_edit'}>
                    <Form
                        initialValues={this.state.values}
                        labelCol={{span: 8}}
                        wrapperCol={{span: 8}}
                        layout="vertical"
                        size="large"
                        style={{margin: '30px'}}
                        onFinish={(values) => {this.send(values)}}
                    >
                        <div>
                            <Upload
                                name="file"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action="/api/admin/upload/"
                                beforeUpload={this.beforeUpload}
                                onChange={this.handleChange}
                            >
                                {this.state.imageUrl ? <img src={this.state.imageUrl} alt="avatar" style={{ width: '100%' }} /> : <div>{this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}<div style={{ marginTop: 8 }}>Upload</div></div>}
                            </Upload>
                        </div>
                        <Form.Item name="id" style={{'display': 'none'}}>
                            <input  type="hidden"/>
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="username"
                            rules={[{required: true, type: 'email', message: 'Неверный Email' }]}
                        >
                            <Input style={{width: '300px'}} placeholder="email"/>
                        </Form.Item>

                        <Form.Item
                            label="Имя"
                            name="first_name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, введите имя',
                                },
                            ]}
                        >
                            <Input style={{width: '300px'}} placeholder="Введите имя"/>
                        </Form.Item>

                        <Form.Item
                            label="Фамилия"
                            name="last_name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, введите фамилию',
                                },
                            ]}
                        >
                            <Input style={{width: '300px'}} placeholder="Введите фамилию"/>
                        </Form.Item>
                        <Divider />
                        <Form.Item
                            label="Профессия"
                            name="profession"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите профессию',
                                },
                            ]}
                        >
                            <Select
                                style={{width: '300px'}}
                                placeholder="Выберите профессию"
                                dropdownRender={menu => (
                                    <div>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                            <Input style={{ flex: 'auto' }} value={this.state.new_post} onChange={(event)=>{
                                                this.setState({new_post: event.target.value});
                                            }} />
                                            <a
                                                style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                                onClick={this.addPost}
                                            >
                                                <PlusOutlined /> Новая
                                            </a>
                                        </div>
                                    </div>
                                )}
                            >
                                {this.renderOptions(this.state.posts)}
                            </Select>
                        </Form.Item>
                        <div className="form_item_group">
                            {/*<div className={'form_item_group__h'}>Роли</div>*/}
                            <Form.Item
                                label="Роли"
                                name="roles"
                            >
                                <Checkbox.Group >
                                    <Row>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_ADMIN" style={{ lineHeight: '32px' }}>
                                                Администратор
                                            </Checkbox>
                                        </Col>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_USER" style={{ lineHeight: '32px' }}>
                                                Пользователь
                                            </Checkbox>
                                        </Col>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_USER_EDIT" style={{ lineHeight: '32px' }}>
                                                Управление сотрудниками
                                            </Checkbox>
                                        </Col>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_MAP_EDIT" style={{ lineHeight: '32px' }}>
                                                Создание/Редактирование карт
                                            </Checkbox>
                                        </Col>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_MAP" style={{ lineHeight: '32px' }}>
                                                Назначение карт
                                            </Checkbox>
                                        </Col>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_LIBRARY" style={{ lineHeight: '32px' }}>
                                                Библиотека
                                            </Checkbox>
                                        </Col>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_DIVISION" style={{ lineHeight: '32px' }}>
                                                Подразделения
                                            </Checkbox>
                                        </Col>
                                        <Col flex="300px">
                                            <Checkbox value="ROLE_CHECK" style={{ lineHeight: '32px' }}>
                                                Проверка результата
                                            </Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>

                            </Form.Item>

                            {/*статично*/}
                            <div className={'user_edit__access_wrap'}>
                                <div className="user_edit__access__h">Правда доступа</div>
                                <ul className={'user_edit__access__list'}>
                                    <li>Создание карт</li>
                                    <li>Редактирование информации в модулях</li>
                                    <li>Добавление новых сотрудников</li>
                                </ul>
                            </div>
                            {/*статично*/}
                        </div>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" shape="round">
                                Обновить профиль
                            </Button>
                        </Form.Item>
                    </Form>
                // </div>
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
