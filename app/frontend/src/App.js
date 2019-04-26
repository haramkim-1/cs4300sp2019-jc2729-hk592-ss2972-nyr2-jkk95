import React, { Component } from 'react';
import Form from './Form';
import logo from './logo.gif';
import stoplight from './stoplight.png';
import './App.css';
import Slider from './Slider';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Modal from 'react-modal';
import Highlighter from "react-highlight-words";
import StarRatings from 'react-star-ratings';
import Tooltip from "react-simple-tooltip"


Modal.setAppElement('#root');

const carSVGPath = `M175 240 c-51 -41 -66 -49 -122 -70 -28 -10 -33 -18 -33 -44 0 -18
	-5 -37 -11 -43 -17 -17 -1 -33 33 -33 18 0 42 -10 60 -25 37 -31 43 -31 74 0
	21 21 35 25 80 25 45 0 59 -4 73 -21 22 -28 69 -28 90 -1 9 11 27 22 41 24 24
	3 25 6 25 72 l0 70 -63 43 c-59 40 -68 43 -130 43 -63 0 -70 -2 -117 -40z
	m105 -20 l0 -40 -70 0 c-38 0 -70 2 -70 5 0 13 96 75 116 75 21 0 24 -5 24
	-40z m110 18 c52 -35 49 -48 -9 -49 -28 -1 -57 -2 -63 -3 -8 -1 -14 14 -16 37
	-3 35 -2 37 26 37 16 0 44 -10 62 -22z m-227 -172 c7 -19 -18 -40 -38 -32 -15
	6 -20 28 -8 39 12 12 41 7 46 -7z m232 -11 c0 -30 -39 -27 -43 3 -3 20 0 23
	20 20 15 -2 23 -10 23 -23z`

const modalStyles = {content: {
	top: '50%',
	left: '50%',
	width: '80%',
	height: '85%',
    // right: 'auto',
	// bottom: 'auto',
	// marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
	overflow:"hidden"
}};

