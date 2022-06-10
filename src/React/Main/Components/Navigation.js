import React, {useState} from "react";
import Search from "./Search";

const Navigation = ({categories, setSelectedCategory, selectedCategory}) => {

    const [visible, setVisible] = useState(false)

    return (
        <>
            <Search visible={visible} setVisible={setVisible}/>
            <navigation className={"f-nav-wrap"}>
                <div className={"f-nav max_width"} style={{
                    maxWidth: '80%',
                    padding: 0,
                    marginLeft: "80px",
                }}>
                    {
                        categories.map((category) => (
                            <a onClick={() => {
                                setSelectedCategory(category.id)
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