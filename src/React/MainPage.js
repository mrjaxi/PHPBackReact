import React from "react";
import { NavLink } from "react-router-dom";
import {Button} from "antd";

import './sass/main-component.scss'

const MainPage = () => {
    return (
        <>
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
                            <a className={'f-sign-in'} href="#" target="_blank" rel="noreferrer">Войти</a>
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
                        <a className={"f-nav-button"}>Методология</a>
                        <a className={"f-nav-button-white"}>Мобильное приложение</a>
                        <a className={"f-nav-button-blur"}>Платформа</a>
                        <a className={"f-nav-button-blur"}>Прочее</a>
                        <img className={"f-nav-button-img"} src={"/i/threedot.svg"}/>
                        <img className={"f-nav-button-img"} src={"/i/search.svg"}/>
                    </div>
                </navigation>
                <div className={"f-row-type max_width"}>
                    <div>
                        <section style={{ width: '50%' }}>
                            <div className={"f-cards"}>
                                <div>
                                    <p className={"f-cards-hashtag"}>#Предложить идею</p>
                                    <div className={"f-cards-card-wrap"}>
                                        <div className={"f-cards-inner"}>
                                            <div className={"f-cards-avatar"}>
                                                <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                <span className={"f-cards-text"}>Константин Константинопольский</span>
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
                                            <div className={"f-cards-under-block"}>
                                                <div>
                                                    <span className={"f-cards-under-block-comment"}>5 комментариев</span>
                                                </div>
                                                <div>
                                                    <a className={"f-cards-under-block-like"} href={"#"}>
                                                        <img src={"/i/fire.svg"} />
                                                        <span className={"f-cards-under-block-like-text"}>24</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        {/*<div style={{ height: 'inherit', width: 200, backgroundColor: 'black'}}>*/}
                                        {/*    <img className={"f-cards-border-image"} alt={"image"} src={"/i/border-image.png"} />*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                                {/*<div></div>*/}
                                {/*<div></div>*/}
                            </div>
                        </section>
                        <section style={{ width: '70%' }}>
                            <div className={"f-cards"}>
                                <div>
                                    <p className={"f-cards-hashtag"}>#Предложить идею</p>
                                    <div className={"f-cards-card-wrap"}>
                                        <div className={"f-cards-inner"}>
                                            <div className={"f-cards-avatar"}>
                                                <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                <span className={"f-cards-text"}>Константин Константинопольский</span>
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
                                                    <span className={"f-cards-under-block-comment"}>2 комментариев</span>
                                                </div>
                                                <div>
                                                    <a className={"f-cards-under-block-like"} href={"#"}>
                                                        <img src={"/i/shit.svg"} />
                                                        <span className={"f-cards-under-block-like-text"}>12</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={"f-cards-border-image-wrap"}>
                                            <img className={"f-cards-border-image"} alt={"image"} src={"/i/border-image.png"} />
                                        </div>
                                    </div>
                                </div>
                                {/*<div></div>*/}
                                {/*<div></div>*/}
                            </div>
                        </section>
                    </div>
                    <section style={{ width: '20%' }}>
                        <div className={"f-side-block"}>
                            <div className={"f-side-panel-count"}>
                                <div className={"f-side-panel-wrapper"}>
                                    <span className={"f-side-panel-count-text"}>56</span>
                                    <span className={"f-side-panel-count-subtext"}>Готовы</span>
                                </div>
                                <div className={"f-side-panel-wrapper"}>
                                    <span className={"f-side-panel-count-text"}>34</span>
                                    <span className={"f-side-panel-count-subtext"}>В работе</span>
                                </div>
                            </div>
                            <div className={"f-side-panel-wrap"}>
                                <a className={"f-side-panel-button"} href={"#"}>#Задать вопрос</a>
                                <a className={"f-side-panel-button"} href={"#"}>#Предложить идею</a>
                                <a className={"f-side-panel-button"} href={"#"}>#Ошибка</a>
                                <a className={"f-side-panel-button"} href={"#"}>#Другое</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
};

export default MainPage;