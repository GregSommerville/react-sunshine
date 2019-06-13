import React from "react";

// extend the "Window" class since we're looking for the "google" property on it
declare global {
  interface Window { google: any }
}

export interface GoogleMapProps {
  id: string,
  apikey: string,
  options: object,
  onMapLoad?: (map: any) => any;
}

export class GoogleMap extends React.Component<GoogleMapProps, any> {
    
    constructor(props: GoogleMapProps) {
        super(props);
        this.onGMapsReady = this.onGMapsReady.bind(this);   // make sure "this" is set correctly
    }

    componentDidUpdate() {
        // dynamically hook in the Google Maps API via inserting a script tag
        if (!window.google) {

            // dynamically create a script element
            const s = document.createElement("script");
            s.type = 'text/javascript';
            s.src = 'https://maps.google.com/maps/api/js?key=' + this.props.apikey;

            // hook into the DOM
            const scriptNodes = document.getElementsByTagName('script');
            if (scriptNodes.length > 0) {
                const domNode = scriptNodes[0];
                if (domNode.parentNode) {
                    domNode.parentNode.insertBefore(s, domNode);
                }
            }
        
            // once the API is loaded, go ahead and render the map in onScriptLoad()
            s.addEventListener('load', () => { this.onGMapsReady() });
        }
        else 
        {
            // Google Maps API was already created, so render the map
            this.onGMapsReady();
        }
    }

    onGMapsReady() {
        const map = new window.google.maps.Map(
            document.getElementById(this.props.id),
            this.props.options);
        if (this.props.onMapLoad) {
            this.props.onMapLoad(map);                    
        }
    }

    render() {
        return (
            <div className="Google-maps-box">
                { this.props.apikey ? 
                    ( <div id={this.props.id} ></div> ) :
                    ( <div>No Google Map API Key was specified</div> )
                }
            </div>
        );
    }
}