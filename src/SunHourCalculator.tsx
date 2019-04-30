export interface DayInfo {
    dayNumber: number;
    sunriseTimeAsNum: number;
    sunsetTimeAsNum: number;
    infoMsg: string;
}

interface MonthInfo {
    month: string;
    numdays: number;
    abbr: string;
}

export class SunHourCalculator {
    monthList: Array<MonthInfo> = [];
    suntimes: Array<DayInfo> = [];  // array of sunrise and sunset times per day, as # minutes from midnight
    latitude: number = 0;
    longitude: number = 0;
    timeZone: number = 0;

    constructor(lat: number, lng: number , tz: number) {

        // initialize the list of months - note that this is written for non-leap years
        this.monthList.push({ month: "January", numdays: 31, abbr: "Jan" });
        this.monthList.push({ month: "February", numdays: 28, abbr: "Feb" });
        this.monthList.push({ month: "March", numdays: 31, abbr: "Mar" });
        this.monthList.push({ month: "April", numdays: 30, abbr: "Apr" });
        this.monthList.push({ month: "May", numdays: 31, abbr: "May" });
        this.monthList.push({ month: "June", numdays: 30, abbr: "Jun" });
        this.monthList.push({ month: "July", numdays: 31, abbr: "Jul" });
        this.monthList.push({ month: "August", numdays: 31, abbr: "Aug" });
        this.monthList.push({ month: "September", numdays: 30, abbr: "Sep" });
        this.monthList.push({ month: "October", numdays: 31, abbr: "Oct" });
        this.monthList.push({ month: "November", numdays: 30, abbr: "Nov" });
        this.monthList.push({ month: "December", numdays: 31, abbr: "Dec" });

        this.latitude = lat;
        this.longitude = lng;
        this.timeZone = tz;
            
        // loop over the whole year and calculate times
        let dayNumber = 1;
        const year = new Date().getFullYear();
        for (let month = 0; month < 12; month++) {

            const numDays = this.monthList[month].numdays;
            for (let day = 1; day <= numDays; day++) {

                const date = new Date(year, month, day, 0, 0, 1, 0);
                let [sunriseTime, sunsetTime, sunriseFormatted, sunsetFormatted] = this.getSuntimesForDate(date);

                // times come back as "00:00" through "23:59", so we need to convert into a contiguous number, 
                // with 24 * 60 possible values
                let parts = sunriseTime.split(':');
                const sunriseTimeAsNum = Number(parts[0]) * 60 + parseInt(parts[1]);

                parts = sunsetTime.split(':');
                const sunsetTimeAsNum = Number(parts[0]) * 60 + parseInt(parts[1]);

                const infoMsg = 
                    this.monthList[month].month + 
                    " " + day +
                    "<br/>Sunrise: " + sunriseFormatted +
                    "<br/>Sunset: " + sunsetFormatted;

                this.suntimes.push({dayNumber, sunriseTimeAsNum, sunsetTimeAsNum, infoMsg});
                dayNumber++;
            }
        }
    }

    getSuntimesForYear() : DayInfo[] {
        return this.suntimes;
    }

//==========================================================================
// The following is based on code originally found at 
// http://www.esrl.noaa.gov/gmd/grad/solcalc/main.js
//
// That code was written by the U.S. government, and powers their NOAA 
// sunrise/sunset website located at 
// http://www.esrl.noaa.gov/gmd/grad/solcalc/index.html
//==========================================================================

    getSuntimesForDate(date: Date): string[] {

        // we assume everyone lives in an area that observes DST (untrue), and base DST solely on the date
        const useDST = this.isDateInDST(date);

        const jday = this.getJD(date);
        const tl = this.getTimeLocal();

        const total = jday + tl / 1440.0 - this.timeZone / 24.0;
        const T = this.calcTimeJulianCent(total);

        this.calcAzEl(T, tl, this.latitude, this.longitude, this.timeZone);
        this.calcSolNoon(jday, this.longitude, this.timeZone, useDST);

        // create a couple of public properties with the results 
        // format is "HH:MM"
        const sunrise = this.calcSunriseSet(1, jday, this.latitude, this.longitude, this.timeZone, useDST),
            sunset = this.calcSunriseSet(0, jday, this.latitude, this.longitude, this.timeZone, useDST),
            sunriseFormatted = this.getFormattedDate(sunrise),
            sunsetFormatted = this.getFormattedDate(sunset);

        return [sunrise, sunset, sunriseFormatted, sunsetFormatted];
    }

    private getFormattedDate(date: string): string {
        const parts = date.split(':');
        const hr = Number(parts[0]);    
        const min = parts[1];
        if (hr >= 12)
            return (hr - 12) + ":" + min + " PM";
        return hr + ":" + min + " AM";
    }

