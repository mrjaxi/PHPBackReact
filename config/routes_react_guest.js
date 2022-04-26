import {default as Login} from "../src/React/Main/Auth/Login"
import {default as MainPage} from "../src/React/MainPage";
import {default as AddIdeaPage} from "../src/React/Main/Idea/AddIdeaPage"

export default [
    { path: "/", name: "Главная страница", Component: MainPage },
    { path: "/login/", name: "Главная", Component: Login },
    { path: "/idea/add/", name: "Добавить идею", Component: AddIdeaPage }
];

