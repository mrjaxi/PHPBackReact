import React, {useState} from "react";
import {Form, Input, Select, Skeleton} from "antd";
import axios from "axios";
import {CloseOutlined} from "@ant-design/icons"
import Highlighter from "react-highlight-words";

const {Option} = Select;
import ApiRoutes from "../Routes/ApiRoutes";
import {NavLink} from "react-router-dom";

const Search = () => {
    const [searchItems, setSearchItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statuses, setStatus] = useState([]);

    const [searchText, setSearchText] = useState("");

    const searchIdeas = (text) => {
        setLoading(true);

        let prevSearchItems = [];

        axios.post(ApiRoutes.API_SEARCH, {title: text, content: ""}).then(response => {
            if (response.data?.ideas) {
                response.data?.ideas.map(item => {
                    prevSearchItems.push({
                        id: item.id,
                        title: item.title,
                        text: item.content,
                        roles: item.user.roles,
                        role: item.user.role_name,
                        status: item.status,
                        like: Number(item.likes),
                        username: item.user?.first_name,
                        type: item.type.name,
                        currentUserIsVote: item.currentUserIsVote,
                    })
                });
            } else {
                prevSearchItems = []
            }

            setSearchItems(prevSearchItems);
            setLoading(false)
        })
    };

    const getCategory = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setStatus(response.data.statuses);
        });
        setLoading(false);
    };

    useState(() => {
        getCategory()
    });

    return (
        <div style={{height: '100vh', width: '100%', backgroundColor: '#656D77'}}>
            <div className={"f-search"}>
                <Form
                    style={{width: '100%'}}
                >
                    <Form.Item
                        name={"search"}
                    >
                        <Input size={"large"} onChange={event => {
                            searchIdeas(event.target.value.trim()),
                                setSearchText(event.target.value.trim())
                        }} style={{
                            paddingLeft: 30,
                            height: 65,
                            borderRadius: 0,
                            borderTopLeftRadius: 32,
                            borderTopRightRadius: 32,
                            borderColor: '#FFFFFF',
                            fontSize: 24,
                            borderBottomWidth: 1,
                            borderBottomColor: '#E6E9ED'
                        }} placeholder={"Поиск..."}/>
                    </Form.Item>
                </Form>
                {
                    searchItems.length === 0
                        ? <div style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 21,
                            fontWeight: 500
                            }}
                        >Введите чтобы найти</div>
                        : <div className={"f-search-wrap"}>
                            {
                                searchItems.map(item => (
                                    <div className={"f-cards"}>
                                        <div>
                                            <p style={{marginLeft: 10}} className={"f-cards-hashtag"}>#{item.type}</p>
                                            <div className={"f-cards-card-wrap"}>
                                                <div className={"f-cards-inner"}>
                                                    <div className={"f-cards-avatar"}>
                                                        <div className={"f-cards-row-wrap"}>
                                                            <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                            <div className={"f-cards-wrap-text"}>
                                                                <span className={"f-cards-text"}>{item.username}</span>
                                                                <span className={"f-cards-text-bottom"}>{item.role}</span>
                                                            </div>
                                                        </div>
                                                        <p className={"f-cards-type"}>{item.status.translate}</p>
                                                    </div>
                                                    <div className={"f-cards-div-wrap-text"}>
                                                        <NavLink to={"/idea/" + item.id}>
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
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                }
            </div>
        </div>
    )
};

export default Search;