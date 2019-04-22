import React, { Component } from 'react';
import Form from './Form';
import logo from './logo.gif';

import './App.css';
import Slider from './Slider';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root')

class App extends Component {
  constructor() {
    super();

    this.state = {
      size1: 'Compact', // TODO replace w nataly's code
      size2: 'Large', // TODO replace w nataly's code
      keywords: [''],
      minPrice: 2000, // TODO replace
      maxPrice: 1700000, // TODO replace
      results: [],
      selectedCar: null,
      modalOpen: false,
      //baseUrl: window.location // use for deployment mode
      baseUrl: "http://localhost:5000/" // use for local development mode
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

  displayDetails = function(event, ymm) {
    // get car details
    axios.get(this.state.baseUrl + 'cardetails', {
        params: { carYMM: ymm }})
      .then(function (response) {
        console.log(response.data);
        this.setState({selectedCar:JSON.parse(response.data), modalOpen:true});
      }.bind(this))
  }.bind(this)

  closeModal = function() {
    this.setState({modalOpen: false});
  }.bind(this)

  afterOpenModal = function() {
    // TODO: setup ?
  }.bind(this)

  render() {
    var listItems = this.state.results.map((ymm) => 
        <li style={{color:"black", listStyleType:"none"}} key={ymm}> 
            <Button style={{opacity:"1.0", margin: "auto", margin: "3px"}} type="button" onClick={(evt) => this.displayDetails(evt, ymm)}> {ymm} </Button>
        </li>
	);
	
	// TODO: more content here
	// TODO: highlight keywords from query
	var modalReviewItems = this.state.selectedCar && this.state.selectedCar.reviews ? (this.state.selectedCar.reviews.map((review) => 
        <li style={{color:"black", listStyleType:"none"}} key={review.Review_Date + " " + review.Author_Name}> 
		
            {review.Review_Title}
        </li>
	)) : null; 
	
    return (

      <div className="App">

        <img src={logo} className="App-logo" alt="logo" />

        <Slider
          updateParentPrices={this.updatePrices}
          updateParentSizes={this.updateSizes}
        />
            <Form updateParentKeywords={this.updateKeywords}/>
            <Button type="button" key='search' onClick={() => {this.sendReq()}}> Search </Button>
        <div style={{backgroundColor:"rgb(255,255,255, 0.6)", width:"300px", margin: "auto", marginTop: "10px"}}>{listItems}</div>

        <Modal
          isOpen={this.state.modalOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Details Modal"
        >
          <h2 ref={subtitle => this.subtitle = subtitle}> {this.state.selectedCar ? this.state.selectedCar.Year_Make_Model : ""} </h2>
          <button onClick={this.closeModal}>close</button>
          <div style={{overflow:"scroll", strokeColor:"black", strokeWidth:"1", width:"500px", margin: "auto", marginTop: "10px"}}>{modalReviewItems}</div>
        </Modal>
      </div>
    );
  }
}

export default App;
