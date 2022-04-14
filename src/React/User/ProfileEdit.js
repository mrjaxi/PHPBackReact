import React from 'react';
import {Layout, Card, Row, Col, Typography, Form, Input, Button, Upload} from 'antd';
import Icon, {LoadingOutlined, UploadOutlined} from "@ant-design/icons";
import {InputTopTitle} from "./Components";


const {Header, Footer, Sider, Content} = Layout;
import {
    Link, NavLink
} from "react-router-dom";
import axios from "axios";

const {Text} = Typography;

export default class ProfileEdit extends React.Component {
    formRef = React.createRef();
    constructor(props) {
        super(props);
        this.state = {
            values: [],
            wait: true,
            validate: {
                first_name: 'success',
                middle_name: 'success',
                last_name: 'success',
                phone: 'success',
                username: 'success',
            },
            help: '',
            imageUrl: '',
        }
        global.ProfileEdit = this;
    }



    componentDidMount() {
        axios.get('/api/profile/', {withCredentials: true}).then((response) => {
            console.log(response.data.profile);
            let values = {
                first_name: response.data.profile.first_name,
                middle_name: response.data.profile.middle_name,
                last_name: response.data.profile.last_name,
                phone: response.data.profile.phone,
                username: response.data.profile.username,
            }
            if (response.data.state === "success") {
                this.setState({values: values, wait: false, imageUrl: response.data.profile.image})

            }
        }).catch((e) => {

        });
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
                axios.post('/api/web/profile/save?avatar=1', {avatar: this.state.imageUrl}, {withCredentials: true})
                    .then(response => {
                        if (response.data.state === "success") {
                            global.openNotification('Сохранено');
                            global.Header.setState({avatar: this.state.imageUrl})
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

    onFinish = (values) => {
        if (
                this.state.values.first_name.length === 0 ||
                this.state.values.middle_name.length === 0 ||
                this.state.values.last_name.length === 0
        ) {
            this.setState({    validate: {
                    first_name: this.state.values.first_name.length > 0 ? 'success' : 'error',
                    middle_name: this.state.values.middle_name.length > 0 ? 'success' : 'error',
                    last_name: this.state.values.last_name.length > 0 ? 'success' : 'error',
                    phone: 'success',
                    username: 'success',
                }, help: 'Обязательное поле'})
        }
        else {
            axios.post('/api/web/profile/save', this.state.values, {withCredentials: true})
                .then(response => {
                    if (response.data.state === "success") {
                        global.openNotification('Сохранено');
                        global.app.setState({onlyProfile: false})
                    }
                })
        }
    }

    updateProfileInput = (name, value) => {
        let _state = Object.assign({},this.state);
        _state.values[name] = value;
        _state.validate[name] = value.length > 0 ? 'success' : 'error'
        this.setState(_state)
    }

    onFinishFailed = () => {

    }

    render() {
        if (this.state.wait) {
            return (<></>)
        }
        return (
            <div className={'u_profile_edit'}>
                <div className={'u_profile_edit__form'}>
                    <Form
                        onFinish={this.onFinish}
                        // autoComplete="off"
                        initialValues={this.state.values}
                    >
                        <div>
                            <Upload
                                name="file"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action="/api/web/upload/"
                                beforeUpload={this.beforeUpload}
                                onChange={this.handleChange}
                                // style={{width: '170px', height: '170px', borderRadius: '85px', marginBottom: '34px'}}
                            >
                                {this.state.imageUrl ? <img src={this.state.imageUrl} alt="avatar" style={{ width: '100%', borderRadius: '85px' }} /> : <div >{this.state.loading ? <LoadingOutlined /> : <div className={'u_profile__photo_upl'}><UploadOutlined /><br/>Загрузить фото</div>}</div>}
                            </Upload>
                        </div>
                        <Form.Item
                            name="first_name"
                            help={this.state.validate.first_name === 'error' ? this.state.help : ''}
                            validateStatus={this.state.validate.first_name}
                        >
                            <InputTopTitle inputProps={{placeholder: 'Имя', name: "first_name"}} title={'Имя'}/>
                        </Form.Item>
                        <Form.Item
                            name="last_name"
                            help={this.state.validate.last_name === 'error' ? this.state.help : ''}
                            validateStatus={this.state.validate.last_name}
                        >
                            <InputTopTitle inputProps={{placeholder: 'Фамилия', name: "last_name"}} title={'Фамилия'}/>
                        </Form.Item>
                        <Form.Item
                            name="middle_name"
                            help={this.state.validate.middle_name === 'error' ? this.state.help : ''}
                            validateStatus={this.state.validate.middle_name}
                        >
                            <InputTopTitle inputProps={{placeholder: 'Отчество', name: "middle_name"}} title={'Отчество'}/>
                        </Form.Item>

                        <Form.Item
                            name="username"
                            help={this.state.validate.username === 'error' ? this.state.help : ''}
                            validateStatus={this.state.validate.username}
                        >
                            <InputTopTitle inputProps={{placeholder: 'Электронная почта', disabled: true, name: "username"}} title={'Электронная почта'}/>
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            validateStatus={this.state.validate.phone === 'error' ? this.state.help : ''}
                            help={this.state.help}
                        >
                            <InputTopTitle inputProps={{placeholder: 'Телефон', name: "phone"}} title={'Телефон'}/>
                        </Form.Item>

                        <Form.Item noStyle>
                            <Button htmlType={'submit'} className={'action_button default u_feedback__submit'}>Продолжить</Button>
                        </Form.Item>

                    </Form>
                </div>
            </div>
        );
    }
}
