import React from 'react';
import {Row, Col, Typography, Tag, Input, Button, Avatar, Tooltip} from 'antd';
import { Search } from './';
import Icon, {UserOutlined, HomeOutlined} from "@ant-design/icons";
import NoticeIcon from '../../../../public/i/user/bell.svg';
import HelpIcon from '../../../../public/i/user/help.svg';
// import TempLogo from '../../../../public/i/user/temp-logo.png';
import {NavLink} from "react-router-dom";
const { Title, Text } = Typography;
const defaultProps = {
    title: '', //название карты
    percent: 0,
    required: false,
    circleColor: null, //цвет диаграммы
    isLocked: false
}

export default class UserHeader extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            avatar: global.profile.image,
            items: [
                {
                    title: 'Карты',
                    items: [
                        {
                            links: [
                                {
                                    text: 'Карта «Менеджер проектов»',
                                    url: '/'
                                }
                            ],

                            body: 'Расскажите о ценностях компании и как начать <b>разговор</b>, если клиент принял обед молчания…',
                        },
                        {
                            links: [
                                {
                                    text: 'Карта «Менеджер»',
                                    url: '/'
                                }
                            ],

                            body: 'Расскажите о ценностях компании...',
                        },
                    ],


                },

                {
                    title: 'Модули из карт',
                    items: [
                        {
                            links: [
                                {
                                    text: 'Карта «Менеджер проектов»',
                                    url: '/'
                                },
                                {
                                    text: 'Что делать и как начать разговор, если клиент хочет предложить…',
                                    url: '/'
                                }
                            ],

                            body: 'Расскажите о ценностях компании и как начать <b>разговор</b>, если клиент принял обед молчания…',
                        },

                    ]

                },

                {
                    type: 'tags',
                    title: 'Метки',
                    items: [
                        {
                            links: [
                                {
                                    text: 'Маркетолог',
                                    url: '/'
                                },
                                {
                                    text: 'Исследования',
                                    url: '/'
                                }
                            ],
                        },
                    ]
                }
            ]
        }
        global.Header = this;
    }

    componentDidMount() {
        setTimeout(()=>{
            this.setState({
                items: []
            })
        }, 5000);
    }
    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state,callback)=>{
            return;
        };
    }

    render() {
        let { searchBarVisibility } = {...defaultProps, ...this.props};
        return (
            <Row className={'u_header_in'} justify="space-between" align="middle">
                <Col>
                    <div className={"u_header__logo_wrap"}>
                        <Tooltip title={"Главная"}><div className={'u_header__logo'} onClick={()=>{
                            global._history.push(global.lang + '/user/')
                        }} />
                        </Tooltip>
                        <Text>{global.profile.first_name.length > 0 ? 'Привет, ' + global.profile.first_name : 'Привет, незнакомец'}</Text>
                    </div>
                </Col>
                <Col flex={1} />
                <Col>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {
                            searchBarVisibility && <Search
                                onSend={(value)=>{
                                    console.log(value);
                                }}
                                result={ this.state.items }
                            />

                        }
                        <div className={'u_header__action'}>
                            <Button className={'u_header__action__item help'} type="text"><Icon component={ HelpIcon } style={{ fontSize: 20 }} /></Button>
                            <Button className={'u_header__action__item notice'} type="text"><Icon component={ NoticeIcon } style={{ fontSize: 20 }} /></Button>
                        </div>
                        <NavLink style={{border: 'none'}} to={global.lang + '/profile/'}>
                            <Avatar size={40} src={this.state.avatar} icon={<UserOutlined />} className={'u_header__avatar'} />
                        </NavLink>
                    </div>

                </Col>
            </Row>
        );
    }
}
