import React from "react";

const EmptyIdeas = ({text = "Пока нет записей..."}) => {

    return (
        <div className={"f-cards"}>
            <div className={"f-cards-card-wrap"}>
                <div className={"f-cards-inner sub-change-padding-mobile"}>
                    <div className={"f-cards-div-wrap-text"}>
                        <span className={"f-cards-content-text"}>
                            <div>{text}</div>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default EmptyIdeas;