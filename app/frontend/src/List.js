import React from 'react';
import Button from 'react-bootstrap/Button';
import './List.css'
import Tooltip from 'react-simple-tooltip';
/** Displays selected keywords and allows user to delete keyword **/

const priorityMap = {
	1: "green",
	2: "#fad201",
	3: "red"
};

const List = props => (



  <ul>
    {
      props.items.map((item, index) => 
      	<Tooltip key={index} content="Click to change priority" style={{"lineHeight": "15px", fontSize:"15px"}}>
		<Button className="keybutton" type="button" style={{margin:'10px 5px',background:"green", color:"black", border:"solid", font:"bold"}} 
			key={index} onClick={(evt) => {
				// increase priority or wrap around back to 1
				if(item.priority === 3) {
					item.priority = 1;	
				} else {
					item.priority += 1;
				}

				// TODO: maybe find a way to do this by setting a state somewhere
				evt.target.style.background = priorityMap[item.priority];
				// console.log(item);
			}}>
			{item.word} <span className="close" onClick={() => {props.delete(item)}}>x</span>
		</Button>
		</Tooltip>)
    }
  </ul>
);

export default List;
