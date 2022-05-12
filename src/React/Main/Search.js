import React from "react";
import {Form, Input, Skeleton} from "antd";

const Search = () => {
    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: '#656D77' }}>
            <div className={"f-search"}>
                <Form
                    style={{ width: '100%' }}
                >
                    <Form.Item
                        name={"search"}
                    >
                        <Input size={"large"} style={{
                            width: '100%', paddingLeft: 30,
                            height: 65, borderRadius: 0, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderColor: '#FFFFFF',
                            fontSize: 24, borderBottomWidth: 1, borderBottomColor: '#E6E9ED'
                        }} placeholder={"Поиск..."}/>
                    </Form.Item>
                </Form>
                <Skeleton active style={{ width: '95%' }} paragraph={{ rows: 7 }}/>
            </div>
        </div>
    )
};

export default Search;