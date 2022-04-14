import React from 'react';
import {
    Typography,
    Button
} from 'antd';
import {Link, NavLink} from "react-router-dom";
import Moment from "moment";
import {FormOutlined} from "@ant-design/icons";

const {Title} = Typography;
const axios = require('axios');

export default class UserBalance extends React.Component {

    constructor(props) {
        global.app.setState({pageTitle:'Баланс лицевого счёта', viewHeader: true});
        super(props);
        this.state = {
            wait: false,
            selectedRowKeys: [],
            items: [
                {
                    date: '22 февраля, 2021',
                    sum:'-200,00',
                    title: 'Оплата за 2 новых пользователя (Тариф «Тестирование») для ООО «Цвети»'
                },
                {
                    date: '23 декабря, 2020',
                    sum:'+5000,00',
                    title: 'Оплата за 2 новых пользователя (Тариф «Тестирование») для ООО «Цвети»'
                }
            ]
        }
    }

    componentDidMount() {

    }

    render() {

        return (
            <>
                <div style={{
                    margin: '30px'
                }}>

                    <div className={'user_balance__info'}>
                        <div className={'user_balance__info__label'}>Остаток средств:</div>
                        <div className={'user_balance__info__sum'}><b>5000</b>,00 ₽</div>
                        <Button type="primary" shape="round" size="large">Запросить счет на оплату</Button>
                        <div className={'user_balance__info__price'}>
                            20 пользователей за 100 ₽ <span>/ пользователь</span>
                        </div>
                    </div>
                    <b className={'user_balance__table_name'}>История операций</b>
                    <div className={'c_table user_balance__table'}>
                        {
                            this.state.items.map((cell, i)=>(
                                <div className={'c_table__row'} key={i + 'rows'}>
                                    <div className={'c_table__cell nw w1'}>{cell.date}</div>
                                    <div className={'c_table__cell nw w1 balance_cell' + (cell.sum.indexOf('+') !== -1 ? ' plus' : '')}>{ cell.sum + ' ₽' }</div>
                                    <div className={'c_table__cell'}>{ cell.title }</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </>
        );

    }
}
