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
/**
* Gilaneh
 * @private
 * It returns True if user language is Persian on web or website
 * @param {Object} session
 * @returns {Boolean}
*/
export const isFaLang = (_session) => {
    let isFa = false
    if (_session.is_frontend){
     isFa = session.lang_url_code == 'fa' ? true : false
    }else{
        isFa = _session.bundle_params.lang && _session.bundle_params.lang == 'fa_IR' ? true : false
    }
    return isFa
}

patch(Dates, {
    /**
    * Gilaneh
    * @override
    */
    formatDate(value, options = {}) {
        if (!value) {
            return "";
        }
        const format = options.format || localization.dateFormat;
        // Gilaneh
//        console.log('formatDate', value.year, session.bundle_params.lang)

        if(isFaLang(session) && value.year > 1600){
            return value.setZone("default").reconfigure({ outputCalendar: "persian" }).setLocale("fa").toFormat(format);
        }
        return value.toFormat(format);
    },
    /**
    * Gilaneh
    * @override
    */
    formatDateTime(value, options={} ) {
        if (!value) {
            return "";
        }
        const format = options.format || localization.dateTimeFormat;
//        console.log('formatDateTime', value.year, session.bundle_params.lang, session.lang_url_code, session)

            // Gilaneh
        if(isFaLang(session) && value.year > 1600){
            return value.setZone("default").reconfigure({ outputCalendar: "persian" }).setLocale("fa").toFormat(format);
        }
        return value.setZone("default").toFormat(format);

    },
    /**
    * Gilaneh
    * @override
    */
    parseDate(value, options = {}) {
        const parsed = Dates.parseDateTime(value, { ...options, format: options.format || localization.dateFormat });
        return parsed && parsed.startOf("day");
    },
    /**
    * Gilaneh
    * @override
    */
    parseDateTime(value, options = {}) {
        if (!value) {
            return false;
        }
        let result = super.parseDateTime(...arguments)
            // Gilaneh
//        console.log('parseDateTime G1', result ? result.toISODate() : "No result", session )
//        console.log('parseDateTime G1', result  )

        if(isFaLang(session) && result.year < 1600){
            const gDate = jalaali.toGregorian(result.year, result.month, result.day)
            result = DateTime.fromString(`${gDate.gy}-${gDate.gm}-${gDate.gd} ${result.hour}:${result.minute}`, 'yyyy-M-d H:m')
        }
//        console.log('parseDateTime G2', result ? result.toISODate() : "No result" )
        return result.setZone("default");
    },

})






