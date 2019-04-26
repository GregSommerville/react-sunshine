import React from 'react';
import { DayInfo } from './SunHourCalculator';

// defining the property types
interface DisplayProps {
    sunData: DayInfo[];
}

export class SuntimesDisplay extends React.Component<DisplayProps, any> {

    componentDidMount() {
        const canvas = this.refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        const sunData = this.props.sunData;

        // now draw the data
    }

    render() {
        return (
            <div className="col-12">
                <canvas ref="canvas" width={700} height={500} />
            </div>
        );
    }
} 