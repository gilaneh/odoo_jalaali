/** @odoo-module **/
import { session } from "@web/session";
import { patch } from "@web/core/utils/patch";
import { DateTimePicker } from "@web/core/datetime/datetime_picker";
import * as DateTimePickers from "@web/core/datetime/datetime_picker";
import { Component, onWillRender, onWillUpdateProps, useState } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import {
    MAX_VALID_DATE,
    MIN_VALID_DATE,
    clampDate,
    is24HourFormat,
    isInRange,
    isMeridiemFormat,
    today,
} from "@web/core/l10n/dates";
import { localization } from "@web/core/l10n/localization";
import { ensureArray } from "@web/core/utils/arrays";
const { DateTime, Info } = luxon;

//console.log('dp fa', DateTimePickers )
/**
 * @param {number} min
 * @param {number} max
 */
const numberRange = (min, max) => [...Array(max - min)].map((_, i) => i + min);


/**
 * @param {DateTime} date
 */
const getStartOfDecade = (date) => Math.floor(date.year / 10) * 10;

/**
 * Gilaneh
 * @param {DateTime} date
 * @returns {String} jalaali year
 */
const jGetStartOfDecade = (date) => getStartOfDecade({'year': jalaali.toJalaali(date.year, 3, 23).jy});

/**
 * Gilaneh
 * @param {DateTime} date
 * @returns {String} jalaali year
 */
const jGetStartOfCentury = (date) => Math.floor(jalaali.toJalaali(date.year, 3, 23).jy / 100) * 100;

/**
 * Gilaneh
 * @param {DateTime} date
 * @returns {DateTime}
 */
const jalaaliDate = (date) => {
        if (session.user_context.lang == 'fa_IR' && date.year < 1600){
            const gDate = jalaali.toGregorian(date.year, date.month, date.day)
            date = DateTime.fromString(`${gDate.gy}-${gDate.gm}-${gDate.gd}`, JALAALI_FORMAT)
        }
        return date
    }

const jalaaliDateRange = (date, duration='month') => {
        let gDateStart;
        let gDateEnd;
        let jDate = jalaali.toJalaali(date.year, date.month, date.day)

        if(duration == 'month'){
            gDateStart = jalaali.toGregorian(jDate.jy, jDate.jm, 1)
            gDateEnd = jalaali.toGregorian(jDate.jy, jDate.jm, jalaali.jalaaliMonthLength(jDate.jy, jDate.jm))
        }
        else if(duration == 'year'){
            jDate = jalaali.toJalaali(date.year, 3, 23)
            gDateStart = jalaali.toGregorian(jDate.jy, 1, 1)
            gDateEnd = jalaali.toGregorian(jDate.jy, 12, jalaali.jalaaliMonthLength(jDate.jy, 12))
        }
        else if(duration == 'decades'){
            jDate = jalaali.toJalaali(date.year, 3, 23)
            gDateStart = jalaali.toGregorian(jDate.jy, 1, 1)
            gDateEnd = jalaali.toGregorian(jDate.jy + 9, 12, jalaali.jalaaliMonthLength(jDate.jy + 9, 12))
        }
        else{
            gDateStart = jalaali.toGregorian(jDate.jy, jDate.jm, 1)
            gDateEnd = jalaali.toGregorian(jDate.jy, jDate.jm, jalaali.jalaaliMonthLength(jDate.jy, jDate.jm))
        }

        const startDate = DateTime.fromString(`${gDateStart.gy}-${gDateStart.gm}-${gDateStart.gd} 0:0:0`, JALAALI_DataTime_FORMAT)
        const endDate = DateTime.fromString(`${gDateEnd.gy}-${gDateEnd.gm}-${gDateEnd.gd} 23:59:59`, JALAALI_DataTime_FORMAT)

        return [startDate, endDate]
    }

/**
 * @param {Object} params
 * @param {boolean} [params.isOutOfRange=false]
 * @param {boolean} [params.isValid=true]
 * @param {keyof DateTime} params.label
 * @param {string} [params.extraClass]
 * @param {[DateTime, DateTime]} params.range
 * @returns {DateItem}
 */
const toDateItem = ({ isOutOfRange = false, isValid = true, label, range, extraClass }) => ({
    id: range[0].toISODate(),
    includesToday: isInRange(today(), range),
    isOutOfRange,
    isValid,
    // Gilaneh
    label: session.user_context.lang == 'fa_IR' ? toDateItemLabel(range[0], label) : String(range[0][label]) ,
    range,
    extraClass,
});

