import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const locations = [
  { place: 'New York, NY', lat: 40.712784, lng: -74.005941, tz: -5 },
  { place: 'Miami, FL', lat: 25.761680, lng: -80.191790, tz: -5 },
  { place: 'Ann Arbor, MI', lat: 42.280826, lng: -83.743038, tz: -5 },
  { place: 'Chicago, IL', lat: 41.878114, lng: -87.629798, tz: -6 },
  { place: 'Denver, CO', lat: 39.739236, lng: -104.990251, tz: -7 },
  { place: 'Los Angeles, CA', lat: 34.052234, lng: -118.243685, tz: -8 },
  { place: 'San Diego, CA', lat: 32.715738, lng: -117.161084, tz: -8 },
  { place: 'San Francisco, CA', lat: 37.774929, lng: -122.419416, tz: -8 },
  { place: 'Seattle, WA', lat: 47.606209, lng: -122.332071, tz: -8 }
];


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
