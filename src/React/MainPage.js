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
import InfiniteScroll from "react-infinite-scroll-component";

const MainPage = (props) => {
    const urlParams = new URLSearchParams(props.location.search);

    const [wait, setWait] = useState(true);

    const [types, setTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [includedTypes, setIncludedTypes] = useState(urlParams.get("types") ? Object.values(JSON.parse(urlParams.get("types"))) : []);
    const [includedStatuses, setIncludedStatuses] = useState(urlParams.get("status") ? Object.values(JSON.parse(urlParams.get("status"))) : []);
    const [includedCategories, setIncludedCategories] = useState(urlParams.get("categories") ? Object.values(JSON.parse(urlParams.get("categories"))) : []);

    const [page, setPage] = useState(1);
    const [ideas, setIdeas] = useState([]);
    const [visibleLogin, setVisibleLogin] = useState(false);

    const [loading, setLoading] = useState(true);
    const [loadingInfinite, setLoadingInfinite] = useState(true);

    useLayoutEffect(() => {
        getCategory();
    },[]);

    useEffect(() => {
        updateStatuses()
        loadData()
    },[includedTypes, includedStatuses, includedCategories, page]);

    const selectCategory = (categoryId) => {
        if(categoryId) {
            let prevIncludedCategories = [...includedCategories];
            if (prevIncludedCategories.indexOf(categoryId) >= 0) {
                prevIncludedCategories = prevIncludedCategories.filter(item => item !== categoryId)
            } else {
                prevIncludedCategories.push(categoryId);
            }
            setPage(1)
            setIncludedCategories(prevIncludedCategories);
        }
        return true;
    };

    const selectStatus = (statusId) => {
        if(statusId) {
            let prevIncludedStatuses = [...includedStatuses];
            if (prevIncludedStatuses.indexOf(statusId) >= 0) {

                prevIncludedStatuses = prevIncludedStatuses.filter(item => item !== statusId)
            } else {
                prevIncludedStatuses.push(statusId);
            }
            setPage(1)
            setIncludedStatuses(prevIncludedStatuses);
        }
        return true;
    };

    const selectType = (typeId) => {
        if(typeId){
            let prevIncludesTypes = [...includedTypes];
            if (prevIncludesTypes.indexOf(typeId) >= 0){

                prevIncludesTypes = prevIncludesTypes.filter(item => item !== typeId)
            } else {
                prevIncludesTypes.push(typeId);
            }
            setPage(1)
            setIncludedTypes(prevIncludesTypes);
        }
        return true;
    };

    const loadData = () => {
        let data = [];
        let params = {
            order: urlParams.get("order") ? urlParams.get("order") : "id",
            type: urlParams.get("type") ? urlParams.get("type") : "desc",
            page: page,
        };
        if (page > 1){
            data = [...ideas];
            setLoadingInfinite(true);
        } else {
            setLoading(true);
        }

        if(includedCategories.length !== 0){
            params["categories"] = JSON.stringify([...includedCategories])
        }
        if(includedTypes.length !== 0){
            params["types"] = JSON.stringify([...includedTypes])
        }
        if(includedStatuses.length !== 0){
            params["status"] = JSON.stringify([...includedStatuses])
        }

        let serializedParams = "";
        for (let key in params) {
            if(serializedParams === ""){
                serializedParams += `${key}=${params[key]}`
            } else {
                serializedParams += `&${key}=${params[key]}`
            }
        }
        global._history.replace(`${global.lang}/?${serializedParams}`);
        axios.get(ApiRoutes.API_GET_IDEAS + "?" + serializedParams)
            .then(response => {
                switch (response.data?.state) {
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
                                    categoryId: idea.category.id,
                                    category: idea.category.name,
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
                        setLoadingInfinite(false);
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
                <Login visible={visibleLogin} setVisible={setVisibleLogin}/>
                <Col className={"f-main"}>
                    <div>
                        <Header search={true}/>
                        <section className={"max_width"} style={{marginTop: "100px"}}>
                            <div className={"f-section"}>
                                <div>
                                    <p className={"f-section-wrap-p-text"} style={{
                                        marginBottom: 0,
                                        marginTop: "20px",
                                    }}>Мы ценим мнение</p>
                                    <p className={"f-section-wrap-p-text"} style={{ marginBottom: 0 }}>клиентов и рады,</p>
                                    <p className={"f-section-wrap-p-text"} style={{ marginBottom: 0 }}>когда вы делитесь</p>
                                    <p className={"f-section-wrap-p-text"} style={{ marginBottom: 0 }}>им с нами</p>
                                </div>
                            </div>
                        </section>
                        <Navigation
                            categories={categories}
                            selectCategory={selectCategory}
                            includedCategory={includedCategories}
                        />
                        {
                            global.layout !== "guest" ?
                                <NavLink to={global.lang + "/idea/add/"} className={"f-new-idea"}>
                                    <p className={"f-new-idea-text"}>Новая идея</p>
                                </NavLink> :
                                <a onClick={() => setVisibleLogin(!visibleLogin)} className={"f-new-idea"}>
                                    <p className={"f-new-idea-text"}>Новая идея</p>
                                </a>
                        }
                        <div className={"f-row-type max_width"}>
                            <div
                                style={{
                                    width: '100%',
                                    flexDirection: "column",
                                    paddingRight: "100px",
                                    paddingLeft: "20%",
                                    marginBottom: "180px",
                                }}
                            >
                                {loading ? <LoadingIdeas type={true}/> :
                                    ideas.length === 0 ? <EmptyIdeas text={"Пока нет записей..."}/>
                                        : <InfiniteScroll
                                            style={{overflow: 'hidden'}}
                                            next={() => {
                                                setPage(page + 1)
                                            }}
                                            hasMore={true}
                                            dataLength={ideas.length}
                                            loader={loadingInfinite ? <LoadingIdeas type={true}/> : <></>}
                                        >
                                            {
                                                ideas.map((idea, index) => (
                                                    <IdeaItem
                                                        item={idea}
                                                        index={index + 1}
                                                        setItem={setIdea}
                                                        statuses={statuses}
                                                        selectType={selectType}
                                                        selectCategory={selectCategory}
                                                    />
                                                ))
                                            }
                                        </InfiniteScroll>
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