/**
 * Gilaneh
 * @param {DateItem[]} weekDayItems
 * @returns {WeekItem}
 */
const toDateItemLabel = ( range, label) => {
    let theLabel = ''
    if (label == 'day'){
        theLabel = String(jalaali.toJalaali(range.year, range.month, range.day).jd)
    } else if (label == 'monthShort'){
        theLabel = range.plus({month: 1})[label]
    } else if (label == 'year' || label == 'decades'){
        theLabel = String(jalaali.toJalaali(range.year, range.month + 1, range.day).jy)
    } else{
        theLabel = range[label]
    }
    return theLabel
}
/**
 * @param {DateTime} date
 */
const getStartOfWeek = (date) => {
    const { weekStart } = localization;
    return date.set({ weekday: date.weekday < weekStart ? weekStart - 7 : weekStart });
};

/**
 * @param {DateItem[]} weekDayItems
 * @returns {WeekItem}
 */
const toWeekItem = (weekDayItems) => ({
    number: weekDayItems[3].range[0].weekNumber,
    days: weekDayItems,
});

// Time constants
const HOURS = numberRange(0, 24).map((hour) => [hour, String(hour)]);
const MINUTES = numberRange(0, 60).map((minute) => [minute, String(minute || 0).padStart(2, "0")]);
const SECONDS = [...MINUTES];
const MERIDIEMS = ["AM", "PM"];
const JALAALI_FORMAT = 'yyyy-M-d'
const JALAALI_DataTime_FORMAT = 'yyyy-M-d H:m:s'

/**
 * Odoo
 * Precision levels
 * @type {Map<PrecisionLevel, PrecisionInfo>}
 */
const PRECISION_LEVELS = new Map()
    .set("days", {
        mainTitle: _t("Select month"),
        nextTitle: _t("Next month"),
        prevTitle: _t("Previous month"),
        step: { month: 1 },
        getTitle: (date, { additionalMonth }) => {
            const titles = [`${date.monthLong} ${date.year}`];
            if (additionalMonth) {
                const next = date.plus({ month: 1 });
                titles.push(`${next.monthLong} ${next.year}`);
            }
            return titles;
        },
        getItems: (
            date,
            { additionalMonth, maxDate, minDate, showWeekNumbers, isDateValid, dayCellClass }
        ) => {
            const startDates = [date];
            if (additionalMonth) {
                startDates.push(date.plus({ month: 1 }));
            }
            return startDates.map((date, i) => {
                const monthRange = [date.startOf("month"), date.endOf("month")];
                /** @type {WeekItem[]} */
                const weeks = [];

                // Generate 6 weeks for current month
                let startOfNextWeek = getStartOfWeek(monthRange[0]);
                for (let w = 0; w < 6; w++) {
                    const weekDayItems = [];
                    // Generate all days of the week
                    for (let d = 0; d < 7; d++) {
                        const day = startOfNextWeek.plus({ day: d });
                        const range = [day, day.endOf("day")];
                        const dayItem = toDateItem({
                            isOutOfRange: !isInRange(day, monthRange),
                            isValid: isInRange(range, [minDate, maxDate]) && isDateValid?.(day),
                            label: "day",
                            range,
                            extraClass: dayCellClass?.(day) || "",
                        });
                        weekDayItems.push(dayItem);
                        if (d === 6) {
                            startOfNextWeek = day.plus({ day: 1 });
                        }
                    }
                    weeks.push(toWeekItem(weekDayItems));
                }

                // Generate days of week labels
                const daysOfWeek = weeks[0].days.map((d) => [
                    d.range[0].weekdayShort,
                    d.range[0].weekdayLong,
                    Info.weekdays("narrow", { locale: d.range[0].locale })[d.range[0].weekday - 1],
                ]);
                if (showWeekNumbers) {
                    daysOfWeek.unshift(["#", _t("Week numbers"), "#"]);
                }

                return {
                    id: `__month__${i}`,
                    number: monthRange[0].month,
                    daysOfWeek,
                    weeks,
                };
            });
        },
    })
    .set("months", {
        mainTitle: _t("Select year"),
        nextTitle: _t("Next year"),
        prevTitle: _t("Previous year"),
        step: { year: 1 },
        getTitle: (date) => String(date.year),
        getItems: (date, { maxDate, minDate }) => {
            const startOfYear = date.startOf("year");
            return numberRange(0, 12).map((i) => {
                const startOfMonth = startOfYear.plus({ month: i });
                const range = [startOfMonth, startOfMonth.endOf("month")];
                return toDateItem({
                    isValid: isInRange(range, [minDate, maxDate]),
                    label: "monthShort",
                    range,
                });
            });
        },
    })
    .set("years", {
        mainTitle: _t("Select decade"),
        nextTitle: _t("Next decade"),
        prevTitle: _t("Previous decade"),
        step: { year: 10 },
        getTitle: (date) => `${getStartOfDecade(date) - 1} - ${getStartOfDecade(date) + 10}`,
        getItems: (date, { maxDate, minDate }) => {
            const startOfDecade = date.startOf("year").set({ year: getStartOfDecade(date) });
            return numberRange(-GRID_MARGIN, GRID_COUNT + GRID_MARGIN).map((i) => {
                const startOfYear = startOfDecade.plus({ year: i });
                const range = [startOfYear, startOfYear.endOf("year")];
                return toDateItem({
                    isOutOfRange: i < 0 || i >= GRID_COUNT,
                    isValid: isInRange(range, [minDate, maxDate]),
                    label: "year",
                    range,
                });
            });
        },
    })
    .set("decades", {
        mainTitle: _t("Select century"),
        nextTitle: _t("Next century"),
        prevTitle: _t("Previous century"),
        step: { year: 100 },
        getTitle: (date) => `${getStartOfCentury(date) - 10} - ${getStartOfCentury(date) + 100}`,
        getItems: (date, { maxDate, minDate }) => {
            const startOfCentury = date.startOf("year").set({ year: getStartOfCentury(date) });
            return numberRange(-GRID_MARGIN, GRID_COUNT + GRID_MARGIN).map((i) => {
                const startOfDecade = startOfCentury.plus({ year: i * 10 });
                const range = [startOfDecade, startOfDecade.plus({ year: 10, millisecond: -1 })];
                return toDateItem({
                    label: "year",
                    isOutOfRange: i < 0 || i >= GRID_COUNT,
                    isValid: isInRange(range, [minDate, maxDate]),
                    range,
                });
            });
        },
    });

