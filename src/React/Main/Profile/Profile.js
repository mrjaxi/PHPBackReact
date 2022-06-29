import React, {useEffect, useLayoutEffect, useState} from "react";
import { useParams } from "react-router";
import {Avatar, Col, Select, Skeleton} from "antd";
import Header from "../Components/Header";
import UserIdeas from "./UserIdeas";
import UserComments from "./UserComments";
import UserFavourite from "./UserFavourite";
import {UserOutlined} from "@ant-design/icons";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
const {Option} = Select;

const Profile = () => {

    const params = useParams();
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);
    const [roles, setRoles] = useState([])
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

    useLayoutEffect(() => {
        getUser();
    }, [])

    useEffect(() => {
        if(user?.email) {
            setLoadingProfile(false)
            setRoles(user?.roles)
        }
    }, [user])

    function getUser() {
        axios.get(ApiRoutes.API_GET_USER_DATA.format(params.id)).then(response => {
            switch (response.data?.state) {
                case "trouble":
                case "success":
                    if (response.data?.profile) {
                        let username = ""
                        username += response.data.profile?.middle_name ? response.data.profile.middle_name + " " : "";
                        username += response.data.profile?.first_name ? response.data.profile.first_name + " " : "";
                        username += response.data.profile?.last_name ? response.data.profile.last_name : "";
                        response.data.profile.fio = username
                        setUser(response.data.profile)
                    }
                    break;
                case "error":
                    global.openNotification("Ошибка", response.data?.message, "error")
                    break;
                default:
                    global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                    break;
            }
        })
    }

    function changeRole(value, name) {
        if(user.roles.includes(value)){
            return global.openNotification("Предупреждение", `Пользователь уже ${name}`, "warn")
        }
        axios.post(ApiRoutes.API_SET_ROLE, {user_id: user.id, new_role: value})
            .then(response => {
                switch (response.data?.state) {
                    case "success":
                        let username = ""
                        username += response.data.profile?.middle_name ? response.data.profile.middle_name + " " : "";
                        username += response.data.profile?.first_name ? response.data.profile.first_name + " " : "";
                        username += response.data.profile?.last_name ? response.data.profile.last_name : "";
                        response.data.profile.fio = username
                        setUser(response.data?.profile)
                        global.openNotification("Успешно", `Роль пользователя изменена на ${response.data?.profile.role_name}`, "success")
                        break;
                    case "error":
                        global.openNotification("Ошибка", response.data?.message, "error")
                        break;
                    default:
                        global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                        break;
                }
            })
    }

    return (
        <>
            <Col className={"f-main"} style={{minHeight: '100vh', display: 'flex', justifyContent: 'flex-start'}}>
                <Header/>
                <div style={{ display: "flex", flexDirection: "column"}}>
                    <div className={"max_width"}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: "center",
                            width: '50vw',
                            paddingTop: 135,
                        }}>
                            { loadingProfile && roles !== [] ?
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
                                                            { user.fio }
                                                            { roles && ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => roles?.includes(el)) &&
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
                                                            size={'large'}
                                                            onSelect={(value, data) => {
                                                                changeRole(value, data.data)
                                                            }}
                                                            // bordered={false}
                                                            style={{height: '100%'}}
                                                            defaultValue={roles[0]}
                                                        >
                                                            <Option data={"Генератор идей"} value={"ROLE_USER"}>Генератор идей</Option>
                                                            <Option data={"Администратор"} value={"ROLE_ADMIN"}>Администратор</Option>
                                                            <Option data={"Разработчик"} value={"ROLE_DEVELOPER"}>Разработчик</Option>
                                                        </Select> :
                                                        <></>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            <div style={{ display: 'flex', marginLeft: "30px", }}>
                                <a onClick={() => setSelectedHeaderItem(0)} className={"f-profile-header"}
                                   style={{color: selectedHeaderItem === 0 && "#1D1D1F"}}>
                                    Публикации
                                    {selectedHeaderItem === 0 && <div className={"f-bottom-selected"}/>}
                                </a>
                                <a onClick={() => setSelectedHeaderItem(1)} className={"f-profile-header"}
                                   style={{color: selectedHeaderItem === 1 && "#1D1D1F"}}>
                                    Комментарии
                                    {selectedHeaderItem === 1 && <div className={"f-bottom-selected"}/>}
                                </a>
                                <a onClick={() => setSelectedHeaderItem(2)} className={"f-profile-header"}
                                   style={{color: selectedHeaderItem === 2 && "#1D1D1F"}}>
                                    Понравилось
                                    {selectedHeaderItem === 2 && <div className={"f-bottom-selected"}/>}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className={"max_width"} style={{marginTop:50}}>
                        <div style={{
                            display: "flex",
                            justifyContent: 'center',
                            flexDirection: "column",
                            alignItems: "center",
                            width: '50vw'
                        }}>
                            {
                                loadingProfile && roles !== [] ? <LoadingIdeas type={true}/>
                                    : selectedHeaderItem === 0 ?
                                        <UserIdeas user={user} user_id={params.id}/> :
                                        selectedHeaderItem === 1 ?
                                            <UserComments user={user} user_id={params.id}/> :
                                            selectedHeaderItem === 2 &&
                                            <UserFavourite user={user} user_id={params.id}/>
                            }
                        </div>
                    </div>
                </div>
            </Col>
        </>
    )
};

export default Profile;