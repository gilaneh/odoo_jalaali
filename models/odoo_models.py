import logging

import jdatetime
import datetime
from odoo import models, api
from odoo.tools import date_utils, get_lang, Query, SQL, sql
from odoo.osv import expression
from jdatetimext import j_start, j_end
import pytz
import babel
import logging

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


_original_read_group_format_result = models.BaseModel._read_group_format_result


def _custom_fa_read_group_format_result(self, rows_dict, lazy_groupby):
    """
        Helper method to format the data contained in the dictionary data by
        adding the domain corresponding to its values, the groupbys in the
        context and by properly formatting the date/datetime values.

    :param data: a single group
    :param annotated_groupbys: expanded grouping metainformation
    :param groupby: original grouping metainformation
    """
    for group in lazy_groupby:
        field_name = group.split(':')[0].split('.')[0]
        field = self._fields[field_name]

        if field.type in ('date', 'datetime'):
            locale = get_lang(self.env).code
            fmt = models.DEFAULT_SERVER_DATETIME_FORMAT if field.type == 'datetime' else models.DEFAULT_SERVER_DATE_FORMAT
            granularity = group.split(':')[1] if ':' in group else 'month'
            interval = models.READ_GROUP_TIME_GRANULARITY[granularity]

        elif field.type == "properties":
            self._read_group_format_result_properties(rows_dict, group)
            continue

        for row in rows_dict:
            value = row[group]

            if isinstance(value, models.BaseModel):
                row[group] = (value.id, value.sudo().display_name) if value else False
                value = value.id

            if not value and field.type == 'many2many':
                other_values = [other_row[group][0] if isinstance(other_row[group], tuple)
                                else other_row[group].id if isinstance(other_row[group], models.BaseModel)
                else other_row[group] for other_row in rows_dict if other_row[group]]
                additional_domain = [(field_name, 'not in', other_values)]
            else:
                additional_domain = [(field_name, '=', value)]

            if field.type in ('date', 'datetime'):
                if value and isinstance(value, (datetime.date, datetime.datetime)):
                    range_start = value

                    # TODO:Arash; groupby second step
                    # range_end = value + interval
                    range_end = j_end(granularity, value)

                    if field.type == 'datetime':
                        tzinfo = None
                        if self._context.get('tz') in pytz.all_timezones_set:
                            tzinfo = pytz.timezone(self._context['tz'])
                            range_start = tzinfo.localize(range_start).astimezone(pytz.utc)
                            # take into account possible hour change between start and end
                            range_end = tzinfo.localize(range_end).astimezone(pytz.utc)

                        label = babel.dates.format_datetime(
                            range_start, format=CUSTOM_READ_GROUP_DISPLAY_FORMAT[granularity],
                            tzinfo=tzinfo, locale=locale
                        )
                    else:
                        label = babel.dates.format_date(
                            value, format=CUSTOM_READ_GROUP_DISPLAY_FORMAT[granularity],
                            locale=locale
                        )

                    range_start = range_start.strftime(fmt)
                    range_end = range_end.strftime(fmt)
                    row[group] = label  # TODO should put raw data
                    row.setdefault('__range', {})[group] = {'from': range_start, 'to': range_end}
                    additional_domain = [
                        '&',
                        (field_name, '>=', range_start),
                        (field_name, '<', range_end),
                    ]
                elif not value:
                    # Set the __range of the group containing records with an unset
                    # date/datetime field value to False.
                    row.setdefault('__range', {})[group] = False

            row['__domain'] = expression.AND([row['__domain'], additional_domain])


@api.model
def _18_custom_fa_read_group_format_result(self, rows_dict, lazy_groupby):
    locale = get_lang(self.env).code
    for group in lazy_groupby:
        field_name = group.split(':')[0].split('.')[0]
        field = self._fields[field_name]

        if field.type in ('date', 'datetime'):
            granularity = group.split(':')[1] if ':' in group else 'month'
            if granularity in models.READ_GROUP_TIME_GRANULARITY:
                locale = get_lang(self.env).code
                fmt = models.DEFAULT_SERVER_DATETIME_FORMAT if field.type == 'datetime' else models.DEFAULT_SERVER_DATE_FORMAT
                interval = models.READ_GROUP_TIME_GRANULARITY[granularity]
        elif field.type == "properties":
            self._read_group_format_result_properties(rows_dict, group)
            continue

        for row in rows_dict:
            value = row[group]

            if isinstance(value, models.BaseModel):
                row[group] = (value.id, value.sudo().display_name) if value else False
                value = value.id

            if not value and field.type == 'many2many':
                other_values = [other_row[group][0] if isinstance(other_row[group], tuple)
                                else other_row[group].id if isinstance(other_row[group], models.BaseModel)
                else other_row[group] for other_row in rows_dict if other_row[group]]
                additional_domain = [(field_name, 'not in', other_values)]
            else:
                additional_domain = [(field_name, '=', value)]

            if field.type in ('date', 'datetime'):
                if value and isinstance(value, (datetime.date, datetime.datetime)):
                    range_start = value

                    # TODO:Arash; groupby second step
                    range_end = j_end(granularity, value)
                    # jrange_start = jdatetime.datetime.fromgregorian(datetime=range_start).strftime('%Y/%m/%d %H:%M:%S')

                    # print(f"\n EEEEEEEEEEE [{granularity}]  {jrange_start}\n range_start: {range_start}\n   range_end: {range_end}")

                    # if range_start == value:
                    #     logging.warning(f"[_read_group_format_result] range_start: {range_start} \n    make sure 'jdate_trunc' is working as postgresql function")
                    if field.type == 'datetime':
                        tzinfo = None
                        if self._context.get('tz') in pytz.all_timezones_set:
                            tzinfo = pytz.timezone(self._context['tz'])
                            range_start = tzinfo.localize(range_start).astimezone(pytz.utc)
                            # take into account possible hour change between start and end
                            range_end = tzinfo.localize(range_end).astimezone(pytz.utc)

                        label = babel.dates.format_datetime(
                            range_start, format=CUSTOM_READ_GROUP_DISPLAY_FORMAT[granularity],
                            tzinfo=tzinfo, locale=locale
                        )

                    else:
                        label = babel.dates.format_date(
                            value, format=CUSTOM_READ_GROUP_DISPLAY_FORMAT[granularity],
                            locale=locale
                        )
                    # special case weeks because babel is broken *and*
                    # ubuntu reverted a change, so it's also inconsistent
                    if granularity == 'week1':
                        # TODO:Arash;
                        if locale == 'fa_IR':
                            jrange_start = jdatetime.datetime.fromgregorian(date=range_start)
                            week = jrange_start.weeknumber()
                            year = jrange_start.year
                            label = f"( {year} هفته {week} )"
                        else:
                            year, week = date_utils.weeknumber(
                                babel.Locale.parse(locale),
                                range_start,
                            )
                            label = f"W{week} {year:04}"

                    range_start = range_start.strftime(fmt)
                    range_end = range_end.strftime(fmt)
                    row[group] = label  # TODO should put raw data
                    row.setdefault('__range', {})[group] = {'from': range_start, 'to': range_end}

                    additional_domain = [
                        '&',
                        (field_name, '>=', range_start),
                        (field_name, '<', range_end),
                    ]
                elif value is not None and granularity in models.READ_GROUP_NUMBER_GRANULARITY:
                    additional_domain = [(f"{field_name}.{granularity}", '=', value)]
                elif not value:
                    # Set the __range of the group containing records with an unset
                    # date/datetime field value to False.
                    row.setdefault('__range', {})[group] = False

            row['__domain'] = expression.AND([row['__domain'], additional_domain])

