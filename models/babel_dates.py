from babel.dates import DateTimeFormat, UTC

import babel.dates as babel_dates
from babel.core import Locale
from datetime import datetime, date, time
import khayyam
import jdatetime

def date_time_format__init__(self, value, locale):
    self.locale = Locale.parse(locale)

    # TODO:Arash; locale is not string
    print(f" .........> fa_IR {locale},  ")
    if isinstance(locale, str) and locale.startswith('fa') or isinstance(locale.language, str) and  locale.language.startswith('fa'):
        if isinstance(value, datetime):

            # TODO:Arash; Make sure jdatetime is working properly
            # self.value = khayyam.JalaliDatetime(value)
            self.value = jdatetime.datetime.fromgregorian(date=value)
        elif isinstance(value, date):

            # TODO:Arash; Make sure jdatetime is working properly
            # self.value = khayyam.JalaliDate(value)
            self.value = jdatetime.date.fromgregorian(date=value)
        elif isinstance(value, time):
            self.value = value
        else:
            raise ValueError(f'invalid value type: {type(value)}, value={value}')
    else:
        assert isinstance(value, (date, datetime, time))
        if isinstance(value, (datetime, time)) and value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        self.value = value
    # print(f" .........> value:{self.value}   self.local:{self.locale}")

DateTimeFormat.__init__ = date_time_format__init__


# Store the original function for reference if needed
original_format_datetime = babel_dates.format_datetime

def custom_format_datetime(datetime=None, format='medium', tzinfo=None,locale=babel_dates.LC_TIME):
    # Custom logic for formatting datetime

    # print(f"\n >>>>>>>> datetime:{datetime} format:{format} tzinfo:{tzinfo} locale:{locale}")
    if locale == 'fa_IR':
        datetime = babel_dates._ensure_datetime_tzinfo(babel_dates._get_datetime(datetime), tzinfo)

        locale = babel_dates.Locale.parse(locale)
        # print(f" >>>>>>>> fa_IR locale:{locale}")
        if format in ('full', 'long', 'medium', 'short'):
            # print(f"\ >>>>>>>> get_datetime_format:{babel_dates.get_datetime_format(format, locale=locale)}")
            return (babel_dates.get_datetime_format(format, locale=locale)
                .replace("'", '')
                .replace('{0}', custom_format_date(datetime, format, tzinfo=None, locale=locale))
                .replace('{1}', custom_format_date(datetime, format, locale=locale)))

        else:
            try:
                # jdate_time = jdatetime.datetime.fromgregorian(date=datetime)
                # print(f" >>>>>>>> parse_pattern:{babel_dates.parse_pattern(format)}")
                # print(f" >>>>>>>> parse_pattern:{babel_dates.parse_pattern(format).apply(datetime, locale)}")

                return (babel_dates.parse_pattern(format).apply(datetime, locale))
            except TypeError as e:
                if 'subtract' in str(e):
                    return (babel_dates.parse_pattern(format).apply(datetime.replace(tzinfo=None), locale))
                raise
    else:
        return original_format_datetime(datetime, format, tzinfo ,locale)


babel_dates.format_datetime = custom_format_datetime


original_format_date = babel_dates.format_date


def custom_format_date(date=None, format='medium', locale=babel_dates.LC_TIME):
    # Custom logic for formatting datetime

    # print(f"\n >>>>>>>> date:{date} format:{format} locale:{locale}")
    if locale == 'fa_IR':

        if format == 'MM/dd/yyyy':
            format = 'yyyy/MM/dd'
        if date is None:
            date = babel_dates.date_.today()
        elif isinstance(date, datetime):
            date = date.date()

        if format in ('full', 'long', 'medium', 'short'):
            format = babel_dates.get_date_format(format, locale=locale)
        pattern = babel_dates.parse_pattern(format)
        return pattern.apply(date, locale)
    else:
        return original_format_date(date, format, locale)


# Apply the patch
babel_dates.format_date = custom_format_date


