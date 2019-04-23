import React, { Component } from 'react';
import Form from './Form';
import logo from './logo.gif';

import './App.css';
import Slider from './Slider';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const modalStyles = {content: {
	// top: '50%',
	// left: '50%',
	// width: '50%',
	// height: '50%',
    // right: 'auto',
	// bottom: 'auto',
	// marginRight: '-50%',
    // transform: 'translate(-50%, -50%)',
	overflowY:"visible"
}};

class App extends Component {
  constructor() {
    super();

    this.state = {
      size1: 'Compact',
      size2: 'Large',
      keywords: [''],
      minPrice: 2000, // TODO replace
      maxPrice: 2700000, // TODO replace
      fuel1: 'Gas-Guzzler',
      fuel2: 'Electric',
      results: [],
      selectedCar: null,
      modalOpen: false,
      //baseUrl: window.location // use for deployment mode
      baseUrl: "http://localhost:5000/" // use for local development mode
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
		maxPrice: this.state.maxPrice,
		//TODO: get values from state
		fuel1: this.state.fuel1,
		fuel2: this.state.fuel2
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
  updateFuel = (new_fuel1, new_fuel2) => {
    this.setState({fuel1:new_fuel1});
    this.setState({fuel2:new_fuel2});
  }

  displayDetails = function(event, ymm) {
    // get car details
    axios.get(this.state.baseUrl + 'cardetails', {
        params: { carYMM: ymm }})
      .then(function (response) {
		console.log(response.data);
        this.setState({selectedCar:response.data, modalOpen:true});
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
            <Button style={{opacity:"1.0", margin: "3px"}} type="button" onClick={(evt) => this.displayDetails(evt, ymm)}> {ymm} </Button>
        </li>
	);

	// TODO: more content here
	// TODO: highlight keywords from query
	var modalReviewItems = this.state.selectedCar && this.state.selectedCar.reviews ? (this.state.selectedCar.reviews.map((review) =>
        <li style={{backgroundColor:"lightgrey", listStyleType:"none", margin:"4px", marginLeft:"6px", marginRight:"4px"}} key={review.Review_Date + " " + review.Author_Name}>
			<h4 style={{"margin":"4px"}}> {"\"" + review.Review_Title + "\""} </h4>
			<p style={{"fontSize":"14px", "margin":"4px"}}> {"by: " + review.Author_Name} </p>
			<p style={{"fontSize":"11px", "margin":"4px"}}>> {review.Review} </p>
        </li>
	)) : null;

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />

        <Slider
          updateParentPrices={this.updatePrices}
          updateParentSizes={this.updateSizes}
          updateParentFuel={this.updateFuel}
        />
            <Form updateParentKeywords={this.updateKeywords}/>
            <Button id="circle" type="button" key='search' onClick={() => {this.sendReq()}}> GO </Button>
        <div style={{width:"300px", margin: "auto", marginTop: "10px", marginBottom: "30px"} }>{listItems}</div>

        <Modal
          isOpen={this.state.modalOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
		  contentLabel="Details Modal"
		  style={modalStyles}
        >
			<h2 ref={subtitle => this.subtitle = subtitle}> {this.state.selectedCar ? this.state.selectedCar.Year_Make_Model:""} </h2>
			<button onClick={this.closeModal}>close</button>

			<div>
				<p>{this.state.selectedCar ? this.state.selectedCar["Engine Fuel Type"]:""}</p>
				<p>{this.state.selectedCar ? this.state.selectedCar["Driven_Wheels"]:""}</p>
				<p>{this.state.selectedCar ? this.state.selectedCar["MSRP"]:""}</p>
				<p>{this.state.selectedCar ? this.state.selectedCar["Transmission Type"]:""}</p>
				<p>{this.state.selectedCar ? this.state.selectedCar["Vehicle Style"]:""}</p>
				<p>{this.state.selectedCar ? this.state.selectedCar["Vehicle Size"]:""}</p>
				<p>{this.state.selectedCar ? this.state.selectedCar["city mpg"]:""}</p>
				<p>{this.state.selectedCar ? this.state.selectedCar["highway MPG"]:""}</p>
			</div>
			<div style={{overflow:"scroll", outline:"1px solid black", width:"500px", marginTop: "10px", height:"80%"}}>
				<center><h3>Reviews</h3></center>
				{modalReviewItems}
			</div>
			<div>

			</div>
        </Modal>
      </div>
    );
  }
}

export default App;
