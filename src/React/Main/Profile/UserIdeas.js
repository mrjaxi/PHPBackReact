import React, { useLayoutEffect, useState } from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import FlatList from "flatlist-react";
import IdeaItem from "../Components/Idea/IdeaItem";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";

const UserIdeas = () => {

    let data = [];

    const [statuses, setStatuses] = useState([]);
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        updateStatuses();
        getUserIdeas()
    }, []);

    const getUserIdeas = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_USER_DATA.format(global.user.id) + "?" + global.serialize({page: "1"})).then(response => {
            switch (response.data?.state) {
                case "success":
                    if (response.data?.ideas) {
                        response.data.ideas.map(item => {
                            data.push({
                                idea_id: item.id,
                                title: item.title,
                                text: item.content,
                                showComments: false,//item.comments.length > 0,
                                showFullText: false,
                                roles: item.user.roles,
                                role: item.user.role_name,
                                status: item.status,
                                photo: item.photo,
                                comments: item.comments,
                                like: Number(item.likes),
                                dislike: 2,
                                username: item.user?.first_name,
                                userImage: item.user.image,
                                type: item.type.name,
                                currentUserIsVote: item.currentUserIsVote,
                                allowComments: item.allowComments
                            })
                        });
                    }
                    console.log("GET IDEAS NICE")
                    break;
                case "error":
                    global.openNotification("Ошибка", response.data?.message, "error")
                    break;
                default:
                    global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                    break;
            }
            setIdeas(data);
            setLoading(false)
        })
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas]
        newIdeas[index] = idea
        setIdeas(newIdeas)
    }

    const updateStatuses = () => {
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setStatuses(response.data?.statuses);
        })
    };

    return (
        <>
            <div className={"max_width"} style={{paddingTop: "10vh"}}>
                <div style={{
                    display: "flex",
                    justifyContent: 'center',
                    flexDirection: "column",
                    alignItems: "center",
                    width: '50vw'
                }}>
                    {loading ? <LoadingIdeas/> :
                        <FlatList
                            list={ideas}
                            renderItem={(idea, index) => {
                                return (
                                    <IdeaItem item={idea} index={index} setItem={setIdea}
                                              statuses={statuses}/>
                                )
                            }}
                            renderWhenEmpty={() =>
                                <EmptyIdeas text={"Вы еще не добавили ни одной записи"}/>
                            }
                        />
                    }
                </div>
            </div>
        </>
    )
};

export default UserIdeas;