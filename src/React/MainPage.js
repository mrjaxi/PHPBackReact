import React, {useEffect, useLayoutEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import './sass/main-component.scss'
import {Col, Skeleton} from "antd";
import axios from "axios";
import Header from "./Main/Components/Header";
import Navigation from "./Main/Components/Navigation";
import ApiRoutes from "./Routes/ApiRoutes";
import FlatList from 'flatlist-react';
import IdeaItem from "./Main/Components/Idea/IdeaItem";
import LoadingIdeas from "./Main/Components/Idea/LoadingIdeas";
import EmptyIdeas from "./Main/Components/Idea/EmptyIdeas";
import Login from "./Main/Auth/Login";

const MainPage = (props) => {

    let data = [];

    const urlParams = new URLSearchParams(props.location.search);

    const [wait, setWait] = useState(true);

    const [types, setTypes] = useState(urlParams.get("types") ? JSON.parse(urlParams.get("types")) : []);
    const [statuses, setStatuses] = useState(urlParams.get("statuses") ? JSON.parse(urlParams.get("categories")) : []);
    const [categories, setCategories] = useState(urlParams.get("categories") ? JSON.parse(urlParams.get("categories")) : []);

    const [includedTypes, setIncludedTypes] = useState(urlParams.get("types") ? JSON.parse(urlParams.get("types")) : []);
    const [includedStatuses, setIncludedStatuses] = useState(urlParams.get("status") ? JSON.parse(urlParams.get("status")) : []);
    const [includedCategory, setIncludedCategory] = useState([]);

    const [ideas, setIdeas] = useState([]);
    const [visible, setVisible] = useState();
    const [selectedCategory, setSelectedCategory] = useState(urlParams.get("categories") ? Number(urlParams.get("categories")) : '');

    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        console.log(JSON.parse(urlParams.get("types")))
        getCategory();
    },[]);

    useEffect(() => {
        if(selectedCategory){
            updateStatuses()
            loadData()
        }
    },[selectedCategory, includedTypes, includedStatuses]);

    const selectStatus = (statusId) => {
        if(statusId) {
            let prevIncludedStatuses = [...includedStatuses];

            if (prevIncludedStatuses.indexOf(statusId) >= 0) {
                console.log("такой есть");
                prevIncludedStatuses = prevIncludedStatuses.filter(item => item !== statusId)
            } else {
                console.log("такого нет запушил");
                prevIncludedStatuses.push(statusId);
            }
            setIncludedStatuses(prevIncludedStatuses);
        }
    };

    const selectType = (typeId) => {
        if(typeId){
            let prevIncludesTypes = [...includedTypes];

            if (prevIncludesTypes.indexOf(typeId) >= 0){
                console.log("такой есть");
                prevIncludesTypes = prevIncludesTypes.filter(item => item !== typeId)
            } else {
                console.log("такого нет запушил");
                prevIncludesTypes.push(typeId);
            }
            setIncludedTypes(prevIncludesTypes);
        }
        return true;
    };

    const loadData = (status=null, type=null) => {
        setLoading(true);
        data = [];
        let params = {
            order: urlParams.get("order") ? urlParams.get("order") : "id",
            type: urlParams.get("type") ? urlParams.get("type") : "desc",
            page: urlParams.get("page") ? urlParams.get("page") : 1,
        };

        if(includedTypes.length !== 0){
            console.log("[...includedTypes]", [...includedTypes])
            params["types"] = JSON.stringify([...includedTypes])
        }
        if(includedStatuses.length !== 0){
            console.log("[...includedStatuses]", [...includedStatuses])
            params["status"] = JSON.stringify([...includedStatuses])
        }

        axios.get(ApiRoutes.API_GET_IDEAS.format(selectedCategory) + "?" + global.serialize(params)).then(response => {
            global._history.replace("?" + `${global.serialize(params)}&categories=${selectedCategory}`);
            switch(response.data?.state){
                case "success":
                    if (response.data?.ideas !== null) {
                        response.data.ideas.map(idea => {
                            data.push({
                                idea_id: idea.id,
                                title: idea.title,
                                text: idea.content,
                                showComments: false,//idea.comments.length > 0,
                                showFullText: false,
                                roles: idea.user.roles,
                                role: idea.user.role_name,
                                status: idea.status,
                                photo: idea.photo,
                                comments: idea.comments,
                                like: Number(idea.likes),
                                dislike: 0,
                                username: idea.user?.first_name,
                                userImage: idea.user.image,
                                type: idea.type.name,
                                typeId: idea.type.id,
                                currentUserIsVote: idea.currentUserIsVote,
                                allowComments: idea.allowComments,
                                date: idea?.date
                            })
                        });
                    }
                    setIdeas(data);
                    setLoading(false)
                    break;
                case "error":
                    global.openNotification("Ошибка", response.data?.message, "error")
                    break;
                default:
                    global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                    break;
            }
            setWait(false);
        })
    };

    const getCategory = () => {
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setTypes(response.data.types);
            setStatuses(response.data.statuses);
            setCategories(response.data.categories);

            if(response.data?.categories){
                setSelectedCategory(urlParams.get("categories") ? Number(urlParams.get("categories")) : response.data.categories[0]?.id);
            }
        });
    };

    const updateStatuses = () => {
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setStatuses(response.data.statuses);
        })
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas]
        newIdeas[index] = idea
        setIdeas(newIdeas)
        updateStatuses()
    }

    if (wait) {
        return (
            <div className="loader-wrapper">
                <div className="loader" />
            </div>
        );
    } else {
        return (
            <>
                <Login visible={visible} setVisible={setVisible}/>
                <Col className={"f-main"}>
                    <div>
                        <Header search={true} />
                        <section className={"max_width"} style={{marginTop: "100px"}}>
                            <div className={"f-section"}>
                                <div className={"f-section-wrap-text"}>
                                    <p className={"f-section-wrap-p-text"} style={{
                                        marginBottom: 0,
                                        marginTop: "20px",
                                    }}>
                                        Мы ценим мнение
                                        клиентов и рады,
                                        когда вы делитесь
                                        им с нами
                                    </p>
                                </div>
                            </div>
                        </section>
                        <Navigation
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            includedCategory={includedCategory}
                            setIncludedCategory={setIncludedCategory}
                        />
                        {
                        global.layout !== "guest" ?
                        <NavLink to={global.lang + "/idea/add/"} className={"f-new-idea"}>
                            <p className={"f-new-idea-text"}>Новая идея</p>
                        </NavLink> :
                        <a onClick={() => setVisible(!visible)} className={"f-new-idea"}>
                            <p className={"f-new-idea-text"}>Новая идея</p>
                        </a>
                    }
                        <div className={"f-row-type max_width"}>
                            <div style={{
                                width: '100%',
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: 'center',
                                alignItems: "center",
                                paddingRight: "100px",
                                paddingLeft: "20%",
                                marginBottom: "180px",
                            }}>
                                {
                                    loading ? <LoadingIdeas type={true}/> :
                                        <FlatList
                                            list={ideas}
                                            renderItem={(idea, index) => {
                                                return(
                                                    <IdeaItem
                                                        item={idea}
                                                        index={index}
                                                        setItem={setIdea}
                                                        statuses={statuses}
                                                        selectType={selectType}
                                                    />
                                                )
                                            }}
                                            renderWhenEmpty={() =>
                                                <EmptyIdeas text={"Пока нет записей..."}/>
                                            }
                                        />
                                }
                            </div>
                            <section style={{ width: '20%', justifyContent: 'center', alignItems: "center", }}>
                                <div className={"f-side-block"}>
                                    <div className={"f-side-panel-wrap"}>
                                        {
                                            statuses.map((status, index) => (
                                                <a className={"f-side-panel-button-section "}
                                                   onClick={() => {
                                                       // console.log(`selectType(${status.id})`)
                                                       selectStatus(status.id)
                                                   }}
                                                   style={{
                                                       color: includedStatuses.includes(status.id) && "#fff",
                                                       backgroundColor: includedStatuses.includes(status.id) && (status?.color ? status?.color : "#ffffff00"),
                                                       borderRadius: "65px",
                                                   }}
                                                >{status.translate}
                                                    <span
                                                        className={"f-side-panel-count-subtext " + (includedStatuses.includes(status.id) && "f-block")}
                                                    >{status.ideasCount}</span>
                                                </a>
                                            ))
                                        }
                                    </div>
                                    <div className={"f-side-panel-wrap"}>
                                        {
                                            types.map((type) => (
                                                <a className={"f-side-panel-button"}
                                                   onClick={() => {
                                                       // console.log(`selectType(${type.id})`)
                                                       selectType(type.id)
                                                   }}
                                                   style={{color: includedTypes.includes(type.id) && (type?.color ? type?.color : "#3D72ED"),
                                                       borderColor: includedTypes.includes(type.id) && (type?.color ? type?.color : "#3D72ED") }}
                                                >#{type.name}</a>
                                            ))
                                        }
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </Col>
            </>
        )
    }
};

export default MainPage;