import React from 'react';
import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js'
import { Input } from 'antd';

export default class InputTopTitle extends React.Component {
    constructor(props) {
        super(props);
        let {inputProps} = props;

        this.state = {
            showTitle: !!inputProps?.value,
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
        let {inputProps, title,
            updateInput = (value) => {},
            setPhone = (object) => {},
            setValidate = (bool) => {},
        } = this.props;

        return <>
            {title && this.state.showTitle && <div className={'u_input_top_title__label'}>{title}</div>}
            <Input
                {...inputProps}
                size={this.state.size}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                autoComplete="off"
                onChange={(event) => {
                    let text = event.target.value;

                    if (inputProps.name === 'phone') {
                        for(let i = 1; i < text.length; i++){
                            let letter = text[i]
                            if (!Number.isInteger(Number(letter)) && letter !== " "){
                                return
                            }
                        }

                        if (text.indexOf('+') !== 0) {
                            text = '+' + text;
                        }

                        let parsePhone = parsePhoneNumber(text, 'RU');
                        setPhone(parsePhone)

                        try {
                            text = parsePhone.formatInternational();
                        } catch (e) {}

                        if (isValidPhoneNumber(text, 'RU')) {
                            setValidate(true)
                        } else if (text.length > 1) {
                            setValidate(false)
                        } else {
                            setValidate(true)
                        }
                    }

                    updateInput(text)
                }}
            />
        </>
    }
}
