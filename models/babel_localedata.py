import babel.localedata as locale_data
import os
import pickle

_jmonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
_jmonths_dict_wide = {i + 1: v for i, v in enumerate(_jmonths)}
_jmonths_dict_abbr = {i + 1: v[:2] for i, v in enumerate(_jmonths)}
_jmonths_dict_narrow = {i + 1: v[0] for i, v in enumerate(_jmonths)}
_months = {
    'format': {
        'abbreviated': (locale_data.Alias(['months', 'format', 'wide']), _jmonths_dict_abbr),
        'narrow': (locale_data.Alias(['months', 'stand-alone', 'narrow']), _jmonths_dict_narrow),
        'wide': _jmonths_dict_wide,
    },
    'stand-alone': {
        'abbreviated': (locale_data.Alias(['months', 'format', 'abbreviated']), _jmonths_dict_abbr),
        'narrow': _jmonths_dict_narrow,
        'wide': (locale_data.Alias(['months', 'format', 'wide']), _jmonths_dict_wide),
    },
}


_jquarter = ['بهار', 'تابستان', 'پاییز', 'زمستان']
_jquarter_dict_wide = {i + 1: v for i, v in enumerate(_jquarter)}
_jquarter_dict_abbr = {i + 1: v[:2] for i, v in enumerate(_jquarter)}
_jquarter_dict_narrow = {i + 1: v[0] for i, v in enumerate(_jquarter)}
_quarters = {
    'format': {
        'abbreviated': (locale_data.Alias(['quarters', 'format', 'wide']), _jquarter_dict_abbr),
        'narrow': (locale_data.Alias(['quarters', 'stand-alone', 'narrow']), _jquarter_dict_narrow),
        'wide': _jquarter_dict_wide,
    },
    'stand-alone': {
        'abbreviated': (locale_data.Alias(['quarters', 'format', 'abbreviated']), _jquarter_dict_abbr),
        'narrow': _jquarter_dict_narrow,
        'wide': (locale_data.Alias(['quarters', 'format', 'wide']), _jquarter_dict_wide),
    },
}

original_load = locale_data.load

def custom_load(name, merge_inherited=True):
    if name == 'fa_IR':
        name = os.path.basename(name)
        locale_data._cache_lock.acquire()
        try:
            data = locale_data._cache.get(name)
            if not data:
                # Load inherited data
                if name == 'root' or not merge_inherited:
                    data = {}
                else:
                    from babel.core import get_global

                    parent = get_global('parent_exceptions').get(name)
                    if not parent:
                        parts = name.split('_')
                        if len(parts) == 1:
                            parent = 'root'
                        else:
                            parent = '_'.join(parts[:-1])
                    data = locale_data.load(parent).copy()
                filename = locale_data.resolve_locale_filename(name)
                with open(filename, 'rb') as fileobj:
                    if name != 'root' and merge_inherited:
                        locale_data.merge(data, pickle.load(fileobj))
                    else:
                        data = pickle.load(fileobj)
                locale_data._cache[name] = data

            if name.startswith('fa'):
                data['months'] = _months
                data['quarters'] = _quarters

            return data
        finally:
            locale_data._cache_lock.release()
    else:
        return original_load(name, merge_inherited=True)


locale_data.load = custom_load
