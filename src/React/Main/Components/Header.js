import React, {useEffect, useState} from "react";
import {Avatar} from "antd";
import {DownOutlined, UpOutlined, UserOutlined} from "@ant-design/icons";
import {NavLink} from "react-router-dom";
import axios from "axios";
import ProfileAvatar from "../Profile/ProfileAvatar";
import Login from "../Auth/Login";

const Header = () => {

    const [visible, setVisible] = useState();

    const logout = () => {
        axios.post("/ru/logout").then(response => {
            if (response.data.state === "success") {
                global._history.replace("/")
            }
        })
    };

    return (
        <>
            <Login visible={visible} setVisible={setVisible}/>
            <header className={"f-header-content"}>
                <div className={'f-header-wrap-logo'}>
                    <NavLink to={"/"}>
                        <img className={"f-header-wrap-logo-element"} src={'/i/logotype_sticky.svg'}/>
                    </NavLink>
                </div>
                {
                    (global.layout !== "guest" || !global.layout) ?
                        (<div className="dropdown">
                            <button className="dropbtn">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}>
                                    <ProfileAvatar size={45} image={global.user.image}/>
                                    <div style={{marginLeft: 10}}>
                                        <DownOutlined/>
                                    </div>
                                </div>
                            </button>
                            <div className="dropdown-content"
                                 style={{ marginTop: "-10px" }}>
                                <NavLink style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    zIndex: 10,
                                }} to={"/profile"}>
                                    <span style={{marginRight: 10, fontSize: 17}}>{global.user.first_name}</span>
                                    <ProfileAvatar size={45} image={global.user.image}/>
                                    <div style={{marginLeft: 5}}>
                                        <UpOutlined/>
                                    </div>
                                </NavLink>
                                <a href={"/"} onClick={() => logout()}>Выход</a>
                            </div>
                        </div>)
                        :
                        (<div className={'f-header-logo-wrapper'}>
                            {/*<NavLink className={'f-sign-in'} to={global.lang + "/auth/"}>Войти</NavLink>*/}
                            <a className={'f-sign-in'} onClick={() => setVisible(!visible)}>Войти</a>
                        </div>)
                }
            </header>
            <div className={"logo logo-circle"}/>
            <div className={"logo logo-ag"}/>
        </>
    )
};

export default Header;