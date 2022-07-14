import React, {useEffect, useLayoutEffect, useState} from "react";
import {useHistory, useParams} from "react-router";
import {Avatar, Col, Select, Skeleton} from "antd";
import Header from "../Components/Header";
import UserIdeas from "./UserIdeas";
import UserComments from "./UserComments";
import UserFavourite from "./UserFavourite";
import {UserOutlined} from "@ant-design/icons";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import {NavLink} from "react-router-dom";
import Login from "../Auth/Login";

const {Option} = Select;

const Profile = () => {

    const params = useParams();
    const history = useHistory();
    const [notifications, setNotifications] = useState(global.user?.notifications);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);
    const [roles, setRoles] = useState([])
    const [visibleLogin, setVisibleLogin] = useState(false);
    const [user, setUser] = useState({
        id: params.id,
        username: "",
        email: "",
        phone: "",
        roles: [],
        role_name: "",
        fio: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        image: "",
        is_active: true,
        system_id: null,
    });

    const [ideasCount, setIdeasCount] = useState(-1);
    const [commentsCount, setCommentsCount] = useState(-1);
    const [likesCount, setLikesCount] = useState(-1);

    useLayoutEffect(() => {
        setUser({
            id: params.id,
            username: "",
            email: "",
            phone: "",
            roles: [],
            role_name: "",
            fio: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            image: "",
            is_active: true,
            system_id: null,
        })
        setRoles([])
        setSelectedHeaderItem(0)
        setLoadingProfile(true)
        getUser();
    }, [history.location.pathname])

    useEffect(() => {
        if (user?.email) {
            setLoadingProfile(false)
            setRoles(user?.roles)
        }
    }, [user])

    function changeNotifications(bool) {
        setNotifications(bool)
        global.user.notifications = bool;
    }

    function getUser() {
        if(global.user?.id == params.id){
            setUser(global.user);
        }
        axios.get(ApiRoutes.API_GET_USER_DATA.format(params.id)).then(response => {
            global.handleResponse(response,
                function () {
                    if (response.data?.profile) {
                        let username = ""
                        username += response.data.profile?.middle_name ? response.data.profile.middle_name + " " : "";
                        username += response.data.profile?.first_name ? response.data.profile.first_name + " " : "";
                        username += response.data.profile?.last_name ? response.data.profile.last_name : "";
                        response.data.profile.fio = username
                        setUser(response.data.profile)

                        setIdeasCount(response.data?.count.ideas)
                        setCommentsCount(response.data?.count.comments)
                        setLikesCount(response.data?.count.likes)
                    }
                },
                function () {
                    global.openNotification("Ошибка", response.data?.message, "error")
                    global._history.replace("/")
                },
            )
        })
    }

    function changeRole(value, name) {
        if (user.roles.includes(value)) {
            return global.openNotification("Предупреждение", `Пользователь уже ${name}`, "warn")
        }
        axios.post(ApiRoutes.API_SET_ROLE, {user_id: user.id, new_role: value})
            .then(response => {
                global.handleResponse(response,
                    function () {
                        let username = ""
                        username += response.data.profile?.middle_name ? response.data.profile.middle_name + " " : "";
                        username += response.data.profile?.first_name ? response.data.profile.first_name + " " : "";
                        username += response.data.profile?.last_name ? response.data.profile.last_name : "";
                        response.data.profile.fio = username
                        setUser(response.data?.profile)
                        global.openNotification("Успешно", `Роль пользователя изменена на ${response.data?.profile.role_name}`, "success")
                    },
                    function () {
                        global.openNotification("Ошибка", response.data?.message, "error")
                    },
                )
            })
    }

    return (
        <>
            <Login visible={visibleLogin} setVisible={setVisibleLogin}/>
            <Col className={"f-main"} style={{minHeight: '100vh', display: 'flex', justifyContent: 'flex-start'}}>
                {(notifications === false || notifications === true) && <Header/>}
                {
                    global.layout !== "guest" ?
                        <NavLink to={global.lang + "/idea/add/"} className={"f-new-idea"}>
                            <p className={"f-new-idea-text"}></p>
                        </NavLink> :
                        <a onClick={() => setVisibleLogin(!visibleLogin)} className={"f-new-idea"}>
                            <p className={"f-new-idea-text"}></p>
                        </a>
                }
                <div style={{display: "flex", flexDirection: "column"}}>
                    <div className={"max_width"}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: "center",
                            alignItems: "center",
                            width: '50vw',
                            minWidth: 600,
                            paddingTop: 135,
                        }}>
                            {loadingProfile && roles !== [] ?
                                <div className={"f-cards"}>
                                    <div className={"f-cards-card-wrap"}>
                                        <div className={"f-cards-inner"}>
                                            <div className={"f-cards-div-wrap-text"}>
                                                <span className={"f-cards-content-text"}>
                                                    <Skeleton active avatar paragraph={{rows: 1}}/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className={"f-cards"}>
                                    <div className={"f-cards-card-wrap"}>
                                        <div className={"f-cards-inner"}>
                                            <div className={"f-cards-avatar"} style={{marginBottom: 25}}>
                                                <div className={"f-cards-row-wrap"}>
                                                    <Avatar size={48} style={{backgroundColor: '#AAB2BD'}}
                                                            src={user.image
                                                                ? <img src={user.image}/>
                                                                : <UserOutlined/>
                                                            }/>
                                                    <div className={"f-cards-wrap-text-style"}>
                                                        <div>
                                                        <span className={"f-cards-text"}>
                                                            {user.fio}
                                                            {roles && ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => roles?.includes(el)) &&
                                                            <img style={{marginBottom: 3, marginLeft: 5}}
                                                                 src={"/i/official.svg"} width={15}
                                                                 height={15}/>
                                                            }
                                                        </span>
                                                        </div>
                                                        <span className={"f-cards-text-bottom"}>{user.role_name}</span>
                                                    </div>
                                                </div>
                                                {
                                                    global.layout === "admin" && roles[0] ?
                                                        <Select
                                                            value={roles[0]}
                                                            size={'large'}
                                                            onSelect={(value, option) => {
                                                                changeRole(value, option.data)
                                                            }}
                                                            // bordered={false}
                                                            style={{height: '100%'}}
                                                            // defaultValue={roles[0]}
                                                        >
                                                            <Option data={"Генератор идей"} value={"ROLE_USER"}>Генератор
                                                                идей</Option>
                                                            <Option data={"Администратор"}
                                                                    value={"ROLE_ADMIN"}>Администратор</Option>
                                                            <Option data={"Разработчик"}
                                                                    value={"ROLE_DEVELOPER"}>Разработчик</Option>
                                                        </Select>
                                                        : <></>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            <div style={{
                                display: 'flex',
                                paddingLeft: "40px",
                                width: "100%",
                                maxWidth: 1000,
                            }}>
                                {notifications &&
                                <div style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 100,
                                    marginTop: 10,
                                    backgroundColor: '#3D72ED'
                                }}/>
                                }
                                <a onClick={() => setSelectedHeaderItem(0)} className={"f-profile-header"}
                                   style={{
                                       color: selectedHeaderItem === 0 && "#1D1D1F",
                                       marginLeft: notifications ? 5 : 22
                                   }}>
                                    Публикации <a style={{color: "#AAB2BD"}}>{ideasCount >= 0 ? ideasCount : 0}</a>
                                    {selectedHeaderItem === 0 && <div className={"f-bottom-selected"}/>}
                                </a>
                                <a onClick={() => setSelectedHeaderItem(1)} className={"f-profile-header"}
                                   style={{color: selectedHeaderItem === 1 && "#1D1D1F"}}>
                                    Комментарии <a
                                    style={{color: "#AAB2BD"}}>{commentsCount >= 0 ? commentsCount : 0}</a>
                                    {selectedHeaderItem === 1 && <div className={"f-bottom-selected"}/>}
                                </a>
                                <a onClick={() => setSelectedHeaderItem(2)} className={"f-profile-header"}
                                   style={{color: selectedHeaderItem === 2 && "#1D1D1F"}}>
                                    Понравилось <a style={{color: "#AAB2BD"}}>{likesCount >= 0 ? likesCount : 0}</a>
                                    {selectedHeaderItem === 2 && <div className={"f-bottom-selected"}/>}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className={"max_width"} style={{marginTop: 50}}>
                        <div style={{
                            display: "flex",
                            justifyContent: 'center',
                            flexDirection: "column",
                            alignItems: "center",
                            width: '50vw',
                            minWidth: 600,
                        }}>
                            {
                                !user || loadingProfile || !roles[0] ? <LoadingIdeas type={true}/>
                                    : selectedHeaderItem === 0 ?
                                    <UserIdeas user={user} user_id={params.id} setCount={setIdeasCount}
                                               setNotifications={changeNotifications}/> :
                                    selectedHeaderItem === 1 ?
                                        <UserComments user={user} user_id={params.id} setCount={setCommentsCount}/> :
                                        selectedHeaderItem === 2 &&
                                        <UserFavourite user={user} user_id={params.id} setCount={setLikesCount}/>
                            }
                        </div>
                    </div>
                </div>
            </Col>
        </>
    )
};

export default Profile;