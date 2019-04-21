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
      size1: 'Compact',
      size2: 'Large',
      keywords: [''],
      minPrice: 2000,
      maxPrice: 1700000,
  	  results: [],
  	  baseUrl: window.location
    };
  }

  sendReq = () => {
    const self = this

    axios.get(this.state.baseUrl + 'search', {
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

  /** Returns sliders for filters, freeform input Form with suggested keywords, search button **/
  render() {
    var list_items = this.state.results.map((d) => <li style={{color:"black", listStyleType:"none"}} key={d}>{d} </li>);
    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />

        <Slider
          updateParentPrices={this.updatePrices}
          updateParentSizes={this.updateSizes}
        />
    		<Form updateParentKeywords={this.updateKeywords}/>
    		<Button type="button" key='search' onClick={() => {this.sendReq()}}> Search </Button>
        <div style={{background:"white", opacity:"0.6", width:"300px", margin: "auto", marginTop: "10px"}}>{list_items}</div>
      </div>

    );
  }
}

export default App;