    private isDateInDST(date: Date): boolean {
        // getDay() returns 0 for Sunday, 1 = Mon, etc.

        //begins on the second Sunday of March 
        const march = 2; // JS quirk
        let dstStart = new Date(date.getFullYear(), march, 8);
        // if getDay = 0, 2nd Sun is 8th and value is correct
        // for 1 (Mon), Sun is 14th
        // for 6 (Sat), Sun is 9th
        // thus, 15 - getDay for everybody except if getDay is 0
        if (dstStart.getDay() > 0)
            dstStart = new Date(date.getFullYear(), march, 15 - dstStart.getDay());

        //ends on the first Sunday of November
        const november = 10;
        let dstEnd = new Date(date.getFullYear(), november, 1);
        // if getDay = 0, Sun is 1st and the value is correct
        // for 1 (Mon), Sun is 7th
        // for 6 (Sat), Sun is 2nd
        // thus, (8 - getDay) for everybody except if getDay is 0
        if (dstEnd.getDay() > 0)
            dstEnd = new Date(date.getFullYear(), november, 8 - dstEnd.getDay());

        return (date >= dstStart) && (date < dstEnd);
    }

    private getJD(date: Date): number {
        let docmonth = date.getMonth() + 1;
        let docday = date.getDate();
        let docyear = date.getFullYear();

        if ((this.isLeapYear(docyear)) && (docmonth == 2)) {
            if (docday > 29) {
                docday = 29
            }
        } else {
            if (docday > this.monthList[docmonth - 1].numdays) {
                docday = this.monthList[docmonth - 1].numdays
            }
        }
        if (docmonth <= 2) {
            docyear -= 1
            docmonth += 12
        }
        const A = Math.floor(docyear / 100)
        const B = 2 - A + Math.floor(A / 4)
        const JD = Math.floor(365.25 * (docyear + 4716)) + Math.floor(30.6001 * (docmonth + 1)) + docday + B - 1524.5
        return JD
    }

    private getTimeLocal(): number {
        let dochr = 20;
        const docmn = 13;
        const docsc = 23;
        const docpm = false;
        const docdst = true;

        if ((docpm) && (dochr < 12)) {
            dochr += 12
        }
        if (docdst) {
            dochr -= 1
        }
        const mins = dochr * 60 + docmn + docsc / 60.0;
        return mins
    }

    private calcTimeJulianCent(jd: number): number {
        const T = (jd - 2451545.0) / 36525.0
        return T
    }

    private isLeapYear(yr: number): boolean {
        return ((yr % 4 == 0 && yr % 100 != 0) || yr % 400 == 0);
    }

    private radToDeg(angleRad: number): number {
        return (180.0 * angleRad / Math.PI);
    }

    private degToRad(angleDeg: number): number {
        return (Math.PI * angleDeg / 180.0);
    }

    private calcGeomMeanLongSun(t: number): number {
        let L0 = 280.46646 + t * (36000.76983 + t * (0.0003032))
        while (L0 > 360.0) {
            L0 -= 360.0
        }
        while (L0 < 0.0) {
            L0 += 360.0
        }
        return L0		// in degrees
    }

    private calcGeomMeanAnomalySun(t: number): number {
        const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
        return M;		// in degrees
    }

    private calcEccentricityEarthOrbit(t: number): number {
        const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
        return e;		// unitless
    }

    private calcSunEqOfCenter(t: number): number {
        const m = this.calcGeomMeanAnomalySun(t);
        const mrad = this.degToRad(m);
        const sinm = Math.sin(mrad);
        const sin2m = Math.sin(mrad + mrad);
        const sin3m = Math.sin(mrad + mrad + mrad);
        const C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
        return C;		// in degrees
    }

    private calcSunTrueLong(t: number): number {
        const l0 = this.calcGeomMeanLongSun(t);
        const c = this.calcSunEqOfCenter(t);
        const O = l0 + c;
        return O;		// in degrees
    }

    private calcSunApparentLong(t: number): number {
        const o = this.calcSunTrueLong(t);
        const omega = 125.04 - 1934.136 * t;
        const lambda = o - 0.00569 - 0.00478 * Math.sin(this.degToRad(omega));
        return lambda;		// in degrees
    }

