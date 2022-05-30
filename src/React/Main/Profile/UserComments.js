import React, {useEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import {Select} from "antd";
import Comments from "../Comments";

const UserComments = () => {

    let data = [];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getUserComments = () => {
        axios.get(ApiRoutes.API_GET_USER_DATA.format(global.user.id) + "?" + global.serialize({page: "2"})).then(response => {
            if (response.data.state === "success" && response.data?.comments){
                response.data.comments.map(item => {
                    data.push({
                        id: item.id,
                        photo: item.user.image,
                        content: item.content,
                        roles: item.user.roles,
                        role: item.user.role_name,
                        username: item.user?.first_name,
                    })
                });

                setItems(data);
                setLoading(false)
            } else {
                setItems([]);
                setLoading(false)
            }
        })
    };

    useEffect(() => {
        getUserComments()
    }, []);

    return (
        <>
            {
                loading ? <></> :
                    <>
                        <div className={"f-row-type max_width"} style={{ marginTop: 100 }}>
                                <div className={"f-row-type max_width"} style={{ justifyContent: 'center' }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: 'center',
                                        flexDirection: "column",
                                        alignItems: "center",
                                        width: '70%'
                                    }}>
                                        {
                                            items.length === 0 ?
                                                <div className={"f-cards"}>
                                                    <div>
                                                        <div className={"f-cards-card-wrap"}>
                                                            <div className={"f-cards-inner"}>
                                                                <div className={"f-cards-div-wrap-text"}>
                                                                    <span className={"f-cards-content-text"}>
                                                                        <div>Вы пока не написали ни одного комментария...</div>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                items.map((item) => (
                                                    <div className={"f-cards"}>
                                                        <div>
                                                            <div className={"f-cards-card-wrap"}>
                                                                {
                                                                    item.photo !== null &&
                                                                    <div className={"f-cards-image-type"} style={{ backgroundImage: 'url("' + item.photo.split(";")[0] + '")' }} />
                                                                }
                                                                <div className={"f-cards-inner"}>
                                                                    <div className={"f-cards-avatar"}>
                                                                        <div className={"f-cards-row-wrap"}>
                                                                            <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                                            <div className={"f-cards-wrap-text"}>
                                                                                <span className={"f-cards-text"}>{ item.username }
                                                                                    {
                                                                                        item.roles.includes("ROLE_ADMIN") &&
                                                                                        <img style={{ marginBottom: 3, marginLeft: 5 }} src={"/i/official.svg"} width={15} height={15}/>
                                                                                    }
                                                                                </span>
                                                                                <span className={"f-cards-text-bottom"}>{ item.role }</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={"f-cards-div-wrap-text"}>
                                                                        <span className={"f-cards-content-text"}>
                                                                            { item.content }
                                                                        </span>
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                )
                                                )
                                        }
                                </div>
                            </div>
                        </div>
                </>
            }
        </>
    )
};
export default UserComments;