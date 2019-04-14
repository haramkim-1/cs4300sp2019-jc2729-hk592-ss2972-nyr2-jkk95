import React, { Component } from 'react';
import Form from './Form';
import logo from './logo.gif';
import './App.css';
import Slider from './Slider';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

class App extends Component {
  constructor() {
    super();

    this.state = {
      size1: 'compact', // TODO replace w nataly's code
      size2: 'large', // TODO replace w nataly's code
      keywords: [''],
      minPrice: 2000, // TODO replace
      maxPrice: 1700000, // TODO replace
      results: []
    };

  }
  sendReq = () => {
      const self = this
    console.log('req sent')
    console.log(this.state.size1)
    console.log(this.state.size2)
    console.log(this.state.keywords)
    console.log(this.state.minPrice)
    console.log(this.state.maxPrice)

  axios.get('http://localhost:5000/search', {
    params: {
      size1: this.state.size1,
      size2: this.state.size2,
      keywords: JSON.stringify(this.state.keywords),
      minPrice: this.state.minPrice,
      maxPrice: this.state.maxPrice
    }})
  .then(function (response) {
      self.setState({results:response.data})
    })

    // axios.get('http://localhost:5000/dummysearch')
    // .then(function (response) {
    //   console.log(response.data);
    //   self.setState({results:response.data})
    // })
};

  updateKeywords = (new_keywords) => {
    this.setState({keywords:new_keywords})
  }
  updatePrices = (new_minprice,new_maxprice) => {
    this.setState({minPrice:new_minprice});
    this.setState({maxPrice:new_maxprice});
  }
  updateSizes = (new_size1,new_size2) => {
    this.setState({size1:new_size1});
    this.setState({size2:new_size2});
  }

  render() {
    return (

      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />

        <Slider
          updateParentPrices={this.updatePrices}
          updateParentSizes={this.updateSizes}
        />
    		<Form updateParentKeywords={this.updateKeywords}/>
    		<Button type="button" key='search' onClick={() => {this.sendReq()}}> Search </Button>
        <div>{this.state.results}</div>
      </div>

    );
  }
}

export default App;
