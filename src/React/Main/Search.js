import React from "react";
import {Form, Input, Select, Skeleton} from "antd";
import axios from "axios";

const Search = () => {

    const searchIdeas = (text) => {
        axios.post(global.baseURL + "/ideas/api/search/", {title: 'Неза', content: ''}).then(response => {
            console.log(response.data)
        })
    };

    return (
        <div style={{ width: '100%', backgroundColor: '#656D77' }}>
            <div className={"f-search"}>
                <Form
                    style={{ width: '100%', height: '100%' }}
                >
                    <Form.Item
                        name={"search"}
                    >
                        <Input size={"large"} onChange={event => searchIdeas(event.target.value)} style={{
                            width: '100%', paddingLeft: 30,
                            height: 65, borderRadius: 0, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderColor: '#FFFFFF',
                            fontSize: 24, borderBottomWidth: 1, borderBottomColor: '#E6E9ED'
                        }} placeholder={"Поиск..."}/>
                    </Form.Item>
                </Form>
                {/*<Skeleton active style={{ width: '95%' }} paragraph={{ rows: 7 }}/>*/}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {
                        [1, 2, 3, 4, 5, 6].map(a => (
                            <div className={"f-cards"}>
                                <div>
                                    <p style={{ marginLeft: 10 }} className={"f-cards-hashtag"}>#{"item.type"}</p>
                                    <div className={"f-cards-card-wrap"}>
                                        <div className={"f-cards-inner"}>
                                            <div className={"f-cards-avatar"}>
                                                <div className={"f-cards-row-wrap"}>
                                                    <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                    <div className={"f-cards-wrap-text"}>
                                                <span className={"f-cards-text"}>{ "Пользователь" }
                                                </span>
                                                        <span className={"f-cards-text-bottom"}>{ "Роль" }</span>
                                                    </div>
                                                </div>
                                                {
                                                    // global.layout === "admin" ?
                                                    //     <Select onSelect={(id) => changeStatus(item.id, id, item.status.name)} defaultValue={ item.status.id } style={{ width: 130 }}>
                                                    //         {
                                                    //             statuses.map(status => (
                                                    //                 <Option value={status.id}>{status.translate}</Option>
                                                    //             ))
                                                    //         }
                                                    //     </Select> :
                                                    <p className={"f-cards-type"}>{ "item.status.name" }</p>
                                                }
                                            </div>
                                            <div className={"f-cards-div-wrap-text"}>
                                        <span className={"f-cards-content-text"}>
                                            { "item.title" }
                                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
};

export default Search;