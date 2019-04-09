import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import React, { Component } from 'react';
import axios from 'axios';
import './Form.css';
/** Tutorial: http://react-autosuggest.js.org/ **/

// Janice's TODO add: 1. "add", 2. "delete from list", 4. prettify (center), 5. store keywords somehow
const keywords = [
  {
    text: 'Car 1111'
  },
  {
    text: '2 car'
  }
];

const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  var suggestions = inputLength === 0 ? [] : keywords.filter(kw =>
    kw.text.toLowerCase().includes(inputValue))
  suggestions.sort(function(a,b){
  	return a.text.length - b.text.length;
  });
  return suggestions
  
};

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

  onChange = (event, { newValue, method }) => {

    this.setState({
      value: newValue
    });
  };

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
  	console.log(suggestionValue)
  	// TODO add here
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Enter keywords",
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps} />
    );
  }
}

export default Form;