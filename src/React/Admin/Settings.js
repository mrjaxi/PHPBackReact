import React from 'react';
import {Form, Input, Button, Checkbox, Layout} from 'antd';
const {Header, Footer, Sider, Content} = Layout;

export default class Settings extends React.Component {

    constructor(props) {
        global.app.setState({pageTitle:'Настройки', viewHeader: true});
        super(props);
    }
    componentDidMount() {

    }

    render() {
        return (
            <Button>Start</Button>
        );
    }
}
