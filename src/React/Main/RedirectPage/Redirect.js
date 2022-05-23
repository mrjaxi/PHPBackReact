import React, {useEffect} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const Redirect = (props) => {

    const decodeUserData = () => {
        const query = new URLSearchParams(props.location.search);

        if (query.get("url") && query.get("user")){
            axios.post(ApiRoutes.API_DECODE_USER_DATA, {user: query.get("user")}).then(response => {
                if (response.data.state === "success") {
                    axios.post(ApiRoutes.API_LOGIN, {username: response.data?.user.username, password: response.data?.user.password, remember: true}, {withCredentials: true}).then(login => {
                        if (login.data.state === "success"){
                            global.user = login.data.profile;
                        }
                        global._history.push(query.get("url"))
                    })
                }
            })
        }
    };

    useEffect(() => {
        decodeUserData()
    }, []);

    return (
        <></>
    )
};

export default Redirect;