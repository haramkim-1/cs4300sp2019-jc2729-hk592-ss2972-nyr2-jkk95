import React from 'react';
import Button from 'react-bootstrap/Button';
import './List.css'
const List = props => (
  
  <ul>
    {
      props.items.map((item, index) => <Button type="button" style={{margin:'10px 5px'}} key={index} onClick={() => {props.delete(item)}}>{item} <span className="close">x</span></Button>)
    }
  </ul>
);

export default List;

