import React, {useEffect, useState} from "react";
import {Avatar} from "antd";
import {DownOutlined, UpOutlined, UserOutlined} from "@ant-design/icons";
import {Link, NavLink} from "react-router-dom";
import axios from "axios";
import ProfileAvatar from "../Profile/ProfileAvatar";
import Search from "./Search";
import Login from "../Auth/Login";

const Header = ({ search=false, includedTypes = () => false, includedCategory = () => false, setIncludedTypes = () => false,
                    setIncludedCategories = () => false }) => {
    const [visibleSearch, setVisibleSearch] = useState(false)
    const [visibleLogin, setVisibleLogin] = useState();

    const logout = async () => {
         await axios.post("/ru/logout");
         global._history.replace(global.lang + "/")
         window.location.reload(true)
    };

    return (
        <>
            <Login visible={visibleLogin} setVisible={setVisibleLogin}/>
            <header className={"f-header-content"}>
                <div className={'f-header-wrap-logo'}>
                    <NavLink to={global.lang + "/"}>
                        <img className={"f-header-wrap-logo-element"} src={'/i/logotype_sticky.svg'}/>
                    </NavLink>
                </div>
                <div style={{ display: "flex", }}>
                    { search &&
                        <>
                            <Search
                                includedTypes={includedTypes}
                                includedCategory={includedCategory}
                                visible={visibleSearch}
                                setVisible={setVisibleSearch}
                                setIncludedTypes={setIncludedTypes}
                                setIncludedCategories={setIncludedCategories}
                            />
                            <a onClick={() => setVisibleSearch(!visibleSearch)}
                                style={{
                                    marginTop: "auto",
                                    marginBottom: "auto",
                                    marginRight: "40px",
                                }}>
                                <img className={"f-nav-button-img"} src={"/i/search.svg"}/>
                            </a>
                        </>
                    }
                    {
                        (global.layout !== "guest" || !global.layout) ?
                            (<div className="dropdown">
                                <button className="dropbtn">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>
                                        { global.user.notifications &&
                                            <div style={{ width: 12, height: 12, borderRadius: 100, border: '2px solid #E6E9ED', position: 'absolute', zIndex: 2, top: 10, right: 25, backgroundColor: '#3D72ED' }}/>
                                        }
                                        <ProfileAvatar size={48} image={global.user.image}/>
                                        <img src={"/i/downOutlined.svg"} style={{
                                            marginLeft: 7.5
                                        }}/>
                                    </div>
                                </button>
                                <div className="dropdown-content">
                                    <Link style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: "space-between",
                                        padding: "15px 0",
                                        margin: "0px 20px 14.5px 30px",
                                        zIndex: 10,
                                        borderBottom: "1px solid rgb(230, 233, 237)"
                                    }} to={global.lang + `/profile/${global.user.id}`}>
                                        <span style={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            color: "black",
                                            fontSize: 17,
                                            marginRight: 10,
                                        }}>{ global.user?.first_name
                                        }</span>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <ProfileAvatar size={48} image={global.user.image}/>
                                            <img src={"/i/upOutlined.svg"} style={{
                                                marginLeft: 7.5
                                            }}/>
                                        </div>
                                    </Link>
                                    <Link type={"button"} to={global.lang + "/user/settings/"}>Настройки профиля</Link>
                                    <a type={"button"} onClick={() => logout()}>Выход</a>
                                </div>
                            </div>)
                            :
                            (<div className={'f-header-logo-wrapper'}>
                                {/*<NavLink className={'f-sign-in'} to={global.lang + "/auth/"}>Войти</NavLink>*/}
                                <a className={'f-sign-in'}  onClick={() => setVisibleLogin(!visibleLogin)}>Войти</a>
                            </div>)
                    }
                </div>
            </header>
            <div className={"logo logo-circle"}/>
            <Link to={global.lang + "/"}>
                <div  style={{ zIndex: 500 }} className={"logo logo-ag"}/>
            </Link>
        </>
    )
};

export default Header;