import React, {useCallback, useEffect, useLayoutEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import FlatList from "flatlist-react";
import IdeaItem from "../Components/Idea/IdeaItem";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";

const UserFavourite = ({ user, setCount, updateCounts }) => {

    const [loading, setLoading] = useState(true);
    const [ideas, setIdeas] = useState([]);

    useLayoutEffect(() => {
        getUserFavourites()
    }, []);

    useEffect(() => {
        if(user) {
            let prevIdeas = [...ideas]
            prevIdeas?.map(idea => {
                if(idea?.user.id === user.id) {
                    idea.roles = user?.roles
                    idea.role = user?.role_name
                    idea.user.roles = user?.roles
                    idea.user.role_name = user?.role_name
                }
                idea?.comments?.map(comment => {
                    if(comment.user.id === user.id) {
                        comment.user.roles = user?.roles;
                        comment.user.role_name = user?.role_name;
                    }
                })
            })
            setIdeas(prevIdeas)
        }
    }, [user])

    const getUserFavourites = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_USER_DATA.format(user.id) + "?" + global.serialize({page: "3"})).then(response => {
            let data = [];
            global.handleResponse(response,
                function () {
                    let ideasItems = []
                    response.data?.likes.map(item => {
                        ideasItems.push(item?.idea);
                    })
                    data = global.parseToIdeaItems(ideasItems)
                    setCount(response.data?.count)
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
        let newIdeas = [...ideas];
        newIdeas[index] = idea;
        setIdeas(newIdeas)
        updateCounts()
    };

    const deleteIdea = useCallback((id) => {
        axios.post(ApiRoutes.API_DELETE_IDEA, {idea_id: id}).then(response => {
            if (response.data.state === "success"){
                let prevIdeas = [...ideas];
                console.log("ID: ", id);
                prevIdeas = prevIdeas.filter(item => Number(item.idea_id) !== Number(id));
                setIdeas(prevIdeas);
                updateCounts();
                global.openNotification("Успешно", "Идея удалена", "success")
            } else {
                global.openNotification("Ошибка", "Невозможно удалить идею", "error")
            }
        })
    }, [ideas]);

    return (
        <>
            {loading ? <LoadingIdeas type={true}/> :
                <FlatList
                    list={ideas}
                    renderItem={(idea, index) => {
                        return (
                            <IdeaItem deleteIdea={deleteIdea} item={idea} index={index} setItem={setIdea}/>
                        )
                    }}
                    renderWhenEmpty={() =>
                        <EmptyIdeas text={user.id === global.user.id ? "Вы еще не оценили ни одну запись" : "Пользователь еще не оценил ни одной записи"}/>
                    }
                />
            }
        </>
    )
};

export default UserFavourite;