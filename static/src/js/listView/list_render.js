/** @odoo-module **/

import core from 'web.core';
import dom from 'web.dom';
import BasicController from 'web.BasicController';
import ListRenderer from 'web.ListRenderer';
// addons/web/static/src/legacy/js/views/list/list_renderer.js
import relational_fields from 'web.relational_fields';
let FieldX2Many = relational_fields.FieldX2Many
import utils from 'web.utils';
import { WidgetAdapterMixin } from 'web.OwlCompatibility';
var _t = core._t;


BasicController.include({
    /** This make sure the x2m record form will transfer correct date format to the parent view.
    *  Ex: In a form with a one2many field which is a tree view, if you click on a row, it will open a dialog box to
    *  edit the field records. If you change the date field, it makes sure the correct date will be passed to the
    *   parrent form on save button.
    */
    _applyChanges: function (dataPointID, changes, event) {
//        console.log('changes.date_deadline', changes, Object.keys(changes))
        Object.keys(changes).forEach(change => {
            if(changes[change]._isAMomentObject){
                changes[change] = moment(changes[change].format('YYYY-MM-DD') + ' 03:30')
            }
        })
        return this._super.apply(this, arguments);
    },
})

FieldX2Many.include({

    /**
     * This fixes the jalaali date records on one2many list records in a form.
     * Before it, when you update
     *
     * @private
     * @param {string} recordID
     * @returns {Promise} resolved if the line was properly saved or discarded.
     *                     rejected if the line could not be saved and the user
     *                     did not agree to discard.
     */
    _saveLine: function(recordID){
        let self = this;
//        todo: It must be prepare for datetime fields too.

//        console.log('_saveLine2', recordID, self.value.data)

        if (self.value.data){

            let fields = self.value.data[0].fields
            let fieldNames = Object.keys(fields)
            let date_fields = fieldNames.filter(rec => fields[rec].type == 'date')
//            console.log('rec', fieldNames.filter(rec => fields[rec].type == 'date'))
            self.value.data.forEach(rec => {
                date_fields.forEach(date_f => {
//                        console.log('recs', rec.data[date_f])
                    if(rec.data[date_f]){
//                        console.log('[_saveLine1]', rec.data[date_f] )
                        rec.data[date_f] = moment(rec.data[date_f].format('YYYY-MM-DD'))
//                        console.log('[_saveLine2]', rec.data[date_f] )
                    }
                })
                rec
            })
//            console.log('recs', self.value.data)
        }
        return this._super.apply(this, arguments);
    },
})

ListRenderer.include({
    _renderBodyCell: function (record, node, colIndex, options) {
        let $cell = this._super.apply(this, arguments);
    //        console.log('render', this._getCalendar())
    //        if (this.state.fields[node.attrs.name].type == 'date' && formattedValue.includes('j') &&  this.getCalendar()=='j'){
    //           formattedValue = moment(formattedValue.replaceAll('j', '')).format('jYYYY/jMM/jDD')
    //            console.log('$td[0]:', formattedValue, this.state)
    //        }
        return $cell
    },

    _getCalendar: function(){
        /// Within odoo environment we may use user_context.getCalendar
        var user_context = ((typeof odoo=='undefined'?{}:odoo).session_info ||{}).user_context;
        if (user_context && typeof user_context.getCalendar==='function')
        {
            return user_context.getCalendar();
        }
        /// If calendar is set on user_context
        if (user_context && typeof user_context.calendar=='string'){
            return user_context.calendar.startsWith('j')?'j':'';
        }
        // Otherwise if 'calendar' is present on 'options' return it
        // if not, return jalali calendar if locale is fa.
        return (this._options || {}).calendar || (moment.locale()=='fa'?'j':'');
    },
})