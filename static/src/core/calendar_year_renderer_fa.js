/** @odoo-module **/

import { CalendarYearRenderer } from "@web/views/calendar/calendar_year/calendar_year_renderer";
import { session } from "@web/session";
import { patch } from "@web/core/utils/patch";
//console.log('c y r')
//patch(CalendarYearRenderer.prototype, {
//    getDateWithMonth(month) {
//    super.getDateWithMonth(...arguments)
////    console.log('getDateWithMonth', this.props.model.date.set({ month: this.months.indexOf(month) + 1 + 3 }).toISO() )
//        return this.props.model.date.set({ month: this.months.indexOf(month) + 1 }).toISO();
//    }
//})