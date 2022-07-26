import React, {useEffect, useLayoutEffect, useState} from "react";
import { NavLink } from "react-router-dom";
import './sass/main-component.scss'
import {Avatar, Button, Col, Drawer, Skeleton} from "antd";
import axios from "axios";
import Header from "./Main/Components/Header";
import Navigation from "./Main/Components/Navigation";
import ApiRoutes from "./Routes/ApiRoutes";
import IdeaItem from "./Main/Components/Idea/IdeaItem";
import LoadingIdeas from "./Main/Components/Idea/LoadingIdeas";
import EmptyIdeas from "./Main/Components/Idea/EmptyIdeas";
import Login from "./Main/Auth/Login";
import InfiniteScroll from "react-infinite-scroll-component";
import {UserOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
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
    const [showDrawer, setShowDrawer] = useState(false);
    const [showSearchDrawer, setShowSearchDrawer] = useState(false);

    const [searchItems, setSearchItems] = useState([]);
    const [searchText, setSearchText] = useState("");

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

    const searchIdeas = (text) => {
        if (cancel !== undefined) {
            cancel();
        }
        let prevSearchItems = [];

        if(text && text.length > 2){
            axios.post(ApiRoutes.API_SEARCH, {title: text, content: ""}, {withCredentials: true, cancelToken: new cancelTokenSource(function executor(c) {cancel = c;}) })
                .then(response => {
                    if (response.data?.ideas && response.data.state === "success") {
                        response.data?.ideas.map(idea => {
                            prevSearchItems.push({
                                idea_id: idea.id,
                                title: idea.title,
                                text: idea.content,
                                roles: idea.user.roles,
                                role: idea.user.role_name,
                                userImage: idea.user.image,
                                status: idea.status,
                                categoryId: idea.category.id,
                                category: idea.category.name,
                                like: Number(idea.likes),
                                user: idea.user,
                                username: idea.user?.first_name,
                                typeId: idea.type.id,
                                type: idea.type.name,
                                typeColor: idea.type.color,
                                currentUserIsVote: idea.currentUserIsVote,
                                date: global.getDateString(new Date(idea?.date), false,false)
                            })
                        });
                    } else if (response.data.state === "error") {
                        prevSearchItems = []
                    } else {
                        prevSearchItems = null
                    }
                    setSearchItems(prevSearchItems);
                })
        } else {
            setSearchItems(prevSearchItems);
        }
    };


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
                    <div className={"f-hashtag-drawer"} onClick={() => setShowDrawer(!showDrawer)}>
                        <p className={"f-text-drawer"}>#</p>
                    </div>
                    <div className={"max_width f-cards-wrapper-pad"}>
                        <div className={"f-cards-wrap"} style={{

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
                                        <div className={"f-ideas-scroll"}>
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
                        <section className={"f-side-block-items"}>
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
            <Drawer bodyStyle={{ padding: 15 }} height={'100vh'} onClose={() => setShowSearchDrawer(!showSearchDrawer)} placement="bottom" visible={showSearchDrawer}>
                <input autoFocus={true} onChange={event => {searchIdeas(event.target.value)
                           setSearchText(event.target.value)}} placeholder={"Поиск"} className={"f-search-drawer-button"}/>
                {
                    searchItems === null
                        ? <div style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 24,
                            fontWeight: 500
                        }}
                        >Ничего не найдено...</div> :
                        searchItems.length === 0
                            ? <div style={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: 24,
                                fontWeight: 500
                            }}
                            >Введите чтобы найти</div>
                            :
                            <div className={"f-search-wrap"} style={{ marginTop: 20 }}>
                                {
                                    searchItems.map(item => (
                                        <div className={"f-cards"}>
                                            <div>
                                                <div className={"f-text-tags-wrap"}>
                                                    <p className={"f-cards-hashtag"} style={{
                                                        marginRight: 0,
                                                        color: "rgb(29, 29, 31)",
                                                        backgroundColor: "rgba(255, 255, 255, 0.282)",
                                                        boxShadow: "rgb(0 0 0 / 7%) 0px 0px 16px 0px"
                                                    }}>#{item?.category}</p>
                                                    <p style={{ marginLeft: 0, color: item?.typeColor }} className={"f-cards-hashtag"}>#{item?.type}</p>
                                                </div>
                                                <NavLink className={"f-cards-card-wrap"} to={global.lang + "/idea/" + item.idea_id} onClick={() => {
                                                    setVisible(false)
                                                }}>
                                                    <div className={"f-cards-inner f-drawer-search-inner"}>
                                                        <div className={"f-cards-avatar"}>
                                                            <div className={"f-cards-row-wrap"}>
                                                                <Avatar size={48} style={{backgroundColor: '#AAB2BD'}}
                                                                        src={item.userImage
                                                                            ? <img src={item.userImage}/>
                                                                            : <UserOutlined/>
                                                                        }/>
                                                                <div className={"f-cards-wrap-text"}>
                                                                    <span className={"f-cards-text"}>{item.username}</span>
                                                                    <span className={"f-cards-text-bottom"}>
                                                                    {item.role}
                                                                        <span> · </span>
                                                                        {item.date}
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <div style={{
                                                                textAlign: "center",
                                                                justifyContent: 'center',
                                                            }}>
                                                                <p className={"f-cards-type f-cards-type-viewed"} style={{
                                                                    flex: 1,
                                                                    padding: "5px",
                                                                    color: item.status?.color ? item.status?.color : "#000000",
                                                                    backgroundColor: item.status?.color ? item.status?.color + "30" : "#AAB2BD",
                                                                }}
                                                                >{item.status.translate}</p>
                                                            </div>
                                                        </div>
                                                        <div className={"f-cards-div-wrap-text"}>
                                                            {/*<NavLink to={global.lang + "/idea/" + item.idea_id}>*/}
                                                            <span className={"f-cards-content-text"}>
                                                                <Highlighter
                                                                    searchWords={searchText.split(" ").filter(item => item.length > 1)}
                                                                    autoEscape={true}
                                                                    highlightStyle={{
                                                                        padding: 0,
                                                                        backgroundColor: "#FFFF66",
                                                                        color: "black"
                                                                    }}
                                                                    textToHighlight={item.title}
                                                                />
                                                            </span>
                                                            {/*</NavLink>*/}
                                                        </div>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                }
            </Drawer>
            <Drawer height={'60vh'} onClose={() => setShowDrawer(!showDrawer)} title="Статусы и типы" placement="bottom" visible={showDrawer}>
                <span className={"f-search-drawer-button"} onClick={() => setShowSearchDrawer(!showSearchDrawer)}>Поиск</span>
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
            </Drawer>
        </>
    )
};

export default MainPage;