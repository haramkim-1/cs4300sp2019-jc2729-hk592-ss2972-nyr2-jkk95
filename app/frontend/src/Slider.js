import React, { Component } from 'react';
import InputRange from 'react-input-range';
import './Slider.css';
import 'react-input-range/lib/css/index.css'

/** Tutorial: https://github.com/davidchin/react-input-range **/

/** TODO Naaly: add labels (deal with padding), save input, additional inputs **/
class Slider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value1: 1,
      value2: {
        min: 2,
        max: 1700
      },
      value3: 1
    };
  }
  render() {
    return (
      <div className = "middle">
      <form className="slider">
          <InputRange
            name={"Price"}
            maxValue={1700}
            minValue={2}
            formatLabel={value2 => `$ ${value2}k`}
            value={this.state.value2}
            onChange={value2 => this.setState({ value2 })} />
        </form>
            <form className="slider">
              <InputRange
               name={"Size"}
                maxValue={2}
                minValue={0}
                formatLabel={value3 => {
                  var x = `${value3}`;
                  var temp = ['compact','mid-size','large'][x];
                  return ` ${temp}` }}
                value={this.state.value3}
                onChange={value3 => this.setState({ value3 })} />
        </form>
        </div>

      );
    }
}

export default Slider;
