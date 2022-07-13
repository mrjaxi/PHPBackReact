import React, {useLayoutEffect, useState} from "react";
import {Avatar, Modal} from "antd";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import Highlighter from "react-highlight-words";
import { NavLink } from "react-router-dom";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
const cancelTokenSource = axios.CancelToken;
let cancel;

const Search = ({ visible, setVisible, includedTypes,
                    includedCategory, setIncludedTypes,
                    setIncludedCategories}) => {

    const [searchItems, setSearchItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statuses, setStatus] = useState([]);
    const [searchText, setSearchText] = useState("");

    useLayoutEffect(() => {
        getCategory()
    }, []);

    const searchIdeas = (text) => {
        if (cancel !== undefined) {
            cancel();
        }
        setLoading(true);

        let prevSearchItems = [];

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
    };

    const getCategory = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setStatus(response.data.statuses);
        });
        setLoading(false);
    };

    return (
        <Modal
            title={
                <>
                    <form>
                        <input autoFocus={true} value={searchText} style={{width: "97%",}} onChange={event => {
                            searchIdeas(event.target.value), setSearchText(event.target.value)
                        }} className={"f-input-search"} placeholder={"Поиск..."}/>
                        {searchText &&
                        <a style={{color: '#AAB2BD', marginLeft: 5}} onClick={() => {
                            setSearchText(""), searchIdeas("")
                        }}>
                            <CloseOutlined/>
                        </a>
                        }
                    </form>
                    <a onClick={() => setVisible(!visible)} style={{ position: 'absolute', right: -40, top: 5 }}>
                        <img style={{ filter: 'brightness(10)' }} src={"/i/close-login.svg"} alt={"Вернуться в главное меню"}/>
                    </a>
                </>
            }
            centered
            closable={false}
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            width={"90vw"}
            style={{
                top: 30,
                verticalAlign: "top",
                minHeight: "90vh",
                paddingBottom: 30,
            }}
            footer={null}
            bodyStyle={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: "24px 24px 0",
                minHeight: "85vh",
            }}
            wrapClassName={"ant-modal-wrap-search"}
        >
            {
                searchItems === null
                    ? <div style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: 21,
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
                            fontSize: 32,
                            fontWeight: 500
                        }}
                        >Введите чтобы найти</div>
                        :
                        <div className={"f-search-wrap"}>
                            {
                                searchItems.map(item => (
                                    <div className={"f-cards"}>
                                        <div>
                                            <div className={"f-text-tags-wrap"}>
                                                <p style={{ marginRight: 30, marginLeft: 0 }} className={"f-cards-hashtag"}>#{item?.category}</p>
                                                <p style={{ marginLeft: 0 }} className={"f-cards-hashtag"}>#{item?.type}</p>
                                            </div>
                                            <NavLink className={"f-cards-card-wrap"} to={global.lang + "/idea/" + item.idea_id}>
                                                <div className={"f-cards-inner"}>
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
        </Modal>
    )
};

export default Search;