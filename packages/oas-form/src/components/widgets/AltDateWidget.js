import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { shouldRender, parseDateString, toDateString, pad } from '../../utils';

function rangeOptions(start, stop) {
  const options = [];
  for (let i = start; i <= stop; i++) {
    options.push({ value: i, label: pad(i, 2) });
  }
  return options;
}

function readyForChange(state) {
  return Object.keys(state).every(key => state[key] !== -1);
}

function DateElement(props) {
  const { type, range, value, select, rootId, disabled, readonly, autofocus, registry, onBlur } = props;
  const id = `${rootId}_${type}`;
  const { SelectWidget } = registry.widgets;
  return (
    <SelectWidget
      autofocus={autofocus}
      className="form-control"
      disabled={disabled}
      id={id}
      onBlur={onBlur}
      onChange={value => select(type, value)}
      options={{ enumOptions: rangeOptions(range[0], range[1]) }}
      placeholder={type}
      readonly={readonly}
      schema={{ type: 'integer' }}
      value={value}
    />
  );
}

class AltDateWidget extends Component {
  static defaultProps = {
    autofocus: false,
    disabled: false,
    options: {
      yearsRange: [1900, new Date().getFullYear() + 2],
    },
    readonly: false,
    time: false,
  };

  constructor(props) {
    super(props);
    this.state = parseDateString(props.value, props.time);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(parseDateString(nextProps.value, nextProps.time));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  onChange = (property, value) => {
    this.setState({ [property]: typeof value === 'undefined' ? -1 : value }, () => {
      // Only propagate to parent state if we have a complete date{time}
      if (readyForChange(this.state)) {
        this.props.onChange(toDateString(this.state, this.props.time));
      }
    });
  };

  setNow = event => {
    event.preventDefault();
    const { time, disabled, readonly, onChange } = this.props;
    if (disabled || readonly) {
      return;
    }
    const nowDateObj = parseDateString(new Date().toJSON(), time);
    this.setState(nowDateObj, () => onChange(toDateString(this.state, time)));
  };

  clear = event => {
    event.preventDefault();
    const { time, disabled, readonly, onChange } = this.props;
    if (disabled || readonly) {
      return;
    }
    this.setState(parseDateString('', time), () => onChange(undefined));
  };

  get dateElementProps() {
    const { time, options } = this.props;
    const { year, month, day, hour, minute, second } = this.state;
    const data = [
      {
        type: 'year',
        range: options.yearsRange,
        value: year,
      },
      { type: 'month', range: [1, 12], value: month },
      { type: 'day', range: [1, 31], value: day },
    ];
    if (time) {
      data.push(
        { type: 'hour', range: [0, 23], value: hour },
        { type: 'minute', range: [0, 59], value: minute },
        { type: 'second', range: [0, 59], value: second }
      );
    }
    return data;
  }

  render() {
    const { id, disabled, readonly, autofocus, registry, onBlur, options } = this.props;
    return (
      <ul className="list-inline">
        {this.dateElementProps.map((elemProps, i) => (
          <li key={i}>
            <DateElement
              rootId={id}
              select={this.onChange}
              {...elemProps}
              autofocus={autofocus && i === 0}
              disabled={disabled}
              onBlur={onBlur}
              readonly={readonly}
              registry={registry}
            />
          </li>
        ))}
        {(options.hideNowButton !== 'undefined' ? !options.hideNowButton : true) && (
          <li>
            <a className="btn btn-info btn-now" href="#" onClick={this.setNow}>
              Now
            </a>
          </li>
        )}
        {(options.hideClearButton !== 'undefined' ? !options.hideClearButton : true) && (
          <li>
            <a className="btn btn-warning btn-clear" href="#" onClick={this.clear}>
              Clear
            </a>
          </li>
        )}
      </ul>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  AltDateWidget.propTypes = {
    autofocus: PropTypes.bool,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    options: PropTypes.object,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    schema: PropTypes.object.isRequired,
    time: PropTypes.bool,
    value: PropTypes.string,
  };
}

export default AltDateWidget;
