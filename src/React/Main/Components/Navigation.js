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
                        <a className={"f-nav-button " + ((includedCategory.includes(category.id)) && "f-nav-button-active")}
                           key={category.id}
                           onClick={() => selectCategory(category.id) }
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