import React from "react";
import { NavLink } from "react-router-dom";
import {Button} from "antd";

import './sass/main-component.scss'

const MainPage = () => {
    return (
        <>
            <div className={'f-main-wrap'}>
                <header className={"f-header-content"}>
                    <div className={'f-header-wrap-content'}>
                        <div className={'f-header-wrap-logo'}>
                            <a href="/" className={'anb main_logo'}>
                                <img src={'/i/atmaguru.svg'} />
                            </a>
                        </div>
                        <div className={'f-header-logo-wrapper'}>
                            <a className={'f-sign-in'} href="#" target="_blank" rel="noreferrer">Войти</a>
                            <img className={'f-sign-in-lock'} src={"/i/lock-signin.svg"} />
                        </div>
                    </div>
                </header>
                <section>
                    <div className={"f-section"}>
                        <div className={"f-section-wrap-text"}>
                            <p className={"f-section-wrap-p-text"}>Мы ценим мнение
                                клиентов и рады,
                                когда вы делитесь
                                им с нами
                            </p>
                            {/*<a href={"#"} className={'f-section-wrap-button'}>Больше не показывать</a>*/}
                        </div>
                        <img className={"f-section-wrap-image"} src={'/i/movie-text.png'} />
                    </div>
                </section>
                <section>
                    <div className={"f-nav"}>
                        <a className={"f-nav-button"}>Методология</a>
                        <a className={"f-nav-button-white"}>Мобильное приложение</a>
                        <a className={"f-nav-button-blur"}>Платформа</a>
                        <a className={"f-nav-button-blur"}>Прочее</a>
                        <img src={"/i/threedot.svg"}/>
                        <img src={"/i/search.svg"}/>
                    </div>
                </section>
                <section>
                    <div className={"f-cards"}>
                        <div>
                            <p>#Предложить идею</p>
                            <div className={"f-cards-inner"}>
                                <div className={"f-cards-avatar"}>
                                    <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                    <span className={"f-cards-text"}>Константин Константинопольский</span>
                                </div>
                                <div>
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
                                            <span>24</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*<div></div>*/}
                        {/*<div></div>*/}
                    </div>
                </section>
                <section>
                    <div className={"f-cards"}>
                        <div>
                            <p>#Предложить идею</p>
                            <div className={"f-cards-inner"}>
                                <div className={"f-cards-avatar"}>
                                    <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                    <span className={"f-cards-text"}>Константин Константинопольский</span>
                                </div>
                                <div>
                                    <span className={"f-cards-content-text"}>
                                        Крайне не удобно работать
                                        с множественным
                                        выделением на карте, так как
                                        Ctrl и Shift + click
                                        не работают
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/*<div></div>*/}
                        {/*<div></div>*/}
                    </div>
                </section>
            </div>
        </>
    )
};

export default MainPage;