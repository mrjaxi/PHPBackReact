import React, {useEffect, useState} from "react";
import {Col, Result} from "antd";
import {Link} from "react-router-dom";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const Unsubscribe = () => {

	const [resp, setResp] = useState(null);

	const unsubscribeData = () => {
		axios.post(ApiRoutes.API_UNSUBSCRIBE_USER, {type: "unsubscribe"}).then(response => {
			console.log(response.data)
			if (response.data.state === "success") {
				setResp(true);
			} else {
				setResp(false);
			}
		})
	};

	useEffect(() => {
		unsubscribeData()
	});

	if (resp === null) {
		return <></>
	}

	return (
		<Col className={"f-main"} style={{minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
			<div style={{ backgroundColor: 'white', borderRadius: 36, minWidth: '50%', paddingTop: 30, paddingBottom: 30 }}>
				<Result
					status={resp ? "success" : "error"}
					title={resp ? "Вы успешно отписались от рассылки!" : "Ошибка отписки от рассылки!"}
					subTitle={resp ? 'Для того, чтобы снова подписаться на рассылку зайдите в профиль и нажмите "Подписаться на рассылку"' : "Вы не авторизованы в системе"}
					extra={[
						<Link to={global.lang + "/"} type="primary">
							На главную
						</Link>
					]}
				/>
			</div>
		</Col>
	)
};

export default Unsubscribe;