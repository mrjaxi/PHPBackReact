import React, { useLayoutEffect, useState } from "react";
import { useParams } from "react-router";
import { Col } from "antd";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import FlatList from "flatlist-react";
import Header from "../Components/Header";
import IdeaItem from "../Components/Idea/IdeaItem";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";

const ShowIdea = () => {

    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState([]);
    const params = useParams();

    useLayoutEffect(() => {
        updateStatuses()
        getIdea();
    }, []);

    const getIdea = () => {
        setLoading(true)
        axios.get(ApiRoutes.API_GET_ONE_IDEA.format(params.id)).then(response => {
            let data = [];
            switch(response.data?.state){
                case "success":
                    if (response.data?.idea) {
                        response.data.idea.map(item => {
                            data.push({
                                idea_id: item.id,
                                title: item.title,
                                text: item.content,
                                showComments: item.comments.length > 0,
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
                    console.log("GET IDEA NICE")
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
            <Col className={"f-main"} style={{ minHeight: '100vh' }}>
                <div>
                    <Header />
                    <div className={"max_width"} style={{paddingTop: "15vh"}}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: 'center',
                            alignItems: "center",
                        }}>
                            <div className={"max_width"}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: 'center',
                                    flexDirection: "column",
                                    alignItems: "center",
                                    width: '50vw'
                                }}>
                                    { loading ? <LoadingIdeas/> :
                                        <FlatList
                                            list={ideas}
                                            renderItem={(idea, index) => {
                                                // console.log(`idea:`, idea)
                                                return (
                                                    <IdeaItem item={idea} index={index} setItem={setIdea}
                                                              statuses={statuses}/>
                                                )
                                            }}
                                            renderWhenEmpty={() =>
                                                <EmptyIdeas text={"Такой записи не существует..."}/>
                                            }
                                            // sortBy={["firstName", {key: "lastName", descending: true}]}
                                            // groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Col>
        </>
    )
};

export default ShowIdea;