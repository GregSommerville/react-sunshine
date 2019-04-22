import React, { Component } from 'react';
import './App.css';
import { PlaceSelector } from './PlaceSelector';
import { SuntimesDisplay } from './SuntimesDisplay';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="row">
          <PlaceSelector />
        </div>
        <div className="row">
          <SuntimesDisplay />
        </div>
      </div>
    );
  }
}

export default App;