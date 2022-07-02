import React, {useEffect} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const Redirect = (props) => {

    const decodeUserData = () => {
        const query = new URLSearchParams(props.location.search);

        if (query.get("url") && query.get("user")){
            axios.post(ApiRoutes.API_DECODE_USER_DATA, {user: query.get("user")}).then(response => {
                global.handleResponse(response,
                    function () {
                        axios.post(ApiRoutes.API_LOGIN, global.serialize({
                                username: response.data?.user.username,
                                password: response.data?.user.password,
                                remember: true
                            }), {withCredentials: true})
                            .then(login => {
                                global.getProfile();
                                global._history.push(query.get("url"))
                            })
                    },
                )
            })
        }
    };

    useEffect(() => {
        decodeUserData()
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: '100vh', width: '100%' }}>
            <span style={{ fontSize: 24 }}>Выполняем вход...</span>
        </div>
    )
};

export default Redirect;