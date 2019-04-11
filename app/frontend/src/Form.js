import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import React, { Component } from 'react';
import axios from 'axios';
import './Form.css';
import List from './List'
/** Tutorial: http://react-autosuggest.js.org/ **/

// Janice's TODO: 2. "delete from list", 4. prettify (center), 5. api calls to load keywords and send!
const sys_keywords = [
  {
    text: 'Car 1111'
  },
  {
    text: '2 car'
  }
];



function getSuggestionValue(suggestion) {
  return `${suggestion.text}`;
}

function renderSuggestion(suggestion, { query }) {
  const suggestionText = `${suggestion.text}`;
  const matches = AutosuggestHighlightMatch(suggestionText, query);
  const parts = AutosuggestHighlightParse(suggestionText, matches);

  return (
    <span className={'suggestion-content'}>
      <span className="name">
        {
          parts.map((part, index) => {
            const className = part.highlight ? 'highlight' : null;

            return (
              <span className={className} key={index}>{part.text}</span>
            );
          })
        }
      </span>
    </span>
  );
}

class Form extends Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
      keywords: []
    };

  }
  
  // componentDidMount() {
  //   axios.get('keywords')
	 //  .then(function (response) { // TODO see API and test
	 //    this.setState({keywords:response})
	 //  })
	 //  .catch(function (error) {
	 //    console.log(error);
	 //  });
  // }

  getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    var suggestions = inputLength === 0 ? [] : sys_keywords.filter(kw =>
      kw.text.toLowerCase().includes(inputValue) && this.state.keywords.indexOf(kw.text) < 0)
    suggestions.sort(function(a,b){
      return a.text.length - b.text.length;
    });
    return suggestions
    
  };
  onChange = (event, { newValue, method }) => {

    this.setState({
      value: newValue
    });
  };

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
  	this.setState({
      keywords: [...this.state.keywords, suggestionValue],
      value:''
    })
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onKeywordDelete = (keyword) => {
    this.setState((prevState) => ({
      keywords: prevState.keywords.filter(k => k !== keyword)
    }));

  }
  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Enter keywords",
      value,
      onChange: this.onChange
    };

    return (
      <div>

      <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps} />
      <List items={this.state.keywords} delete={this.onKeywordDelete} />
      </div>
    );
  }
}

export default Form;