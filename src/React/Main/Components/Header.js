import React, {useState} from "react";
import { HashLink as Link } from 'react-router-hash-link';
import axios from "axios";
import ProfileAvatar from "../Profile/ProfileAvatar";
import Search from "./Search";
import Login from "../Auth/Login";

const Header = ({ search=true }) => {
    const [visibleSearch, setVisibleSearch] = useState(false)
    const [visibleLogin, setVisibleLogin] = useState();
    const [contentVisible, setContentVisible] = useState(false)

    const logout = async () => {
        await axios.post("/ru/logout");
        window.location.reload(true)
        global._history.replace(global.lang + "/")
    };

    return (
        <header>
            <Login visible={visibleLogin} setVisible={setVisibleLogin}/>
            <div className={'f-header-wrap-logo'} style={{
                position: "fixed",
                top: 38,
                left: 20,
                zIndex: 10,
            }}>
                <div to={global.lang + "?order=id&type=desc&page=1&reset=1#start"}>
                    <img className={"f-header-wrap-logo-element"} src={'/i/logotype_sticky.svg'}/>
                </div>
            </div>
            <div className={"f-wrap-login"}>
                { search &&
                <>
                    <Search
                        visible={visibleSearch}
                        setVisible={setVisibleSearch}
                    />
                    <a onClick={() => setVisibleSearch(!visibleSearch)}
                       className={"f-search-click"}
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
                            <button className="dropbtn" onClick={() => setContentVisible(!contentVisible)}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}>
                                    { global.user?.notifications &&
                                    <div style={{ width: 12, height: 12, borderRadius: 100, border: '2px solid #E6E9ED', position: 'absolute', zIndex: 2, top: 10, right: 25, backgroundColor: '#3D72ED' }}/>
                                    }
                                    <ProfileAvatar size={48} image={global.user?.image}/>
                                    <img src={"/i/downOutlined.svg"} style={{
                                        marginLeft: 7.5
                                    }}/>
                                </div>
                            </button>
                            <div className="dropdown-content" style={{ display: !contentVisible && 'none' }}>
                                <Link style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: "space-between",
                                    padding: "15px 0",
                                    margin: "0px 20px 14.5px 30px",
                                    zIndex: 10,
                                    borderBottom: "1px solid rgb(230, 233, 237)"
                                }} to={global.lang + `/profile/${global.user?.id}/`}>
                                        <span style={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            color: "black",
                                            fontSize: 17,
                                            marginRight: 10,
                                        }}>{global.user?.first_name}</span>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <ProfileAvatar size={48} image={global.user?.image}/>
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
            {
                contentVisible === true &&
                <div className={"f-back-out-close"} onClick={() => setContentVisible(false)}/>
            }
            <div className={"logo logo-circle"}/>
            <Link className={"f-logo-click"}  to={global.lang + "?order=id&type=desc&page=1&reset=1#start"}>
                <div style={{ zIndex: 500 }} className={"logo logo-ag"}/>
            </Link>
        </header>
    )
};

export default Header;