/**
 * Gilaneh
 * Precision levels
 * @type {Map<PrecisionLevel, PrecisionInfo>}
 */
const PRECISION_LEVELS_fa = new Map()
    .set("days", {
        mainTitle: _t("Select month"),
        nextTitle: _t("Next month"),
        prevTitle: _t("Previous month"),
        step: { month: 1 },
        getTitle: (date, { additionalMonth }) => {

//            console.log('getTitle',jalaali.toJalaali(date.year, date.month, date.day).jy )
//            const titles = [`${date.monthLong} ${date.year}`];
            if (date.year < 1600){
                let jDate = jalaali.toGregorian(date.year, date.month, date.day)
                date = DateTime.fromString(`${jDate.gy}-${jDate.gm}-${jDate.gd}`, JALAALI_FORMAT)
            }
            const titles = [`${date.plus({'month': 1}).monthLong} ${jalaali.toJalaali(date.year, date.month, date.day).jy}`]

            if (additionalMonth) {
                const nextDate = date.plus({ month: 1 });
                const next = jalaali.toJalaali(date.year, date.month + 1, date.day)
                titles.push(`${nextDate.plus({'month': 1}).monthLong} ${next.jy}`);
            }
            return titles;
        },
        getItems: (
            date,
            { additionalMonth, maxDate, minDate, showWeekNumbers, isDateValid, dayCellClass }
        ) => {

            date = jalaaliDate(date)
            const startDates = [date];

//            console.log('getItems', date)

            if (additionalMonth) {
                startDates.push(date.plus({ month: 1 }));
            }
            return startDates.map((date, i) => {

//                const monthRange = [date.startOf("month"), date.endOf("month")];
                const monthRange = jalaaliDateRange(date);
                /** @type {WeekItem[]} */
                const weeks = [];

                // Generate 6 weeks for current month
                let startOfNextWeek = getStartOfWeek(monthRange[0]);
//                console.log('startOfNextWeek', startOfNextWeek, startOfNextWeek.plus({ day: 1 }))
                for (let w = 0; w < 6; w++) {
                    const weekDayItems = [];
                    // Generate all days of the week
                    for (let d = 0; d < 7; d++) {
                        const day = startOfNextWeek.plus({ day: d });
                        const range = [day, day.endOf("day")];
                        const dayItem = toDateItem({
                            isOutOfRange: !isInRange(day, monthRange),
                            isValid: isInRange(range, [minDate, maxDate]) && isDateValid?.(day),
                            label: "day",
                            range,
                            extraClass: dayCellClass?.(day) || "",
                        });
                        weekDayItems.push(dayItem);
                        if (d === 6) {
                            startOfNextWeek = day.plus({ day: 1 });
                        }
                    }
                    weeks.push(toWeekItem(weekDayItems));
                }

                // Generate days of week labels
                const daysOfWeek = weeks[0].days.map((d) => [
                    d.range[0].weekdayShort,
                    d.range[0].weekdayLong,
                    Info.weekdays("narrow", { locale: d.range[0].locale })[d.range[0].weekday - 1],
                ]);
                if (showWeekNumbers) {
                    daysOfWeek.unshift(["#", _t("Week numbers"), "#"]);
                }
//                console.log('weeks[0]', weeks[0]['days'][0])

                return {
                    id: `__month__${i}`,
                    number: monthRange[0].month,
                    daysOfWeek,
                    weeks,
                };
            });
        },
    })
    .set("months", {
        mainTitle: _t("Select year"),
        nextTitle: _t("Next year"),
        prevTitle: _t("Previous year"),
        step: { year: 1 },
        getTitle: (date) => {
            date = jalaaliDate(date)
            return String(jalaali.toJalaali(date.year, date.month, date.day).jy)
            },
//        getTitle: (date) => String(jalaali.toJalaali(date.year, date.month, date.day).jy),
        getItems: (date, { maxDate, minDate }) => {
            date = jalaaliDate(date)
//            console.log('getItems month:', date, jalaaliDate(date))
            const startOfYear = date.startOf("year");
            return numberRange(0, 12).map((i) => {
                const startOfMonth = startOfYear.plus({ month: i + 3 });
//                const range = [startOfMonth, startOfMonth.endOf("month")];
                const range = jalaaliDateRange(startOfMonth, 'month');
//                console.log('range:', startOfMonth)
                return toDateItem({
                    isValid: isInRange(range, [minDate, maxDate]),
                    label: "monthShort",
                    range,
                });
            });
        },
    })
    .set("years", {
        mainTitle: _t("Select decade"),
        nextTitle: _t("Next decade"),
        prevTitle: _t("Previous decade"),
        step: { year: 10 },
        getTitle: (date) => {
            date = jalaaliDate(date)
            return `${jGetStartOfDecade(date)} - ${jGetStartOfDecade(date) + 9}`
        },
        getItems: (date, { maxDate, minDate }) => {
            date = jalaaliDate(date)
            const jDateYear = jGetStartOfDecade(date)
            const jStartOfDecade= jalaali.toGregorian(jDateYear, 1, 1)
//            const startOfDecade = date.startOf("year").set({ year: jStartOfDecade.gy });
            const startOfDecade = date.set({ year: jStartOfDecade.gy });
            return numberRange(-GRID_MARGIN, GRID_COUNT + GRID_MARGIN).map((i) => {
                const startOfYear = startOfDecade.plus({ year: i });
//                const range = [startOfYear, startOfYear.endOf("year")];
                const range = jalaaliDateRange(startOfYear, 'year');
//                console.log('year', `[${i}]`, range[0].toFormat(JALAALI_FORMAT), range[1].toFormat(JALAALI_FORMAT),)
                return toDateItem({
                    isOutOfRange: i < 0 || i >= GRID_COUNT,
                    isValid: isInRange(range, [minDate, maxDate]),
                    label: "year",
                    range,
                });
            });
        },
    })
    .set("decades", {
        mainTitle: _t("Select century"),
        nextTitle: _t("Next century"),
        prevTitle: _t("Previous century"),
        step: { year: 100 },
        getTitle: (date) => {
            date = jalaaliDate(date)
            return `${jGetStartOfCentury(date)} - ${jGetStartOfCentury(date) + 100}`
        },
//        getTitle: (date) => `${getStartOfCentury(date) - 10} - ${getStartOfCentury(date) + 100}`,
        getItems: (date, { maxDate, minDate }) => {
            date = jalaaliDate(date)
            const jDateYear = jGetStartOfCentury(date)
            const jStartOfCentury = jalaali.toGregorian(jDateYear, 1, 1)
            const startOfCentury = date.set({ year: jStartOfCentury.gy });
//                console.log('\nstartOfCentury', startOfCentury.toFormat(JALAALI_FORMAT),jDateYear, jStartOfCentury)

            return numberRange(-GRID_MARGIN, GRID_COUNT + GRID_MARGIN).map((i) => {

                const startOfDecade = startOfCentury.plus({ year: i * 10 });
//                const range = [startOfDecade, startOfDecade.plus({ year: 10, millisecond: -1 })];
                const range = jalaaliDateRange(startOfDecade, 'decades');
//                console.log('Century', i, range[0].toFormat(JALAALI_FORMAT), range[1].toFormat(JALAALI_FORMAT))
                return toDateItem({
                    label: "year",
                    isOutOfRange: i < 0 || i >= GRID_COUNT,
                    isValid: isInRange(range, [minDate, maxDate]),
                    range,
                });
            });
        },
    });



