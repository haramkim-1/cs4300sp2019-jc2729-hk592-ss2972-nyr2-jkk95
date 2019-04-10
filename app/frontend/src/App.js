import React, { Component } from 'react';
import Form from './Form';
import logo from './logo.gif';
import './App.css';

class App extends Component {

  render() {
    return (

      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <Form/>

      </div>
      
    );
  }
}

export default App;
