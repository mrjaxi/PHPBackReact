import React, {useEffect, useState} from "react";
import Search from "./Search";

const Navigation = ({categories, selectCategory, includedCategory}) => {

    // const selectCategory = (categoryId) => {
    //     if(categoryId) {
    //         let prevIncludedCategory = [...includedCategory];
    //
    //         if (prevIncludedCategory.indexOf(categoryId) >= 0) {
    //             console.log("такой есть");
    //             prevIncludedCategory = prevIncludedCategory.filter(item => item !== categoryId)
    //         } else {
    //             console.log("такого нет запушил");
    //             prevIncludedCategory.push(categoryId);
    //         }
    //         setIncludedCategory(prevIncludedCategory);
    //     }
    // };

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
                                // selectCategory(category.id),
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