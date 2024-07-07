/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import * as Dates from "@web/core/l10n/dates";
import { localization } from "@web/core/l10n/localization";
import { _t } from "@web/core/l10n/translation";
import { memoize } from "@web/core/utils/functions";
import { ensureArray } from "@web/core/utils/arrays";
const { DateTime, Settings } = luxon;
import { session } from "@web/session";

function isValidDate(date) {
    return date && date.isValid && Dates.isInRange(date, [Dates.MIN_VALID_DATE, Dates.MAX_VALID_DATE]);
}

patch(Dates, {
    formatDate(value, options = {}) {
        if (!value) {
            return "";
        }
        const format = options.format || localization.dateFormat;
        // Gilaneh
        if(session.user_context.lang == 'fa_IR' && value.year > 1600){
            return value.setZone("default").reconfigure({ outputCalendar: "persian" }).setLocale("fa").toFormat(format);
        }
        return value.toFormat(format);
    },
    formatDateTime(value, options={} ) {
        if (!value) {
            return "";
        }
        const format = options.format || localization.dateTimeFormat;

            // Gilaneh
        if(session.user_context.lang == 'fa_IR' && value.year > 1600){
            return value.setZone("default").reconfigure({ outputCalendar: "persian" }).setLocale("fa").toFormat(format);
        }
        return value.setZone("default").toFormat(format);

    },
    parseDate(value, options = {}) {
        const parsed = Dates.parseDateTime(value, { ...options, format: options.format || localization.dateFormat });
        return parsed && parsed.startOf("day");
    },
    parseDateTime(value, options = {}) {
        if (!value) {
            return false;
        }
        let result = super.parseDateTime(...arguments)
            // Gilaneh
        if(session.user_context.lang == 'fa_IR' && result.year < 1600){
            const gDate = jalaali.toGregorian(result.year, result.month, result.day)
            result = DateTime.fromString(`${gDate.gy}-${gDate.gm}-${gDate.gd} ${result.hour}:${result.minute}`, 'yyyy-M-d H:m')
        }
        return result.setZone("default");
    },

})






