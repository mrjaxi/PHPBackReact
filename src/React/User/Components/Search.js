import React from 'react';
import {Layout, Card, Row, Col, Typography, Progress, Tag, Input} from 'antd';
import Icon from '@ant-design/icons';
import DeleteSearchIcon from '../../../../public/i/user/delete-search.svg'

import {
    NavLink
} from "react-router-dom";

const { Title, Text } = Typography;
const defaultProps = {
    onSend: () => {},
    result: [],
    value: ''
}


export default class Search extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: props.color ? props.color : 'white',
            value: props.value ? props.value : '',
            isFocus: false,
            emptyResult: false
        }
    }

    onFocus = () => {

        if(event.target.value !== ''){
            this.setState({
                isFocus: true
            })
        }


    }

    onBlur = (event) => {
        console.log(event);

        // setTimeout(() => this.setState({
        //     isFocus: false
        // }), 200)
    }

    onClick = (event) => {
        event.stopPropagation();
    }

    onChange = () => {
        let value = event.target.value;

        this.setState({
            value,
            isFocus: (this.props.result && this.props.result.length > 0)
        }, () =>
            this.props.onSend(value))
    }

    renderItem = ({item, i, type = 'def'}) => {
        let links = [];

        item.links.map((link, l)=>{
            links.push(<NavLink key={l + 'links'} to={ link.url }>{ link.text }</NavLink>)
        })

        return <div className={'u_search__result__' + (type === 'tags' ? 'tags' : 'item')} key={i + 'search_bi'}>
            <div className={(type === 'tags' ? '' : 'u_search__breadcrumbs')}>{ links }</div>
            <div dangerouslySetInnerHTML={{ __html: item.body }} />
        </div>
    }

    renderEmpty = () => {
        return <Row style={{ padding: '0 22px' }}><Col><Text>По вашему запросу ничего не найдено</Text></Col></Row>
    }

    build = (result) => {
        let items = [];
        let { value } = this.state;

        if(value === ''){
            return null;
        }

        result.map((block, i)=>{
            items.push(
                <div key={i + 'search_b'}>
                    <div className={'u_search__result__title'}>
                        <Text>{ block.title }</Text>
                    </div>
                    {
                        block.items.map((item, i)=>this.renderItem({item, i, type: block.type}))
                        // block.items.map((item, j)=>(
                        //     <div className={'u_search__result__item'} key={j + 'search_bi'}>
                        //         <div className={'u_search__breadcrumbs'}>{
                        //             item.links.map((link, l)=>(
                        //                 <NavLink to="/">{ link.text }</NavLink>
                        //             ))
                        //         }</div>
                        //         <div dangerouslySetInnerHTML={{ __html: item.body }} />
                        //     </div>
                        // ))
                    }
                </div>
            )
        })

        return items;

    }

    componentDidUpdate(prevProps, prevState) {
        if(JSON.stringify(prevProps.result) !== JSON.stringify(this.props.result)){
            if(this.props.result.length === 0 || (this.state.value.trim() !== '' && this.props.result.length === 0)){
                this.setState({
                    emptyResult: true
                })
            }else{
                this.setState({
                    emptyResult: false
                })
            }
        }
    }

    componentDidMount() {
        addEventListener('click', (e) => this.setState({ isFocus: false }));
    }
    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state,callback)=>{
            return;
        };
    }
    render() {
        let { isFocus, value, emptyResult } = this.state;
        let { items, onSearch, result } = {...defaultProps, ...this.props};

        return (
            <div className={'u_search' + (isFocus ? ' show' : '') } onClick={ this.onClick }>
                <div className={'u_search__inp_wrap'}>
                    <Input size="large" placeholder="Поиск" onFocus={ this.onFocus } onBlur={ this.onBlur } className={'u_search__inp ' + this.state.color} onChange={ this.onChange } value={ value } />
                    <Icon component={ DeleteSearchIcon } className={'u_search__delete'} onClick={ () => this.setState({ value: '' }) } />
                </div>

                <div className={'u_search__result'}>
                    { emptyResult && this.renderEmpty() }
                    { this.build(result) }
                </div>
            </div>
        );
    }
}
