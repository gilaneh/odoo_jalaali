/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import field_utils from 'web.field_utils';
import time from 'web.time';

patch(field_utils.parse, 'field_utils_jalaali', {
    date(value, field, options) {
        if (!value) {
            return false;
        }
        if(typeof value == 'string'){
            const p2e = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
            value = p2e(value)

        }

        var datePattern = time.getLangDateFormat();
        var datePatternWoZero = time.getLangDateFormatWoZero();
        var date;
        const smartDate = this.parseSmartDateInput(value);
        if (smartDate) {
            date = smartDate;
        } else {
            if (options && options.isUTC) {
                value = value.padStart(10, "0"); // server may send "932-10-10" for "0932-10-10" on some OS
                date = moment.utc(value);
            } else {
                date = moment.utc(value, [datePattern, datePatternWoZero, moment.ISO_8601]);
            }
        }
        if (date.isValid()) {
            if (date.year() === 0) {
                date.year(moment.utc().year());
            }
            if (date.year() >= 1000){
                date.toJSON = function () {
                    return this.clone().locale('en').format('YYYY-MM-DD');
                };
                return date;
            }
        }
        throw new Error(_.str.sprintf(core._t("'%s' is not a correct date"), value));
    },
    parseSmartDateInput(value) {
        const units = {
            d: 'days',
            m: 'months',
            w: 'weeks',
            y: 'years',
        };
        const re = new RegExp(`^([+-])(\\d+)([${Object.keys(units).join('')}]?)$`);
        const match = re.exec(value);
        if (match) {
            let date = moment();
            const offset = parseInt(match[2], 10);
            const unit = units[match[3] || 'd'];
            if (match[1] === '+') {
                date.add(offset, unit);
            } else {
                date.subtract(offset, unit);
            }
            return date;
        }
        return false;
    },
})