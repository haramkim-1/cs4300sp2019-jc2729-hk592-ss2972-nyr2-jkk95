import React, { Component } from 'react';
import InputRange from 'react-input-range';

import './Slider.css';
import 'react-input-range/lib/css/index.css';

// Tutorial: https://github.com/davidchin/react-input-range
function labelFormatter(value1) {
  if (value1 < 200) {
    return `$${value1}`
  } else {
    return `$${value1}+`
  }
}


function logStep(value) {
  return Math.log(value)
}


class Slider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value1: {
        min: 0,
        max: 200
      },
      value2: {
        min: 0,
        max: 2
      }
    };
  }
  // Slider for pricing.
  // Maps prices to 1000s and passes it to parent component.
  // Slider for size.
  // Maps size to approate label and passes it to parent component.



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

        <div>
        Min: {labelFormatter(this.state.value1.min)}
        </div>
        <div>
        Max: {labelFormatter(this.state.value1.max)}
        </div>
        <div>
        Min: {['Compact', 'Midsize', 'Large'][this.state.value2.min]}
        </div>
        <div>
        Max: {['Compact', 'Midsize', 'Large'][this.state.value2.max]}
        </div>
</div>
      <div className = "middle">

          <form className="slider price" >
            <InputRange
              name={"Price"}
              maxValue={200}
              minValue={0}
              allowSameValues={true}
              formatLabel={value1 => labelFormatter(value1)}
              value={this.state.value1}
              step={10}
              onChange={value1 => {
                this.setState({ value1 });
                var new_minprice = this.state.value1.min ;
                var new_maxprice = this.state.value1.max ;
                this.props.updateParentPrices(new_minprice * 1000, new_maxprice * 1000);

            }} />
          </form>

          <form className="slider size">
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
