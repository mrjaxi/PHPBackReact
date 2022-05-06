import React, {useEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import Comments from "./Main/Comments";
import './sass/main-component.scss'
import {Col, Skeleton} from "antd";
import axios from "axios";

const MainPage = () => {

    let data = [];

    let selectType = [
        {type: "Запланировано", className: "-planned"},
        {type: "В работе", className: "-inwork"},
        {type: "Рассмотрено", className: "-viewed"},
        {type: "Завершено", className: "-completed"}
    ];

    let selectStatus = [
        "started",
        "planned",
        "considered",
        "completed",
        "new",
        "declined",
    ];

    const [items, setItems] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedPanelMenu, setSelectedPanelMenu] = useState(0);

    const [loading, setLoading] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const loadData = (id = 0) => {
        setLoading(true);
        data = [];
        axios.get("http://127.0.0.1:8000/ideas/api/getCategories/").then(response => {
            setTypes(response.data.types)
        });
        axios.get("http://127.0.0.1:8000/ideas/api/getIdeas/1/?" + global.serialize({
            order: "votes",
            type: "asc",
            page: 1,
            types: JSON.stringify(["1"]),
            status: JSON.stringify([selectStatus[id]])
        })).then(response => {
            if (response.data.ideas !== null) {
                response.data.ideas.map(item => {
                    data.push({
                        title: item.title,
                        text: item.content,
                        showComments: false,
                        showFullText: false,
                        comments: item.Comments,
                        like: Number(item.votes),
                        dislike: getRandomInt(0, 200),
                        username: item.User?.first_name,
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
                            <a className={"f-nav-button f-nav-button-active"}>Методология</a>
                            <a className={"f-nav-button"}>Мобильное приложение</a>
                            <a className={"f-nav-button"}>Платформа</a>
                            <a className={"f-nav-button"}>Прочее</a>
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
                                                                <div>В категории "{ selectType[selectedPanelMenu].type }" пока нет идей...</div>
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
                                            <p className={"f-cards-hashtag"}>#Вопрос</p>
                                            <div className={"f-cards-card-wrap"}>
                                                <div className={"f-cards-image-type"} style={{ backgroundImage: 'url("https://newcastlebeach.org/images/any-2.jpg")' }} />
                                                <div className={"f-cards-inner"}>
                                                    <div className={"f-cards-avatar"}>
                                                        <div className={"f-cards-row-wrap"}>
                                                            <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                            <div className={"f-cards-wrap-text"}>
                                                                <span className={"f-cards-text"}>{ item.username }</span>
                                                                <span className={"f-cards-text-bottom"}>Генератор идей</span>
                                                            </div>
                                                        </div>
                                                        <p className={"f-cards-type" + selectType[selectedPanelMenu].className}>{ selectType[selectedPanelMenu].type }</p>
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
                                                            <span className={"f-cards-under-block-comment"}>{ item.comments.length } комментариев</span>
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
                                                        item.comments.length > 0 &&
                                                        <Comments comments={item.comments} loading={loadingComments}/>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    {/*    <div className={"f-row-center-wrap"}>*/}
                    {/*        <section style={{ width: '65%' }}>*/}
                    {/*            {*/}
                    {/*                loading ?*/}
                    {/*                    <div /> :*/}
                    {/*                items.map((item, index) => (*/}
                    {/*                    <div className={"f-cards"}>*/}
                    {/*                        <div>*/}
                    {/*                            <p className={"f-cards-hashtag"}>#Вопрос</p>*/}
                    {/*                            <div className={"f-cards-card-wrap"}>*/}
                    {/*                                <div className={"f-cards-image-type"} style={{ backgroundImage: 'url("https://newcastlebeach.org/images/any-2.jpg")' }} />*/}
                    {/*                                <div className={"f-cards-inner"}>*/}
                    {/*                                    <div className={"f-cards-avatar"}>*/}
                    {/*                                        <div className={"f-cards-row-wrap"}>*/}
                    {/*                                            <img className={"f-cards-image"} src={"/i/avatar.png"}/>*/}
                    {/*                                            <div className={"f-cards-wrap-text"}>*/}
                    {/*                                                <span className={"f-cards-text"}>{ item.username }</span>*/}
                    {/*                                                <span className={"f-cards-text-bottom"}>Генератор идей</span>*/}
                    {/*                                            </div>*/}
                    {/*                                        </div>*/}
                    {/*                                        <p className={"f-cards-type" + selectType[selectedPanelMenu].className}>{ selectType[selectedPanelMenu].type }</p>*/}
                    {/*                                    </div>*/}
                    {/*                                    <div className={"f-cards-div-wrap-text"}>*/}
                    {/*                                <span className={"f-cards-content-text"}>*/}
                    {/*                                    { item.title }*/}
                    {/*                                </span>*/}
                    {/*                                    </div>*/}
                    {/*                                    <div className={"f-cards-div-wrap-text"}>*/}
                    {/*                                <span className={"f-cards-content-description"}>*/}
                    {/*                                    {*/}
                    {/*                                        item.text.length < 400 ? <span>{item.text}</span> :*/}
                    {/*                                        item.text.length > 400 && !item.showFullText ?*/}
                    {/*                                            <span>{item.text.slice(0, 400)}... <a onClick={() => showText(item.showFullText, index)}>Еще</a></span> :*/}
                    {/*                                            <span>{item.text}... <a onClick={() => showText(item.showFullText, index)}>Скрыть</a></span>*/}
                    {/*                                    }*/}
                    {/*                                </span>*/}
                    {/*                                    </div>*/}
                    {/*                                    <div className={"f-cards-under-block"}>*/}
                    {/*                                        <div>*/}
                    {/*                                            <span className={"f-cards-under-block-comment"}>{ item.comments.length } комментариев</span>*/}
                    {/*                                        </div>*/}
                    {/*                                        <div>*/}
                    {/*                                            <a className={"f-cards-under-block-like"} onClick={() => addLike(index)}>*/}
                    {/*                                                <i className="em em---1"*/}
                    {/*                                                   aria-label="THUMBS UP SIGN"></i>*/}
                    {/*                                                <span className={"f-cards-under-block-like-text"}>{ item.like }</span>*/}
                    {/*                                            </a>*/}
                    {/*                                        </div>*/}
                    {/*                                        <div>*/}
                    {/*                                            <a className={"f-cards-under-block-like"} href={"#"}>*/}
                    {/*                                                <i className="em em--1"*/}
                    {/*                                                   aria-label="THUMBS DOWN SIGN"></i>*/}
                    {/*                                                <span className={"f-cards-under-block-like-text"}>Не нравится</span>*/}
                    {/*                                            </a>*/}
                    {/*                                        </div>*/}
                    {/*                                    </div>*/}
                    {/*                                    {*/}
                    {/*                                        item.comments.length > 0 &&*/}
                    {/*                                        <Comments comments={item.comments} loading={loadingComments}/>*/}
                    {/*                                    }*/}
                    {/*                                </div>*/}
                    {/*                            </div>*/}
                    {/*                        </div>*/}
                    {/*                    </div>*/}
                    {/*                ))*/}
                    {/*            }*/}
                    {/*        </section>*/}
                    {/*    </div>*/}
                        <section style={{ width: '20%' }}>
                            <div className={"f-side-block"}>
                                <div className={"f-side-panel-wrap"} style={{ marginTop: 70 }}>
                                    <a onClick={() => { setSelectedPanelMenu(4), loadData(4)}} style={{ marginBottom: 30 }} className={"f-side-panel-button-section " + (selectedPanelMenu === 4 && "f-planned")}>Непрочитанные <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 4 && "f-block")}>56</span></a>
                                    <a onClick={() => { setSelectedPanelMenu(0), loadData(0)}} className={"f-side-panel-button-section " + (selectedPanelMenu === 0 && "f-planned")}>В работе <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 0 && "f-block")}>{ items.length }</span></a>
                                    <a onClick={() => { setSelectedPanelMenu(1), loadData(1)}} className={"f-side-panel-button-section " + (selectedPanelMenu === 1 && "f-inwork")}>Запланировано <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 1 && "f-block")}>{ items.length }</span></a>
                                    <a onClick={() => { setSelectedPanelMenu(2), loadData(2)}} className={"f-side-panel-button-section " + (selectedPanelMenu === 2 && "f-viewed")}>Рассмотрено <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 2 && "f-block")}>{ items.length }</span></a>
                                    <a onClick={() => { setSelectedPanelMenu(3), loadData(3)}} className={"f-side-panel-button-section " + (selectedPanelMenu === 3 && "f-completed")}>Завершено <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 3 && "f-block")}>{ items.length }</span></a>
                                </div>
                                <div className={"f-side-panel-wrap"}>
                                    {
                                        types.map((type) => (
                                            <a className={"f-side-panel-button"} href={"#"}>#{type.name}</a>
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