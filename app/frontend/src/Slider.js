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
      value1: {
        min: 2,
        max: 1700
      },
      value2: {
        min: 0,
        max: 2
      }
    };
  }
  render() {
    return (
      <div>
      <div className = "labels">
      Price
      </div>
      <div className = "labels">
      Size
      </div>
      <div className = "middle">
      /** Slider for pricing.**/
        <form className="slider">
          <InputRange
            name={"Price"}
            maxValue={1700}
            minValue={2}
            allowSameValues={true}
            formatLabel={value1 => `$ ${value1}k`}
            value={this.state.value1}
            /** Maps prices to 1000s and passes it to parent component. **/
            onChange={value1 => {
              this.setState({ value1 });
              var new_minprice = this.state.value1.min ;
              var new_maxprice = this.state.value1.max ;
              this.props.updateParentPrices(new_minprice * 1000, new_maxprice * 1000);

          }} />
        </form>
        /** Slider for size.**/
        <form className="slider">
          <InputRange
            name={"Size"}
            maxValue={2}
            minValue={0}
            allowSameValues={true}
            formatLabel={value2 => {
              var x = `${value2}`;
              var temp = ['Compact', 'Midsize', 'Large'][x];
              return ` ${temp}` }}
              value={this.state.value2}
              /** Maps size to approate label and passes it to parent component.**/
              onChange={value2 => {
                this.setState({ value2 });
                var new_size1 = ['Compact', 'Midsize', 'Large'][this.state.value2.min];
                var new_size2 = ['Compact', 'Midsize', 'Large'][this.state.value2.max];
                this.props.updateParentSizes(new_size1,new_size2);
            }} />
        </form>
        </div>
        </div>
      );
    }
}

export default Slider;
