import React from "react";
import {Skeleton} from "antd";

const Navigation = ({categories, selectCategory, includedCategory}) => {

    return (
        <>
            <navigation className={"f-nav-wrap"}>
                <div className={"f-nav max_width"} style={{
                    maxWidth: '80%',
                    padding: 0,
                    marginLeft: 80,
                    paddingLeft: 17
                    }}>
                        <div id={"start"}></div>
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
                </div>
            </navigation>
        </>
    )
};

export default Navigation;