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
    const [ideas, setIdeas] = useState([]);
    const [ideasInfinite, setIdeasInfinite] = useState([]);

    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [loadingInfinity, setLoadingInfinity] = useState(true);
    const [stopInfinity, setStopInfinity] = useState(false);

    const history = useHistory();
    const params = useParams();

    useLayoutEffect(() => {
        getIdea();
        setIdeasInfinite([])
        setStopInfinity(false)
        setPage(0);
    }, [history.location.pathname]);

    useEffect(() => {
        getIdeas();
    }, [page]);

    const getIdea = () => {
        setLoading(true)
        axios.get(ApiRoutes.API_GET_ONE_IDEA.format(params.id)).then(response => {
            let data = [];
            global.handleResponse(response,
                function () {
                    data = global.parseToIdeaItems(response.data?.idea, data, true)
                },
                function () {
                    global.openNotification("Ошибка", response.data?.message, "error")
                },
            )
            setIdeas(data);
            if(data){
                setPage(1)
            }
            setLoading(false)
        })
    };

    const getIdeas = () => {
        if(ideas[0] && page > 0 && !stopInfinity) {
            let data = []
            if(page > 1){
                data = [...ideasInfinite];
            }
            let idea_ids = [ideas[0].idea_id];
            setLoadingInfinity(true);
            axios.get(ApiRoutes.API_GET_IDEAS + `?page=${page}&categories=[${ideas[0].categoryId}]&types=[${ideas[0].typeId}]`)
                .then(response => {
                    global.handleResponse(response,
                        function () {
                            if (response.data?.ideas !== null) {
                                data = global.parseToIdeaItems(response.data.ideas, data)
                                data = data.filter(idea => {
                                    if (!idea_ids.includes(idea.idea_id)) {
                                        idea_ids.push(idea.idea_id)
                                        return true;
                                    } else {
                                        return false;
                                    }
                                })
                            } else {
                                setStopInfinity(true);
                            }
                            setIdeasInfinite(data);
                            setLoadingInfinity(false);
                        },
                        function () {
                            global.openNotification("Ошибка", response.data?.message, "error")
                        },
                    )
                })
        }
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas];
        newIdeas[index] = idea;
        setIdeas(newIdeas)
        // if(ideasInfinite.length > 0 && (ideasInfinite[0]?.typeId !== idea?.typeId || ideasInfinite[0]?.categoryId !== idea?.categoryId)){
        //     setStopInfinity(false)
        //     setPage(1);
        //     getIdeas();
        // } else if(ideasInfinite.length === 0){
        //     setStopInfinity(false)
        //     setPage(1);
        //     getIdeas();
        // }
    };

    return (
        <>
            <Col className={"f-main"} style={{ minHeight: '100vh' }}>
                <div>
                    <Header />
                    <div className={"max_width f-cards-wrapper-pad"}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: 'center',
                            alignItems: "flex-start",
                        }}>
                            <div className={"max_width f-cards-wrapper-pad"}>
                                <div className={"f-single-idea-wrap"}>
                                    { loading ? <LoadingIdeas/> : (
                                        <>
                                            { ideas[0] ? <IdeaItem item={ideas[0]} index={ideas[0].idea_id} setItem={setIdea}/>
                                                : <EmptyIdeas text={"Такой записи не существует..."}/>
                                            }
                                            { ideasInfinite.length > 0 ?
                                                <>
                                                <span className={"f-cards-hashtag"} style={{
                                                    marginBottom: 33,
                                                    fontWeight: 500,
                                                    color: "#1D1D1D",
                                                    fontSize: 24
                                                }}>Посмотрите похожие публикации</span>
                                                    <InfiniteScroll
                                                        style={{overflow: 'hidden', display: "flex", alignItems: "center", flexDirection: "column"}}
                                                        next={() => {
                                                            setPage(page + 1)
                                                        }}
                                                        hasMore={true}
                                                        dataLength={ideasInfinite.length}
                                                        loader={(loadingInfinity) ? <div style={{display: "flex", justifyContent: "center"}}><LoadingIdeas type={true}/></div> : <></>}
                                                    >{
                                                        ideasInfinite.map((idea, index) => (
                                                            <IdeaItem item={idea} index={idea.idea_id} setItem={setIdea}/>
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