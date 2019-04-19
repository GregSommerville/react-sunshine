const monthList = [];
monthList.push({ month: "January", numdays: 31, abbr: "Jan" });
monthList.push({ month: "February", numdays: 28, abbr: "Feb" });
monthList.push({ month: "March", numdays: 31, abbr: "Mar" });
monthList.push({ month: "April", numdays: 30, abbr: "Apr" });
monthList.push({ month: "May", numdays: 31, abbr: "May" });
monthList.push({ month: "June", numdays: 30, abbr: "Jun" });
monthList.push({ month: "July", numdays: 31, abbr: "Jul" });
monthList.push({ month: "August", numdays: 31, abbr: "Aug" });
monthList.push({ month: "September", numdays: 30, abbr: "Sep" });
monthList.push({ month: "October", numdays: 31, abbr: "Oct" });
monthList.push({ month: "November", numdays: 30, abbr: "Nov" });
monthList.push({ month: "December", numdays: 31, abbr: "Dec" });

interface DayInfo {
    dayNumber: number;
    sunriseTime: number;
    sunsetTime: number;
    infoMsg: string;
}

export class SunHourCalculator {
    suntimes: Array<DayInfo>;  // array of sunrise and sunset times per day, as # minutes from midnight

    constructor(lat, lng, tz) {

        var sunCalc = new SunTimeCalculator(lat, lng, tz);

        // loop over the whole year and calculate times
        var dayNumber = 1;
        var year = new Date().getFullYear();
        for (var month = 0; month < 12; month++) {

            var numDays = sunCalc.getNumDaysOfMonth(month);
            for (var day = 1; day <= numDays; day++) {

                var date = new Date(year, month, day, 0, 0, 1, 0);
                sunCalc.setDate(date);

                // times come back as "00:00" through "23:59", so we need to convert into a contiguous number, 
                // with 24 * 60 possible values
                var sunriseTime = sunCalc.sunrise;
                var parts = sunriseTime.split(':');
                sunriseTime = parts[0] * 60 + parseInt(parts[1]);

                var sunsetTime = sunCalc.sunset;
                parts = sunsetTime.split(':');
                sunsetTime = parts[0] * 60 + parseInt(parts[1]);

                var infoMsg = 
                    sunCalc.getMonthName(month) + " " + day +
                    "<br/>Sunrise: " + sunCalc.sunriseFormatted +
                    "<br/>Sunset: " + sunCalc.sunsetFormatted;

                this.suntimes.push({dayNumber, sunriseTime, sunsetTime, infoMsg});
                dayNumber++;
            }
        }
    }
}
//==========================================================================
// The following is based on code originally found at http://www.esrl.noaa.gov/gmd/grad/solcalc/main.js
// That code was written by the U.S. government, and powers their NOAA sunrise/sunset website.  
// More Info: http://www.esrl.noaa.gov/gmd/grad/solcalc/index.html

// Refactored into a SunTimeCalculator object
//-------------------------------------------
// Constructor: SunTimeCalculator(latitude, longitude, timeZone)
// Methods: setDate(date)
// Properties: sunrise, sunset

