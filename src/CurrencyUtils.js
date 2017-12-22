const CurrencyDict = {
    "USD": {
        "en": ["dollar","dollars","dollars"],
        "en-us": ["dollar","dollars","dollars"],
        "ru": ["доллар","доллара","долларов"]
    },
    "RUB": {
        "en": ["ruble","rubles","rubles"],
        "en-us": ["ruble","rubles","rubles"],
        "ru": ["рубль","рубля","рублей"]
    },
    "CHF":{
        "en": ["frank","franks","franks"],
        "en-us": ["frank","franks","franks"],
        "ru": ["франк","франков","франков"]
    },
    "GBP": {
        "en": ["pound","pounds","pounds"],
        "en-us": ["pound","pounds","pounds"],
        "ru": ["фунт","фунт","фунт"]
    },
    "EUR": {
        "en": ["euro","euros","euros"],
        "en-us": ["euro","euros","euros"],
        "ru": ["евро","евро","евро"]
    }
};

function plural(curr, num, lang) {
    num = num % 100;
    if ( num > 19) {
        num = num % 10;
    }
    switch (num) {
        case 1: return CurrencyDict[curr][lang][0];
        case 2: return CurrencyDict[curr][lang][1];
        case 3: return CurrencyDict[curr][lang][1];
        case 4: return CurrencyDict[curr][lang][1];
        default: return CurrencyDict[curr][lang][2];
    }
}

module.exports = plural