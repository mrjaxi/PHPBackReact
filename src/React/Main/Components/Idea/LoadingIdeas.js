import React from "react";
import { Skeleton } from "antd";

const LoadingIdeas = ({type = false}) => {

    return (
        <div className={"f-cards"}>
            { type &&
                <Skeleton className={"f-cards-hashtag"} active paragraph={{rows: 1}}/>
            }
            <div className={"f-cards-card-wrap"}>
                <div className={"f-cards-inner"}>
                    <div className={"f-cards-div-wrap-text"}>
                            <span className={"f-cards-content-text"}>
                                <Skeleton active avatar paragraph={{rows: 1}}/>
                                <Skeleton active/>
                            </span>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoadingIdeas;