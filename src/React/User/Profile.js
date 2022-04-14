import React from 'react';
import {Layout, Card, Row, Col, Typography, Form, Input, Button, Tooltip} from 'antd';
import Icon, {FormOutlined} from "@ant-design/icons";
import TelegramIcon from '../../../public/i/user/Telegram.svg';
import WhatsAppIcon from '../../../public/i/user/WhatsApp.svg';


const {Header, Footer, Sider, Content} = Layout;
import {
    Link, NavLink
} from "react-router-dom";
import axios from "axios";

const { Text } = Typography;

export default class Profile extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            profile: null,
            disabled: false
        }
    }

    componentDidMount() {
        //
        if(global.profile.system_list.length > 0){
            global._history.push(global.lang + '/user/systems-list');
        } else {
            global._history.push(global.lang + '/user/settings');
        }
        axios.get('/api/web/profile/').then((response) => {
            if (response.data.state === "success" && typeof response.data.profile !== 'undefined') {
                this.setState({profile: response.data.profile, wait: false, imageUrl : response.data.profile.image});
            }
        })

    }

    onFinish = (values)=>{
        if (!this.state.disabled) {
            axios.post('/api/web/feedback', values).then((response) => {
                if (response.data.state === "success") {
                    global.openNotification('Спасибо!', 'Нам очень важно ваше мнение :)')
                    this.setState({disabled: true})
                }
            })
        }
    }
    render() {
        if (this.state.profile === null) {
            return (<></>);
        }
        return (
            <div className={'u_profile'}>
                <div className={'u_profile__info'}>
                    <NavLink style={{border: 'none'}} to={global.lang + '/profile/edit'}><div className={'u_profile__photo_upl'} style={{width: '170px', height: '170px', backgroundImage: 'url("' + this.state.profile.image + '")', borderRadius: '85px', backgroundSize: 'cover'}} /></NavLink>
                    <div className={'u_profile__name'}>{this.state.profile.first_name + ' ' + (this.state.profile.middle_name.length ? this.state.profile.middle_name + ' ' : '') + this.state.profile.last_name}<NavLink style={{border: 'none'}} to={global.lang + '/profile/edit'}><FormOutlined style={{marginLeft: '20px', cursor: 'pointer'}} /></NavLink></div>
                    <ul className={'u_profile__post'}>
                        <li key={-1}>{this.state.profile.profession}{this.state.profile.profession.length && this.state.profile.posts.length > 0 && ', '}</li>
                        {
                            this.state.profile.posts.map((value, index)=>{
                                return (
                                    <li key={index}><Tooltip title={value.division}>{value.title + (index !== this.state.profile.posts.length-1 ? ',' : '')}</Tooltip></li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className={'u_feedback'}>
                    <Row className={"u_feedback__soc"}>
                        <Col><Text style={{ marginRight: 10 }}>Связаться с нами</Text></Col>
                        <Col><Icon className={'u_feedback__soc__item'} component={WhatsAppIcon} /></Col>
                        <Col><Icon className={'u_feedback__soc__item'} component={TelegramIcon} /></Col>
                    </Row>
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: true }}
                        onFinish={this.onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="message"
                            rules={[{ required: true, message: 'Расскажите о своём опыте пользования системой. Что можно сделать лучше?' }]}
                            noStyle
                        >
                            <Input.TextArea disabled={this.state.disabled} rows={8} placeholder={'Расскажите о своём опыте пользования системой. Что можно сделать лучше?'} />
                        </Form.Item>
                        <Button htmlType={'submit'} className={'action_button default u_feedback__submit'}>Отправить</Button>
                    </Form>
                </div>
            </div>
        );
    }
}
