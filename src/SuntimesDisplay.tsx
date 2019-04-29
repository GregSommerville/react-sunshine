import React from 'react';
import { DayInfo } from './SunHourCalculator';

// defining the property types
interface DisplayProps {
    sunData: DayInfo[];
}

export class SuntimesDisplay extends React.Component<DisplayProps, any> {

    private canvasWidth: number = 700;
    private canvasHeight: number = 500;
    private sideMargin: number = 25;
    private topMargin: number = 20;

    constructor(props: DisplayProps) {
        super(props);
        this.state = {};
    }

    componentDidUpdate() {
        const canvas = this.refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")!;
        const sunData = this.props.sunData;

        // calc size of each day's bar
        const dayWidth = (this.canvasWidth - 2 * this.sideMargin) / 365; 
        const dayHeight = (this.canvasHeight - 2 * this.topMargin);  // max height 

        ctx.fillStyle = 'red';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let x = this.sideMargin;
        let baseY = this.topMargin;
        sunData.forEach(day => {
            // each day has sunriseTimeAsNum and sunsetTimeAsNum, which are both numbers that
            // represent rise and set times as minutes from midnight (0 - 1440)
            const topYadjust = (1440 - day.sunsetTimeAsNum) / 1440;
            const botYadjust = (1440 - day.sunriseTimeAsNum) / 1440;

            ctx.fillRect(x, baseY + dayHeight * topYadjust, dayWidth, dayHeight * (botYadjust - topYadjust));
            x += dayWidth;
        });

        // draw midline that shows noon
        // draw month names 
    }

    render() {
        return (
            <div className="col-12">
                <canvas ref="canvas" width={this.canvasWidth} height={this.canvasHeight} />
            </div>
        );
    }
} 