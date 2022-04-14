import React from 'react';
import {
    Select,
    Row,
    Col,
    Typography,
    notification,
    Image,
    Table,
    Progress,
    Tag,
    Tooltip,
    ConfigProvider, Avatar
} from 'antd';
import {Link, NavLink} from "react-router-dom";
import Moment from "moment";
import Icon, {FormOutlined, ApartmentOutlined, UserOutlined, StopOutlined} from "@ant-design/icons";
import Time from '../../../../public/i/time.svg';

const {Title, Text} = Typography;
const axios = require('axios');

export default class User extends React.Component {

    constructor(props) {
        global.app.setState({pageTitle:'Сотрудник ', viewHeader: true});
        super(props);
        this.state = {
            wait: true,
            items: [],
            selectedRowKeys: [],
            profile: false
        }
    }

    componentDidMount() {
        axios.get('/api/admin/users/get-maps/' + this.props.match.params.id + '/').then((response) => {
            if (response.data.state === "success" && typeof response.data.items !== 'undefined' && response.data.items.length > 0) {
                this.setState({items: response.data.items});
            }
        })
        axios.get('/api/admin/users/' + this.props.match.params.id + '/').then((response) => {
            if (response.data.state === "success" && typeof response.data.profile !== 'undefined') {
                this.setState({profile: response.data.profile, wait: false});
            }
        })
    }

    render() {
        const columns = [
            {
                title: 'Название',
                dataIndex: 'title',
                key: 'title',
                render: title => {
                    return <Link style={{whiteSpace: 'nowrap'}} to={global.lang + '/admin/users/' + this.props.match.params.id + '/map/' + title.split(';')[0] + '/'}>
                        <div>
                            <div style={{verticalAlign: 'middle', display: 'inline-block', padding: '14px'}}>{title.split(';')[1]}</div>
                        </div>
                    </Link>;
                },
                sorter: (a, b) => {
                    if(a.title.split(';')[1] < b.title.split(';')[1]) { return -1; }
                    if(a.title.split(';')[1] > b.title.split(';')[1]) { return 1; }
                    return 0;
                },
            },
            {
                align: 'center',
                title: '',
                key: 'progress',
                dataIndex: 'progress',
                width: '30%',
                render: progress => {
                    let percent = progress.split(':');
                    return <Progress
                        percent={ percent[0] }
                        success={(typeof percent[1] !== 'undefined' && percent[1] !== '0' ? {percent: percent[1]} : false)}
                        // strokeColor={circleColor ? circleColor : '#1790FF'}
                        status={typeof percent[3] !== 'undefined' ? 'exception' : 'active'}
                    />
                },
            },
            {
                align: 'center',
                title: 'Последняя активность',
                key: 'updated_at',
                dataIndex: 'updated_at',
                render: updated_at => {
                    return updated_at;
                },
                sorter: (a, b) => {
                    if(a.strtotime < b.strtotime) { return -1; }
                    if(a.strtotime > b.strtotime) { return 1; }
                    return 0;
                },
            },
        ];

        if (!this.state.wait) {
            return (
                <>
                    <div style={{
                        margin: '30px'
                    }}>
                        <Avatar size={80} src={this.state.profile.image} icon={<UserOutlined />} style={{display:"inline-block", verticalAlign: 'top'}}/>
                        <div style={{display: 'inline-block', verticalAlign: 'top', padding: '10px 10px 10px 20px'}}>
                            <div style={{fontWeight: 'bold', fontSize: '18px', textAlign: 'left'}}>
                                {!this.state.profile.is_active && <Tooltip title={"Заблокирован"}><StopOutlined style={{marginRight: '10px', color: 'grey'}} /></Tooltip>}
                                {this.state.profile.first_name + ' ' + this.state.profile.last_name}
                                {this.state.profile.temporary !== 'not' ? <Tooltip title={"Временный до " + this.state.profile.temporary}><Icon style={{fontSize:'18px', marginLeft: '10px'}} component={Time}/></Tooltip> : ''}
                                <NavLink to={global.lang + '/admin/users/' + this.props.match.params.id + '/edit'}><FormOutlined style={{marginLeft: '20px', cursor: 'pointer'}} /></NavLink>
                            </div>
                            <div style={{textAlign: 'left'}}>
                                {this.state.profile.profession.length > 0 && <Tooltip title={"Профессия"}><Text italic>{this.state.profile.profession}</Text></Tooltip>}
                                {this.state.profile.profession.length > 0 && this.state.profile.posts.length > 0 && ', '}
                                {this.state.profile.posts.length > 0 && this.state.profile.posts.map((value, index)=>{
                                    return <Tooltip key={index} title={value.division}>{value.title + (typeof this.state.profile.posts[index+1] !== 'undefined' ? ', ' : '')}</Tooltip>;
                                })}
                            </div>
                        </div>
                    </div>
                    <ConfigProvider
                        renderEmpty={(e)=>{
                            return (
                                <div key={1} style={{ textAlign: 'center' }}>
                                    <ApartmentOutlined style={{ fontSize: 20 }} />
                                    <p>Карты не назначены</p>
                                </div>
                            );
                        }}
                    >
                        <Table
                            loading={this.state.loading}
                            className="main_table"
                            dataSource={this.state.items}
                            columns={columns}
                        />
                    </ConfigProvider>
                </>
            );
        }

        return (
            <>
                <Row type="flex" justify="left" align="left" style={{minHeight: '85vh'}}>
                    <Col span={10}/>
                </Row>
            </>
        );

    }
}
