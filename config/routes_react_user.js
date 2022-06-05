import {default as AddIdeaPage} from "../src/React/Main/Idea/AddIdeaPage";
import {default as Profile} from "../src/React/Main/Profile/Profile";
import {default as MainPage} from "../src/React/MainPage";
import {default as Search} from "../src/React/Main/Search";
import {default as ShowIdea} from "../src/React/Main/Idea/ShowIdea";
import {default as Redirect} from "../src/React/Main/RedirectPage/Redirect";

/*
params:
    path - string
    name - string
    Component - react component
    icon - component antd icon
    left_menu - key left menu, если не указан - не отобразится в меню
    viewBreadcrumbs - хлебные крошки
 */

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/profile", name: "Профиль", Component: Profile},
    { path: "/idea/add/", name: "Добавить идею", Component: AddIdeaPage },
    { path: "/idea/:id", name: "Идея", Component: ShowIdea},
    { path: "/redirect", name: "Редирект", Component: Redirect },
    { path: "/search", name: "Поиск по идеям", Component: Search },
];