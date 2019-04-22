import React from 'react';
import Button from 'react-bootstrap/Button';
import './List.css'
/** Displays selected keywords and allows user to delete keyword **/
const List = props => (

  <ul>
    {
      props.items.map((item, index) => <Button className="keybutton" type="button" style={{margin:'10px 5px',background:"#3f51b5"}} key={index} onClick={() => {props.delete(item)}}>{item} <span className="close">x</span></Button>)
    }
  </ul>
);

export default List;
