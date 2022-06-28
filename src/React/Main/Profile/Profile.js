import React, {useState} from "react";
import { useParams } from "react-router";
import { Col } from "antd";
import Header from "../Components/Header";
import UserIdeas from "./UserIdeas";
import UserComments from "./UserComments";
import UserFavourite from "./UserFavourite";

const Profile = () => {

    const params = useParams();
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);

    return (
        <>
            <Col className={"f-main"} style={{minHeight: '100vh', display: 'flex', justifyContent: 'flex-start'}}>
                <div>
                    <Header/>
                    <div className={"max_width"}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '35vw',
                            marginLeft: "21vw",
                            paddingTop: "15vh",
                        }}>
                            <a onClick={() => setSelectedHeaderItem(0)} className={"f-profile-header"}
                               style={{color: selectedHeaderItem === 0 && "#1D1D1F"}}>
                                Публикации
                                {selectedHeaderItem === 0 && <div className={"f-bottom-selected"}/>}
                            </a>
                            <a onClick={() => setSelectedHeaderItem(1)} className={"f-profile-header"}
                               style={{color: selectedHeaderItem === 1 && "#1D1D1F"}}>
                                Комментарии
                                {selectedHeaderItem === 1 && <div className={"f-bottom-selected"}/>}
                            </a>
                            <a onClick={() => setSelectedHeaderItem(2)} className={"f-profile-header"}
                               style={{color: selectedHeaderItem === 2 && "#1D1D1F"}}>
                                Понравилось
                                {selectedHeaderItem === 2 && <div className={"f-bottom-selected"}/>}
                            </a>
                        </div>

                    </div>
                </div>
                {
                    selectedHeaderItem === 0 ?
                        <UserIdeas user_id={params.id}/> :
                        selectedHeaderItem === 1 ?
                            <UserComments user_id={params.id}/> :
                            selectedHeaderItem === 2 &&
                                <UserFavourite user_id={params.id}/>
                }
            </Col>
        </>
    )
};

export default Profile;