@api.model
def _custom_read_group_format_result(self, rows_dict, lazy_groupby):
    """
        Helper method to format the data contained in the dictionary data by
        adding the domain corresponding to its values, the groupbys in the
        context and by properly formatting the date/datetime values.

    :param data: a single group
    :param annotated_groupbys: expanded grouping metainformation
    :param groupby: original grouping metainformation
    """
    # TODO:Arash;
    locale = get_lang(self.env).code
    if locale == 'fa_IR':
        return _custom_fa_read_group_format_result(self, rows_dict, lazy_groupby)
    else:
        return _original_read_group_format_result(self, rows_dict, lazy_groupby)


models.BaseModel._read_group_format_result = _custom_read_group_format_result


_original_read_group_groupby = models.BaseModel._read_group_groupby


def _custom_fa_read_group_groupby(self, groupby_spec: str, query: Query) -> tuple[SQL, list[str]]:
    """ Return a pair (<SQL expression>, [<field names used in SQL expression>])
    corresponding to the given groupby element.
    """
    fname, property_name, granularity = models.parse_read_group_spec(groupby_spec)
    if fname not in self:
        raise ValueError(f"Invalid field {fname!r} on model {self._name!r}")

    field = self._fields[fname]

    if property_name:
        if field.type != "properties":
            raise ValueError(f"Property set on a non properties field: {property_name!r}")
        access_fname = f"{fname}.{property_name}"
    else:
        access_fname = fname

    if granularity and field.type not in ('datetime', 'date', 'properties'):
        raise ValueError(f"Granularity set on a no-datetime field or property: {groupby_spec!r}")

    sql_expr = self._field_to_sql(self._table, access_fname, query)
    if field.type == 'datetime' and self.env.context.get('tz') in pytz.all_timezones_set:
        sql_expr = SQL("timezone(%s, timezone('UTC', %s))", self.env.context['tz'], sql_expr)

    if field.type in ('datetime', 'date') or (field.type == 'properties' and granularity):
        if not granularity:
            raise ValueError(f"Granularity not set on a date(time) field: {groupby_spec!r}")
        if granularity not in models.READ_GROUP_TIME_GRANULARITY:
            raise ValueError(f"Granularity specification isn't correct: {granularity!r}")

        if granularity == 'week1':
            # first_week_day: 0=Monday, 1=Tuesday, ...
            first_week_day = int(get_lang(self.env).week_start) - 1
            days_offset = first_week_day and 7 - first_week_day
            interval = f"-{days_offset} DAY"
            sql_expr = SQL(
                "(date_trunc('week', %s::timestamp - INTERVAL %s) + INTERVAL %s)",
                sql_expr, interval, interval,
            )
        else:
            sql_expr = SQL("jdate_trunc(%s, %s::timestamp)", granularity, sql_expr)

        if field.type == 'date':
            sql_expr = SQL("%s::date", sql_expr)

    elif field.type == 'boolean':
        sql_expr = SQL("COALESCE(%s, FALSE)", sql_expr)

    return sql_expr, [fname]


def _custom_read_group_groupby(self, groupby_spec: str, query: Query) -> SQL:
    """ Return <SQL expression> corresponding to the given groupby element.
    The method also checks whether the fields used in the groupby are
    accessible for reading.
    """
    # TODO:Arash;
    locale = get_lang(self.env).code
    if locale == 'fa_IR':
        return _custom_fa_read_group_groupby(self, groupby_spec, query)
    else:
        return _original_read_group_groupby(self, groupby_spec, query)


models.BaseModel._read_group_groupby = _custom_read_group_groupby