class App extends Component {
  constructor() {
    super();

    this.state = {
      size1: 'Compact',
      size2: 'Large',
      keywords: [],
      minPrice: 2000, // TODO replace
      maxPrice: 2700000, // TODO replace
      fuel1: 'Gas-Guzzler',
      fuel2: 'Electric',
      results: [],
      selectedCar: null,
      modalOpen: false,
      expandedQuery: [],
      queryRegex: null,
      queryColorMapping: [],
    //   baseUrl: window.location // use for deployment mode
      baseUrl: "http://localhost:5000/" // use for local development mode
	};
	
	console.log("baseUrl (app.js): " + this.state.baseUrl);
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
        fuel1: this.state.fuel1,
        fuel2: this.state.fuel2
      }}).then(function (response) {
        console.log(response.data.query);
    
        // generate mapping for highlighting
        let words = [];
        let mapping = {};

        response.data.query.forEach(element => {
          words.push("\\b" + element.word + "\\b");
          if(element.priority === 1)
            mapping[element.word] = "word priority one";
          else if (element.priority === 2)
            mapping[element.word] = "word priority two";
          else if (element.priority === 3)
            mapping[element.word] = "word priority three";
		});
		
		// create regex
		let regex = new RegExp(words.join("|"));
		console.log(regex);

        // set all state components at once
        self.setState({results:response.data.results, expandedQuery:response.data.query, queryRegex: regex, queryColorMapping: mapping})
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

  generateStarRatings = function(review) {
	let rating = Number(review.Rating);
	if(!isNaN(rating)) {
		return (<StarRatings
				rating={rating}
				name={review.Review_Date + " " + review.Author_Name}
				starRatedColor="red"
				starEmptyColor="black"
				starDimension="15px"
				// svgIconPath={carSVGPath}
			/>);
	} else {
		return (null);
	}
  }

  render() {
    var listItems = this.state.results.map((ymm) =>
        <li style={{color:"black", listStyleType:"none"}} key={ymm}>
            <Button style={{opacity:"1.0", margin: "3px"}} type="button" onClick={(evt) => this.displayDetails(evt, ymm)}> {ymm} </Button>
        </li>
	);

	// display reviews
	// TODO: handle cases where the rating is N/A
	var modalReviewItems = this.state.selectedCar && this.state.selectedCar.reviews ? (this.state.selectedCar.reviews.map((review) =>
      <li style={{backgroundColor:"lightgrey", listStyleType:"none", margin:"4px", marginLeft:"6px", marginRight:"4px"}} 
          key={review.Review_Date + " " + review.Author_Name}>
        <h4 style={{"margin":"4px"}}> {"\"" + review.Review_Title + "\""} </h4>
        <p style={{"fontSize":"14px", "margin":"4px"}}> {"by: " + review.Author_Name} </p>

		{this.generateStarRatings(review)}

        <p style={{"fontSize":"11px", "margin":"4px"}}>
          <Highlighter
            searchWords={[this.state.queryRegex]}
            textToHighlight={review.Review}
            highlightClassName={this.state.queryColorMapping}
          />
        </p>
      </li>
	)) : null;

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <br/>
        <div style={{display:"inline-block"}}>
        <img src={stoplight} className="stoplight" alt="stoplight"/>
        <div style={{marginTop:"-150px"}}>
        <Slider
          updateParentPrices={this.updatePrices}
          updateParentSizes={this.updateSizes}
          updateParentFuel={this.updateFuel}
        />
            <Form updateParentKeywords={this.updateKeywords}/>
            <Button id="circle" type="button" key='search' onClick={() => {this.sendReq()}}> GO </Button>
        <div style={{width:"300px", margin: "auto", marginTop: "10px", marginBottom: "30px"} }>{listItems}</div>
        </div>
        </div>

        <Modal
          isOpen={this.state.modalOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
		  contentLabel="Details Modal"
		  style={modalStyles}
        >
			<div>
				<h2 ref={subtitle => this.subtitle = subtitle}> {this.state.selectedCar ? this.state.selectedCar.Year_Make_Model:""} </h2>
				<button onClick={this.closeModal}>close</button>
			</div>
			
			<center style={{verticalAlign:"middle", whiteSpace:"nowrap", height:"95%", width:"100%", margin:"auto"}}>
				<div style={{display:"inline-block", whiteSpace:"normal", verticalAlign:"middle", outline:"1px solid black", 
						width:"35%", marginTop: "10px", transform: "translate(-4%, 0)"}}>
					<center><h3>Vehicle Details</h3></center>
          	
			<div style={{paddingBottom:"0px"}}>
				<Tooltip content="I AM TOOLTIP">
					<p style={{margin:"1px", borderBottom: "0.05em dotted" }}>
          				Engine Fuel Type 
          			</p>
          		</Tooltip>
          		<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Engine Fuel Type"]:""} </p>
          	</div>

			<div>
				<Tooltip content="I AM TOOLTIP">
					<p style={{margin:"1px", borderBottom: "0.05em dotted"}}>
						Drive Type
					</p>
				</Tooltip>
				<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Driven_Wheels"]:""}</p>
			</div>

			<div>
				<Tooltip content="I AM TOOLTIP">
					<p style={{margin:"1px", borderBottom: "0.05em dotted"}}>
						MSRP
					</p>
				</Tooltip>
			<p style={{display:"inline-block"}}> : ${this.state.selectedCar ? this.state.selectedCar["MSRP"]:""}</p>
			</div>

			<div>
			<Tooltip content="I AM TOOLTIP">
						<p style={{margin:"1px", borderBottom: "0.05em dotted" }}>
							Transmission Type
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Transmission Type"]:""}</p>
			</div>

			<div>
			<Tooltip content="I AM TOOLTIP">
						<p style={{margin:"1px", borderBottom: "0.05em dotted"}}>
							Vehicle Style
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Vehicle Style"]:""}</p>
			</div>


			<div>
			<Tooltip content="I AM TOOLTIP">
						<p style={{margin:"1px", borderBottom: "0.05em dotted"}}>
							Vehicle Size
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Vehicle Size"]:""}</p>
			</div>

			<div>
			<Tooltip content="I AM TOOLTIP">
						<p style={{margin:"1px", borderBottom: "0.05em dotted"}}>
							City MPG
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["city mpg"]:""}</p>
			</div>

			<div>
				<Tooltip content="I AM TOOLTIP">
					<p style={{margin:"1px", borderBottom: "0.05em dotted"}}>
						Highway MPG
					</p>
				</Tooltip>
				<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["highway MPG"]:""}</p>
			</div>

				</div>
				<div style={{display:"inline-block", verticalAlign:"middle", whiteSpace:"normal", outline:"1px solid black", 
						width:"55%", marginTop: "10px", height:"90%", margin:"auto", transform: "translate(4%, 0)"}}>
					<center><h3>Reviews</h3></center>
					<div style={{overflowY:"auto", overflowX:"visible", height:"90%"}}>
						{modalReviewItems}
					</div>
				</div>
			</center>
        </Modal>
      </div>
    );
  }
}

export default App;
