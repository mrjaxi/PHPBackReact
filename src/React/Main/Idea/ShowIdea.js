import React, {useEffect, useLayoutEffect, useState} from "react";
import {useHistory, useParams} from "react-router";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import Header from "../Components/Header";
import IdeaItem from "../Components/Idea/IdeaItem";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";
import InfiniteScroll from "react-infinite-scroll-component";
import { Col } from "antd";

const ShowIdea = (props) => {
    const urlPrams = new URLSearchParams(props.location.search);

    const [ideas, setIdeas] = useState([]);
    const [ideasInfinite, setIdeasInfinite] = useState([]);

    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState([]);
    const [page, setPage] = useState(0);
    const [loadingInfinity, setLoadingInfinity] = useState(true);
    const [stopInfinity, setStopInfinity] = useState(false);
    const [wait, setWait] = useState(true);

    const history = useHistory();
    const params = useParams();

    useLayoutEffect(() => {
        updateStatuses();
        getIdea();
    }, [history.location.pathname]);

    useEffect(() => {
        getIdeas();
    }, [page]);

    const getIdea = () => {
        setLoading(true)
        setWait(true)
        axios.get(ApiRoutes.API_GET_ONE_IDEA.format(params.id)).then(response => {
            let data = [];
            switch(response.data?.state){
                case "success":
                    if (response.data?.idea) {
                        response.data.idea.map(idea => {
                            data.push({
                                idea_id: idea.id,
                                category_id: idea?.category?.id,
                                type_id: idea?.type?.id,
                                title: idea.title,
                                text: idea.content,
                                showComments: idea.comments.length > 0,
                                showFullText: false,
                                roles: idea.user.roles,
                                role: idea.user.role_name,
                                status: idea.status,
                                photo: idea.photo,
                                comments: idea.comments,
                                categoryId: idea.category.id,
                                category: idea.category.name,
                                like: Number(idea.likes),
                                dislike: 2,
                                username: idea.user?.first_name,
                                userImage: idea.user.image,
                                type: idea.type.name,
                                currentUserIsVote: idea.currentUserIsVote,
                                allowComments: idea.allowComments,
                                date: idea?.date,
                            })
                        });
                    }
                    break;
                case "error":
                    global.openNotification("Ошибка", response.data?.message, "error")
                    break;
                default:
                    global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                    break;
            }
            setIdeas(data);
            if(data){
                setPage(1)
            }
            setLoading(false)
            setWait(false)
        })
    };

    const getIdeas = () => {
        if(ideas[0] && page > 0 && !stopInfinity) {
            let data = [...ideasInfinite];
            let idea_ids = [ideas[0].idea_id];
            setLoadingInfinity(true);
            axios.get(ApiRoutes.API_GET_IDEAS + `?page=${page}&categories=[${ideas[0].category_id}]&types=[${ideas[0].type_id}]`)
                .then(response => {
                    switch (response.data?.state) {
                        case "success":
                            if (response.data?.ideas !== null) {
                                response.data.ideas.map(idea => {
                                    if (!idea_ids.includes(idea.id)) {
                                        idea_ids.push(idea.id)
                                        data.push({
                                            idea_id: idea.id,
                                            title: idea.title,
                                            text: idea.content,
                                            showComments: false,//idea.comments.length > 0,
                                            showFullText: false,
                                            roles: idea.user.roles,
                                            role: idea.user.role_name,
                                            status: idea.status,
                                            photo: idea.photo,
                                            comments: idea.comments,
                                            like: Number(idea.likes),
                                            dislike: 0,
                                            categoryId: idea.category.id,
                                            category: idea.category.name,
                                            username: idea.user?.first_name,
                                            userImage: idea.user.image,
                                            type: idea.type.name,
                                            typeId: idea.type.id,
                                            currentUserIsVote: idea.currentUserIsVote,
                                            allowComments: idea.allowComments,
                                            date: idea?.date
                                        })
                                    }
                                });
                            } else {
                                setStopInfinity(true);
                            }
                            setIdeasInfinite(data);
                            setLoadingInfinity(false);
                            break;
                        case "error":
                            global.openNotification("Ошибка", response.data?.message, "error")
                            break;
                        default:
                            global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                            break;
                    }
                })
        }
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas];
        newIdeas[index] = idea;
        setIdeas(newIdeas)
    };

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
                                    width: '50vw',
                                    minHeight: '60vh'
                                }}>
                                    { loading ? <LoadingIdeas/> : (
                                        <>
                                            {
                                                ideas[0] ? <IdeaItem item={ideas[0]} index={ideas[0].idea_id} setItem={setIdea}
                                                                 statuses={statuses}/> : <EmptyIdeas text={"Такой записи не существует..."}/>
                                            }
                                            { ideasInfinite.length > 0 ?
                                                <>
                                                <span className={"f-cards-hashtag"} style={{
                                                    marginTop: 50,
                                                    marginBottom: 33,
                                                    fontWeight: 500,
                                                    color: "#1D1D1D",
                                                    fontSize: 24
                                                }}>Посмотрите похожие публикации</span>
                                                    <InfiniteScroll
                                                        style={{overflow: 'hidden',}}
                                                        next={() => {
                                                            setPage(page + 1)
                                                        }}
                                                        hasMore={true}
                                                        dataLength={ideasInfinite.length}
                                                        loader={(loadingInfinity) ? <LoadingIdeas type={true}/> : <></>}
                                                    >{
                                                        ideasInfinite.map((idea, index) => (
                                                            <IdeaItem item={idea} index={idea.idea_id} setItem={setIdea}
                                                                      statuses={statuses}/>
                                                        ))
                                                    }</InfiniteScroll>
                                                </>
                                                : <></>
                                            }
                                        </>)
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