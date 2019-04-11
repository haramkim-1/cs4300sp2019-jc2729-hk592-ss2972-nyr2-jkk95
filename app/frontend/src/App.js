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
      size1: '1', // TODO replace w nataly's code
      size2: '2', // TODO replace w nataly's code
      keywords: [''],
      minPrice: 0, // TODO replace
      maxPrice: 0, // TODO replace
      results: []
    };

  }
  sendReq = () => {
    // axios.get('/search', {
    // params: {
    //   size1: this.state.size1,
    //   size2: this.state.size2,
    //   keywords: this.state.keywords,
    //   minPrice: this.state.minPrice,
    //   maxPrice: this.state.maxPrice
    // }})
    // .then(function (response) {
    //   console.log(response.data);
    // })
    const self = this
    axios.get('http://localhost:5000/dummysearch')
    .then(function (response) {
      console.log(response.data);
      self.setState({results:response.data})
    })
  };

  updateKeywords = (new_keywords) => {
    this.setState({keywords:new_keywords})
  }
  render() {
    return (

      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        
        <Slider/>
    		<Form updateParentKeywords={this.updateKeywords}/>
    		<Button type="button" key='search' onClick={() => {this.sendReq()}}> Search </Button>
        <div>{this.state.results}</div>
      </div>

    );
  }
}

export default App;
