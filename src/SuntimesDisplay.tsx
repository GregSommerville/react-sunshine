import React from 'react';
import { DayInfo } from './SunHourCalculator';

// defining the property types
interface DisplayProps {
    sunData: DayInfo[];
}

export class SuntimesDisplay extends React.Component<DisplayProps, any> {

    private minutesInADay: number = 1440;
    private canvasWidth: number = 1000;
    private canvasHeight: number = 450;
    private sideMargin: number = 50;
    private topMargin: number = 40;
    private leftTextX: number = 10;
    private rightTextX: number = this.canvasWidth - 30;
    private topTextY: number = 20;
    private bottomTextY: number = this.canvasHeight - 20;
    private dayWidth: number = (this.canvasWidth - 2 * this.sideMargin) / 365; 
    private dayHeight: number = (this.canvasHeight - 2 * this.topMargin);  // max height 

    constructor(props: DisplayProps) {
        super(props);
        this.state = {};
    }

    drawHours(ctx: CanvasRenderingContext2D) {
        // show the hour lines and labels
        ctx.fillStyle = 'lightgray';
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 1;
        ctx.font = '12px sanserif';

        let topNumber = 12, 
            bottomNumber = 12,
            topY = this.topMargin, 
            bottomY = topY + this.dayHeight;
        const hourGap = this.dayHeight / 24;
        for (let i = 0; i < 12; i++)
        {
            // line
            topY = Math.floor(topY) + 0.5;  // to draw cleaner
            ctx.moveTo(this.sideMargin, topY);
            ctx.lineTo(ctx.canvas.width - this.sideMargin, topY);
            ctx.stroke();

            // text
            let hourString = (topNumber == 12) ? "mid" : topNumber.toString() + "p";
            ctx.fillText(hourString, this.leftTextX, topY);
            ctx.fillText(hourString, this.rightTextX, topY);

            topNumber--;
            topY += hourGap;

            // line
            bottomY = Math.floor(bottomY) + 0.5;  // to draw cleaner
            ctx.moveTo(this.sideMargin, bottomY);
            ctx.lineTo(ctx.canvas.width - this.sideMargin, bottomY);
            ctx.stroke();

            // text
            hourString = (bottomNumber == 12) ? "mid" : bottomNumber.toString() + "a";
            ctx.fillText(hourString, this.leftTextX, bottomY);
            ctx.fillText(hourString, this.rightTextX, bottomY);

            bottomNumber++;
            if (bottomNumber > 12) bottomNumber = 1;
            bottomY -= hourGap;
        }

        // draw noon
        topY = Math.floor(this.canvasHeight / 2) + 0.5;
        ctx.moveTo(this.sideMargin, topY);
        ctx.lineTo(ctx.canvas.width - this.sideMargin, topY);
        ctx.stroke();
        ctx.fillText("noon", this.leftTextX, topY);
        ctx.fillText("noon", this.rightTextX, topY);
    }

    drawMonths(ctx: CanvasRenderingContext2D) {
        const abbrs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        ctx.fillStyle = 'lightgray';
        ctx.font = '12px sanserif';        
        let x = this.sideMargin;
        const monthWidth = (ctx.canvas.width - this.sideMargin * 2) / abbrs.length;
        abbrs.forEach(mon => {
            ctx.fillText(mon, x, this.topTextY);
            ctx.fillText(mon, x, this.bottomTextY);
            x += monthWidth;
        });        
    }

    componentDidUpdate() {
        const canvas = this.refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")!;
        const sunData = this.props.sunData;

        // background is blue
        ctx.beginPath();
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // lines and labels for the graph hours
        this.drawHours(ctx);
        this.drawMonths(ctx);

        // now create a path that is defined by the sunset times, then the sunrise times
        let x = this.sideMargin;
        let baseY = this.topMargin;

        ctx.fillStyle = 'gold';
        ctx.beginPath();

        for (let i = 0; i < sunData.length; i++) {
            const day = sunData[i];
            const topYadjust = (this.minutesInADay - day.sunsetTimeAsNum) / this.minutesInADay;
            const y = baseY + this.dayHeight * topYadjust;
            if (i == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += this.dayWidth;
        }
        for (let i = sunData.length - 1; i >= 0; i--) {
            const day = sunData[i];
            const botYadjust = (this.minutesInADay - day.sunriseTimeAsNum) / this.minutesInADay;
            const y = baseY + this.dayHeight * botYadjust;
            ctx.lineTo(x, y);
            x -= this.dayWidth;
        }
        ctx.fill();    
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