import React, {useEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import Comments from "./Main/Comments";
import './sass/main-component.scss'
import { Col, Menu, Select, Skeleton} from "antd";
import axios from "axios";
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
                prevIncludesType.length > 1 ?
                    prevIncludesType = prevIncludesType.filter(item => item !== type) : null
            } else {
                prevIncludesType.push(type);
            }
            setIncludedTypes(prevIncludesType);

            params["types"] = JSON.stringify(prevIncludesType);
        }

        if (id) {
            let prevIncludedId = [...includedId];

            if (prevIncludedId.indexOf(id) >= 0){
                prevIncludedId.length > 1 ?
                prevIncludedId = prevIncludedId.filter(item => item !== id) : null
            } else {
                prevIncludedId.push(id);
            }

            setIncludedId(prevIncludedId);

            params["status"] = JSON.stringify(prevIncludedId)
        }

        axios.get("http://127.0.0.1:8000/ideas/api/getIdeas/" + category + "/?" + global.serialize(params)).then(response => {
            console.log(response);
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
        axios.get("http://127.0.0.1:8000/ideas/api/getCategories/").then(response => {
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
            axios.post("http://127.0.0.1:8000/api/delete/vote/", {idea_id: id}).then(response => {
                if (response.data.state === "success"){
                    let data = [...items];
                    data[index].like -= 1;
                    data[index].currentUserIsVote = !currentUserIsVote;

                    setItems(data)
                }
            }) :
            axios.post("http://127.0.0.1:8000/ideas/api/newVote/", {idea_id: id, type: "like"}).then(response => {
                if (response.data.state === "success"){
                    let data = [...items];
                    data[index].like += 1;
                    data[index].currentUserIsVote = !currentUserIsVote;
                    setItems(data)
                }
            })
    };

    useEffect(() => {
        getCategory();
    }, []);

    const showText = (show, index) => {
        let data = [...items];
        data[index].showFullText = !show;

        setItems(data)
    };

    const showComments = (index) => {
        let data = [...items];
        data[index].showComments = !data[index].showComments;
        setItems(data)
    };

    const addCommentToIdea = (index, comment) => {
        let data = [...items];
        data[index].comments.push(comment);
        setItems(data)
    };

    const changeStatus = (idea_id, id, name) => {
        console.log(name)
        axios.post("http://127.0.0.1:8000/ideas/api/setStatus/", {idea_id: idea_id, status_id: id}).then(response => {
            if (response.data.state === "success"){
                let data = [...items];
                data[index].status = id;
                if (name === "declined" || name === "completed"){
                    data[index].allowComments = false;
                }
                data[index].allowComments = true;
                setItems(data)
            } else {
                global.openNotification("Ошибка", "Невозможно изменить статус идеи", "error")
            }
        })
    };

    return (
        <>
            <Col className={"f-main"}>
                <div>
                    <header className={"f-header-content"}>
                        <div className={'f-header-wrap-content'}>
                            <div className={'f-header-wrap-logo'}>
                                <a href="/" className={'f-header-wrap-logo'}>
                                    <div className={"f-header-back-wrap"}>
                                        <img className={"f-header-wrap-logo-element"} src={'/i/logotype_sticky.svg'} />
                                    </div>
                                    <img className={"f-header-wrap-logo-logo"} src={"/i/atmaguru.svg"} />
                                </a>
                            </div>
                            <div className={'f-header-logo-wrapper'}>
                                <NavLink className={'f-sign-in'} to={global.lang + "/auth/"}>Войти</NavLink>
                            </div>
                        </div>
                    </header>
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
                    <navigation className={"f-nav-wrap"}>
                        <div className={"f-nav max_width"}>
                            {
                                categories.map((category) => (
                                    <a onClick={() => { setSelectedCategory(category.id), loadData(selectedPanelMenu, selectedType, category.id) }} className={"f-nav-button " + (category.id === selectedCategory && "f-nav-button-active")}>{ category.name }</a>
                                ))
                            }
                            <img className={"f-nav-button-img"} src={"/i/threedot.svg"}/>
                            <NavLink to={"/search"}>
                                <img className={"f-nav-button-img"} src={"/i/search.svg"}/>
                            </NavLink>
                        </div>
                    </navigation>

                    <NavLink to={global.lang + "/idea/add/"} className={"f-new-idea"}>Новая идея</NavLink>
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
                                                    <div className={"f-cards-image-type"} style={{ backgroundImage: 'url("http://127.0.0.1:8000' + item.photo.split(";")[0] + '")' }} />
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
                                                        <Select onSelect={(id) => changeStatus(item.id, id, item.status.name)} defaultValue={ item.status.id } style={{ width: 130 }}>
                                                            {
                                                                statuses.map(status => (
                                                                    <Option value={status.id}>{status.translate}</Option>
                                                                ))
                                                            }
                                                        </Select>
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
                                                        (item.comments.length > 0 || item.showComments) &&
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
                                            <a onClick={() => { setSelectedPanelMenu(status.id), loadData(status.id, selectedType, selectedCategory)}} className={"f-side-panel-button-section " + (includedId.includes(status.id) && "f-viewed")}>{status.translate} <span className={"f-side-panel-count-subtext " + (includedId.includes(status.id) && "f-block")}>{ status.ideasCount }</span></a>
                                        ))
                                    }
                                </div>
                                <div className={"f-side-panel-wrap"}>
                                    {
                                        types.map((type) => (
                                            <a onClick={() => { setSelectedType(type.id), loadData(selectedPanelMenu, type.id, selectedCategory)}} className={"f-side-panel-button"} style={{ color: includedTypes.includes(type.id) && "#3D72ED", borderColor: includedTypes.includes(type.id) && "#3D72ED" }}>#{type.name}</a>
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