// Other constants
const GRID_COUNT = 10;
const GRID_MARGIN = 1;
const NULLABLE_DATETIME_PROPERTY = [DateTime, { value: false }, { value: null }];

//console.log('PRECISION_LEVELS_fa', DateTimePickers)
patch(DateTimePicker.prototype,{
    get activePrecisionLevel() {
        // Gilaneh
        return session.user_context.lang == 'fa_IR' ? PRECISION_LEVELS_fa.get(this.state.precision) : PRECISION_LEVELS.get(this.state.precision);
    },
    adjustFocus(values, focusedDateIndex) {
       if (
            !this.shouldAdjustFocusDate &&
            this.state.focusDate &&
            focusedDateIndex === this.props.focusedDateIndex
        ) {
            return;
        }

        let dateToFocus =
            values[focusedDateIndex] || values[focusedDateIndex === 1 ? 0 : 1] || today();

        if (
            this.additionalMonth &&
            focusedDateIndex === 1 &&
            values[0] &&
            values[1] &&
            values[0].month !== values[1].month
        ) {
            dateToFocus = dateToFocus.minus({ month: 1 });
        }

        this.shouldAdjustFocusDate = false;
//        this.state.focusDate = this.clamp(dateToFocus.startOf("month"));

        // Gilaneh
        if (session.user_context.lang == 'fa_IR'){
            let jdateToFocus = jalaali.toJalaali(dateToFocus.year, dateToFocus.month, dateToFocus.day )
//            console.log('jdateToFocus',jdateToFocus)
            dateToFocus = DateTime.fromString(`${jdateToFocus.jy}-${jdateToFocus.jm}-1`, JALAALI_FORMAT)
            this.state.focusDate = this.clamp(dateToFocus);
        } else{
            this.state.focusDate = this.clamp(dateToFocus.startOf("month"));
        }

    },
        /**
     * @param {PrecisionLevel} minPrecision
     * @param {PrecisionLevel} maxPrecision
     */
    filterPrecisionLevels(minPrecision, maxPrecision) {
        // Gilaneh
        const levels = session.user_context.lang == 'fa_IR' ? [...PRECISION_LEVELS_fa.keys()] : [...PRECISION_LEVELS.keys()];
        return levels.slice(levels.indexOf(minPrecision), levels.indexOf(maxPrecision) + 1);
    },




    })



patch(DateTimePicker.props, {
        ...DateTimePicker.props,
        maxPrecision: {
        // Gilaneh
            type: session.user_context.lang == 'fa_IR' ? [...PRECISION_LEVELS_fa.keys()].map((value) => ({ value })) : [...PRECISION_LEVELS.keys()].map((value) => ({ value })),
            lang: session.user_context.lang,
            optional: true,
        },
        minDate: { type: [NULLABLE_DATETIME_PROPERTY, { value: "today" }], optional: true },
        minPrecision: {
        // Gilaneh
            type: session.user_context.lang == 'fa_IR' ? [...PRECISION_LEVELS_fa.keys()].map((value) => ({ value })) : [...PRECISION_LEVELS.keys()].map((value) => ({ value })),
            optional: true,
        },
})



