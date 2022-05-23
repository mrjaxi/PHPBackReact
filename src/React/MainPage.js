import React, {useEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import Comments from "./Main/Comments";
import './sass/main-component.scss'
import {Col, Select, Skeleton} from "antd";
import axios from "axios";
import Header from "./Main/Components/Header";
import Navigation from "./Main/Components/Navigation";
import ApiRoutes from "./Routes/ApiRoutes";
const { Option } = Select;

const MainPage = () => {

    let data = [];

    const [includedTypes, setIncludedTypes] = useState([]);
    const [includedId, setIncludedId] = useState([]);

    const [items, setItems] = useState([]);

    const [types, setTypes] = useState([]);
    const [statuses, setStatus] = useState([]);
    const [categories, setCategories] = useState([]);

    const [selectedPanelMenu, setSelectedPanelMenu] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const loadData = (id, type, category) => {
        setLoading(true);
        data = [];

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
            if (response.data?.ideas !== null) {
                response.data.ideas.map(item => {
                    data.push({
                        id: item.id,
                        title: item.title,
                        text: item.content,
                        showComments: item.comments.length > 0,
                        showFullText: false,
                        roles: item.user.roles,
                        role: item.user.role_name,
                        status: item.status,
                        photo: item.photo,
                        comments: item.comments,
                        like: Number(item.likes),
                        dislike: getRandomInt(0, 200),
                        username: item.user?.first_name,
                        type: item.type.name,
                        currentUserIsVote: item.currentUserIsVote,
                        allowComments: item.allowComments
                    })
                });

                setItems(data);
                setLoading(false)
            } else {
                setItems(data);
                setLoading(false)
            }
        })
    };

    const getCategory = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setTypes(response.data.types);
            setStatus(response.data.statuses);
            setCategories(response.data.categories);

            setSelectedCategory(response.data.categories[0].id);

            loadData(null, null, response.data.categories[0].id)
        });
        setLoading(false);
    };

    const newVote = (id, index, currentUserIsVote) => {
        currentUserIsVote ?
            axios.post(ApiRoutes.API_DELETE_VOTE, {idea_id: id}).then(response => {
                if (response.data.state === "success"){
                    let data = [...items];
                    data[index].like -= 1;
                    data[index].currentUserIsVote = !currentUserIsVote;

                    setItems(data)
                } else {
                    global.openNotification("Ошибка", response.data.message, "error")
                }
            }) :
            axios.post(ApiRoutes.API_NEW_VOTE, {idea_id: id, type: "like"}).then(response => {
                if (response.data.state === "success"){
                    let data = [...items];
                    data[index].like += 1;
                    data[index].currentUserIsVote = !currentUserIsVote;
                    setItems(data)
                } else {
                    global.openNotification("Ошибка", response.data.message, "error")
                }
            })
    };

    useEffect(() => {
        getCategory();
        global.getProfile();
    }, []);

    const showText = (show, index) => {
        let data = [...items];
        data[index].showFullText = !show;

        setItems(data)
    };

    const showComments = (index) => {
        let data = [...items];

        const flag = data[index].showComments;
        data[index].showComments = !flag;
        setItems(data)
    };

    const addCommentToIdea = (index, comment) => {
        let data = [...items];
        data[index].comments.push(comment);
        setItems(data)
    };

    const changeStatus = (idea_id, id, name, index) => {
        axios.post(ApiRoutes.API_SET_STATUS, {idea_id: idea_id, status_id: id}).then(response => {
            if (response.data.state === "success"){
                let data = [...items];
                data[index].status = id;
                if (name === "declined" || name === "completed"){
                    data[index].allowComments = false;
                }
                data[index].allowComments = true;
                setItems(data)
            } else {
                global.openNotification("Ошибка", response.data.message, "error")
            }
        })
    };

    return (
        <>
            <Col className={"f-main"}>
                <div>
                    <Header />
                    <section className={"max_width"}>
                        <div className={"f-section"}>
                            <div className={"f-section-wrap-text"}>
                                <p className={"f-section-wrap-p-text"}>
                                    Мы ценим мнение
                                    клиентов и рады,
                                    когда вы делитесь
                                    им с нами
                                </p>
                            </div>
                            <img className={"f-section-wrap-image"} src={'/i/movie-text.png'} />
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
                    <NavLink to={ global.layout !== "guest" ? (global.lang + "/idea/add/") : (global.lang + "/auth/")} className={"f-new-idea"}>Новая идея</NavLink>
                    <div className={"f-row-type max_width"}>
                        <div style={{
                            width: '80%',
                            display: "flex",
                            justifyContent: 'center',
                            flexDirection: "column",
                            alignItems: "center",
                            paddingLeft: 200,
                            paddingRight: 200,
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
                                    items.length === 0 ?
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
                                        :
                                    items.map((item, index) => (
                                    <div className={"f-cards"}>
                                        <div>
                                            <p style={{ marginLeft: 10 }} className={"f-cards-hashtag"}>#{item.type}</p>
                                            <div className={"f-cards-card-wrap"}>
                                                {
                                                    item.photo !== null &&
                                                    <div className={"f-cards-image-type"} style={{ backgroundImage: 'url("' + item.photo.split(";")[0] + '")' }} />
                                                }
                                                <div className={"f-cards-inner"}>
                                                    <div className={"f-cards-avatar"}>
                                                        <div className={"f-cards-row-wrap"}>
                                                            <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                            <div className={"f-cards-wrap-text"}>
                                                                <span className={"f-cards-text"}>{ item.username }
                                                                    {
                                                                        item.roles.includes("ROLE_ADMIN") &&
                                                                        <img style={{ marginBottom: 3, marginLeft: 5 }} src={"/i/official.svg"} width={15} height={15}/>
                                                                    }
                                                                </span>
                                                                <span className={"f-cards-text-bottom"}>{ item.role }</span>
                                                            </div>
                                                        </div>
                                                        {
                                                            global.layout === "admin" ?
                                                            <Select onSelect={(id) => changeStatus(item.id, id, item.status.name, index)} defaultValue={ item.status.id } style={{ width: 130 }}>
                                                                {
                                                                    statuses.map(status => (
                                                                        <Option value={status.id}>{status.translate}</Option>
                                                                    ))
                                                                }
                                                            </Select> :
                                                                <p className={"f-cards-type f-type-viewed"}>{ item.status.translate }</p>
                                                        }
                                                    </div>
                                                    <div className={"f-cards-div-wrap-text"}>
                                                        <span className={"f-cards-content-text"}>
                                                            { item.title }
                                                        </span>
                                                    </div>
                                                    <div className={"f-cards-div-wrap-text"}>
                                                            <span className={"f-cards-content-description"}>
                                                                {
                                                                    item.text.length < 400 ? <span>{item.text}</span> :
                                                                        item.text.length > 400 && !item.showFullText ?
                                                                            <span>{item.text.slice(0, 400)}... <a onClick={() => showText(item.showFullText, index)}>Еще</a></span> :
                                                                            <span>{item.text} <a onClick={() => showText(item.showFullText, index)}>Скрыть</a></span>
                                                                }
                                                            </span>
                                                    </div>
                                                    <div className={"f-cards-under-block"}>
                                                        <div>
                                                            <a onClick={() => { showComments(index) }} className={"f-cards-under-block-comment"}>{ item.comments.length } комментариев</a>
                                                        </div>
                                                        <div>
                                                            <a style={{ backgroundColor: item.currentUserIsVote === true ? "#90EE90" : "" }} className={"f-cards-under-block-like"} onClick={() => newVote(item.id, index, item.currentUserIsVote)}>
                                                                <i className="em em---1"
                                                                   aria-label="THUMBS UP SIGN"></i>
                                                                <span className={"f-cards-under-block-like-text"}>{ item.like }</span>
                                                            </a>
                                                        </div>
                                                        {/*<div>*/}
                                                        {/*    <a className={"f-cards-under-block-like"} href={"#"}>*/}
                                                        {/*        <i className="em em--1"*/}
                                                        {/*           aria-label="THUMBS DOWN SIGN"></i>*/}
                                                        {/*        <span className={"f-cards-under-block-like-text"}>Не нравится</span>*/}
                                                        {/*    </a>*/}
                                                        {/*</div>*/}
                                                    </div>
                                                    {
                                                        item.showComments &&
                                                        <Comments allowComments={item.allowComments} item={item} index={index} addCommentToIdea={addCommentToIdea} comments={item.comments} loading={loadingComments}/>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        <section style={{ width: '20%' }}>
                            <div className={"f-side-block"}>
                                <div className={"f-side-panel-wrap"} style={{ marginTop: 70 }}>
                                    {
                                        statuses.map((status, index) => (
                                            <a onClick={() => { setSelectedPanelMenu(status.id), loadData(status.id, null, selectedCategory)}} className={"f-side-panel-button-section " + (includedId.includes(status.id) && "f-viewed")}>{status.translate} <span className={"f-side-panel-count-subtext " + (includedId.includes(status.id) && "f-block")}>{ status.ideasCount }</span></a>
                                        ))
                                    }
                                </div>
                                <div className={"f-side-panel-wrap"}>
                                    {
                                        types.map((type) => (
                                            <a onClick={() => { setSelectedType(type.id), loadData(null, type.id, selectedCategory)}} className={"f-side-panel-button"} style={{ color: includedTypes.includes(type.id) && "#3D72ED", borderColor: includedTypes.includes(type.id) && "#3D72ED" }}>#{type.name}</a>
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