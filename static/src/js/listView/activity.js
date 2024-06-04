/** @odoo-module **/
import time from 'web.time'
import { Activity } from '@mail/components/activity/activity';
import { patch } from 'web.utils';
            console.log('formattedCreateDatetime 1', )

patch(Activity.prototype, 'datetime_jalaali', {
    get formattedCreateDatetime() {
        this._super()
            const momentCreateDate = moment(time.auto_str_to_date(this.activity.dateCreate));
            const datetimeFormat = time.getLangDatetimeFormat();
            // todo: ARASH, it gets default format and needed to convert to jalaali format.
//        const datetimeFormat = 'jYYYY/jMM/jDD';
//            console.log('formattedCreateDatetime patch', )

            return momentCreateDate.format(datetimeFormat);

    },

    get formattedDeadlineDate() {
        this._super()
        const momentDeadlineDate = moment(time.auto_str_to_date(this.activity.dateDeadline));
        const datetimeFormat = time.getLangDateFormat();
//        const datetimeFormat = 'jYYYY/jMM/jDD';
//            console.log('format patch', datetimeFormat)

        return momentDeadlineDate.format(datetimeFormat);
    }
})