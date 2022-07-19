import {default as MainPage} from "../src/React/MainPage";
import {default as ShowIdea} from "../src/React/Main/Idea/ShowIdea";
import {default as Profile} from "../src/React/Main/Profile/Profile";
import {default as Redirect} from "../src/React/Main/RedirectPage/Redirect";

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/profile/:id/", name: "Профиль", Component: Profile},
    { path: "/idea/:id/", name: "Идея", Component: ShowIdea},
    { path: "/redirect", name: "Редирект", Component: Redirect }
];

