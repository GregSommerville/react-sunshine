import React, { Component } from 'react';
import './App.css';
import { PlaceSelector } from './PlaceSelector';
import { SuntimesDisplay } from './SuntimesDisplay';
import { SunHourCalculator } from './SunHourCalculator';
import { Instructions } from './Instructions';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { sunData: [], lat: NaN, lng: NaN }
  }

  // when our place changes, calculate new sun data and pass to the display control by changing the state data
  onPlaceChange = (placeInfo) => {
    const sunCalc = new SunHourCalculator(placeInfo.lat, placeInfo.lng, placeInfo.tz);
    this.setState(
      { sunData: sunCalc.getSuntimesForYear(), 
        lat: placeInfo.lat, 
        lng: placeInfo.lng });
  }

  render() {
    return (
      <div className="App">
        <div className="row">
          <div className="col-12">
            <Instructions />
            <PlaceSelector onPlaceChange={this.onPlaceChange} />
          </div>
        </div>
        <div className="row">
          <SuntimesDisplay sunData={this.state.sunData} />
        </div>
      </div>
    );
  }
}

export default App;