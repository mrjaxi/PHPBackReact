import React, {useEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import Comments from "./Main/Comments";
import './sass/main-component.scss'
import {Col, Skeleton} from "antd";
import axios from "axios";

const MainPage = () => {

    let data = [];
    let commentsData = [];

    let selectType = [
        {type: "Запланировано", className: "-planned"},
        {type: "В работе", className: "-inwork"},
        {type: "Рассмотрено", className: "-viewed"},
        {type: "Завершено", className: "-completed"}
    ];

    const [items, setItems] = useState([]);
    const [comments, setComments] = useState([]);
    const [selectedPanelMenu, setSelectedPanelMenu] = useState(0);

    const [loading, setLoading] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const loadData = () => {
        setLoading(true);
        data = [];
        axios.get("https://jsonplaceholder.typicode.com/posts").then(response => {
            response.data.map(item => {
                data.push({
                    title: "Крайне не удобно работать \n" +
                        "с множественным выделением \n" +
                        "на карте, так как Ctrl и Shift+click \n" +
                        "не работают",
                    text: "Обычно ты работаешь следующим образом: Выдели модуль, \n" +
                        "зажат Shift, выделил следующий модуль — все промежуточные \n" +
                        "тоже выделились. Можешь выделить через Shift другой \n" +
                        "и выделение сменится по тому же правилу. \n" +
                        "\n" +
                        "Выдели модуль, зажат Ctrl, выделил следующий модуль — только \n" +
                        "эти 2 выделились. Можешь дальше через Ctrl выделять ещё. \n" +
                        "Если было что-то выделено через Shift до этого, выделение \n" +
                        "осталось. Клик на выделенном модуле убирает выделение. \n" +
                        "\n" +
                        "Если хочешь сделать 2 выделения через Shift, то веделяешь \n" +
                        "модуль, через Shift другой — получаешь выделенный диапазон; \n" +
                        "потом через Ctrl выделяешь другой модуль и через Ctrl + Shift \n" +
                        "ещё — получаешь 2 выделенных диапазона",
                    showComments: false,
                    showFullText: false,
                    like: getRandomInt(0, 200),
                    dislike: getRandomInt(0, 200),
                })
            });

            setItems(data);
            setLoading(false)
        })
    };

    const loadComments = () => {
        setLoadingComments(true)
        commentsData = [];
        axios.get("https://jsonplaceholder.typicode.com/comments").then(comment => {
            for (let i = 0; i < 10; i++){
                commentsData.push({
                    name: comment.data[i].name,
                    text: comment.data[i].body,
                })
            }
            setComments(commentsData);
            setLoadingComments(false)
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

    const showComments = (show, index) => {
        let data = [...items];
        data[index].showComments = !show;
        loadComments();
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
                        <div className={"f-row-center-wrap"}>
                            <section style={{ width: '65%' }}>
                                {
                                    loading ?
                                        <div className={"f-cards"}>
                                            <div>
                                                <div className={"f-cards-card-wrap"}>
                                                    <Skeleton avatar active style={{ minWidth: 800, height: 400, backgroundColor: '#FFFFFF', padding: 40, borderRadius: 24 }}/>
                                                </div>
                                            </div>
                                        </div> :
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
                                                                    <span className={"f-cards-text"}>Константин Константинопольский</span>
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
                                                            item.text.length > 400 && !item.showFullText ?
                                                                <span>{item.text.slice(0, 400)}... <a onClick={() => showText(item.showFullText, index)}>Еще</a></span> :
                                                                <span>{item.text}... <a onClick={() => showText(item.showFullText, index)}>Скрыть</a></span>
                                                        }
                                                    </span>
                                                        </div>
                                                        <div className={"f-cards-under-block"}>
                                                            <div>
                                                                <a onClick={() => showComments(item.showComments, index)} className={"f-cards-under-block-comment"}>5 комментариев</a>
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
                                                            item.showComments &&
                                                            <Comments comments={comments} loading={loadingComments}/>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </section>
                        </div>
                        <section style={{ width: '20%' }}>
                            <div className={"f-side-block"}>
                                <div className={"f-side-panel-wrap"} style={{ marginTop: 100 }}>
                                    <a onClick={() => { setSelectedPanelMenu(0), loadData()}} className={"f-side-panel-button-section " + (selectedPanelMenu === 0 && "f-planned")}>В работе <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 0 && "f-block")}>56</span></a>
                                    <a onClick={() => { setSelectedPanelMenu(1), loadData()}} className={"f-side-panel-button-section " + (selectedPanelMenu === 1 && "f-inwork")}>Запланировано <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 1 && "f-block")}>{ items.length }</span></a>
                                    <a onClick={() => { setSelectedPanelMenu(2), loadData()}} className={"f-side-panel-button-section " + (selectedPanelMenu === 2 && "f-viewed")}>Рассмотрено <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 2 && "f-block")}>2356</span></a>
                                    <a onClick={() => { setSelectedPanelMenu(3), loadData()}} className={"f-side-panel-button-section " + (selectedPanelMenu === 3 && "f-completed")}>Завершено <span className={"f-side-panel-count-subtext " + (selectedPanelMenu === 3 && "f-block")}>532</span></a>
                                </div>
                                <div className={"f-side-panel-wrap"}>
                                    <a className={"f-side-panel-button"} href={"#"}>#Вопрос</a>
                                    <a className={"f-side-panel-button"} href={"#"}>#Идея</a>
                                    <a className={"f-side-panel-button"} href={"#"}>#Ошибка</a>
                                    <a className={"f-side-panel-button"} href={"#"}>#Другое</a>
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