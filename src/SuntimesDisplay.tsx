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

    componentDidMount() {
        const canvas = this.refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")!;
        const sunData = this.props.sunData;

        // calc size of each day's bar
        const dayWidth = (this.canvasWidth - 2 * this.sideMargin) / 365;
        const dayHeight = (this.canvasHeight - 2 * this.topMargin);

        ctx.lineWidth = dayWidth;

        // foreach day: ctx.rect(x1, y1, width, height)

    }

    render() {
        return (
            <div className="col-12">
                <canvas ref="canvas" width={this.canvasWidth} height={this.canvasHeight} />
            </div>
        );
    }
} 