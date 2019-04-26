import React, { Component } from 'react';
import './App.css';
import { PlaceSelector } from './PlaceSelector';
import { SuntimesDisplay } from './SuntimesDisplay';
import { SunHourCalculator } from './SunHourCalculator';

class App extends Component {

  // when our place changes, calculate new sun data and pass to the display control by changing the state data
  onPlaceChange = (placeInfo) => {
    const sunCalc = new SunHourCalculator(placeInfo.lat, placeInfo.lng, placeInfo.tz);
    this.setState("sunData", sunCalc.getSuntimesForYear);
  }

  render() {
    return (
      <div className="App">
        <div className="row">
          <PlaceSelector onPlaceChange={this.onPlaceChange} />
        </div>
        <div className="row">
          <SuntimesDisplay sunData={this.state.sunData} />
        </div>
      </div>
    );
  }
}

export default App;