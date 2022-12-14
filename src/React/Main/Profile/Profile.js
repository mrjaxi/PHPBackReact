import React, {useCallback, useEffect, useLayoutEffect, useState} from "react";
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
import {func} from "prop-types";

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

    function setCounts(counts){
        setIdeasCount(counts?.ideas)
        setCommentsCount(counts?.comments)
        setLikesCount(counts?.likes)
    }

    function updateCounts(){
        axios.get(ApiRoutes.API_GET_USER_DATA.format(params.id)).then(response => {
            global.handleResponse(response,
                function () {
                    if (response.data?.count) {
                        setIdeasCount(response.data?.count.ideas)
                        setCommentsCount(response.data?.count.comments)
                        setLikesCount(response.data?.count.likes)
                    }
                },
                function () {
                    global.openNotification("????????????", response.data?.message, "error")
                    global._history.replace("/")
                },
            )
        })
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
                    global.openNotification("????????????", response.data?.message, "error")
                    global._history.replace("/")
                },
            )
        })
    }

    function changeRole(value, name) {
        if (user.roles.includes(value)) {
            return global.openNotification("????????????????????????????", `???????????????????????? ?????? ${name}`, "warn")
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
                        global.openNotification("??????????????", `???????? ???????????????????????? ???????????????? ???? ${response.data?.profile.role_name}`, "success")
                    },
                    function () {
                        global.openNotification("????????????", response.data?.message, "error")
                    },
                )
            })
    }

    return (
        <>
            <Login visible={visibleLogin} setVisible={setVisibleLogin}/>
            <Col className={"f-main"} style={{minHeight: '100vh', display: 'flex', justifyContent: 'flex-start'}}>
                {(notifications === false || notifications === true || notifications === undefined || notifications === null) && <Header/>}
                {/*<Header/>*/}
                {
                    global.layout !== "guest" ?
                        <NavLink to={global.lang + "/idea/add/"} className={"f-new-idea f-new-idea-profile"}>
                            <p className={"f-new-idea-text"}></p>
                        </NavLink> :
                        <a onClick={() => setVisibleLogin(!visibleLogin)} className={"f-new-idea f-new-idea-profile"}>
                            <p className={"f-new-idea-text"}></p>
                        </a>
                }
                <div style={{display: "flex", flexDirection: "column"}}>
                    <div className={"f-profile-wrapper-container"}>
                        <div className={"f-profile-wrapper-container-2"}>
                            {loadingProfile && roles !== [] ?
                                <div className={"f-cards"}>
                                    <div className={"f-cards-card-wrap"}>
                                        <div className={"f-cards-inner sub-change-padding-mobile"}>
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
                                        <div className={"f-cards-inner sub-change-padding-mobile"}>
                                            <div className={"f-cards-avatar"} style={{marginBottom: 25}}>
                                                <div className={"f-cards-row-wrap"}>
                                                    <Avatar size={48} style={{minWidth: 48, minHeight: 48,backgroundColor: '#AAB2BD'}}
                                                            src={user.image
                                                                ? <img src={user.image}/>
                                                                : <UserOutlined/>
                                                            }/>
                                                    <div className={"f-cards-wrap-text-style"} style={{ width: '70%' }}>
                                                        <div>
                                                        <span className={"f-cards-text"}>
                                                            <p className={"f-fio-text"}>
                                                                {user.fio}
                                                                {roles && ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => roles?.includes(el)) &&
                                                                <img style={{marginBottom: 3, marginLeft: 5}}
                                                                     src={"/i/official.svg"} width={15}
                                                                     height={15}/>
                                                                }
                                                            </p>
                                                        </span>
                                                        </div>
                                                        <span className={"f-cards-text-bottom"}>{user.role_name}</span>
                                                    </div>
                                                </div>
                                                {
                                                    (global.layout === "admin" && roles[0]) && user.id !== global.user.id  ?
                                                        <Select
                                                            value={roles[0]}
                                                            size={'large'}
                                                            className={"f-select-mobile"}
                                                            dropdownMatchSelectWidth={false}
                                                            onSelect={(value, option) => {
                                                                changeRole(value, option.data)
                                                            }}
                                                            // bordered={false}
                                                            style={{height: '100%'}}
                                                            // defaultValue={roles[0]}
                                                        >
                                                            <Option data={"?????????????????? ????????"} value={"ROLE_USER"}>??????????????????
                                                                ????????</Option>
                                                            <Option data={"??????????????????????????"}
                                                                    value={"ROLE_ADMIN"}>??????????????????????????</Option>
                                                            <Option data={"??????????????????????"}
                                                                    value={"ROLE_DEVELOPER"}>??????????????????????</Option>
                                                        </Select>
                                                        :
                                                        <div>
                                                            <p style={{
                                                                whiteSpace: "nowrap",
                                                            }} className={"f-cards-type-viewed"}>{user.role_name}</p>
                                                        </div>
                                                }
                                            </div>
                                            {
                                                ((user?.email || user?.phone) && ["ROLE_ADMIN", "ROLE_DEV"].some(el => global.user?.roles?.includes(el))) &&
                                                <div style={{ marginLeft: 58 }}>
                                                    {
                                                        user?.email && <p style={{ fontSize: 17, color: "#1D1D1D" }}>??????????: {user.email}</p>
                                                    }
                                                    {
                                                        user?.phone && <p style={{ fontSize: 17, color: "#1D1D1D" }}>?????????? ????????????????: +{user.phone}</p>
                                                    }
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            }
                            <div className={"f-select-in-profile"}>
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
                                    ???????????????????? <a style={{color: "#AAB2BD"}}>{ideasCount >= 0 ? ideasCount : 0}</a>
                                    {selectedHeaderItem === 0 && <div className={"f-bottom-selected"}/>}
                                </a>
                                <a onClick={() => setSelectedHeaderItem(1)} className={"f-profile-header"}
                                   style={{color: selectedHeaderItem === 1 && "#1D1D1F"}}>
                                    ?????????????????????? <a
                                    style={{color: "#AAB2BD"}}>{commentsCount >= 0 ? commentsCount : 0}</a>
                                    {selectedHeaderItem === 1 && <div className={"f-bottom-selected"}/>}
                                </a>
                                <a onClick={() => setSelectedHeaderItem(2)} className={"f-profile-header"}
                                   style={{color: selectedHeaderItem === 2 && "#1D1D1F"}}>
                                    ?????????????????????? <a style={{color: "#AAB2BD"}}>{likesCount >= 0 ? likesCount : 0}</a>
                                    {selectedHeaderItem === 2 && <div className={"f-bottom-selected"}/>}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className={"max_width disable-style"} style={{marginTop: 50}}>
                        <div className={"f-profile-wrapper-container"}>
                            {
                                !user || loadingProfile || !roles[0] ? <LoadingIdeas type={true}/>
                                    : selectedHeaderItem === 0 ?
                                    <UserIdeas user={user} user_id={params.id} setCount={setCounts} updateCounts={updateCounts}
                                               setNotifications={changeNotifications}/> :
                                    selectedHeaderItem === 1 ?
                                        <UserComments user={user} user_id={params.id} setCount={setCounts} updateCounts={updateCounts}/> :
                                        selectedHeaderItem === 2 &&
                                        <UserFavourite user={user} user_id={params.id} setCount={setCounts} updateCounts={updateCounts}/>
                            }
                        </div>
                    </div>
                </div>
            </Col>
        </>
    )
};

export default Profile;