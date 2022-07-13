import React from "react";
import {Skeleton} from "antd";

const Navigation = ({categories, selectCategory, includedCategory}) => {

    return (
        <>
            <navigation className={"f-nav max_width"} style={{
                display: "inline-flex",
                marginLeft: 80,
            }}>
                { categories?.length > 0 ?
                    categories.map((category) => (
                        <a className={"f-nav-button"}
                           style={(includedCategory.includes(category.id)) ? {
                               backgroundColor: "white",
                           } : {}}
                           key={category.id}
                           href={"#start"}
                           onClick={() => {
                               selectCategory(category.id)
                               global._history.push({
                                   hash: "#start"
                               })
                           }}
                        >
                            {category.name}
                        </a>
                    ))
                    : [1,2,3,4].map((item, index) => (
                        <div className={"f-nav-button noHover"} style={{width: 210, height: 83}}>
                            <Skeleton active paragraph={{ rows: 0 }}/>
                        </div>
                    ))
                }
            </navigation>
        </>
    )
};

export default Navigation;