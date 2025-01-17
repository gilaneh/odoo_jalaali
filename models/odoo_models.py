import logging

import jdatetime
import datetime
from odoo import models, api
# from odoo.tools import date_utils, get_lang, Query, SQL, sql
from odoo.tools import date_utils, get_lang
from odoo.osv import expression
from jdatetimext import j_start, j_end
from odoo.tools.misc import CountingStream, clean_context, DEFAULT_SERVER_DATETIME_FORMAT, DEFAULT_SERVER_DATE_FORMAT, get_lang

import pytz
import babel
import logging
import dateutil
# from icecream import ic

_logger = models._logger

CUSTOM_READ_GROUP_DISPLAY_FORMAT = {
    # Careful with week/year formats:
    #  - yyyy (lower) must always be used, *except* for week+year formats
    #  - YYYY (upper) must always be used for week+year format
    #         e.g. 2006-01-01 is W52 2005 in some locales (de_DE),
    #                         and W1 2006 for others
    #
    # Mixing both formats, e.g. 'MMM YYYY' would yield wrong results,
    # such as 2006-01-01 being formatted as "January 2005" in some locales.
    # Cfr: http://babel.pocoo.org/en/latest/dates.html#date-fields
    'hour': 'MMMM dd HH:00',
    'day': 'yyyy MMMM dd', # yyyy = normal year
    'week': "YYYY 'هفته' w ",  # w YYYY = ISO week-year
    'month': 'yyyy MMMM',
    'quarter': 'yyyy QQQQ',
    'year': 'yyyy',
}


_original_read_group_process_groupby = models.BaseModel._read_group_process_groupby

@api.model
def _custom_fa_read_group_process_groupby(self, gb, query):
    """
        Helper method to collect important information about groupbys: raw
        field name, type, time information, qualified name, ...
    """
    split = gb.split(':')
    field = self._fields.get(split[0])
    if not field:
        raise ValueError("Invalid field %r on model %r" % (split[0], self._name))
    field_type = field.type
    gb_function = split[1] if len(split) == 2 else None
    temporal = field_type in ('date', 'datetime')
    tz_convert = field_type == 'datetime' and self._context.get('tz') in pytz.all_timezones
    qualified_field = self._inherits_join_calc(self._table, split[0], query)
    if temporal:
        display_formats = {
            # Careful with week/year formats:
            #  - yyyy (lower) must always be used, *except* for week+year formats
            #  - YYYY (upper) must always be used for week+year format
            #         e.g. 2006-01-01 is W52 2005 in some locales (de_DE),
            #                         and W1 2006 for others
            #
            # Mixing both formats, e.g. 'MMM YYYY' would yield wrong results,
            # such as 2006-01-01 being formatted as "January 2005" in some locales.
            # Cfr: http://babel.pocoo.org/en/latest/dates.html#date-fields
            'hour': 'MMMM dd HH:00',
            'day': 'yyyy MMMM dd',  # yyyy = normal year
            'week': "YYYY 'هفته' w ",  # w YYYY = ISO week-year
            'month': 'yyyy MMMM',
            'quarter': 'yyyy QQQQ',
            'year': 'yyyy',
        }
        time_intervals = {
            'hour': dateutil.relativedelta.relativedelta(hours=1),
            'day': dateutil.relativedelta.relativedelta(days=1),
            'week': datetime.timedelta(days=7),
            'month': dateutil.relativedelta.relativedelta(months=1),
            'quarter': dateutil.relativedelta.relativedelta(months=3),
            'year': dateutil.relativedelta.relativedelta(years=1)
        }
        if tz_convert:
            qualified_field = "timezone('%s', timezone('UTC',%s))" % (self._context.get('tz', 'UTC'), qualified_field)
        qualified_field = "jdate_trunc('%s', %s::timestamp)" % (gb_function or 'month', qualified_field)
    if field_type == 'boolean':
        qualified_field = "coalesce(%s,false)" % qualified_field
    return {
        'field': split[0],
        'groupby': gb,
        'type': field_type,
        'display_format': display_formats[gb_function or 'month'] if temporal else None,
        'interval': time_intervals[gb_function or 'month'] if temporal else None,
        'granularity': gb_function or 'month' if temporal else None,
        'tz_convert': tz_convert,
        'qualified_field': qualified_field,
    }


