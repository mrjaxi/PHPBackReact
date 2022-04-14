import {default as Settings} from "../src/React/Admin/Settings";
import {default as User} from "../src/React/Admin/User/User";
import {default as UserEdit} from "../src/React/Admin/User/UserEdit";
import {default as UserNew} from "../src/React/Admin/User/UserNew";

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
        path: "/admin/users/new/",
        name: "Новые пользователи",
        Component: UserNew,
        viewBreadcrumbs: true
    },
    {
        path: "/admin/users/:id/",
        name: "Сотрудник",
        Component: User,
        viewBreadcrumbs: true
    },
    {
        path: "/admin/users/:id/edit/",
        name: "Редактирование пользователя",
        Component: UserEdit,
        viewBreadcrumbs: true
    },
    {
        path: "/admin/settings/",
        name: "Настройки",
        Component: Settings,
        icon: 'SettingOutlined',
        viewBreadcrumbs: false,
        // disabled: true
    }
];