    private calcMeanObliquityOfEcliptic(t: number): number {
        const seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * (0.001813)));
        const e0 = 23.0 + (26.0 + (seconds / 60.0)) / 60.0;
        return e0;		// in degrees
    }

    private calcObliquityCorrection(t: number): number {
        const e0 = this.calcMeanObliquityOfEcliptic(t);
        const omega = 125.04 - 1934.136 * t;
        const e = e0 + 0.00256 * Math.cos(this.degToRad(omega));
        return e;		// in degrees
    }

    private calcSunDeclination(t:number): number {
        const e = this.calcObliquityCorrection(t);
        const lambda = this.calcSunApparentLong(t);
        const sint = Math.sin(this.degToRad(e)) * Math.sin(this.degToRad(lambda));
        const theta = this.radToDeg(Math.asin(sint));
        return theta;		// in degrees
    }

    private calcEquationOfTime(t: number): number {
        const epsilon = this.calcObliquityCorrection(t);
        const l0 = this.calcGeomMeanLongSun(t);
        const e = this.calcEccentricityEarthOrbit(t);
        const m = this.calcGeomMeanAnomalySun(t);

        let y = Math.tan(this.degToRad(epsilon) / 2.0);
        y *= y;

        const sin2l0 = Math.sin(2.0 * this.degToRad(l0));
        const sinm = Math.sin(this.degToRad(m));
        const cos2l0 = Math.cos(2.0 * this.degToRad(l0));
        const sin4l0 = Math.sin(4.0 * this.degToRad(l0));
        const sin2m = Math.sin(2.0 * this.degToRad(m));

        const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
        return this.radToDeg(Etime) * 4.0;	// in minutes of time
    }

    private calcHourAngleSunrise(lat: number, solarDec: number) {
        const latRad = this.degToRad(lat);
        const sdRad = this.degToRad(solarDec);
        const HAarg = (Math.cos(this.degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad));
        const HA = Math.acos(HAarg);
        return HA;		// in radians (for sunset, use -HA)
    }

    private zeroPad(n: number, digits: number): string {
        let result = n.toString();
        while (result.length < digits) {
            result = '0' + n;
        }
        return result;
    }

    private calcAzEl(T: number, localtime: number, latitude: number, longitude: number, zone: number) {
        const eqTime = this.calcEquationOfTime(T)
        const theta = this.calcSunDeclination(T)
        const solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone
        let trueSolarTime = localtime + solarTimeFix
        while (trueSolarTime > 1440) {
            trueSolarTime -= 1440
        }
        let hourAngle = trueSolarTime / 4.0 - 180.0;
        if (hourAngle < -180) {
            hourAngle += 360.0
        }
        const haRad = this.degToRad(hourAngle)
        let csz = Math.sin(this.degToRad(latitude)) * Math.sin(this.degToRad(theta)) + Math.cos(this.degToRad(latitude)) * Math.cos(this.degToRad(theta)) * Math.cos(haRad)
        if (csz > 1.0) {
            csz = 1.0
        } else if (csz < -1.0) {
            csz = -1.0
        }
        const zenith = this.radToDeg(Math.acos(csz))
        let azimuth = 0;
        const azDenom = (Math.cos(this.degToRad(latitude)) * Math.sin(this.degToRad(zenith)))
        if (Math.abs(azDenom) > 0.001) {
            let azRad = ((Math.sin(this.degToRad(latitude)) * Math.cos(this.degToRad(zenith))) - Math.sin(this.degToRad(theta))) / azDenom
            if (Math.abs(azRad) > 1.0) {
                if (azRad < 0) {
                    azRad = -1.0
                } else {
                    azRad = 1.0
                }
            }
            azimuth = 180.0 - this.radToDeg(Math.acos(azRad))
            if (hourAngle > 0.0) {
                azimuth = -azimuth
            }
        } else {
            if (latitude > 0.0) {
                azimuth = 180.0
            } else {
                azimuth = 0.0
            }
        }
        if (azimuth < 0.0) {
            azimuth += 360.0
        }
        const exoatmElevation = 90.0 - zenith

        // Atmospheric Refraction correction
        let refractionCorrection = 0;
        if (exoatmElevation > 85.0) {
            refractionCorrection = 0.0;
        } else {
            const te = Math.tan(this.degToRad(exoatmElevation));
            if (exoatmElevation > 5.0) {
                refractionCorrection = 58.1 / te - 0.07 / (te * te * te) + 0.000086 / (te * te * te * te * te);
            } else if (exoatmElevation > -0.575) {
                refractionCorrection = 1735.0 + exoatmElevation * (-518.2 + exoatmElevation * (103.4 + exoatmElevation * (-12.79 + exoatmElevation * 0.711)));
            } else {
                refractionCorrection = -20.774 / te;
            }
            refractionCorrection = refractionCorrection / 3600.0;
        }

        //const solarZen = zenith - refractionCorrection;
        return (azimuth)
    }

    private calcSolNoon(jd: number, longitude: number, timezone: number, dst: boolean) {
        const tnoon = this.calcTimeJulianCent(jd - longitude / 360.0)
        let eqTime = this.calcEquationOfTime(tnoon)
        let solNoonOffset = 720.0 - (longitude * 4) - eqTime // in minutes
        const newt = this.calcTimeJulianCent(jd + solNoonOffset / 1440.0)
        eqTime = this.calcEquationOfTime(newt)
        let solNoonLocal = 720 - (longitude * 4) - eqTime + (timezone * 60.0)// in minutes
        if (dst) solNoonLocal += 60.0
        while (solNoonLocal < 0.0) {
            solNoonLocal += 1440.0;
        }
        while (solNoonLocal >= 1440.0) {
            solNoonLocal -= 1440.0;
        }
    }

    private dayString(jd: number, next: number, flag: number) {
        let output = "";
        // returns a string in the form DDMMMYYYY[ next] to display prev/next rise/set
        // flag=2 for DD MMM, 3 for DD MM YYYY, 4 for DDMMYYYY next/prev
        if ((jd < 900000) || (jd > 2817000)) {
            output = "error"
        } else {
            const z = Math.floor(jd + 0.5);
            const f = (jd + 0.5) - z;
            let A = 0;
            if (z < 2299161) {
                A = z;
            } else {
                const alpha = Math.floor((z - 1867216.25) / 36524.25);
                A = z + 1 + alpha - Math.floor(alpha / 4);
            }
            const B = A + 1524;
            const C = Math.floor((B - 122.1) / 365.25);
            const D = Math.floor(365.25 * C);
            const E = Math.floor((B - D) / 30.6001);
            const day = B - D - Math.floor(30.6001 * E) + f;
            const month = (E < 14) ? E - 1 : E - 13;
            const year = ((month > 2) ? C - 4716 : C - 4715);
            if (flag === 2)
                output = this.zeroPad(day, 2) + " " + this.monthList[month - 1].abbr;
            if (flag === 3)
                output = this.zeroPad(day, 2) + this.monthList[month - 1].abbr + year.toString();
            if (flag === 4)
                output = this.zeroPad(day, 2) + this.monthList[month - 1].abbr + year.toString() + ((next) ? " next" : " prev");
        }
        return output;
    }

    private timeDateString(JD: number, minutes: number): string {
        const output = this.timeString(minutes, 2) + " " + this.dayString(JD, 0, 2);
        return output;
    }

    private timeString(minutes: number, flag: number): string
    // timeString returns a zero-padded string (HH:MM:SS) given time in minutes
    // flag=2 for HH:MM, 3 for HH:MM:SS
    {
        let output = "";
        if ((minutes >= 0) && (minutes < 1440)) {
            const floatHour = minutes / 60.0;
            let hour = Math.floor(floatHour);
            const floatMinute = 60.0 * (floatHour - Math.floor(floatHour));
            let minute = Math.floor(floatMinute);
            const floatSec = 60.0 * (floatMinute - Math.floor(floatMinute));
            let second = Math.floor(floatSec + 0.5);
            if (second > 59) {
                second = 0
                minute += 1
            }
            if ((flag == 2) && (second >= 30)) minute++;
            if (minute > 59) {
                minute = 0
                hour += 1
            }
            output = this.zeroPad(hour, 2) + ":" + this.zeroPad(minute, 2);
            if (flag > 2) output = output + ":" + this.zeroPad(second, 2);
        } else {
            output = "error"
        }
        return output;
    }

    private calcSunriseSetUTC(rise: number, JD: number, latitude: number, longitude: number) {
        const t = this.calcTimeJulianCent(JD);
        const eqTime = this.calcEquationOfTime(t);
        const solarDec = this.calcSunDeclination(t);
        let hourAngle = this.calcHourAngleSunrise(latitude, solarDec);
        if (!rise) hourAngle = -hourAngle;
        const delta = longitude + this.radToDeg(hourAngle);
        const timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes
        return timeUTC
    }

    private calcSunriseSet(rise: number, JD: number, latitude: number, longitude: number, timezone: number, dst: boolean)
    // rise = 1 for sunrise, 0 for sunset
    {
        const timeUTC = this.calcSunriseSetUTC(rise, JD, latitude, longitude);
        const newTimeUTC = this.calcSunriseSetUTC(rise, JD + timeUTC / 1440.0, latitude, longitude);
        //if (this.isNumber(newTimeUTC)) {
            let timeLocal = newTimeUTC + (timezone * 60.0)
            timeLocal += ((dst) ? 60.0 : 0.0);
            if ((timeLocal >= 0.0) && (timeLocal < 1440.0)) {
                return this.timeString(timeLocal, 2);
            } else {
                let jday = JD
                const increment = ((timeLocal < 0) ? 1 : -1)
                while ((timeLocal < 0.0) || (timeLocal >= 1440.0)) {
                    timeLocal += increment * 1440.0
                    jday -= increment
                }
                return this.timeDateString(jday, timeLocal);
            }
    }
}