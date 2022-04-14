import React from 'react';
import InputMask from 'react-input-mask';

import {Row, Col, Input, Form} from 'antd';

export default class InputTopTitle extends React.Component {
    constructor(props) {
        super();

        this.state = {
            showTitle: (props.inputProps.value === '')
        }
    }

    onFocus = () => {
        this.setState({showTitle: true})
    }

    onBlur = (event) => {
        let target = event.target;

        if (target.value === '') {
            this.setState({showTitle: false})
        }
    }

    render() {
        let {inputProps, title} = this.props;
        let {showTitle} = this.state;

        return <div className={'u_input_top_title'}>
            {title && showTitle && <div className={'u_input_top_title__label'}>{title}</div>}
            {
                inputProps.name === 'phone' ?
                    <InputMask
                        {...inputProps}
                        value={global.ProfileEdit.state.values[inputProps.name]}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        autoComplete="off"
                        onChange={(event)=>{global.ProfileEdit.updateProfileInput(inputProps.name, event.target.value)}}
                        className={'ant-input'}
                        mask="+7 (999) 999-99-99"
                    />
                    :
                    <Input {...inputProps}
                           value={global.ProfileEdit.state.values[inputProps.name]}
                           onFocus={this.onFocus}
                           onBlur={this.onBlur}
                           autoComplete="off"
                           onChange={(event)=>{global.ProfileEdit.updateProfileInput(inputProps.name, event.target.value)}}/>
            }
        </div>
    }
}
