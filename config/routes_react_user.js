import {default as Profile} from "../src/React/User/Profile";
import {default as SystemsList} from "../src/React/User/SystemsList";
import {default as Settings} from "../src/React/User/Settings";

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
    {
        path: "/user/",
        name: "Главная",
        Component: Profile,
        icon: 'HomeOutlined',
        viewBreadcrumbs: false
    },
    { path: "/user/systems-list", name: "Список систем", Component: SystemsList },
    { path: "/user/settings", name: "Настройки", Component: Settings },
];
