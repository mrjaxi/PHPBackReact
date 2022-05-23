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
                <Header />
                <section>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'center'}}>
                        <div style={{ display: 'flex', flexDirection: 'row', width: '40%', justifyContent: 'space-between' }}>
                            <span style={{}}>
                                Публикации
                            </span>
                            <span>
                                Комментарии
                            </span>
                            <span>
                                Понравилось
                            </span>
                        </div>
                    </div>
                </section>
            </Col>
        </>
    )
};

export default Profile;