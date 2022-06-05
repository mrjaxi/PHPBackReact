import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import axios from "axios";

const Navigation = ({ categories, setSelectedCategory, loadData, selectedPanelMenu, selectedType, selectedCategory }) => {
    return (
        <navigation className={"f-nav-wrap"}>
            <div className={"f-nav max_width"}>
                {
                    categories.map((category) => (
                        <a onClick={() => { setSelectedCategory(category.id), loadData(null, null, category.id) }} className={"f-nav-button " + (category.id === selectedCategory && "f-nav-button-active")}>{ category.name }</a>
                    ))
                }
                <img className={"f-nav-button-img"} src={"/i/threedot.svg"}/>
                <NavLink to={"/search"}>
                    <img className={"f-nav-button-img"} src={"/i/search.svg"}/>
                </NavLink>
            </div>
        </navigation>
    )
};

export default Navigation;