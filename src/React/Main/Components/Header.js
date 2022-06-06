import React, {useEffect} from "react";
import {Avatar} from "antd";
import {DownOutlined, UpOutlined, UserOutlined} from "@ant-design/icons";
import {NavLink} from "react-router-dom";
import axios from "axios";

const Header = () => {

    const logout = () => {
        axios.post("/ru/logout").then(response => {
            if (response.data.state === "success") {
                global._history.replace("/")
            }
        })
    };

    return (
        <>
            <header className={"f-header-content"}>
                <div className={'f-header-wrap-content'}>
                    <div className={'f-header-wrap-logo'}>
                        <NavLink to={"/"} className={'f-header-wrap-logo'}>
                            <div className={"f-header-back-wrap"}>
                                <img className={"f-header-wrap-logo-element"} src={'/i/logotype_sticky.svg'}/>
                            </div>
                            <img className={"f-header-wrap-logo-logo"} src={"/i/atmaguru.svg"}/>
                        </NavLink>
                    </div>
                    {
                        global.layout !== "guest" ?
                            (<div className="dropdown">
                                <button className="dropbtn">
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'row'
                                    }}>
                                        <Avatar size={36} style={{backgroundColor: '#AAB2BD'}}
                                                src={global.user.image !== null
                                                    ? <img src={global.user.image}/>
                                                    : <UserOutlined/>
                                                }/>
                                        <div style={{marginLeft: 10}}>
                                            <DownOutlined/>
                                        </div>
                                    </div>
                                </button>
                                <div className="dropdown-content">
                                    <NavLink style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                    }} to={"/profile"}>
                                        <span style={{marginRight: 10, fontSize: 17}}>{global.user.first_name}</span>
                                        <Avatar size={36} style={{backgroundColor: '#AAB2BD'}}
                                                src={global.user.image !== null ? <img src={global.user.image}/> :
                                                    <UserOutlined/>}/>
                                        <div style={{marginLeft: 5}}>
                                            <UpOutlined/>
                                        </div>
                                    </NavLink>
                                    <a href={"/"} onClick={() => logout()}>Выход</a>
                                </div>
                            </div>)
                            :
                            (<div className={'f-header-logo-wrapper'}>
                                <NavLink className={'f-sign-in'} to={global.lang + "/auth/"}>Войти</NavLink>
                            </div>)
                    }
                </div>
            </header>
        </>
    )
};

export default Header;