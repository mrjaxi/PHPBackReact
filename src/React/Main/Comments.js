import React from "react";
import { Skeleton } from "antd";

const Comments = ({ comments, loading }) => {
    return (
        <div className={"f-comments"}>
            <span className={"f-comments-tip-text"}>Комментарии</span>
            <div className={"f-comments-scroll"}>
                {
                    loading ? <Skeleton active style={{ width: '100%', height: '200px' }} />:
                    comments.map(comment => (
                        <div className={"f-cards-avatar f-cards-avatar-bottom-border"} style={{ marginTop: 20 }}>
                            <div className={"f-cards-row-wrap"}>
                                <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                <div className={"f-cards-wrap-text"}>
                                    <span className={"f-cards-text"}>Константин Константинопольский</span>
                                    <span className={"f-cards-content-description"}>
                                        {
                                            comment.content
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className={"f-write-comments"}>
                <span className={"f-write-comments-title"}>Написать</span>
                <textarea cols={5} wrap={"hard"} placeholder={"Напишите что-нибудь..."} className={"f-write-comments-input"}/>
                <button className={"f-write-comments-button"}>Отправить</button>
            </div>
        </div>
    )
};

export default Comments;