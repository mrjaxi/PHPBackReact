import React from 'react';
import {Form, Input, Button, Checkbox, Layout} from 'antd';
import axios from "axios";
const {Header, Footer, Sider, Content} = Layout;

export default class Dashboard extends React.Component {

    constructor(props) {
        global.app.setState({pageTitle:'Главный экран', viewHeader: true});
        super(props);
    }
    componentDidMount() {

    }

    click = () => {
        axios.post(global.lang + '/authentication_token', global.serialize({username:'root', password: 'freelord'}), {headers: {'Content-Type': 'application/json'}, withCredentials: true})
            .then(response =>{
                console.log(response);
            })
    }
    render() {
        return (
            <Button onClick={this.click}>Start</Button>
        );
    }
}
