import {default as Login} from "../src/React/Main/Auth/Login"
import {default as Profile} from "../src/React/Main/Profile/Profile";
import {default as MainPage} from "../src/React/MainPage";
import {default as Redirect} from "../src/React/Main/RedirectPage/Redirect";
import {default as ShowIdea} from "../src/React/Main/Idea/ShowIdea";

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/auth/", name: "Главная", Component: Login },
    { path: "/profile", name: "Профиль", Component: Profile},
    { path: "/redirect", name: "Редирект", Component: Redirect },
    { path: "/idea/:id", name: "Идея", Component: ShowIdea}
];

