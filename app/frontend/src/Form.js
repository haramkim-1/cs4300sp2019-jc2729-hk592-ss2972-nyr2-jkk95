import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import React, { Component } from 'react';
import axios from 'axios';
import './Form.css';
import List from './List'
/** Tutorial: http://react-autosuggest.js.org/ **/

const SERVER_URL = window.location // use for deployment mode
// const SERVER_URL = "http://localhost:5000/" // use for local development mode

console.log("server url (form.js): " + SERVER_URL);

// Janice's TODO: 4. prettify (center), 5. api calls to  send!
var sys_keywords = [];

axios.get(SERVER_URL + 'keywords', {'headers':{'Access-Control-Allow-Origin': '*'}})
  .then(function (response) {
    sys_keywords = response.data
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })


function getSuggestionValue(suggestion) {
  return `${suggestion.text}`;
}
/** Matching code begins here, for letters in user input matching with keywords **/
// This matching code is taken directly from https://github.com/moroshko/autosuggest-highlight/issues/5
// which will soon be merged into the Autosuggest-Highlight library, imported in this js file
const specialCharsRegex = /[.*+?^${}()|[\]\\]/g;
const whitespacesRegex = /\s+/;

function escapeRegexCharacters(str: any) {
    return str.replace(specialCharsRegex, '\\$&');
}
const match = (text: any, query: any)  => {
    return (
        query
            .trim()
            .split(whitespacesRegex)
            .reduce((result: any, word: any) => {
                if (!word.length) return result;
                const wordLen = word.length;
                const regex = new RegExp(escapeRegexCharacters(word), 'i');
                const { index = -1 } = text.match(regex);
                if (index > -1) {
                    result.push([index, index + wordLen]);

                    // Replace what we just found with spaces so we don't find it again.
                    text =
                        text.slice(0, index) +
                        new Array(wordLen + 1).join(' ') +
                        text.slice(index + wordLen);
                }

                return result;
            }, [])
            .sort((match1: any, match2: any) => {
                return match1[0] - match2[0];
            })
    );
};
/** Matching code ends here **/

/** Renders a single suggested keyword, with matches with the user input highlighted **/
function renderSuggestion(suggestion, { query }) {
  const suggestionText = `${suggestion.text}`;
  const matches = match(suggestionText, query);
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

  /** Returns ranked list of suggested keywords, from shorted to longest */
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
    var new_keywords = [...this.state.keywords, suggestionValue]
  	this.setState({
      keywords: new_keywords,
      value:''
    })
    this.props.updateParentKeywords(new_keywords)
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

  /** User clicked delete on keyword **/
  onKeywordDelete = (keyword) => {
    var new_keywords = this.state.keywords.filter(k => k !== keyword)
    this.setState({

      keywords: new_keywords
    });
    this.props.updateParentKeywords(new_keywords)
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