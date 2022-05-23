import React, {useEffect, useState} from "react";
import {Col} from "antd";
import Header from "../Components/Header";
import Navigation from "../Components/Navigation";

const Profile = () => {
    const [categories, setCategories] = useState([]);

    const [selectedPanelMenu, setSelectedPanelMenu] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const loadData = () => {

    };

    return (
        <>
            <Col className={"f-main"}>
                <div>
                    <Header />
                    <Navigation
                        categories={categories}
                        loadData={loadData}
                        selectedCategory={selectedCategory}
                        selectedPanelMenu={selectedPanelMenu}
                        selectedType={selectedType}
                        setSelectedCategory={setSelectedCategory}
                    />
                    <section>
                        <div>
                            <div>
                                Тест
                            </div>
                            <div>
                                Тест
                            </div>
                            <div>
                                Тест
                            </div>
                        </div>
                    </section>
                </div>
            </Col>
        </>
    )
};

export default Profile;