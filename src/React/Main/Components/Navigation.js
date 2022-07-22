import React from "react";
import {Skeleton} from "antd";

const Navigation = ({ selectCategory, includedCategory }) => {

    return (
        <>
            <navigation className={"f-nav max_width"} style={{maxWidth: 1000}}>
                <div className={"f-nav-wrap"} style={{ display: 'flex', alignItems: 'center' }}>
                { global.categories?.length > 0 ?
                    global.categories.map((category) => (
                        <a className={"f-nav-button"}
                           style={(includedCategory.includes(category.id)) ? {
                               backgroundColor: "white",
                           } : {}}
                           key={category.id}
                           href={global.isFireFox ? null : "#start"}
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
                </div>
            </navigation>
        </>
    )
};

export default Navigation;