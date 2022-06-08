import React, {useLayoutEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import './sass/main-component.scss'
import {Col, Skeleton} from "antd";
import axios from "axios";
import Header from "./Main/Components/Header";
import Navigation from "./Main/Components/Navigation";
import ApiRoutes from "./Routes/ApiRoutes";
import FlatList from 'flatlist-react';
import IdeaItem from "./Main/Idea/IdeaItem";

const MainPage = () => {

    let data = [];

    const [includedTypes, setIncludedTypes] = useState([]);
    const [includedId, setIncludedId] = useState([]);

    const [ideas, setIdeas] = useState([]);

    const [types, setTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [selectedPanelMenu, setSelectedPanelMenu] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        getCategory();
    }, []);

    const loadData = (id, type, category) => {
        setLoading(true);
        data = [];
        console.log("includedTypes:: ", includedTypes, " includedId:: ", includedId)
        let params = {
            order: "id",
            type: "asc",
            page: 1,
        };

        params["status"] = JSON.stringify([...includedId]);
        params["types"] = JSON.stringify([...includedTypes]);

        if (type){
            let prevIncludesType = [...includedTypes];

            if (prevIncludesType.indexOf(type) >= 0){
                prevIncludesType = prevIncludesType.filter(item => item !== type)
            } else {
                prevIncludesType.push(type);
            }
            setIncludedTypes(prevIncludesType);

            params["types"] = prevIncludesType.length !== 0 ? JSON.stringify(prevIncludesType) : JSON.stringify([]);
        }

        if (id) {
            let prevIncludedId = [...includedId];

            if (prevIncludedId.indexOf(id) >= 0){
                prevIncludedId = prevIncludedId.filter(item => item !== id)
            } else {
                prevIncludedId.push(id);
            }

            setIncludedId(prevIncludedId);

            params["status"] = prevIncludedId.length !== 0 ? JSON.stringify(prevIncludedId) : JSON.stringify([]);
        }

        axios.get(ApiRoutes.API_GET_IDEAS.format(category) + "?" + global.serialize(params)).then(response => {
            switch(response.data?.state){
                case "success":
                    if (response.data?.ideas !== null) {
                        response.data.ideas.map(item => {
                            data.push({
                                idea_id: item.id,
                                title: item.title,
                                text: item.content,
                                showComments: false,//item.comments.length > 0,
                                showFullText: false,
                                roles: item.user.roles,
                                role: item.user.role_name,
                                status: item.status,
                                photo: item.photo,
                                comments: item.comments,
                                like: Number(item.likes),
                                dislike: 2,
                                username: item.user?.first_name,
                                userImage: item.user.image,
                                type: item.type.name,
                                currentUserIsVote: item.currentUserIsVote,
                                allowComments: item.allowComments
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
        })
    };

    const getCategory = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setTypes(response.data.types);
            setStatuses(response.data.statuses);
            setCategories(response.data.categories);

            setSelectedCategory(response.data.categories[0].id);

            loadData(null, null, response.data.categories[0].id)
        });
        setLoading(false);
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

    return (
        <>
            <Col className={"f-main"}>
                <div>
                    <Header />
                    <section className={"max_width"} style={{marginTop: "100px"}}>
                        <div className={"f-section"}>
                            <div className={"f-section-wrap-text"}>
                                <p className={"f-section-wrap-p-text"} style={{
                                    marginBottom: 0,
                                }}>
                                    Мы ценим мнение
                                    клиентов и рады,
                                    когда вы делитесь
                                    им с нами
                                </p>
                            </div>
                            {/*<img className={"f-section-wrap-image"} src={'/i/movie-text.png'} />*/}
                        </div>
                    </section>
                    <Navigation
                        categories={categories}
                        loadData={loadData}
                        selectedCategory={selectedCategory}
                        selectedPanelMenu={selectedPanelMenu}
                        selectedType={selectedType}
                        setSelectedCategory={setSelectedCategory}
                    />
                    <NavLink to={ global.layout !== "guest" ? (global.lang + "/idea/add/") : (global.lang + "/auth/")} className={"f-new-idea"}>
                        <p className={"f-new-idea-text"}>Новая идея</p>
                    </NavLink>
                    <div className={"f-row-type max_width"}>
                        <div style={{
                            width: '100%',
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: 'center',
                            alignItems: "center",
                            paddingRight: "100px",
                            paddingLeft: "200px"
                        }}>
                            {
                                loading ?
                                    <div className={"f-cards"}>
                                        <div>
                                            <div className={"f-cards-card-wrap"}>
                                                <div className={"f-cards-inner"}>
                                                    <div className={"f-cards-div-wrap-text"}>
                                                        <span className={"f-cards-content-text"}>
                                                            <Skeleton active avatar paragraph={{ rows: 1 }}/>
                                                            <Skeleton active/>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <FlatList
                                        list={ideas}
                                        renderItem={(idea, index) => {
                                            return(
                                                <IdeaItem item={idea} index={index} setItem={setIdea} statuses={statuses}/>
                                            )
                                        }}
                                        renderWhenEmpty={() =>
                                            <div className={"f-cards"}>
                                                <div>
                                                    <div className={"f-cards-card-wrap"}>
                                                        <div className={"f-cards-inner"}>
                                                            <div className={"f-cards-div-wrap-text"}>
                                                        <span className={"f-cards-content-text"}>
                                                            <div>Пока нет записей...</div>
                                                        </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        // sortBy={["firstName", {key: "lastName", descending: true}]}
                                        // groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                                    />
                                }
                        </div>
                        <section style={{ width: '20%', justifyContent: 'center', alignItems: "center", }}>
                            <div className={"f-side-block"}>
                                <div className={"f-side-panel-wrap"} style={{ marginTop: 70 }}>
                                    {
                                        statuses.map((status, index) => (
                                            <a className={"f-side-panel-button-section "/* + (includedId.includes(status.id) && "f-viewed")*/}
                                               onClick={() => {setSelectedPanelMenu(status.id), loadData(status.id, null, selectedCategory)}}
                                               style={{
                                                   color: includedId.includes(status.id) && "#fff",
                                                   backgroundColor: includedId.includes(status.id) && (status?.color ? status?.color : "#ffffff00"),
                                                   borderRadius: "65px",
                                               }}
                                            >{status.translate}
                                                <span
                                                    className={"f-side-panel-count-subtext " + (includedId.includes(status.id) && "f-block")}
                                                >{status.ideasCount}</span>
                                            </a>
                                        ))
                                    }
                                </div>
                                <div className={"f-side-panel-wrap"}>
                                    {
                                        types.map((type) => (
                                            <a className={"f-side-panel-button"}
                                               onClick={() => { setSelectedType(type.id), loadData(null, type.id, selectedCategory)}}
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
};

export default MainPage;