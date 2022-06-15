import React, {useState} from "react";
import Search from "./Search";

const Navigation = ({categories, setSelectedCategory, selectedCategory}) => {

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
                            <a onClick={() => {
                                setSelectedCategory(category.id)
                            }}
                               className={"f-nav-button " + (category.id === selectedCategory && "f-nav-button-active")}>{category.name}</a>
                        ))
                    }
                </div>
            </navigation>
        </>
    )
};

export default Navigation;