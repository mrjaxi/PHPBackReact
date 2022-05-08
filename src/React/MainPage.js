import React, {useEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import Comments from "./Main/Comments";
import './sass/main-component.scss'
import {Col, Skeleton} from "antd";
import axios from "axios";

const MainPage = () => {

    let data = [];

    const [items, setItems] = useState([]);

    const [types, setTypes] = useState([]);
    const [statuses, setStatus] = useState([]);
    const [categories, setCategories] = useState([]);

    const [selectedPanelMenu, setSelectedPanelMenu] = useState(1);
    const [selectedType, setSelectedType] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(1);

    const [loading, setLoading] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const loadData = (id = 1, type = 1, category = 1) => {
        setLoading(true);
        data = [];
        axios.get("http://127.0.0.1:8000/ideas/api/getCategories/").then(response => {
            setTypes(response.data.types);
            setStatus(response.data.statuses);
            setCategories(response.data.categories)
        });
        axios.get("http://127.0.0.1:8000/ideas/api/getIdeas/" + category + "/?" + global.serialize({
            order: "id",
            type: "asc",
            page: 1,
            types: JSON.stringify([type]),
            status: JSON.stringify([id])
        })).then(response => {
            console.log(response.data)
            if (response.data?.ideas !== null) {
                response.data.ideas.map(item => {
                    data.push({
                        id: item.id,
                        title: item.title,
                        text: item.content,
                        showComments: item.comments.length > 0,
                        showFullText: false,
                        photo: item.photo,
                        comments: item.comments,
                        like: Number(item.votes),
                        dislike: getRandomInt(0, 200),
                        username: item.user?.first_name,
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

    useEffect(() => {
        loadData()
    }, []);

    const showText = (show, index) => {
        let data = [...items];
        data[index].showFullText = !show;

        setItems(data)
    };


    const addLike = (index) => {
        let data = [...items];
        data[index].like += 1;

        setItems(data)
    };

    const showComments = (index) => {
        let data = [...items];
        data[index].showComments = !data[index].showComments;
        setItems(data)
    };

    const addCommentToIdea = (index, id, text, date) => {
        let data = [...items];
        data[index].comments.push({
            id: id,
            content: text,
            date: date
        });
        setItems(data)
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
                                <NavLink className={'f-sign-in'} to={global.lang + "/login/"}>Войти</NavLink>
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
                            <img className={"f-nav-button-img"} src={"/i/search.svg"}/>
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
                                            <p className={"f-cards-hashtag"}>#{types[selectedType - 1].name}</p>
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
                                                                <span className={"f-cards-text"}>{ item.username }</span>
                                                                <span className={"f-cards-text-bottom"}>Генератор идей</span>
                                                            </div>
                                                        </div>
                                                        <p className={"f-cards-type f-cards-type-viewed"}>{ statuses[selectedPanelMenu - 1].translate }</p>
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
                                                                            <span>{item.text}... <a onClick={() => showText(item.showFullText, index)}>Скрыть</a></span>
                                                                }
                                                            </span>
                                                    </div>
                                                    <div className={"f-cards-under-block"}>
                                                        <div>
                                                            <a onClick={() => { showComments(index) }} className={"f-cards-under-block-comment"}>{ item.comments.length } комментариев</a>
                                                        </div>
                                                        <div>
                                                            <a className={"f-cards-under-block-like"} onClick={() => addLike(index)}>
                                                                <i className="em em---1"
                                                                   aria-label="THUMBS UP SIGN"></i>
                                                                <span className={"f-cards-under-block-like-text"}>{ item.like }</span>
                                                            </a>
                                                        </div>
                                                        <div>
                                                            <a className={"f-cards-under-block-like"} href={"#"}>
                                                                <i className="em em--1"
                                                                   aria-label="THUMBS DOWN SIGN"></i>
                                                                <span className={"f-cards-under-block-like-text"}>Не нравится</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {
                                                        (item.comments.length > 0 || item.showComments) &&
                                                        <Comments item={item} index={index} addCommentToIdea={addCommentToIdea} comments={item.comments} loading={loadingComments}/>
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
                                            <a onClick={() => { setSelectedPanelMenu(status.id), loadData(status.id, selectedType, selectedCategory)}} className={"f-side-panel-button-section " + (selectedPanelMenu === status.id && "f-viewed")}>{status.translate} <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === status.id && "f-block")}>{ status.ideasCount }</span></a>
                                        ))
                                    }
                                </div>
                                <div className={"f-side-panel-wrap"}>
                                    {
                                        types.map((type) => (
                                            <a onClick={() => { setSelectedType(type.id), loadData(selectedPanelMenu, type.id, selectedCategory)}} className={"f-side-panel-button"} style={{ color: selectedType === type.id && "#3D72ED" }}>#{type.name}</a>
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