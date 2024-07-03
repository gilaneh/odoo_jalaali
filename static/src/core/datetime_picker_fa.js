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

console.log('dp fa', DateTimePickers )
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



// Time constants
const HOURS = numberRange(0, 24).map((hour) => [hour, String(hour)]);
const MINUTES = numberRange(0, 60).map((minute) => [minute, String(minute || 0).padStart(2, "0")]);
const SECONDS = [...MINUTES];
const MERIDIEMS = ["AM", "PM"];
const JALAALI_FORMAT = 'yyyy-M-d'
const JALAALI_DataTime_FORMAT = 'yyyy-M-d H:m:s'
/**
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
            const titles = [`${date.monthLong} fa ${date.year}`];
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

patch(DateTimePicker.prototype, {
zoomOrSelect(datetime){
    let res = super.zoomOrSelect(...arguments)
    console.log('zoomOrSelect fa', res, ...arguments, datetime )
}

})

patch(DateTimePicker, {
props = {

}

})







