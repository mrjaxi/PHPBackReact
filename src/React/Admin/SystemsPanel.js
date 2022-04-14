import React from 'react';
import {Button, Menu} from 'antd';
import {NavLink} from "react-router-dom";
import {LogoutOutlined} from "@ant-design/icons";


const axios = require('axios');

export default class SystemsPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            wait: true,
            items: [],
            selected: []
        }
    }

    componentDidMount(){

    }

    render() {
        return (
            <>
                <div className="icon_system facebook"></div>
                <div className="icon_system yandex"></div>
                <Button type="link" className="logout" danger
                        onClick={()=>{
                            axios.post(global.lang + '/logout', )
                                .then(response =>{
                                    console.log(response);
                                    if (response.state = "success") {
                                        global.profile = null;
                                        global.app.setState({layout: 'guest'});
                                        global._history.replace('/auth');
                                    }
                                })
                        }}
                >
                    <LogoutOutlined rotate={180} style={{fontSize:'24px'}} />
                </Button>
            </>

        );
    }
}
