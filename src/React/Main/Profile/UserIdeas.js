import React, {useEffect, useLayoutEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import FlatList from "flatlist-react";
import IdeaItem from "../Components/Idea/IdeaItem";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";

const UserIdeas = ({ user, setCount, setNotifications }) => {

    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);

    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        getUserIdeas()
    }, []);

    useEffect(() => {
        console.log("ideas updated")
        if(ideas.length >= 0 && !loading){
            setCount(ideas.length)
        }

        if(ideas.length > 0){
            let notifications = false
            ideas.forEach((idea) => {
                if(idea?.notification === true){
                    notifications = true;
                }
            })
            setNotifications(notifications)
        }
    }, [ideas])

    useEffect(() => {
        if(user) {
            let prevIdeas = [...ideas]
            prevIdeas.map(idea => {
                idea.roles = user?.roles
                idea.role = user?.role_name
                idea.user.roles = user?.roles
                idea.user.role_name = user?.role_name
                idea?.comments?.map(comment => {
                    if(comment.user.id === user.id){
                        comment.user.roles = user?.roles;
                        comment.user.role_name = user?.role_name;
                    }
                })
            })
            setIdeas(prevIdeas)
        }
    }, [user])

    const getUserIdeas = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_USER_DATA.format(user.id) + "?" + global.serialize({page: "1"})).then(response => {
            let data = [];
            global.handleResponse(response,
                function () {
                    data = global.parseToIdeaItems(response.data?.ideas)
                },
                function () {
                    global.openNotification("Ошибка", response.data?.message, "error")
                },
            )
            setIdeas(data);
            setLoading(false)
        })
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas]
        newIdeas[index] = idea
        setIdeas(newIdeas)
    }

    return (
        <>
            {loading ? <LoadingIdeas type={true}/> :
                <FlatList
                    list={ideas}
                    renderItem={(idea, index) => {
                        return (
                            <IdeaItem item={idea} index={index} setItem={setIdea}/>
                        )
                    }}
                    renderWhenEmpty={() =>
                        <EmptyIdeas text={user.id === global.user.id ? "Вы еще не добавили ни одну запись" : "Пользователь еще не добавил ни одной записи"}/>
                    }
                />
            }
        </>
    )
};

export default UserIdeas;