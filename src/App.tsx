import React, { Component } from 'react';
import './App.css';
import { PlaceDescriptor, PlaceSelector } from './PlaceSelector';
import { SuntimesDisplay } from './SuntimesDisplay';
import { SunHourCalculator, DayInfo } from './SunHourCalculator';
import { Instructions } from './Instructions';
import { GoogleMap } from './GoogleMap';

type StateData = {
  sunData: DayInfo[];
  lat: number;
  lng: number;
}

class App extends Component<{}, StateData> {

  constructor(props: any) {
    super(props);
    this.state = { sunData: [], lat: NaN, lng: NaN }
  }

  // when our place changes, calculate new sun data and pass to the display control by changing the state data
  onPlaceChange = (placeInfo: PlaceDescriptor) => {
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
            <GoogleMap id='gmap' apikey=''
              options={{
                center: { lat: this.state.lat, lng: this.state.lng },
                zoom: 8
              }}
            />

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