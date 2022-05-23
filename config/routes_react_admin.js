import {default as MainPage} from "../src/React/MainPage";
import {default as AddIdeaPage} from "../src/React/Main/Idea/AddIdeaPage";
import {default as Search} from "../src/React/Main/Search";
import {default as ShowIdea} from "../src/React/Main/Idea/ShowIdea";
import {default as Profile} from "../src/React/Main/Profile/Profile";

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
    { path: "/idea/add/", name: "Добавить идею", Component: AddIdeaPage },
    { path: '/search', name: "Поиск по идеям", Component: Search },
    { path: "/idea/:id", name: "Идея", Component: ShowIdea},
    { path: "/profile", name: "Профиль", Component: Profile},
];
