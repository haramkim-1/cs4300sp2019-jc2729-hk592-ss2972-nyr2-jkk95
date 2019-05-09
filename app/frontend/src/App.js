import React, { Component } from 'react';
import Form from './Form';
import logo from './logo.gif';
import stoplight from './stoplight.png';
import vroomSound from './vroom.mp3';
import './App.css';
import Slider from './Slider';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Modal from 'react-modal';
import Highlighter from "react-highlight-words";
import StarRatings from 'react-star-ratings';
import Tooltip from "react-simple-tooltip"
import Sound from "react-sound"

Modal.setAppElement('#root');

const modalStyles = {content: {
	top: '50%',
	left: '50%',
	width: '80%',
	height: '85%',
    // right: 'auto',
	// bottom: 'auto',
	// marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
	overflow:"hidden",
	fontFamily:"Helvetica Neue"
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
      soundStatus: Sound.status.STOPPED,
      soundVolume:100,
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
        // console.log(response.data.query);

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

		console.log(response.data.results);

        // set all state components at once
        self.setState({soundStatus: Sound.status.PLAYING, results:response.data.results, expandedQuery:response.data.query, queryRegex: regex, queryColorMapping: mapping})
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
		// TODO: remove this line
		// console.log(response.data);
        this.setState({selectedCar:response.data, modalOpen:true});
      }.bind(this))
  }.bind(this)

  closeModal = function() {
    this.setState({modalOpen: false});
  }.bind(this)

  afterOpenModal = function() {
    // TODO: setup ?
  }.bind(this)

  generateStarRatings = function(strRating, name) {
	let rating = Number(strRating);
    if(!isNaN(rating)) {
      return (<StarRatings
          rating={rating}
          name={name}
          starRatedColor="red"
          starEmptyColor="black"
          starDimension="15px"
          padding="50%"
        />);
    } else {
      return (null);
    }
  }

  generateImage = function(imageStr){
	if(imageStr)
		return (<img style={{objectFit:"contain", width:"90%", maxHeight:"215px"}} src={"data:image/jpeg;base64," + imageStr} />);
	else
		return (<h3>No Image Available</h3>);
  }

  render() {
    var listItems =
		(this.state.results==='None') ?
		<div style={{fontSize:"20px", color:"white"}}> No results found :(
			<div style={{fontSize:"16px"}}> Your query did not match any cars. Try changing the price, size, effeciency or keywords.
			</div>
		</div>
		:
		this.state.results.map((carObj) =>
		<li style={{color:"black", width: '380px', listStyleType:"none", display: 'inline', float: 'left', border:'1px'}} key={carObj['ymm']}>
			<div style={{backgroundColor:'rgba(255, 255, 255, 0.35)'}}>
				{carObj['ranking'] + 1} <br/>
				{carObj['ymm']} <br/>
				{this.generateImage(carObj['img'])} <br/>
				{'$' + carObj['MSRP']} <br/>
				{this.generateStarRatings(carObj['avg_rating'])} <br/>
				<Button style={{opacity:"1.0", margin: "3px", fontFamily:"Helvetica Neue"}} type="button" onClick={(evt) => this.displayDetails(evt, carObj['ymm'])}> {'See Details'} </Button>
			</div>
		</li>
	);

	// display reviews
	var modalReviewItems = this.state.selectedCar && this.state.selectedCar.reviews ? (this.state.selectedCar.reviews.map((review) =>
      <li style={{backgroundColor:"white", listStyleType:"none", margin:"4px", marginLeft:"6px", marginRight:"4px"}}
          key={review.Review_Date + " " + review.Author_Name}>
        <h4 style={{"margin":"4px"}}> {"\"" + review.Review_Title + "\""} </h4>
        <p style={{"fontSize":"14px", "margin":"4px"}}> {"by: " + review.Author_Name} </p>

		{this.generateStarRatings(review.Rating, review.Review_Date + " " + review.Author_Name)}

        <p style={{"fontSize":"11px", "margin":"4px"}}>
          <Highlighter
            searchWords={[this.state.queryRegex]}
            textToHighlight={review.Review}
            highlightClassName={this.state.queryColorMapping}
          />
        </p>
      <hr style={{ backgroundColor:"gray"}}/>
      </li>
	)) : null;

    return (
      <div className="App">
        <Sound
          url={vroomSound}
          autoLoad={true}
          playStatus={this.state.soundStatus}
          onFinishedPlaying={() => this.setState({ soundStatus: Sound.status.STOPPED })}
          volume={this.state.soundVolume}
        />

        <Button id="soundToggle" style={{"position":"absolute", "top":"0px", "right":"0px",
            "backgroundColor":"white", "borderColor":"white", width:"50px", height:"50px", "fontSize":"25px"}}
          type="button" key='sound' onClick={() => {this.setState({soundVolume: Math.abs(this.state.soundVolume - 100)})}}>
            {this.state.soundVolume == 100 ? "\uD83D\uDD0A":"\uD83D\uDD07"}
          </Button>

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
        <div style={{width:"50%",  overflow:'scroll', margin: "auto", marginTop: "10px", marginBottom: "30px"} }>{listItems}</div>
        </div>
        </div>

        <Modal
          isOpen={this.state.modalOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
		  contentLabel="Details Modal"
		  style={modalStyles}
        >


			<h2 ref={subtitle => this.subtitle = subtitle}>


      {this.state.selectedCar ? this.state.selectedCar.Year_Make_Model:""}

      <button onClick={this.closeModal} style={{"backgroundColor":"Transparent", "border":"none", "float": "right", "transform": "translateY(-10px)"}}>
      <svg viewBox="0 0 75 75" width="25px">
        <path d="m5,22 18,-18 28,0 18,18 0,28 -18,18, -28,0 -18,-18z" stroke="red" strokeWidth="2" fill="red" />
          <text x="50%" y="40%" stroke="white" strokeWidth="5px" dy=".1em" fontSize="60" textAnchor="middle" alignmentBaseline="middle" dominantBaseline="central"> &times; </text>
      </svg>
      </button>
      </h2>

		<center style={{verticalAlign:"middle", whiteSpace:"nowrap", height:"95%", width:"100%", margin:"auto"}}>
			<div style={{height:"90%", overflow: "visible auto", display:"inline-block", whiteSpace:"normal", verticalAlign:"middle", border:"1px solid black",
						width:"35%", marginTop: "5px", transform: "translate(-4%, 0)", paddingTop:"1px", paddingBottom:"1px",
            		borderRadius:"5px"}}>
			<br></br>
			<center>
				{this.state.selectedCar ? this.generateImage(this.state.selectedCar.img):""}
			</center>

			<div style={{ borderBottom:"0.05em", display:"inline-block"}}>
				{this.state.selectedCar ? this.generateStarRatings(this.state.selectedCar.avg_rating):"No Ratings Available"}
      		</div>

			<div>
				<Tooltip content="Motor fuel or energy source the manufacturer recommends for the vehicle" style={{"lineHeight": "15px", fontSize:"15px"}}>
					<div style={{ borderBottom: "0.05em dotted" }}>
          				Engine Fuel Type
          			</div>
          		</Tooltip>
          		<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Engine Fuel Type"]:""} </p>
          	</div>

			<div>
				<Tooltip content="Vehicle's drivetrain" style={{"lineHeight": "15px", fontSize:"15px"}}>
					<p style={{ borderBottom: "0.05em dotted"}}>
						Drive Type
					</p>
				</Tooltip>
				<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Driven_Wheels"]:""}</p>
			</div>

			<div>
				<Tooltip content="Manufacturer's Suggested Retail Price (adjusted for older cars)" style={{"lineHeight": "15px", fontSize:"15px"}}>
					<p style={{borderBottom: "0.05em dotted"}}>
						MSRP
					</p>
				</Tooltip>
			<p style={{display:"inline-block"}}> : ${this.state.selectedCar ? this.state.selectedCar["MSRP"]:""}</p>
			</div>

			<div>
			<Tooltip content="Type of gear shift equipped by the vehicle" style={{"lineHeight": "15px", fontSize:"15px"}}>
						<p style={{borderBottom: "0.05em dotted" }}>
							Transmission Type
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Transmission Type"]:""}</p>
			</div>

			<div>
			<Tooltip content="General design style of the vehicle" style={{"lineHeight": "15px", fontSize:"15px"}}>
						<p style={{borderBottom: "0.05em dotted"}}>
							Vehicle Style
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Vehicle Style"]:""}</p>
			</div>


			<div>
			<Tooltip content="Car size category" style={{"lineHeight": "15px", fontSize:"15px"}}>
						<p style={{borderBottom: "0.05em dotted"}}>
							Vehicle Size
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["Vehicle Size"]:""}</p>
			</div>

			<div>
			<Tooltip content="Miles per gallon a car gets traveling in a city or town (more stop & go)" style={{"lineHeight": "15px", fontSize:"15px"}}>
						<p style={{borderBottom: "0.05em dotted"}}>
							City MPG
						</p>
			</Tooltip>
			<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["city mpg"]:""}</p>
			</div>

			<div>
				<Tooltip content="Miles per gallon a car gets traveling on a highway (higher speed, fewer stops)" style={{"lineHeight": "15px", fontSize:"15px"}}>
					<p style={{borderBottom: "0.05em dotted"}}>
						Highway MPG
					</p>
				</Tooltip>
				<p style={{display:"inline-block"}}> : {this.state.selectedCar ? this.state.selectedCar["highway MPG"]:""}</p>
			</div>

				</div>
				<div style={{display:"inline-block", verticalAlign:"middle", whiteSpace:"normal", border:"1px solid black",
						width:"55%", marginTop: "10px", height:"90%", margin:"auto", transform: "translate(4%, 0)", paddingTop:"10px", paddingBottom:"10px", borderRadius:"5px"}}>
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
