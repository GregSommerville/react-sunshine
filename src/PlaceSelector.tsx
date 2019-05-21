import React, { useState } from 'react';

// define what kind of props are going to be passed in
interface PlaceSelectorProps {
  onPlaceChange: (data: any) => void
}

export function PlaceSelector(props: PlaceSelectorProps) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [timezone, setTimezone] = useState('');

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

  const options = locations.map((loc) =>
    <option key={loc.place}>{loc.place}</option>
  );

  const onPlaceSelectChange = (ev: React.FormEvent) => {
    // populate side boxes
    const selectedName = (ev.target as HTMLSelectElement).value;
    const item = locations.find((element) => element.place == selectedName);
    if (item) {
      setLat(String(item.lat));
      setLng(String(item.lng));
      setTimezone(String(item.tz));

      // and notify the app that the place has changed
      props.onPlaceChange({ lat: item.lat, lng: item.lng, tz: item.tz });
    }
  }

  const onLatChange = (ev: React.FormEvent) => {
    const value = (ev.target as HTMLInputElement).value;
    setLat(value);
  }
  const onLngChange = (ev: React.FormEvent) => {
    const value = (ev.target as HTMLInputElement).value;
    setLng(value);
  }
  const onTimezoneSelectChange = (ev: React.FormEvent) => {
    const zone = (ev.target as HTMLSelectElement).value;
    setTimezone(zone);
  }

  return (
    <>
      <div className='Place-selector-box'>

        <div className='Place-selector-sidebox'>
          <b>Presets:</b><br />
          <select name='presetSelect' size={10} onChange={onPlaceSelectChange} >
            {options}
          </select>
        </div>

        <div className='Place-selector-sidebox-right'>
          <span className='Lat-lng-label'>Lat:</span><br />
          <input className='Lat-lng-textbox' type='text' name='lat' value={lat} onChange={onLatChange} ></input><br /><br />

          <span className='Lat-lng-label'>Lng:</span><br />
          <input className='Lat-lng-textbox' type='text' name='lng' value={lng} onChange={onLngChange}></input><br /><br />

          <span className='Lat-lng-label'>Timezone:</span><br />
          <select name='timezone' value={timezone} onChange={onTimezoneSelectChange}>
            <option value='-5'>Eastern</option>
            <option value='-6'>Central</option>
            <option value='-7'>Mountain</option>
            <option value='-8'>Pacific</option>
            <option value='-9'>Alaska</option>
            <option value='-10'>Hawaii</option>
          </select>
        </div>
      </div>
    </>
  );
}