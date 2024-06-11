/** @odoo-module **/
import time from 'web.time'
import { Activity } from '@mail/components/activity/activity';
import { patch } from 'web.utils';

patch(Activity.prototype, 'datetime_jalaali', {
    get formattedCreateDatetime() {
        this._super()
            const momentCreateDate = moment(time.auto_str_to_date(this.activity.dateCreate));
            const datetimeFormat = time.getLangDatetimeFormat();
            return momentCreateDate.format(datetimeFormat);
    },
    get formattedDeadlineDate() {
        this._super()
        const momentDeadlineDate = moment(time.auto_str_to_date(this.activity.dateDeadline));
        const datetimeFormat = time.getLangDateFormat();
        return momentDeadlineDate.format(datetimeFormat);
    }
})