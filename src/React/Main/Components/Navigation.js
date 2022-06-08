import React, {useState} from "react";
import Search from "./Search";

const Navigation = ({categories, setSelectedCategory, loadData, selectedPanelMenu, selectedType, selectedCategory}) => {

    const [visible, setVisible] = useState(false);

    return (
        <>
            <Search visible={visible} setVisible={setVisible}/>
            <navigation className={"f-nav-wrap"}>
                <div className={"f-nav max_width"} style={{

                }}>
                    {
                        categories.map((category) => (
                            <a onClick={() => {
                                setSelectedCategory(category.id), loadData(null, null, category.id)
                            }}
                               className={"f-nav-button " + (category.id === selectedCategory && "f-nav-button-active")}>{category.name}</a>
                        ))
                    }
                    <a onClick={() => setVisible(!visible)}>
                        <img className={"f-nav-button-img"} src={"/i/search.svg"}/>
                    </a>
                </div>
            </navigation>
        </>
    )
};

export default Navigation;