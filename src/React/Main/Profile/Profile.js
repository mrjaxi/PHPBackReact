import React, {useState} from "react";
import {Col, Select} from "antd";
import Header from "../Components/Header";
import UserIdeas from "./UserIdeas";
import UserComments from "./UserComments";
import UserFavourite from "./UserFavourite";
// import UserComments from "../Profile/UserComments"
// import UserIdeas from "./UserIdeas";

const Profile = () => {
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);

    return (
        <>
            <Col className={"f-main"} style={{ minHeight: '100vh', display: 'flex', justifyContent: 'flex-start' }}>
                <div>
                    <Header />
                    <section>
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'center'}}>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '40%', justifyContent: 'space-around' }}>
                                <a onClick={() => setSelectedHeaderItem(0)} className={"f-profile-header"} style={{ color: selectedHeaderItem === 0 && "#1D1D1F" }}>
                                    Публикации
                                    { selectedHeaderItem === 0 && <div className={"f-bottom-selected"} /> }
                                </a>
                                <a onClick={() => setSelectedHeaderItem(1)} className={"f-profile-header"} style={{ color: selectedHeaderItem === 1 && "#1D1D1F" }}>
                                    Комментарии
                                    { selectedHeaderItem === 1 && <div className={"f-bottom-selected"} /> }
                                </a>
                                <a onClick={() => setSelectedHeaderItem(2)} className={"f-profile-header"} style={{ color: selectedHeaderItem === 2 && "#1D1D1F" }}>
                                    Понравилось
                                    { selectedHeaderItem === 2 && <div className={"f-bottom-selected"} /> }
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
                {
                    selectedHeaderItem === 0 ?
                        <UserIdeas/> :
                        selectedHeaderItem === 1 ?
                            <UserComments/> :
                            selectedHeaderItem === 2 &&
                                <UserFavourite/>
                }
            </Col>
        </>
    )
};

export default Profile;