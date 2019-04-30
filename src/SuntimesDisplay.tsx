import React from 'react';
import { DayInfo } from './SunHourCalculator';

// defining the property types
interface DisplayProps {
    sunData: DayInfo[];
}

export class SuntimesDisplay extends React.Component<DisplayProps, any> {

    private canvasWidth: number = 800;
    private canvasHeight: number = 500;
    private sideMargin: number = 50;
    private topMargin: number = 20;
    private leftTextX: number = 10;

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

        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // show the hours
        ctx.fillStyle = 'lightgray';
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 1;
        ctx.font = '12px sanserif';

        let topNumber = 12, bottomNumber = 12;
        let topY = this.topMargin, bottomY = topY + dayHeight;
        const hourGap = dayHeight / 24;
        for (let i = 0; i < 12; i++)
        {
            // line
            topY = Math.floor(topY) + 0.5;  // to draw cleaner
            ctx.moveTo(this.sideMargin, topY);
            ctx.lineTo(canvas.width - this.sideMargin, topY);
            ctx.stroke();

            // text
            let hourString = (topNumber == 12) ? "mid" : topNumber.toString() + "p";
            ctx.fillText(hourString, this.leftTextX, topY);

            topNumber--;
            topY += hourGap;

            // line
            bottomY = Math.floor(bottomY) + 0.5;  // to draw cleaner
            ctx.moveTo(this.sideMargin, bottomY);
            ctx.lineTo(canvas.width - this.sideMargin, bottomY);
            ctx.stroke();

            // text
            hourString = (bottomNumber == 12) ? "mid" : bottomNumber.toString() + "a";
            ctx.fillText(hourString, this.leftTextX, bottomY);

            bottomNumber++;
            if (bottomNumber > 12) bottomNumber = 1;
            bottomY -= hourGap;
        }
        // draw noon
        ctx.moveTo(this.sideMargin, topY);
        ctx.lineTo(canvas.width - this.sideMargin, topY);
        ctx.stroke();
        ctx.fillText("noon", this.leftTextX, topY);

        let x = this.sideMargin;
        let baseY = this.topMargin;
        ctx.fillStyle = 'gold';
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
                <div className="Suntime-display-box">
                    <canvas ref="canvas" width={this.canvasWidth} height={this.canvasHeight} />
                </div>
            </div>
        );
    }
} 