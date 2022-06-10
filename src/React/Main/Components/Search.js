import {Modal} from "antd";
import React, {useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import {NavLink} from "react-router-dom";
import Highlighter from "react-highlight-words";
import {CloseOutlined} from "@ant-design/icons";

const Search = ({ visible, setVisible }) => {

    const [searchItems, setSearchItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statuses, setStatus] = useState([]);
    const [searchText, setSearchText] = useState("");

    const searchIdeas = (text) => {
        setLoading(true);

        let prevSearchItems = [];

        axios.post(ApiRoutes.API_SEARCH, {title: text, content: ""}).then(response => {
            if (response.data?.ideas && response.data.state === "success") {
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

    useState(() => {
        getCategory()
    });

    return (
        <Modal
            title={
                <form>
                    <input value={searchText} onChange={event => {
                        searchIdeas(event.target.value.trim()), setSearchText(event.target.value.trim())
                    }} className={"f-input-search"} placeholder={"Поиск..."}/>
                    {searchText &&
                    <a style={{color: '#AAB2BD'}} onClick={() => {
                        setSearchText(""), searchIdeas("")
                    }}>
                        <CloseOutlined/>
                    </a>
                    }
                </form>
            }
            centered
            closable={false}
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            width={"100vw"}
            style={{
                height: '100vh',
                padding: "1% 5% 4% 5%",
            }}
            footer={null}
            bodyStyle={{
                height: '90%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                scrollbarWidth: 'none',
                overflowY: 'scroll'
            }}
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
                            fontSize: 21,
                            fontWeight: 500
                        }}
                        >Введите чтобы найти</div>
                        :
                        <div className={"f-search-wrap"}>
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
                                                                <span
                                                                    className={"f-cards-text-bottom"}>{item.role}</span>
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
        </Modal>
    )
};

export default Search;