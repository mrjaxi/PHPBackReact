import React, {useEffect, useState} from "react";
import Search from "./Search";

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
                    {
                        categories.map((category) => (
                            <a key={category.id} onClick={() => {
                                selectCategory(category.id)
                            }}
                               className={"f-nav-button " + ((includedCategory.includes(category.id)) && "f-nav-button-active")}>{category.name}</a>
                        ))
                    }
                </div>
            </navigation>
        </>
    )
};

export default Navigation;