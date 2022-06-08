import React, {useLayoutEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import Comments from "./Main/Comments";
import './sass/main-component.scss'
import {Col, Select, Skeleton} from "antd";
import axios from "axios";
import Header from "./Main/Components/Header";
import Navigation from "./Main/Components/Navigation";
import ApiRoutes from "./Routes/ApiRoutes";
import FlatList from 'flatlist-react';
import IdeaItem from "./Main/Idea/IdeaItem";
const { Option } = Select;

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

        if (type){
            let prevIncludesType = [...includedTypes];

            if (prevIncludesType.indexOf(type) >= 0){
                prevIncludesType = prevIncludesType.filter(item => item !== type)
            } else {
                prevIncludesType.push(type);
            }
            setIncludedTypes(prevIncludesType);

            prevIncludesType.length > 0 ?
            params["types"] = JSON.stringify(prevIncludesType) : null;
        }

        if (id) {
            let prevIncludedId = [...includedId];

            if (prevIncludedId.indexOf(id) >= 0){
                prevIncludedId = prevIncludedId.filter(item => item !== id)
            } else {
                prevIncludedId.push(id);
            }

            setIncludedId(prevIncludedId);

            prevIncludedId.length > 0 ?
            params["status"] = JSON.stringify(prevIncludedId) : null;
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
                    console.log("GETIDEAS COMPLETED")
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

    const newVote = (id, index, currentUserIsVote) => {
        switch (currentUserIsVote) {
            case "unauthorized":
                global.openNotification("Войдите", "Чтобы проголосовать нужно авторизоваться", "error")
                break;
            case true:
                axios.post(ApiRoutes.API_DELETE_VOTE, {idea_id: id})
                    .then(response => {
                        switch(response.data?.state){
                            case "success":
                                let data = [...ideas];
                                data[index].like -= 1;
                                data[index].currentUserIsVote = !currentUserIsVote;
                                setIdeas(data)
                                break;
                            case "error":
                                global.openNotification("Ошибка", response.data?.message, "error")
                                break;
                            default:
                                global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                                break;
                        }
                    })
                break;
            case false:
                axios.post(ApiRoutes.API_NEW_VOTE, {idea_id: id, type: "like"})
                    .then(response => {
                        switch (response.data?.state) {
                            case "success":
                                let data = [...ideas];
                                data[index].like += 1;
                                data[index].currentUserIsVote = !currentUserIsVote;
                                setIdeas(data)
                                break;
                            case "error":
                                global.openNotification("Ошибка", response.data?.message, "error")
                                break;
                            default:
                                global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                                break;
                        }
                    })
                break;
            default:
                global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                break;
        }
    };

    const showText = (show, index) => {
        let data = [...ideas];
        data[index].showFullText = !show;

        setIdeas(data)
    };

    const showComments = (index) => {
        let data = [...ideas];

        const flag = data[index].showComments;
        data[index].showComments = !flag;
        setIdeas(data)
    };

    const addCommentToIdea = (index, comment) => {
        let data = [...ideas];
        data[index].comments.push(comment);
        setIdeas(data)
    };

    const changeStatus = (idea_id, id, name, index) => {
        axios.post(ApiRoutes.API_SET_STATUS, {idea_id: idea_id, status_id: id})
            .then(response => {
                switch (response.data?.state) {
                    case "success":
                        global.openNotification("Успешно", "Статус идеи изменен", "success")
                        let data = [...ideas];
                        data[index].status = id;
                        if (name.data === "declined" || name.data === "completed") {
                            data[index].allowComments = false;
                        } else {
                            data[index].allowComments = true;
                        }
                        setIdeas(data)
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

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas]
        newIdeas[index] = idea
        setIdeas(newIdeas)
    }

    return (
        <>
            <Col className={"f-main"}>
                <div>
                    <Header />
                    <section className={"max_width"}>
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
                    <NavLink to={ global.layout !== "guest" ? (global.lang + "/idea/add/") : (global.lang + "/auth/")}>
                        <p className={"f-new-idea"}>Новая идея</p>
                    </NavLink>
                    <div className={"f-row-type max_width"}>
                        <div style={{
                            width: '100%',
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: 'center',
                            alignItems: "center",
                            paddingRight: "200px",
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
                                            // console.log(`idea:`, idea)
                                            return(
                                                <IdeaItem item={idea} index={index} setItem={setIdea} statuses={statuses} updateStatuses={updateStatuses}/>
                                            )
                                        }}
                                        renderWhenEmpty={() =>
                                            <div className={"f-cards"}>
                                                <div>
                                                    <div className={"f-cards-card-wrap"}>
                                                        <div className={"f-cards-inner"}>
                                                            <div className={"f-cards-div-wrap-text"}>
                                                        <span className={"f-cards-content-text"}>
                                                            <div>Пока нет идей...</div>
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