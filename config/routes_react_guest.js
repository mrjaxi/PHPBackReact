import {default as Login} from "../src/React/Main/Auth/Login"
import {default as MainPage} from "../src/React/MainPage";
import {default as AddIdeaPage} from "../src/React/Main/Idea/AddIdeaPage"
import {default as Search} from "../src/React/Main/Search";

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/auth/", name: "Главная", Component: Login },
    { path: "/idea/add/", name: "Добавить идею", Component: AddIdeaPage },
    { path: '/search', name: "Поиск по идеям", Component: Search }
];

