const toCamel = (s) => {
    return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};

const isObject = function (o) {
    return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const isArray = function (a) {
    return Array.isArray(a);
};

const keysToCamel = function (o) {
    if (isObject(o)) {
        const n = {};

        Object.keys(o)
            .forEach((k) => {
                n[toCamel(k)] = keysToCamel(o[k]);
            });

        return n;
    } else if (isArray(o)) {
        return o.map((i) => {
            return keysToCamel(i);
        });
    }

    return o;
};

const nullStringToUndefined = function (o) {
    if (isObject(o)) {
        const n = {};

        Object.keys(o)
            .forEach((k) => {
                n[k] = nullStringToUndefined(o[k] == 'null' ? undefined : o[k]);
            });

        return n;
    } else if (isArray(o)) {
        return o.map((i) => {
            return nullStringToUndefined(i);
        });
    }

    return o;
};

module.exports = {keysToCamel, nullStringToUndefined};