def _custom_read_group_process_groupby(self, gb, query):
    """ Return <SQL expression> corresponding to the given groupby element.
    The method also checks whether the fields used in the groupby are
    accessible for reading.
    """
    # TODO:Arash;
    locale = get_lang(self.env).code
    if locale == 'fa_IR':
        return _custom_fa_read_group_process_groupby(self, gb, query)
    else:
        return _original_read_group_process_groupby(self, gb, query)

models.BaseModel._read_group_process_groupby = _custom_read_group_process_groupby





_original_read_group_format_result = models.BaseModel._read_group_format_result

@api.model
def _custom_fa_read_group_format_result(self, data, annotated_groupbys, groupby, domain):
        """
            Helper method to format the data contained in the dictionary data by
            adding the domain corresponding to its values, the groupbys in the
            context and by properly formatting the date/datetime values.

        :param data: a single group
        :param annotated_groupbys: expanded grouping metainformation
        :param groupby: original grouping metainformation
        :param domain: original domain for read_group
        """

        sections = []
        for gb in annotated_groupbys:

            ftype = gb['type']
            value = data[gb['groupby']]

            # full domain for this groupby spec
            d = None
            if value:
                if ftype in ['many2one', 'many2many']:
                    value = value[0]
                elif ftype in ('date', 'datetime'):
                    # ic(gb)
                    locale = get_lang(self.env).code
                    fmt = DEFAULT_SERVER_DATETIME_FORMAT if ftype == 'datetime' else DEFAULT_SERVER_DATE_FORMAT
                    tzinfo = None
                    range_start = value
                    range_end = value + gb['interval']
                    granularity = gb['granularity']
                    range_end = j_end(granularity, value)
                    # ic(range_start, range_end)
                    # value from postgres is in local tz (so range is
                    # considered in local tz e.g. "day" is [00:00, 00:00[
                    # local rather than UTC which could be [11:00, 11:00]
                    # local) but domain and raw value should be in UTC
                    if gb['tz_convert']:
                        tzinfo = range_start.tzinfo
                        range_start = range_start.astimezone(pytz.utc)
                        # take into account possible hour change between start and end
                        range_end = tzinfo.localize(range_end.replace(tzinfo=None))
                        range_end = range_end.astimezone(pytz.utc)

                    range_start = range_start.strftime(fmt)
                    range_end = range_end.strftime(fmt)
                    if ftype == 'datetime':
                        label = babel.dates.format_datetime(
                            value, format=gb['display_format'],
                            tzinfo=tzinfo, locale=locale
                        )
                    else:
                        label = babel.dates.format_date(
                            value, format=gb['display_format'],
                            locale=locale
                        )
                    data[gb['groupby']] = ('%s/%s' % (range_start, range_end), label)
                    d = [
                        '&',
                        (gb['field'], '>=', range_start),
                        (gb['field'], '<', range_end),
                    ]

            if d is None:
                d = [(gb['field'], '=', value)]
            sections.append(d)
        sections.append(domain)

        data['__domain'] = expression.AND(sections)
        if len(groupby) - len(annotated_groupbys) >= 1:
            data['__context'] = { 'group_by': groupby[len(annotated_groupbys):]}
        del data['id']
        return data


def _custom_read_group_format_result(self, data, annotated_groupbys, groupby, domain):
    """ Return <SQL expression> corresponding to the given groupby element.
    The method also checks whether the fields used in the groupby are
    accessible for reading.
    """
    # TODO:Arash;
    locale = get_lang(self.env).code
    if locale == 'fa_IR':
        return _custom_fa_read_group_format_result(self, data, annotated_groupbys, groupby, domain)
    else:
        return _original_read_group_format_result(self, data, annotated_groupbys, groupby, domain)

models.BaseModel._read_group_format_result = _custom_read_group_format_result