function SunTimeCalculator(latitude, longitude, timeZone) {

    // public methods
    this.setDate = function (date) {

        // we assume everyone lives in an area that observes DST (untrue), and base DST solely on the date
        var useDST = isDateInDST(date);

        var jday = getJD(date);
        var tl = getTimeLocal();

        var total = jday + tl / 1440.0 - timeZone / 24.0;
        var T = calcTimeJulianCent(total);

        calcAzEl(1, T, tl, latitude, longitude, timeZone);
        calcSolNoon(jday, longitude, timeZone, useDST);

        // create a couple of public properties with the results 
        // format is "HH:MM"
        this.sunrise = calcSunriseSet(1, jday, latitude, longitude, timeZone, useDST);
        this.sunset = calcSunriseSet(0, jday, latitude, longitude, timeZone, useDST);

        // and return a nicely formatted version suitable for showing to users
        this.sunriseFormatted = getFormattedDate(this.sunrise);
        this.sunsetFormatted = getFormattedDate(this.sunset);
    }

    this.getNumDaysOfMonth = function (monthNum) {
        return monthList[monthNum].numdays;
    }

    this.getMonthName = function (monthNum) {
        return monthList[monthNum].name;
    }

    // private functions to do the calcs
    function getFormattedDate(date) {
        var parts = date.split(':');
        var hr = parts[0];
        var min = parts[1];
        if (hr >= 12)
            return (hr - 12) + ":" + min + " PM";
        return hr + ":" + min + " AM";
    }

    function isDateInDST(date) {
        // getDay() returns 0 for Sunday, 1 = Mon, etc.

        //begins on the second Sunday of March 
        var march = 2; // JS quirk
        var dstStart = new Date(date.getFullYear(), march, 8);
        // if getDay = 0, 2nd Sun is 8th and value is correct
        // for 1 (Mon), Sun is 14th
        // for 6 (Sat), Sun is 9th
        // thus, 15 - getDay for everybody except if getDay is 0
        if (dstStart.getDay() > 0)
            dstStart = new Date(date.getFullYear(), march, 15 - dstStart.getDay());

        //ends on the first Sunday of November
        var november = 10;
        var dstEnd = new Date(date.getFullYear(), november, 1);
        // if getDay = 0, Sun is 1st and the value is correct
        // for 1 (Mon), Sun is 7th
        // for 6 (Sat), Sun is 2nd
        // thus, (8 - getDay) for everybody except if getDay is 0
        if (dstEnd.getDay() > 0)
            dstEnd = new Date(date.getFullYear(), november, 8 - dstEnd.getDay());

        return (date >= dstStart) && (date < dstEnd);
    }

    //---------- All of the following code is verbatim from the govt site --------------

    function getJD(date) {
        var docmonth = date.getMonth() + 1;
        var docday = date.getDate();
        var docyear = date.getFullYear();

        if ((isLeapYear(docyear)) && (docmonth == 2)) {
            if (docday > 29) {
                docday = 29
            }
        } else {
            if (docday > monthList[docmonth - 1].numdays) {
                docday = monthList[docmonth - 1].numdays
            }
        }
        if (docmonth <= 2) {
            docyear -= 1
            docmonth += 12
        }
        var A = Math.floor(docyear / 100)
        var B = 2 - A + Math.floor(A / 4)
        var JD = Math.floor(365.25 * (docyear + 4716)) + Math.floor(30.6001 * (docmonth + 1)) + docday + B - 1524.5
        return JD
    }

    function getTimeLocal() {
        var dochr = 20;
        var docmn = 13;
        var docsc = 23;
        var docpm = false;
        var docdst = true;

        if ((docpm) && (dochr < 12)) {
            dochr += 12
        }
        if (docdst) {
            dochr -= 1
        }
        var mins = dochr * 60 + docmn + docsc / 60.0
        return mins
    }

    function calcTimeJulianCent(jd) {
        var T = (jd - 2451545.0) / 36525.0
        return T
    }

    function isLeapYear(yr) {
        return ((yr % 4 == 0 && yr % 100 != 0) || yr % 400 == 0);
    }

    function calcDoyFromJD(jd) {
        var z = Math.floor(jd + 0.5);
        var f = (jd + 0.5) - z;
        if (z < 2299161) {
            var A = z;
        } else {
            var alpha = Math.floor((z - 1867216.25) / 36524.25);
            var A = z + 1 + alpha - Math.floor(alpha / 4);
        }
        var B = A + 1524;
        var C = Math.floor((B - 122.1) / 365.25);
        var D = Math.floor(365.25 * C);
        var E = Math.floor((B - D) / 30.6001);
        var day = B - D - Math.floor(30.6001 * E) + f;
        var month = (E < 14) ? E - 1 : E - 13;
        var year = (month > 2) ? C - 4716 : C - 4715;

        var k = (isLeapYear(year) ? 1 : 2);
        var doy = Math.floor((275 * month) / 9) - k * Math.floor((month + 9) / 12) + day - 30;
        return doy;
    }


    function radToDeg(angleRad) {
        return (180.0 * angleRad / Math.PI);
    }

    function degToRad(angleDeg) {
        return (Math.PI * angleDeg / 180.0);
    }

    function calcGeomMeanLongSun(t) {
        var L0 = 280.46646 + t * (36000.76983 + t * (0.0003032))
        while (L0 > 360.0) {
            L0 -= 360.0
        }
        while (L0 < 0.0) {
            L0 += 360.0
        }
        return L0		// in degrees
    }

    function calcGeomMeanAnomalySun(t) {
        var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
        return M;		// in degrees
    }

    function calcEccentricityEarthOrbit(t) {
        var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
        return e;		// unitless
    }

    function calcSunEqOfCenter(t) {
        var m = calcGeomMeanAnomalySun(t);
        var mrad = degToRad(m);
        var sinm = Math.sin(mrad);
        var sin2m = Math.sin(mrad + mrad);
        var sin3m = Math.sin(mrad + mrad + mrad);
        var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
        return C;		// in degrees
    }

    function calcSunTrueLong(t) {
        var l0 = calcGeomMeanLongSun(t);
        var c = calcSunEqOfCenter(t);
        var O = l0 + c;
        return O;		// in degrees
    }

    function calcSunTrueAnomaly(t) {
        var m = calcGeomMeanAnomalySun(t);
        var c = calcSunEqOfCenter(t);
        var v = m + c;
        return v;		// in degrees
    }

    function calcSunRadVector(t) {
        var v = calcSunTrueAnomaly(t);
        var e = calcEccentricityEarthOrbit(t);
        var R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(degToRad(v)));
        return R;		// in AUs
    }

    function calcSunApparentLong(t) {
        var o = calcSunTrueLong(t);
        var omega = 125.04 - 1934.136 * t;
        var lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
        return lambda;		// in degrees
    }

    function calcMeanObliquityOfEcliptic(t) {
        var seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * (0.001813)));
        var e0 = 23.0 + (26.0 + (seconds / 60.0)) / 60.0;
        return e0;		// in degrees
    }

    function calcObliquityCorrection(t) {
        var e0 = calcMeanObliquityOfEcliptic(t);
        var omega = 125.04 - 1934.136 * t;
        var e = e0 + 0.00256 * Math.cos(degToRad(omega));
        return e;		// in degrees
    }

    function calcSunDeclination(t) {
        var e = calcObliquityCorrection(t);
        var lambda = calcSunApparentLong(t);

        var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
        var theta = radToDeg(Math.asin(sint));
        return theta;		// in degrees
    }

    function calcEquationOfTime(t) {
        var epsilon = calcObliquityCorrection(t);
        var l0 = calcGeomMeanLongSun(t);
        var e = calcEccentricityEarthOrbit(t);
        var m = calcGeomMeanAnomalySun(t);

        var y = Math.tan(degToRad(epsilon) / 2.0);
        y *= y;

        var sin2l0 = Math.sin(2.0 * degToRad(l0));
        var sinm = Math.sin(degToRad(m));
        var cos2l0 = Math.cos(2.0 * degToRad(l0));
        var sin4l0 = Math.sin(4.0 * degToRad(l0));
        var sin2m = Math.sin(2.0 * degToRad(m));

        var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
        return radToDeg(Etime) * 4.0;	// in minutes of time
    }

    function calcHourAngleSunrise(lat, solarDec) {
        var latRad = degToRad(lat);
        var sdRad = degToRad(solarDec);
        var HAarg = (Math.cos(degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad));
        var HA = Math.acos(HAarg);
        return HA;		// in radians (for sunset, use -HA)
    }

    function isNumber(inputVal) {
        var oneDecimal = false;
        var inputStr = "" + inputVal;
        for (var i = 0; i < inputStr.length; i++) {
            var oneChar = inputStr.charAt(i);
            if (i === 0 && (oneChar === "-" || oneChar === "+")) {
                continue;
            }
            if (oneChar === "." && !oneDecimal) {
                oneDecimal = true;
                continue;
            }
            if (oneChar < "0" || oneChar > "9") {
                return false;
            }
        }
        return true;
    }


    function zeroPad(n, digits) {
        n = n.toString();
        while (n.length < digits) {
            n = '0' + n;
        }
        return n;
    }

    function calcAzEl(output, T, localtime, latitude, longitude, zone) {
        var eqTime = calcEquationOfTime(T)
        var theta = calcSunDeclination(T)
        var solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone
        var earthRadVec = calcSunRadVector(T)
        var trueSolarTime = localtime + solarTimeFix
        while (trueSolarTime > 1440) {
            trueSolarTime -= 1440
        }
        var hourAngle = trueSolarTime / 4.0 - 180.0;
        if (hourAngle < -180) {
            hourAngle += 360.0
        }
        var haRad = degToRad(hourAngle)
        var csz = Math.sin(degToRad(latitude)) * Math.sin(degToRad(theta)) + Math.cos(degToRad(latitude)) * Math.cos(degToRad(theta)) * Math.cos(haRad)
        if (csz > 1.0) {
            csz = 1.0
        } else if (csz < -1.0) {
            csz = -1.0
        }
        var zenith = radToDeg(Math.acos(csz))
        var azDenom = (Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith)))
        if (Math.abs(azDenom) > 0.001) {
            var azRad = ((Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith))) - Math.sin(degToRad(theta))) / azDenom
            if (Math.abs(azRad) > 1.0) {
                if (azRad < 0) {
                    azRad = -1.0
                } else {
                    azRad = 1.0
                }
            }
            var azimuth = 180.0 - radToDeg(Math.acos(azRad))
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
        var exoatmElevation = 90.0 - zenith

        // Atmospheric Refraction correction

        if (exoatmElevation > 85.0) {
            var refractionCorrection = 0.0;
        } else {
            var te = Math.tan(degToRad(exoatmElevation));
            if (exoatmElevation > 5.0) {
                var refractionCorrection = 58.1 / te - 0.07 / (te * te * te) + 0.000086 / (te * te * te * te * te);
            } else if (exoatmElevation > -0.575) {
                var refractionCorrection = 1735.0 + exoatmElevation * (-518.2 + exoatmElevation * (103.4 + exoatmElevation * (-12.79 + exoatmElevation * 0.711)));
            } else {
                var refractionCorrection = -20.774 / te;
            }
            refractionCorrection = refractionCorrection / 3600.0;
        }

        var solarZen = zenith - refractionCorrection;

        return (azimuth)
    }

    function calcSolNoon(jd, longitude, timezone, dst) {
        var tnoon = calcTimeJulianCent(jd - longitude / 360.0)
        var eqTime = calcEquationOfTime(tnoon)
        var solNoonOffset = 720.0 - (longitude * 4) - eqTime // in minutes
        var newt = calcTimeJulianCent(jd + solNoonOffset / 1440.0)
        eqTime = calcEquationOfTime(newt)
        var solNoonLocal = 720 - (longitude * 4) - eqTime + (timezone * 60.0)// in minutes
        if (dst) solNoonLocal += 60.0
        while (solNoonLocal < 0.0) {
            solNoonLocal += 1440.0;
        }
        while (solNoonLocal >= 1440.0) {
            solNoonLocal -= 1440.0;
        }
    }

    function dayString(jd, next, flag) {
        // returns a string in the form DDMMMYYYY[ next] to display prev/next rise/set
        // flag=2 for DD MMM, 3 for DD MM YYYY, 4 for DDMMYYYY next/prev
        if ((jd < 900000) || (jd > 2817000)) {
            var output = "error"
        } else {
            var z = Math.floor(jd + 0.5);
            var f = (jd + 0.5) - z;
            if (z < 2299161) {
                var A = z;
            } else {
                var alpha = Math.floor((z - 1867216.25) / 36524.25);
                var A = z + 1 + alpha - Math.floor(alpha / 4);
            }
            var B = A + 1524;
            var C = Math.floor((B - 122.1) / 365.25);
            var D = Math.floor(365.25 * C);
            var E = Math.floor((B - D) / 30.6001);
            var day = B - D - Math.floor(30.6001 * E) + f;
            var month = (E < 14) ? E - 1 : E - 13;
            var year = ((month > 2) ? C - 4716 : C - 4715);
            if (flag === 2)
                output = zeroPad(day, 2) + " " + monthList[month - 1].abbr;
            if (flag === 3)
                output = zeroPad(day, 2) + monthList[month - 1].abbr + year.toString();
            if (flag === 4)
                output = zeroPad(day, 2) + monthList[month - 1].abbr + year.toString() + ((next) ? " next" : " prev");
        }
        return output;
    }

    function timeDateString(JD, minutes) {
        var output = timeString(minutes, 2) + " " + dayString(JD, 0, 2);
        return output;
    }

    function timeString(minutes, flag)
    // timeString returns a zero-padded string (HH:MM:SS) given time in minutes
    // flag=2 for HH:MM, 3 for HH:MM:SS
    {
        if ((minutes >= 0) && (minutes < 1440)) {
            var floatHour = minutes / 60.0;
            var hour = Math.floor(floatHour);
            var floatMinute = 60.0 * (floatHour - Math.floor(floatHour));
            var minute = Math.floor(floatMinute);
            var floatSec = 60.0 * (floatMinute - Math.floor(floatMinute));
            var second = Math.floor(floatSec + 0.5);
            if (second > 59) {
                second = 0
                minute += 1
            }
            if ((flag == 2) && (second >= 30)) minute++;
            if (minute > 59) {
                minute = 0
                hour += 1
            }
            var output = zeroPad(hour, 2) + ":" + zeroPad(minute, 2);
            if (flag > 2) output = output + ":" + zeroPad(second, 2);
        } else {
            var output = "error"
        }
        return output;
    }

    function calcSunriseSetUTC(rise, JD, latitude, longitude) {
        var t = calcTimeJulianCent(JD);
        var eqTime = calcEquationOfTime(t);
        var solarDec = calcSunDeclination(t);
        var hourAngle = calcHourAngleSunrise(latitude, solarDec);
        //alert("HA = " + radToDeg(hourAngle));
        if (!rise) hourAngle = -hourAngle;
        var delta = longitude + radToDeg(hourAngle);
        var timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes
        return timeUTC
    }

    function calcSunriseSet(rise, JD, latitude, longitude, timezone, dst)
    // rise = 1 for sunrise, 0 for sunset
    {
        var timeUTC = calcSunriseSetUTC(rise, JD, latitude, longitude);
        var newTimeUTC = calcSunriseSetUTC(rise, JD + timeUTC / 1440.0, latitude, longitude);
        if (isNumber(newTimeUTC)) {
            var timeLocal = newTimeUTC + (timezone * 60.0)
            timeLocal += ((dst) ? 60.0 : 0.0);
            if ((timeLocal >= 0.0) && (timeLocal < 1440.0)) {
                return timeString(timeLocal, 2);
            } else {
                var jday = JD
                var increment = ((timeLocal < 0) ? 1 : -1)
                while ((timeLocal < 0.0) || (timeLocal >= 1440.0)) {
                    timeLocal += increment * 1440.0
                    jday -= increment
                }
                return timeDateString(jday, timeLocal);
            }
        } else { // no sunrise/set found
            var doy = calcDoyFromJD(JD)
            if (((latitude > 66.4) && (doy > 79) && (doy < 267)) ||
                ((latitude < -66.4) && ((doy < 83) || (doy > 263)))) {   //previous sunrise/next sunset
                if (rise) { // find previous sunrise
                    var jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone, dst)
                } else { // find next sunset
                    jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone, dst)
                }
                return dayString(jdy, 0, 3);
            } else {   //previous sunset/next sunrise
                if (rise == 1) { // find previous sunrise
                    jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone, dst)
                } else { // find next sunset
                    jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone, dst)
                }
                return dayString(jdy, 0, 3);
            }
        }
    }

    function calcJDofNextPrevRiseSet(next, rise, JD, latitude, longitude, tz, dst) {
        var julianday = JD;
        var increment = ((next) ? 1.0 : -1.0);

        var time = calcSunriseSetUTC(rise, julianday, latitude, longitude);
        while (!isNumber(time)) {
            julianday += increment;
            time = calcSunriseSetUTC(rise, julianday, latitude, longitude);
        }
        var timeLocal = time + tz * 60.0 + ((dst) ? 60.0 : 0.0)
        while ((timeLocal < 0.0) || (timeLocal >= 1440.0)) {
            var incr = ((timeLocal < 0) ? 1 : -1)
            timeLocal += (incr * 1440.0)
            julianday -= incr
        }
        return julianday;
    }
}