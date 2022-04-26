import React, {useState} from "react";
import { NavLink } from "react-router-dom";
import Comments from "./Main/Comments";
import './sass/main-component.scss'
import {Col} from "antd";

const MainPage = () => {

    const [showComments, setShowComments] = useState(false);

    return (
        <>
            <Col className={"f-main"}>
                <div>
                    <a className={"f-new-idea"}><span>Новая идея</span></a>
                    <header className={"f-header-content"}>
                        <div className={'f-header-wrap-content max_width'}>
                            <div className={'f-header-wrap-logo'}>
                                <a href="/" className={'anb main_logo'}>
                                    <img src={'/i/atmaguru.svg'} />
                                </a>
                            </div>
                            <div className={'f-header-logo-wrapper'}>
                                <NavLink className={'f-sign-in'} to={global.lang + "/login"}>Войти</NavLink>
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
                                {/*<a href={"#"} className={'f-section-wrap-button'}>Больше не показывать</a>*/}
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
                    <div className={"f-row-type max_width"}>
                        <div className={"f-row-center-wrap"}>
                            <section style={{ width: '60%' }}>
                                <div className={"f-cards"}>
                                    <div>
                                        <p className={"f-cards-hashtag"}>#Вопрос</p>
                                        <div className={"f-cards-card-wrap"}>
                                            <div className={"f-cards-inner"}>
                                                <div className={"f-cards-avatar"}>
                                                    <div className={"f-cards-row-wrap"}>
                                                        <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                        <div className={"f-cards-wrap-text"}>
                                                            <span className={"f-cards-text"}>Константин Константинопольский</span>
                                                            <span className={"f-cards-text-bottom"}>Генератор идей</span>
                                                        </div>
                                                    </div>
                                                    <p className={"f-cards-type"}>Запланировано</p>
                                                </div>
                                                <div className={"f-cards-div-wrap-text"}>
                                                    <span className={"f-cards-content-text"}>
                                                        Крайне не удобно работать
                                                        с множественным
                                                        выделением на карте, так как
                                                        Ctrl и Shift + click
                                                        не работают
                                                    </span>
                                                </div>
                                                <div className={"f-cards-div-wrap-text"}>
                                                    <span className={"f-cards-content-description"}>
                                                        Очень не удобно, что кнопка Сохранить не видна
                                                        на экране постоянно, а прокручивается вместе
                                                        с содержимым. Воз...
                                                    </span>
                                                </div>
                                                <div className={"f-cards-under-block"}>
                                                    <div>
                                                        <a onClick={() => setShowComments(!showComments )} className={"f-cards-under-block-comment"}>5 комментариев</a>
                                                    </div>
                                                    <div>
                                                        <a className={"f-cards-under-block-like"} href={"#"}>
                                                            <img src={"/i/fire.svg"} />
                                                            <span className={"f-cards-under-block-like-text"}>24</span>
                                                        </a>
                                                    </div>
                                                    <div>
                                                        <a className={"f-cards-under-block-like"} href={"#"}>
                                                            <img src={"/i/fire.svg"} />
                                                            <span className={"f-cards-under-block-like-text"}>Не нравится</span>
                                                        </a>
                                                    </div>
                                                </div>
                                                {
                                                    showComments &&
                                                        <Comments />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <section style={{ width: '20%' }}>
                            <div className={"f-side-block"}>
                                <div className={"f-side-panel-wrap"} style={{ marginTop: 100 }}>
                                    <a className={"f-side-panel-button-section"} href={"#"}>В работе <span className={"f-side-panel-count-subtext"}>56</span></a>
                                        <a className={"f-side-panel-button-section f-selected"} href={"#"}>Запланировано <span className={"f-side-panel-count-subtext f-block-select"}>72</span></a>
                                    <a className={"f-side-panel-button-section"} href={"#"}>Рассмотрено <span className={"f-side-panel-count-subtext"}>2356</span></a>
                                    <a className={"f-side-panel-button-section"} href={"#"}>Завершено <span className={"f-side-panel-count-subtext"}>532</span></a>
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