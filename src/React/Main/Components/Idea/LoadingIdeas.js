import React from "react";
import { Skeleton } from "antd";

const LoadingIdeas = ({type = false}) => {

    return (
        <div className={"f-cards"}>
            { type &&
                <Skeleton className={"f-cards-hashtag sub-hashtag-style"} active paragraph={{rows: 0}}/>
            }
            <div className={"f-cards-card-wrap"}>
                <div className={"f-cards-inner"}>
                    <div className={"f-cards-div-wrap-text"}>
                            <span className={"f-cards-content-text"} style={{
                                flexDirection: "column"
                            }}>
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