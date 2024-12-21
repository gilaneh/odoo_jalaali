
import { patch } from "@web/core/utils/patch";
import { session } from "@web/session";
import { formatDate } from "@web/core/l10n/dates";
import { ActivityCell } from "@mail/views/web/activity/activity_cell";

import { isFaLang } from "../core/l10n/dates_fa";

patch(ActivityCell.prototype, {
    get reportingDateFormatted() {
        let date = formatDate(luxon.DateTime.fromISO(this.props.reportingDate));
        // Giladoo
        if(isFaLang(session)){
              date = formatDate(luxon.DateTime.fromISO(this.props.reportingDate).reconfigure({ outputCalendar: "persian" }));
        }
        return date
    }
})
