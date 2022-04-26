import React from "react";

const Comments = () => {
    return (
        <div className={"f-comments"}>
            <span className={"f-comments-tip-text"}>Комментарии</span>
            <div className={"f-comments-scroll"}>
                <div className={"f-cards-avatar f-cards-avatar-bottom-border"} style={{ marginTop: 20 }}>
                    <div className={"f-cards-row-wrap"}>
                        <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                        <div className={"f-cards-wrap-text"}>
                            <span className={"f-cards-text"}>Константин Константинопольский</span>
                            <span className={"f-cards-content-description"}>
                                Если хочешь сделать 2 выделения через Shift,
                                то веделяешь модуль, через Shift другой — получаешь
                                выделенный диапазон; потом через Ctrl выделяешь
                                другой модуль и через Ctrl + Shift  ещё — получаешь
                                2 выделенных диапазона
                            </span>
                        </div>
                    </div>
                </div>
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