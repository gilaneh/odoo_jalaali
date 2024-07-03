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
//            console.log('formatDateTime 2.1',format, value.setZone("default").toFormat(format))

            // Gilaneh
        if(session.user_context.lang == 'fa_IR' && value.year > 1600){
//            console.log('formatDateTime 2.2',value.setZone("default").reconfigure({ outputCalendar: "persian" }).setLocale("fa").toFormat(format))
            return value.setZone("default").reconfigure({ outputCalendar: "persian" }).setLocale("fa").toFormat(format);
        }
        return value.setZone("default").toFormat(format);

    },

    parseDateTime(value, options = {}) {
    let result = super.parseDateTime(...arguments)

        // Gilaneh
//        console.log('return result', result )
        if(session.user_context.lang == 'fa_IR' && result.year < 1600){
            const gDate = jalaali.toGregorian(result.year, result.month, result.day)
//            console.log('parseDateTime 1.1', typeof result, result)
//            console.log('parseDateTime 1.2', result.toFormat('yyyy-M-d H:m'), `${gDate.gy}-${gDate.gm}-${gDate.gd} ${result.hour}:${result.minute}`)
            result = DateTime.fromString(`${gDate.gy}-${gDate.gm}-${gDate.gd} ${result.hour}:${result.minute}`, 'yyyy-M-d H:m')
//            console.log('parseDateTime 2', result.toFormat('yyyy-M-d H:m'))

    }
//            console.log('parseDateTime 3', result.toFormat('yyyy-M-d H:m'))
    return result.setZone("default");
}

})






