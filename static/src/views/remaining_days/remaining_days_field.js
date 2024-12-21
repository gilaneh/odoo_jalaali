
import { RemainingDaysField } from "@web/views/fields/remaining_days/remaining_days_field"
import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";


patch(RemainingDaysField.prototype, {

    get diffString() {
        if (this.diffDays === null) {
            return "";
        }
        switch (this.diffDays) {
            case -1:
                return _t("Yesterday");
            case 0:
                return _t("Today");
            case 1:
                return _t("Tomorrow");
        }
        if (Math.abs(this.diffDays) > 99) {
            return this.formattedValue;
        }
        if (this.diffDays < 0) {
        // TODO: return _t("%s days ago", -this.diffDays);
        // Translation does not work for "%s days ago"

            let inDays  = _t("Days")
//            console.log('aaaaa:',inDays  )
            return _t("%s %s", -this.diffDays, inDays );
        }
        // TODO:  return _t("In %s days", this.diffDays);
        // Translation does not work for "In %s days"
        let inDays = _t("Days")
        return _t("%s %s", this.diffDays, inDays);
    }
})