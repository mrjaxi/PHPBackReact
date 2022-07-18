import {default as MainPage} from "../src/React/MainPage";
import {default as ShowIdea} from "../src/React/Main/Idea/ShowIdea";
import {default as Profile} from "../src/React/Main/Profile/Profile";
import {default as Redirect} from "../src/React/Main/RedirectPage/Redirect";
import Settings from "../src/React/Main/Profile/Settings";

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/profile/:id/", name: "Профиль", Component: Profile},
    { path: "/idea/:id/", name: "Идея", Component: ShowIdea},
    { path: "/user/settings/", name: "Настройки пользователя", Component: Settings },
    { path: "/redirect", name: "Редирект", Component: Redirect }
];

