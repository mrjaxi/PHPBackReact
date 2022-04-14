import {default as Auth} from "../src/React/Auth";
import {default as Registration} from "../src/React/Registration";
import {default as MainPage} from "../src/React/MainPage";

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/auth", name: "Главная", Component: Auth },
    { path: "/registration", name: "Регистрация", Component: Registration },
];

