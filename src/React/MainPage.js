import React, {useEffect, useLayoutEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import './sass/main-component.scss'
import {Col, Skeleton} from "antd";
import axios from "axios";
import Header from "./Main/Components/Header";
import Navigation from "./Main/Components/Navigation";
import ApiRoutes from "./Routes/ApiRoutes";
import IdeaItem from "./Main/Components/Idea/IdeaItem";
import LoadingIdeas from "./Main/Components/Idea/LoadingIdeas";
import EmptyIdeas from "./Main/Components/Idea/EmptyIdeas";
import Login from "./Main/Auth/Login";
import InfiniteScroll from "react-infinite-scroll-component";
const cancelTokenSource = axios.CancelToken;
let cancel = undefined;

global.handleResponse = function( response, success=()=>{}, error=()=>{}, trouble=()=>{}, defaultFunc=()=>{} ) {
    switch (response.data?.state) {
        case "success":
            success()
            break;
        case "error":
            error()
            break;
        case "trouble":
            trouble()
            break;
        case "unauthorized":
            global.openNotification("Войдите", "Для этого нужно авторизоваться", "error")
            break;
        default:
            defaultFunc()
            global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
            break;
    }
    /** Вот так ловить ответы от сервера:
        .then(response => {
            global.handleResponse(response,
                function () {
                    // Код при success ответе
                },
                function () {
                    // Код при error ответе
                },
                function () {
                    // Код при trouble ответе
                },
            )
        })
     * */
}

const MainPage = (props) => {
    const urlParams = new URLSearchParams(props.location.search);

    const [statuses, setStatuses] = useState(global.statuses);

    const [includedTypes, setIncludedTypes] = useState(urlParams.get("types") ? Object.values(JSON.parse(urlParams.get("types"))) : []);
    const [includedStatuses, setIncludedStatuses] = useState(urlParams.get("status") ? Object.values(JSON.parse(urlParams.get("status"))) : []);
    const [includedCategories, setIncludedCategories] = useState(urlParams.get("categories") ? Object.values(JSON.parse(urlParams.get("categories"))) : []);

    const [page, setPage] = useState(1);
    const [ideas, setIdeas] = useState([]);
    const [visibleLogin, setVisibleLogin] = useState(false);

    const [loading, setLoading] = useState(true);
    const [loadingInfinite, setLoadingInfinite] = useState(true);

    useEffect(() => {
        updateStatuses()
        loadData()
    },[includedTypes, includedStatuses, includedCategories, page]);

    useEffect(() => {
        if(urlParams.get("reset")){
            setIncludedTypes([]);
            setIncludedStatuses([]);
            setIncludedCategories([]);
        }
    }, [urlParams])

    const selectCategory = (categoryId) => {
        if(categoryId) {
            let prevIncludedCategories = [...includedCategories];
            if (prevIncludedCategories.indexOf(categoryId) >= 0) {
                prevIncludedCategories = prevIncludedCategories.filter(item => item !== categoryId)
            } else {
                prevIncludedCategories.push(categoryId);
            }
            setPage(1)
            setIncludedCategories(prevIncludedCategories);
        }
        return true;
    };

    const selectStatus = (statusId) => {
        if(statusId) {
            let prevIncludedStatuses = [...includedStatuses];
            if (prevIncludedStatuses.indexOf(statusId) >= 0) {

                prevIncludedStatuses = prevIncludedStatuses.filter(item => item !== statusId)
            } else {
                prevIncludedStatuses.push(statusId);
            }
            setPage(1)
            setIncludedStatuses(prevIncludedStatuses);
        }
        return true;
    };

    const selectType = (typeId) => {
        if(typeId){
            let prevIncludesTypes = [...includedTypes];
            if (prevIncludesTypes.indexOf(typeId) >= 0){

                prevIncludesTypes = prevIncludesTypes.filter(item => item !== typeId)
            } else {
                prevIncludesTypes.push(typeId);
            }
            setPage(1)
            setIncludedTypes(prevIncludesTypes);
        }
        return true;
    };

    const loadData = () => {
        if (cancel !== undefined) {
            cancel();
        }
        let data = [];
        let params = {
            order: urlParams.get("order") ? urlParams.get("order") : "id",
            type: urlParams.get("type") ? urlParams.get("type") : "desc",
            page: page,
        };
        if (page > 1) {
            data = [...ideas];
            setLoadingInfinite(true);
        } else {
            setLoading(true);
        }

        if(includedCategories.length !== 0){
            params["categories"] = JSON.stringify([...includedCategories])
        }
        if(includedTypes.length !== 0){
            params["types"] = JSON.stringify([...includedTypes])
        }
        if(includedStatuses.length !== 0){
            params["status"] = JSON.stringify([...includedStatuses])
        }

        let serializedParams = "";
        for (let key in params) {
            if(serializedParams === ""){
                serializedParams += `${key}=${params[key]}`
            } else {
                serializedParams += `&${key}=${params[key]}`
            }
        }
        global._history.replace(`${global.lang}/?${serializedParams}`);
        axios.get(ApiRoutes.API_GET_IDEAS + "?" + serializedParams, {withCredentials: true, cancelToken: new cancelTokenSource(function executor(c) {cancel = c;}) })
            .then(response => {
                global.handleResponse(response,
                    function () {
                        data = global.parseToIdeaItems(response.data?.ideas, data)
                        setIdeas(data);
                        setLoading(false)
                        setLoadingInfinite(false);
                    },
                    function () {
                        global.openNotification("Ошибка", response.data?.message, "error")
                    }
                )
            })
    };

    const updateStatuses = () => {
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setStatuses(response.data.statuses);
        })
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas];
        newIdeas[index] = idea;
        setIdeas(newIdeas);
        updateStatuses()
    };

    return (
        <>
            <Login visible={visibleLogin} setVisible={setVisibleLogin}/>
            <Col className={"f-main"}>
                <Header
                    setIncludedTypes={setIncludedTypes}
                    setIncludedCategories={setIncludedCategories}
                    includedCategory={includedCategories}
                    includedTypes={includedTypes}
                />
                <div key={3} style={{ minHeight: "100vh"}}>
                    <section className={"max_width"} style={{marginTop: 150, marginBottom: 130, maxWidth: 1150, padding: '0 70px'}}>
                        <div className={"f-section"}>
                            <div>
                                <p className={"f-section-wrap-p-text"} style={{
                                    marginBottom: 0,
                                    marginTop: "20px",
                                }}>Мы ценим мнение клиентов и рады, когда вы делитесь им с нами</p>
                            </div>
                        </div>
                    </section>
                    <div id={"start"}/>
                    <Navigation
                        selectCategory={selectCategory}
                        includedCategory={includedCategories}
                    />
                    {
                        global.layout !== "guest" ?
                            <NavLink to={global.lang + "/idea/add/"} className={"f-new-idea"}>
                                <p className={"f-new-idea-text"}></p>
                            </NavLink> :
                            <a onClick={() => setVisibleLogin(!visibleLogin)} className={"f-new-idea"}>
                                <p className={"f-new-idea-text"}></p>
                            </a>
                    }
                    <div className={"max_width"}>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            width: "calc(100% - 250px)",
                            position: "relative",
                            left: 250,
                            marginBottom: 100,
                        }}>
                        <div style={{ width: "100%", maxWidth: 1000, }}>
                            { loading ? <LoadingIdeas type={true}/>
                                : ideas.length === 0 ? <EmptyIdeas text={"Пока нет записей..."}/>
                                    : <InfiniteScroll
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            flexDirection: "column",
                                            overflow: 'hidden'
                                        }}
                                        next={() => {
                                            setPage(page + 1)
                                        }}
                                        hasMore={true}
                                        dataLength={ideas.length}
                                        loader={loadingInfinite ? <LoadingIdeas type={true}/> : <></>}
                                    >
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            flexDirection: "column",
                                            maxWidth: 1000,
                                        }}>
                                        {
                                            ideas.map((idea, index) => (
                                                <IdeaItem
                                                    key={index}
                                                    item={idea}
                                                    index={index}
                                                    setItem={setIdea}
                                                    includedCategory={includedCategories}
                                                    selectType={selectType}
                                                    selectCategory={selectCategory}
                                                    includedTypes={includedTypes}
                                                />
                                            ))
                                        }
                                        </div>
                                    </InfiniteScroll>
                            }
                        </div>
                        <section style={{
                            position: "relative",
                            top: -100,
                            minWidth: 250,
                            maxWidth: 250,
                        }}>
                            <div className={"f-side-block"}>
                                <div className={"f-side-panel-wrap"}>
                                    { statuses?.length > 0 ?
                                        statuses.map((status) => (
                                            <a key={status.id} className={"f-side-panel-button-section"}
                                               href={global.isFireFox ? null : "#start"}
                                               onClick={() => {
                                                   selectStatus(status.id)
                                                   global._history.push({
                                                       hash: "#start"
                                                   })
                                               }}
                                               style={{
                                                   color: includedStatuses.includes(status.id) && "#fff",
                                                   backgroundColor: includedStatuses.includes(status.id) && (status?.color ? status?.color : "#ffffff00"),
                                                   borderRadius: "65px",
                                               }}
                                            >{status.translate}
                                                <span
                                                    className={"f-side-panel-count-subtext " + (includedStatuses.includes(status.id) && "f-block")}
                                                >{status.ideasCount}</span>
                                            </a>
                                        ))
                                        : [1,2,3,4,5].map((status) => (
                                            <Skeleton style={{width: 200}} active paragraph={{ rows: 0 }}>
                                                <a className={"f-side-panel-button-section"} style={{width: 260, height: 50}}>
                                                    <span className={"f-side-panel-count-subtext"}/>
                                                </a>
                                            </Skeleton>
                                        ))
                                    }
                                </div>
                                <div className={"f-side-panel-wrap"}>
                                    { global.types?.length > 0 ?
                                        global.types.map((type) => (
                                            <a key={type.id} className={"f-side-panel-button"}
                                               href={global.isFireFox ? null : "#start"}
                                               onClick={() => {
                                                   selectType(type.id)
                                                   global._history.push({
                                                       hash: "#start"
                                                   })
                                               }}
                                               style={{color: includedTypes.includes(type.id) && (type?.color ? type?.color : "#3D72ED"),
                                                   borderColor: includedTypes.includes(type.id) && (type?.color ? type?.color : "#3D72ED") }}
                                            >#{type.name}</a>
                                        ))
                                        : [1,2,3,4,5].map((type) => (
                                            <Skeleton style={{width: 200}} active paragraph={{ rows: 0 }}>
                                                <a className={"f-side-panel-button"} style={{width: 260, height: 50}}/>
                                            </Skeleton>
                                        ))
                                    }
                                </div>
                            </div>
                        </section>
                        </div>
                    </div>
                </div>
            </Col>
        </>
    )
};

export default MainPage;