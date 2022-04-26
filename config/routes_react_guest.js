import {default as Login} from "../src/React/Main/Auth/Login"
import {default as MainPage} from "../src/React/MainPage";

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/login", name: "Главная", Component: Login },
];

