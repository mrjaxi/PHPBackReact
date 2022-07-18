import {default as MainPage} from "../src/React/MainPage";
import {default as AddIdeaPage} from "../src/React/Main/Idea/AddIdeaPage";
import {default as ShowIdea} from "../src/React/Main/Idea/ShowIdea";
import {default as Profile} from "../src/React/Main/Profile/Profile";
import {default as Redirect} from "../src/React/Main/RedirectPage/Redirect";
import Settings from "../src/React/Main/Profile/Settings";

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
    { path: "/profile/:id/", name: "Профиль", Component: Profile},
    { path: "/idea/add/", name: "Добавить идею", Component: AddIdeaPage },
    { path: "/idea/:id/", name: "Идея", Component: ShowIdea},
    { path: "/user/settings/", name: "Настройки пользователя", Component: Settings },
    { path: "/redirect", name: "Редирект", Component: Redirect }
];