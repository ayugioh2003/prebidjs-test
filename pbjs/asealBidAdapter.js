var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __toCommonJS = (from) => {
  const moduleCache = __toCommonJS.moduleCache ??= new WeakMap;
  var cached = moduleCache.get(from);
  if (cached)
    return cached;
  var to = __defProp({}, "__esModule", { value: true });
  var desc = { enumerable: false };
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  moduleCache.set(from, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// src/adapter.js
function Adapter(code) {
  var bidderCode = code;
  function setBidderCode(code2) {
    bidderCode = code2;
  }
  function getBidderCode() {
    return bidderCode;
  }
  function callBids() {
  }
  return {
    callBids,
    setBidderCode,
    getBidderCode
  };
}
var init_adapter = __esm(() => {
});

// src/polyfill.js
function includes(target, elem, start) {
  return target && target.includes(elem, start) || false;
}
function arrayFrom() {
  return Array.from.apply(Array, arguments);
}
function find(arr, pred, thisArg) {
  return arr && arr.find(pred, thisArg);
}
var init_polyfill = __esm(() => {
});

// src/cpmBucketManager.js
var getPriceBucketString, getCpmStringValue, isValidPriceConfig, getCpmTarget, _defaultPrecision, _lgPriceConfig, _mgPriceConfig, _hgPriceConfig, _densePriceConfig, _autoPriceConfig;
var init_cpmBucketManager = __esm(() => {
  init_polyfill();
  init_utils();
  getPriceBucketString = function(cpm, customConfig, granularityMultiplier = 1) {
    let cpmFloat = parseFloat(cpm);
    if (isNaN(cpmFloat)) {
      cpmFloat = "";
    }
    return {
      low: cpmFloat === "" ? "" : getCpmStringValue(cpm, _lgPriceConfig, granularityMultiplier),
      med: cpmFloat === "" ? "" : getCpmStringValue(cpm, _mgPriceConfig, granularityMultiplier),
      high: cpmFloat === "" ? "" : getCpmStringValue(cpm, _hgPriceConfig, granularityMultiplier),
      auto: cpmFloat === "" ? "" : getCpmStringValue(cpm, _autoPriceConfig, granularityMultiplier),
      dense: cpmFloat === "" ? "" : getCpmStringValue(cpm, _densePriceConfig, granularityMultiplier),
      custom: cpmFloat === "" ? "" : getCpmStringValue(cpm, customConfig, granularityMultiplier)
    };
  };
  getCpmStringValue = function(cpm, config, granularityMultiplier) {
    let cpmStr = "";
    if (!isValidPriceConfig(config)) {
      return cpmStr;
    }
    const cap = config.buckets.reduce((prev, curr) => {
      if (prev.max > curr.max) {
        return prev;
      }
      return curr;
    }, {
      max: 0
    });
    let bucketFloor = 0;
    let bucket = find(config.buckets, (bucket2) => {
      if (cpm > cap.max * granularityMultiplier) {
        let precision = bucket2.precision;
        if (typeof precision === "undefined") {
          precision = _defaultPrecision;
        }
        cpmStr = (bucket2.max * granularityMultiplier).toFixed(precision);
      } else if (cpm <= bucket2.max * granularityMultiplier && cpm >= bucketFloor * granularityMultiplier) {
        bucket2.min = bucketFloor;
        return bucket2;
      } else {
        bucketFloor = bucket2.max;
      }
    });
    if (bucket) {
      cpmStr = getCpmTarget(cpm, bucket, granularityMultiplier);
    }
    return cpmStr;
  };
  isValidPriceConfig = function(config) {
    if (isEmpty(config) || !config.buckets || !Array.isArray(config.buckets)) {
      return false;
    }
    let isValid = true;
    config.buckets.forEach((bucket) => {
      if (!bucket.max || !bucket.increment) {
        isValid = false;
      }
    });
    return isValid;
  };
  getCpmTarget = function(cpm, bucket, granularityMultiplier) {
    const precision = typeof bucket.precision !== "undefined" ? bucket.precision : _defaultPrecision;
    const increment = bucket.increment * granularityMultiplier;
    const bucketMin = bucket.min * granularityMultiplier;
    let pow = Math.pow(10, precision + 2);
    let cpmToFloor = (cpm * pow - bucketMin * pow) / (increment * pow);
    let cpmTarget = Math.floor(cpmToFloor) * increment + bucketMin;
    cpmTarget = Number(cpmTarget.toFixed(10));
    return cpmTarget.toFixed(precision);
  };
  _defaultPrecision = 2;
  _lgPriceConfig = {
    buckets: [{
      max: 5,
      increment: 0.5
    }]
  };
  _mgPriceConfig = {
    buckets: [{
      max: 20,
      increment: 0.1
    }]
  };
  _hgPriceConfig = {
    buckets: [{
      max: 20,
      increment: 0.01
    }]
  };
  _densePriceConfig = {
    buckets: [
      {
        max: 3,
        increment: 0.01
      },
      {
        max: 8,
        increment: 0.05
      },
      {
        max: 20,
        increment: 0.5
      }
    ]
  };
  _autoPriceConfig = {
    buckets: [
      {
        max: 5,
        increment: 0.05
      },
      {
        max: 10,
        increment: 0.1
      },
      {
        max: 20,
        increment: 0.5
      }
    ]
  };
});

// src/constants.json
var require_constants = __commonJS((exports, module) => {
  module.exports = {
    JSON_MAPPING: {
      PL_CODE: "code",
      PL_SIZE: "sizes",
      PL_BIDS: "bids",
      BD_BIDDER: "bidder",
      BD_ID: "paramsd",
      BD_PL_ID: "placementId",
      ADSERVER_TARGETING: "adserverTargeting",
      BD_SETTING_STANDARD: "standard"
    },
    DEBUG_MODE: "pbjs_debug",
    STATUS: {
      GOOD: 1,
      NO_BID: 2
    },
    CB: {
      TYPE: {
        ALL_BIDS_BACK: "allRequestedBidsBack",
        AD_UNIT_BIDS_BACK: "adUnitBidsBack",
        BID_WON: "bidWon",
        REQUEST_BIDS: "requestBids"
      }
    },
    EVENTS: {
      AUCTION_INIT: "auctionInit",
      AUCTION_END: "auctionEnd",
      BID_ADJUSTMENT: "bidAdjustment",
      BID_TIMEOUT: "bidTimeout",
      BID_REQUESTED: "bidRequested",
      BID_RESPONSE: "bidResponse",
      NO_BID: "noBid",
      BID_WON: "bidWon",
      BIDDER_DONE: "bidderDone",
      BIDDER_ERROR: "bidderError",
      SET_TARGETING: "setTargeting",
      BEFORE_REQUEST_BIDS: "beforeRequestBids",
      BEFORE_BIDDER_HTTP: "beforeBidderHttp",
      REQUEST_BIDS: "requestBids",
      ADD_AD_UNITS: "addAdUnits",
      AD_RENDER_FAILED: "adRenderFailed",
      AD_RENDER_SUCCEEDED: "adRenderSucceeded",
      TCF2_ENFORCEMENT: "tcf2Enforcement",
      AUCTION_DEBUG: "auctionDebug",
      BID_VIEWABLE: "bidViewable",
      STALE_RENDER: "staleRender",
      BILLABLE_EVENT: "billableEvent"
    },
    AD_RENDER_FAILED_REASON: {
      PREVENT_WRITING_ON_MAIN_DOCUMENT: "preventWritingOnMainDocument",
      NO_AD: "noAd",
      EXCEPTION: "exception",
      CANNOT_FIND_AD: "cannotFindAd",
      MISSING_DOC_OR_ADID: "missingDocOrAdid"
    },
    EVENT_ID_PATHS: {
      bidWon: "adUnitCode"
    },
    GRANULARITY_OPTIONS: {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      AUTO: "auto",
      DENSE: "dense",
      CUSTOM: "custom"
    },
    TARGETING_KEYS: {
      BIDDER: "hb_bidder",
      AD_ID: "hb_adid",
      PRICE_BUCKET: "hb_pb",
      SIZE: "hb_size",
      DEAL: "hb_deal",
      SOURCE: "hb_source",
      FORMAT: "hb_format",
      UUID: "hb_uuid",
      CACHE_ID: "hb_cache_id",
      CACHE_HOST: "hb_cache_host",
      ADOMAIN: "hb_adomain"
    },
    DEFAULT_TARGETING_KEYS: {
      BIDDER: "hb_bidder",
      AD_ID: "hb_adid",
      PRICE_BUCKET: "hb_pb",
      SIZE: "hb_size",
      DEAL: "hb_deal",
      FORMAT: "hb_format",
      UUID: "hb_uuid",
      CACHE_HOST: "hb_cache_host"
    },
    NATIVE_KEYS: {
      title: "hb_native_title",
      body: "hb_native_body",
      body2: "hb_native_body2",
      privacyLink: "hb_native_privacy",
      privacyIcon: "hb_native_privicon",
      sponsoredBy: "hb_native_brand",
      image: "hb_native_image",
      icon: "hb_native_icon",
      clickUrl: "hb_native_linkurl",
      displayUrl: "hb_native_displayurl",
      cta: "hb_native_cta",
      rating: "hb_native_rating",
      address: "hb_native_address",
      downloads: "hb_native_downloads",
      likes: "hb_native_likes",
      phone: "hb_native_phone",
      price: "hb_native_price",
      salePrice: "hb_native_saleprice",
      rendererUrl: "hb_renderer_url",
      adTemplate: "hb_adTemplate"
    },
    S2S: {
      SRC: "s2s",
      DEFAULT_ENDPOINT: "https://prebid.adnxs.com/pbs/v1/openrtb2/auction",
      SYNCED_BIDDERS_KEY: "pbjsSyncs"
    },
    BID_STATUS: {
      BID_TARGETING_SET: "targetingSet",
      RENDERED: "rendered",
      BID_REJECTED: "bidRejected"
    }
  };
});

// src/config.js
function newConfig() {
  let listeners = [];
  let defaults;
  let config;
  let bidderConfig;
  let currBidder = null;
  function resetConfig() {
    defaults = {};
    let newConfig2 = {
      _debug: DEFAULT_DEBUG,
      get debug() {
        return this._debug;
      },
      set debug(val) {
        this._debug = val;
      },
      _bidderTimeout: DEFAULT_BIDDER_TIMEOUT,
      get bidderTimeout() {
        return this._bidderTimeout;
      },
      set bidderTimeout(val) {
        this._bidderTimeout = val;
      },
      _publisherDomain: DEFAULT_PUBLISHER_DOMAIN,
      get publisherDomain() {
        return this._publisherDomain;
      },
      set publisherDomain(val) {
        this._publisherDomain = val;
      },
      _priceGranularity: GRANULARITY_OPTIONS.MEDIUM,
      set priceGranularity(val) {
        if (validatePriceGranularity(val)) {
          if (typeof val === "string") {
            this._priceGranularity = hasGranularity(val) ? val : GRANULARITY_OPTIONS.MEDIUM;
          } else if (isPlainObject(val)) {
            this._customPriceBucket = val;
            this._priceGranularity = GRANULARITY_OPTIONS.CUSTOM;
            logMessage("Using custom price granularity");
          }
        }
      },
      get priceGranularity() {
        return this._priceGranularity;
      },
      _customPriceBucket: {},
      get customPriceBucket() {
        return this._customPriceBucket;
      },
      _mediaTypePriceGranularity: {},
      get mediaTypePriceGranularity() {
        return this._mediaTypePriceGranularity;
      },
      set mediaTypePriceGranularity(val) {
        this._mediaTypePriceGranularity = Object.keys(val).reduce((aggregate, item) => {
          if (validatePriceGranularity(val[item])) {
            if (typeof val === "string") {
              aggregate[item] = hasGranularity(val[item]) ? val[item] : this._priceGranularity;
            } else if (isPlainObject(val)) {
              aggregate[item] = val[item];
              logMessage(`Using custom price granularity for ${item}`);
            }
          } else {
            logWarn(`Invalid price granularity for media type: ${item}`);
          }
          return aggregate;
        }, {});
      },
      _sendAllBids: DEFAULT_ENABLE_SEND_ALL_BIDS,
      get enableSendAllBids() {
        return this._sendAllBids;
      },
      set enableSendAllBids(val) {
        this._sendAllBids = val;
      },
      _useBidCache: DEFAULT_BID_CACHE,
      get useBidCache() {
        return this._useBidCache;
      },
      set useBidCache(val) {
        this._useBidCache = val;
      },
      _deviceAccess: DEFAULT_DEVICE_ACCESS,
      get deviceAccess() {
        return this._deviceAccess;
      },
      set deviceAccess(val) {
        this._deviceAccess = val;
      },
      _bidderSequence: DEFAULT_BIDDER_SEQUENCE,
      get bidderSequence() {
        return this._bidderSequence;
      },
      set bidderSequence(val) {
        if (VALID_ORDERS[val]) {
          this._bidderSequence = val;
        } else {
          logWarn(`Invalid order: ${val}. Bidder Sequence was not set.`);
        }
      },
      _timeoutBuffer: DEFAULT_TIMEOUTBUFFER,
      get timeoutBuffer() {
        return this._timeoutBuffer;
      },
      set timeoutBuffer(val) {
        this._timeoutBuffer = val;
      },
      _disableAjaxTimeout: DEFAULT_DISABLE_AJAX_TIMEOUT,
      get disableAjaxTimeout() {
        return this._disableAjaxTimeout;
      },
      set disableAjaxTimeout(val) {
        this._disableAjaxTimeout = val;
      },
      _maxNestedIframes: DEFAULT_MAX_NESTED_IFRAMES,
      get maxNestedIframes() {
        return this._maxNestedIframes;
      },
      set maxNestedIframes(val) {
        this._maxNestedIframes = val;
      },
      _auctionOptions: {},
      get auctionOptions() {
        return this._auctionOptions;
      },
      set auctionOptions(val) {
        if (validateauctionOptions(val)) {
          this._auctionOptions = val;
        }
      }
    };
    if (config) {
      callSubscribers(Object.keys(config).reduce((memo, topic) => {
        if (config[topic] !== newConfig2[topic]) {
          memo[topic] = newConfig2[topic] || {};
        }
        return memo;
      }, {}));
    }
    config = newConfig2;
    bidderConfig = {};
    function hasGranularity(val) {
      return find(Object.keys(GRANULARITY_OPTIONS), (option) => val === GRANULARITY_OPTIONS[option]);
    }
    function validatePriceGranularity(val) {
      if (!val) {
        logError("Prebid Error: no value passed to `setPriceGranularity()`");
        return false;
      }
      if (typeof val === "string") {
        if (!hasGranularity(val)) {
          logWarn("Prebid Warning: setPriceGranularity was called with invalid setting, using `medium` as default.");
        }
      } else if (isPlainObject(val)) {
        if (!isValidPriceConfig(val)) {
          logError("Invalid custom price value passed to `setPriceGranularity()`");
          return false;
        }
      }
      return true;
    }
    function validateauctionOptions(val) {
      if (!isPlainObject(val)) {
        logWarn("Auction Options must be an object");
        return false;
      }
      for (let k of Object.keys(val)) {
        if (k !== "secondaryBidders" && k !== "suppressStaleRender") {
          logWarn(`Auction Options given an incorrect param: ${k}`);
          return false;
        }
        if (k === "secondaryBidders") {
          if (!isArray(val[k])) {
            logWarn(`Auction Options ${k} must be of type Array`);
            return false;
          } else if (!val[k].every(isStr)) {
            logWarn(`Auction Options ${k} must be only string`);
            return false;
          }
        } else if (k === "suppressStaleRender") {
          if (!isBoolean(val[k])) {
            logWarn(`Auction Options ${k} must be of type boolean`);
            return false;
          }
        }
      }
      return true;
    }
  }
  function _getConfig() {
    if (currBidder && bidderConfig && isPlainObject(bidderConfig[currBidder])) {
      let currBidderConfig = bidderConfig[currBidder];
      const configTopicSet = new Set(Object.keys(config).concat(Object.keys(currBidderConfig)));
      return arrayFrom(configTopicSet).reduce((memo, topic) => {
        if (typeof currBidderConfig[topic] === "undefined") {
          memo[topic] = config[topic];
        } else if (typeof config[topic] === "undefined") {
          memo[topic] = currBidderConfig[topic];
        } else {
          if (isPlainObject(currBidderConfig[topic])) {
            memo[topic] = mergeDeep({}, config[topic], currBidderConfig[topic]);
          } else {
            memo[topic] = currBidderConfig[topic];
          }
        }
        return memo;
      }, {});
    }
    return Object.assign({}, config);
  }
  function readConfig(...args) {
    if (args.length <= 1 && typeof args[0] !== "function") {
      const option = args[0];
      const configClone = deepClone(_getConfig());
      return option ? dlv(configClone, option) : configClone;
    }
    return subscribe(...args);
  }
  function getConfig(...args) {
    if (args.length <= 1 && typeof args[0] !== "function") {
      const option = args[0];
      return option ? dlv(_getConfig(), option) : _getConfig();
    }
    return subscribe(...args);
  }
  function getBidderConfig() {
    return bidderConfig;
  }
  function getLegacyFpd(obj) {
    if (typeof obj !== "object")
      return;
    let duplicate = {};
    Object.keys(obj).forEach((type) => {
      let prop = type === "site" ? "context" : type;
      duplicate[prop] = prop === "context" || prop === "user" ? Object.keys(obj[type]).filter((key) => key !== "data").reduce((result, key) => {
        if (key === "ext") {
          mergeDeep(result, obj[type][key]);
        } else {
          mergeDeep(result, { [key]: obj[type][key] });
        }
        return result;
      }, {}) : obj[type];
    });
    return duplicate;
  }
  function getLegacyImpFpd(obj) {
    if (typeof obj !== "object")
      return;
    let duplicate = {};
    if (dlv(obj, "ext.data")) {
      Object.keys(obj.ext.data).forEach((key) => {
        if (key === "pbadslot") {
          mergeDeep(duplicate, { context: { pbAdSlot: obj.ext.data[key] } });
        } else if (key === "adserver") {
          mergeDeep(duplicate, { context: { adServer: obj.ext.data[key] } });
        } else {
          mergeDeep(duplicate, { context: { data: { [key]: obj.ext.data[key] } } });
        }
      });
    }
    return duplicate;
  }
  function convertFpd(opt) {
    let duplicate = {};
    Object.keys(opt).forEach((type) => {
      let prop = type === "context" ? "site" : type;
      duplicate[prop] = prop === "site" || prop === "user" ? Object.keys(opt[type]).reduce((result, key) => {
        if (key === "data") {
          mergeDeep(result, { ext: { data: opt[type][key] } });
        } else {
          mergeDeep(result, { [key]: opt[type][key] });
        }
        return result;
      }, {}) : opt[type];
    });
    return duplicate;
  }
  function convertImpFpd(opt) {
    let duplicate = {};
    Object.keys(opt).filter((prop) => prop === "context").forEach((type) => {
      Object.keys(opt[type]).forEach((key) => {
        if (key === "data") {
          mergeDeep(duplicate, { ext: { data: opt[type][key] } });
        } else {
          if (typeof opt[type][key] === "object" && !Array.isArray(opt[type][key])) {
            Object.keys(opt[type][key]).forEach((data) => {
              mergeDeep(duplicate, { ext: { data: { [key.toLowerCase()]: { [data.toLowerCase()]: opt[type][key][data] } } } });
            });
          } else {
            mergeDeep(duplicate, { ext: { data: { [key.toLowerCase()]: opt[type][key] } } });
          }
        }
      });
    });
    return duplicate;
  }
  function convertAdUnitFpd(arr) {
    let convert = [];
    arr.forEach((adunit) => {
      if (adunit.fpd) {
        adunit["ortb2Imp"] ? mergeDeep(adunit["ortb2Imp"], convertImpFpd(adunit.fpd)) : adunit["ortb2Imp"] = convertImpFpd(adunit.fpd);
        convert.push((({ fpd, ...duplicate }) => duplicate)(adunit));
      } else {
        convert.push(adunit);
      }
    });
    return convert;
  }
  function setConfig(options) {
    if (!isPlainObject(options)) {
      logError("setConfig options must be an object");
      return;
    }
    let topics = Object.keys(options);
    let topicalConfig = {};
    topics.forEach((topic) => {
      let prop = topic === "fpd" ? "ortb2" : topic;
      let option = topic === "fpd" ? convertFpd(options[topic]) : options[topic];
      if (isPlainObject(defaults[prop]) && isPlainObject(option)) {
        option = Object.assign({}, defaults[prop], option);
      }
      topicalConfig[prop] = config[prop] = option;
    });
    callSubscribers(topicalConfig);
  }
  function setDefaults(options) {
    if (!isPlainObject(defaults)) {
      logError("defaults must be an object");
      return;
    }
    Object.assign(defaults, options);
    Object.assign(config, options);
  }
  function subscribe(topic, listener) {
    let callback = listener;
    if (typeof topic !== "string") {
      callback = topic;
      topic = ALL_TOPICS;
    }
    if (typeof callback !== "function") {
      logError("listener must be a function");
      return;
    }
    const nl = { topic, callback };
    listeners.push(nl);
    return function unsubscribe() {
      listeners.splice(listeners.indexOf(nl), 1);
    };
  }
  function callSubscribers(options) {
    const TOPICS = Object.keys(options);
    listeners.filter((listener) => includes(TOPICS, listener.topic)).forEach((listener) => {
      listener.callback({ [listener.topic]: options[listener.topic] });
    });
    listeners.filter((listener) => listener.topic === ALL_TOPICS).forEach((listener) => listener.callback(options));
  }
  function setBidderConfig(config2, mergeFlag = false) {
    try {
      check(config2);
      config2.bidders.forEach((bidder) => {
        if (!bidderConfig[bidder]) {
          bidderConfig[bidder] = {};
        }
        Object.keys(config2.config).forEach((topic) => {
          let prop = topic === "fpd" ? "ortb2" : topic;
          let option = topic === "fpd" ? convertFpd(config2.config[topic]) : config2.config[topic];
          if (isPlainObject(option)) {
            const func = mergeFlag ? mergeDeep : Object.assign;
            bidderConfig[bidder][prop] = func({}, bidderConfig[bidder][prop] || {}, option);
          } else {
            bidderConfig[bidder][prop] = option;
          }
        });
      });
    } catch (e) {
      logError(e);
    }
    function check(obj) {
      if (!isPlainObject(obj)) {
        throw "setBidderConfig bidder options must be an object";
      }
      if (!(Array.isArray(obj.bidders) && obj.bidders.length)) {
        throw "setBidderConfig bidder options must contain a bidders list with at least 1 bidder";
      }
      if (!isPlainObject(obj.config)) {
        throw "setBidderConfig bidder options must contain a config object";
      }
    }
  }
  function mergeConfig(obj) {
    if (!isPlainObject(obj)) {
      logError("mergeConfig input must be an object");
      return;
    }
    const mergedConfig = Object.keys(obj).reduce((accum, key) => {
      const prevConf = _getConfig(key)[key] || {};
      accum[key] = mergeDeep(prevConf, obj[key]);
      return accum;
    }, {});
    setConfig({ ...mergedConfig });
    return mergedConfig;
  }
  function mergeBidderConfig(obj) {
    return setBidderConfig(obj, true);
  }
  function runWithBidder(bidder, fn) {
    currBidder = bidder;
    try {
      return fn();
    } finally {
      resetBidder();
    }
  }
  function callbackWithBidder(bidder) {
    return function(cb) {
      return function(...args) {
        if (typeof cb === "function") {
          return runWithBidder(bidder, bind.call(cb, this, ...args));
        } else {
          logWarn("config.callbackWithBidder callback is not a function");
        }
      };
    };
  }
  function getCurrentBidder() {
    return currBidder;
  }
  function resetBidder() {
    currBidder = null;
  }
  resetConfig();
  return {
    getCurrentBidder,
    resetBidder,
    getConfig,
    readConfig,
    setConfig,
    mergeConfig,
    setDefaults,
    resetConfig,
    runWithBidder,
    callbackWithBidder,
    setBidderConfig,
    getBidderConfig,
    mergeBidderConfig,
    convertAdUnitFpd,
    getLegacyFpd,
    getLegacyImpFpd
  };
}
var CONSTANTS, DEFAULT_DEBUG, DEFAULT_BIDDER_TIMEOUT, DEFAULT_PUBLISHER_DOMAIN, DEFAULT_ENABLE_SEND_ALL_BIDS, DEFAULT_DISABLE_AJAX_TIMEOUT, DEFAULT_BID_CACHE, DEFAULT_DEVICE_ACCESS, DEFAULT_MAX_NESTED_IFRAMES, DEFAULT_TIMEOUTBUFFER, RANDOM, FIXED, VALID_ORDERS, DEFAULT_BIDDER_SEQUENCE, GRANULARITY_OPTIONS, ALL_TOPICS, config;
var init_config = __esm(() => {
  init_cpmBucketManager();
  init_polyfill();
  init_utils();
  CONSTANTS = require_constants();
  DEFAULT_DEBUG = getParameterByName(CONSTANTS.DEBUG_MODE).toUpperCase() === "TRUE";
  DEFAULT_BIDDER_TIMEOUT = 3000;
  DEFAULT_PUBLISHER_DOMAIN = window.location.origin;
  DEFAULT_ENABLE_SEND_ALL_BIDS = true;
  DEFAULT_DISABLE_AJAX_TIMEOUT = false;
  DEFAULT_BID_CACHE = false;
  DEFAULT_DEVICE_ACCESS = true;
  DEFAULT_MAX_NESTED_IFRAMES = 10;
  DEFAULT_TIMEOUTBUFFER = 400;
  RANDOM = "random";
  FIXED = "fixed";
  VALID_ORDERS = {};
  VALID_ORDERS[RANDOM] = true;
  VALID_ORDERS[FIXED] = true;
  DEFAULT_BIDDER_SEQUENCE = RANDOM;
  GRANULARITY_OPTIONS = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    AUTO: "auto",
    DENSE: "dense",
    CUSTOM: "custom"
  };
  ALL_TOPICS = "*";
  config = newConfig();
});

// node_modules/just-clone/index.js
var require_just_clone = __commonJS((exports, module) => {
  var clone = function(obj) {
    var result = Array.isArray(obj) ? [] : {};
    for (var key in obj) {
      var value = obj[key];
      if (value && typeof value == "object") {
        result[key] = clone(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };
  module.exports = clone;
});

// node_modules/dlv/index.js
function dlv(obj, key, def, p, undef) {
  key = key.split ? key.split(".") : key;
  for (p = 0;p < key.length; p++) {
    obj = obj ? obj[key[p]] : undef;
  }
  return obj === undef ? def : obj;
}
var init_dlv = __esm(() => {
});

// node_modules/dset/dist/dset.es.js
function dset_es_default(obj, keys, val) {
  keys.split && (keys = keys.split("."));
  var i = 0, l = keys.length, t = obj, x;
  for (;i < l; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === l - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
  }
}
var init_dset_es = __esm(() => {
});

// src/events.js
var exports_events = {};
__export(exports_events, {
  on: () => {
    {
      return on;
    }
  },
  off: () => {
    {
      return off;
    }
  },
  getEvents: () => {
    {
      return getEvents;
    }
  },
  get: () => {
    {
      return get;
    }
  },
  emit: () => {
    {
      return emit;
    }
  }
});
var utils3, CONSTANTS2, slice, push, allEvents, idPaths, eventsFired, _public, on, off, get, getEvents, emit;
var init_events = __esm(() => {
  utils3 = (init_utils(), __toCommonJS(exports_utils));
  CONSTANTS2 = require_constants();
  slice = Array.prototype.slice;
  push = Array.prototype.push;
  allEvents = utils3._map(CONSTANTS2.EVENTS, function(v) {
    return v;
  });
  idPaths = CONSTANTS2.EVENT_ID_PATHS;
  eventsFired = [];
  _public = function() {
    var _handlers = {};
    var _public2 = {};
    function _dispatch(eventString, args) {
      utils3.logMessage("Emitting event for: " + eventString);
      var eventPayload = args[0] || {};
      var idPath = idPaths[eventString];
      var key = eventPayload[idPath];
      var event = _handlers[eventString] || { que: [] };
      var eventKeys = utils3._map(event, function(v, k) {
        return k;
      });
      var callbacks = [];
      eventsFired.push({
        eventType: eventString,
        args: eventPayload,
        id: key,
        elapsedTime: utils3.getPerformanceNow()
      });
      if (key && utils3.contains(eventKeys, key)) {
        push.apply(callbacks, event[key].que);
      }
      push.apply(callbacks, event.que);
      utils3._each(callbacks, function(fn) {
        if (!fn)
          return;
        try {
          fn.apply(null, args);
        } catch (e) {
          utils3.logError("Error executing handler:", "events.js", e);
        }
      });
    }
    function _checkAvailableEvent(event) {
      return utils3.contains(allEvents, event);
    }
    _public2.on = function(eventString, handler, id) {
      if (_checkAvailableEvent(eventString)) {
        var event = _handlers[eventString] || { que: [] };
        if (id) {
          event[id] = event[id] || { que: [] };
          event[id].que.push(handler);
        } else {
          event.que.push(handler);
        }
        _handlers[eventString] = event;
      } else {
        utils3.logError("Wrong event name : " + eventString + " Valid event names :" + allEvents);
      }
    };
    _public2.emit = function(event) {
      var args = slice.call(arguments, 1);
      _dispatch(event, args);
    };
    _public2.off = function(eventString, handler, id) {
      var event = _handlers[eventString];
      if (utils3.isEmpty(event) || utils3.isEmpty(event.que) && utils3.isEmpty(event[id])) {
        return;
      }
      if (id && (utils3.isEmpty(event[id]) || utils3.isEmpty(event[id].que))) {
        return;
      }
      if (id) {
        utils3._each(event[id].que, function(_handler) {
          var que = event[id].que;
          if (_handler === handler) {
            que.splice(que.indexOf(_handler), 1);
          }
        });
      } else {
        utils3._each(event.que, function(_handler) {
          var que = event.que;
          if (_handler === handler) {
            que.splice(que.indexOf(_handler), 1);
          }
        });
      }
      _handlers[eventString] = event;
    };
    _public2.get = function() {
      return _handlers;
    };
    _public2.getEvents = function() {
      var arrayCopy = [];
      utils3._each(eventsFired, function(value) {
        var newProp = Object.assign({}, value);
        arrayCopy.push(newProp);
      });
      return arrayCopy;
    };
    return _public2;
  }();
  ({ on, off, get, getEvents, emit } = _public);
});

// src/utils.js
var exports_utils = {};
__export(exports_utils, {
  waitForElementToLoad: () => {
    {
      return waitForElementToLoad;
    }
  },
  unsupportedBidderMessage: () => {
    {
      return unsupportedBidderMessage;
    }
  },
  uniques: () => {
    {
      return uniques;
    }
  },
  tryAppendQueryString: () => {
    {
      return tryAppendQueryString;
    }
  },
  triggerPixel: () => {
    {
      return triggerPixel;
    }
  },
  transformBidderParamKeywords: () => {
    {
      return transformBidderParamKeywords;
    }
  },
  transformAdServerTargetingObj: () => {
    {
      return transformAdServerTargetingObj;
    }
  },
  timestamp: () => {
    {
      return timestamp;
    }
  },
  shuffle: () => {
    {
      return shuffle;
    }
  },
  replaceClickThrough: () => {
    {
      return replaceClickThrough;
    }
  },
  replaceAuctionPrice: () => {
    {
      return replaceAuctionPrice;
    }
  },
  prefixLog: () => {
    {
      return prefixLog;
    }
  },
  pick: () => {
    {
      return pick;
    }
  },
  parseUrl: () => {
    {
      return parseUrl;
    }
  },
  parseSizesInput: () => {
    {
      return parseSizesInput;
    }
  },
  parseQueryStringParameters: () => {
    {
      return parseQueryStringParameters;
    }
  },
  parseQS: () => {
    {
      return parseQS;
    }
  },
  parseGPTSingleSizeArrayToRtbSize: () => {
    {
      return parseGPTSingleSizeArrayToRtbSize;
    }
  },
  parseGPTSingleSizeArray: () => {
    {
      return parseGPTSingleSizeArray;
    }
  },
  mergeDeep: () => {
    {
      return mergeDeep;
    }
  },
  logWarn: () => {
    {
      return logWarn;
    }
  },
  logMessage: () => {
    {
      return logMessage;
    }
  },
  logInfo: () => {
    {
      return logInfo;
    }
  },
  logError: () => {
    {
      return logError;
    }
  },
  isValidMediaTypes: () => {
    {
      return isValidMediaTypes;
    }
  },
  isStr: () => {
    {
      return isStr;
    }
  },
  isSlotMatchingAdUnitCode: () => {
    {
      return isSlotMatchingAdUnitCode;
    }
  },
  isSafariBrowser: () => {
    {
      return isSafariBrowser;
    }
  },
  isPlainObject: () => {
    {
      return isPlainObject;
    }
  },
  isNumber: () => {
    {
      return isNumber;
    }
  },
  isInteger: () => {
    {
      return isInteger;
    }
  },
  isGptPubadsDefined: () => {
    {
      return isGptPubadsDefined;
    }
  },
  isFn: () => {
    {
      return isFn;
    }
  },
  isEmptyStr: () => {
    {
      return isEmptyStr;
    }
  },
  isEmpty: () => {
    {
      return isEmpty;
    }
  },
  isBoolean: () => {
    {
      return isBoolean;
    }
  },
  isArrayOfNums: () => {
    {
      return isArrayOfNums;
    }
  },
  isArray: () => {
    {
      return isArray;
    }
  },
  isApnGetTagDefined: () => {
    {
      return isApnGetTagDefined;
    }
  },
  isAdUnitCodeMatchingSlot: () => {
    {
      return isAdUnitCodeMatchingSlot;
    }
  },
  isA: () => {
    {
      return isA;
    }
  },
  internal: () => {
    {
      return internal;
    }
  },
  insertUserSyncIframe: () => {
    {
      return insertUserSyncIframe;
    }
  },
  insertHtmlIntoIframe: () => {
    {
      return insertHtmlIntoIframe;
    }
  },
  insertElement: () => {
    {
      return insertElement;
    }
  },
  inIframe: () => {
    {
      return inIframe;
    }
  },
  hasOwn: () => {
    {
      return hasOwn;
    }
  },
  hasDeviceAccess: () => {
    {
      return hasDeviceAccess;
    }
  },
  hasConsoleLogger: () => {
    {
      return hasConsoleLogger;
    }
  },
  groupBy: () => {
    {
      return groupBy;
    }
  },
  getWindowTop: () => {
    {
      return getWindowTop;
    }
  },
  getWindowSelf: () => {
    {
      return getWindowSelf;
    }
  },
  getWindowLocation: () => {
    {
      return getWindowLocation;
    }
  },
  getWindowFromDocument: () => {
    {
      return getWindowFromDocument;
    }
  },
  getValueString: () => {
    {
      return getValueString;
    }
  },
  getValue: () => {
    {
      return getValue;
    }
  },
  getUserConfiguredParams: () => {
    {
      return getUserConfiguredParams;
    }
  },
  getUniqueIdentifierStr: () => {
    {
      return getUniqueIdentifierStr;
    }
  },
  getPrebidInternal: () => {
    {
      return getPrebidInternal;
    }
  },
  getPerformanceNow: () => {
    {
      return getPerformanceNow;
    }
  },
  getParameterByName: () => {
    {
      return getParameterByName;
    }
  },
  getOrigin: () => {
    {
      return getOrigin;
    }
  },
  getOldestHighestCpmBid: () => {
    {
      return getOldestHighestCpmBid;
    }
  },
  getMinValueFromArray: () => {
    {
      return getMinValueFromArray;
    }
  },
  getMaxValueFromArray: () => {
    {
      return getMaxValueFromArray;
    }
  },
  getLatestHighestCpmBid: () => {
    {
      return getLatestHighestCpmBid;
    }
  },
  getKeys: () => {
    {
      return getKeys;
    }
  },
  getKeyByValue: () => {
    {
      return getKeyByValue;
    }
  },
  getHighestCpm: () => {
    {
      return getHighestCpm;
    }
  },
  getGptSlotInfoForAdUnitCode: () => {
    {
      return getGptSlotInfoForAdUnitCode;
    }
  },
  getDefinedParams: () => {
    {
      return getDefinedParams;
    }
  },
  getDNT: () => {
    {
      return getDNT;
    }
  },
  getBidderCodes: () => {
    {
      return getBidderCodes;
    }
  },
  getBidRequest: () => {
    {
      return getBidRequest;
    }
  },
  getBidIdParameter: () => {
    {
      return getBidIdParameter;
    }
  },
  getAdUnitSizes: () => {
    {
      return getAdUnitSizes;
    }
  },
  generateUUID: () => {
    {
      return generateUUID;
    }
  },
  formatQS: () => {
    {
      return formatQS;
    }
  },
  flatten: () => {
    {
      return flatten;
    }
  },
  fill: () => {
    {
      return fill;
    }
  },
  delayExecution: () => {
    {
      return delayExecution;
    }
  },
  deepSetValue: () => {
    {
      return dset_es_default;
    }
  },
  deepEqual: () => {
    {
      return deepEqual;
    }
  },
  deepClone: () => {
    {
      return deepClone;
    }
  },
  deepAccess: () => {
    {
      return dlv;
    }
  },
  debugTurnedOn: () => {
    {
      return debugTurnedOn;
    }
  },
  cyrb53Hash: () => {
    {
      return cyrb53Hash;
    }
  },
  createTrackPixelIframeHtml: () => {
    {
      return createTrackPixelIframeHtml;
    }
  },
  createTrackPixelHtml: () => {
    {
      return createTrackPixelHtml;
    }
  },
  createInvisibleIframe: () => {
    {
      return createInvisibleIframe;
    }
  },
  convertTypes: () => {
    {
      return convertTypes;
    }
  },
  convertCamelToUnderscore: () => {
    {
      return convertCamelToUnderscore;
    }
  },
  contains: () => {
    {
      return contains;
    }
  },
  compareOn: () => {
    {
      return compareOn;
    }
  },
  cleanObj: () => {
    {
      return cleanObj;
    }
  },
  chunk: () => {
    {
      return chunk;
    }
  },
  checkCookieSupport: () => {
    {
      return checkCookieSupport;
    }
  },
  callBurl: () => {
    {
      return callBurl;
    }
  },
  buildUrl: () => {
    {
      return buildUrl;
    }
  },
  bind: () => {
    {
      return bind;
    }
  },
  adUnitsFilter: () => {
    {
      return adUnitsFilter;
    }
  },
  _map: () => {
    {
      return _map;
    }
  },
  _each: () => {
    {
      return _each;
    }
  }
});
function getPrebidInternal() {
  return prebidInternal;
}
function getUniqueIdentifierStr() {
  return getIncrementalInteger() + Math.random().toString(16).substr(2);
}
function generateUUID(placeholder) {
  return placeholder ? (placeholder ^ _getRandomData() >> placeholder / 4).toString(16) : ([1e7] + -1000 + -4000 + -8000 + -100000000000).replace(/[018]/g, generateUUID);
}
function getBidIdParameter(key, paramsObj) {
  if (paramsObj && paramsObj[key]) {
    return paramsObj[key];
  }
  return "";
}
function tryAppendQueryString(existingUrl, key, value) {
  if (value) {
    return existingUrl + key + "=" + encodeURIComponent(value) + "&";
  }
  return existingUrl;
}
function parseQueryStringParameters(queryObj) {
  let result = "";
  for (var k in queryObj) {
    if (queryObj.hasOwnProperty(k)) {
      result += k + "=" + encodeURIComponent(queryObj[k]) + "&";
    }
  }
  result = result.replace(/&$/, "");
  return result;
}
function transformAdServerTargetingObj(targeting) {
  if (targeting && Object.getOwnPropertyNames(targeting).length > 0) {
    return getKeys(targeting).map((key) => `${key}=${encodeURIComponent(getValue(targeting, key))}`).join("&");
  } else {
    return "";
  }
}
function getAdUnitSizes(adUnit) {
  if (!adUnit) {
    return;
  }
  let sizes = [];
  if (adUnit.mediaTypes && adUnit.mediaTypes.banner && Array.isArray(adUnit.mediaTypes.banner.sizes)) {
    let bannerSizes = adUnit.mediaTypes.banner.sizes;
    if (Array.isArray(bannerSizes[0])) {
      sizes = bannerSizes;
    } else {
      sizes.push(bannerSizes);
    }
  } else if (Array.isArray(adUnit.sizes)) {
    if (Array.isArray(adUnit.sizes[0])) {
      sizes = adUnit.sizes;
    } else {
      sizes.push(adUnit.sizes);
    }
  }
  return sizes;
}
function parseSizesInput(sizeObj) {
  var parsedSizes = [];
  if (typeof sizeObj === "string") {
    var sizes = sizeObj.split(",");
    var sizeRegex = /^(\d)+x(\d)+$/i;
    if (sizes) {
      for (var curSizePos in sizes) {
        if (hasOwn(sizes, curSizePos) && sizes[curSizePos].match(sizeRegex)) {
          parsedSizes.push(sizes[curSizePos]);
        }
      }
    }
  } else if (typeof sizeObj === "object") {
    var sizeArrayLength = sizeObj.length;
    if (sizeArrayLength > 0) {
      if (sizeArrayLength === 2 && typeof sizeObj[0] === "number" && typeof sizeObj[1] === "number") {
        parsedSizes.push(parseGPTSingleSizeArray(sizeObj));
      } else {
        for (var i = 0;i < sizeArrayLength; i++) {
          parsedSizes.push(parseGPTSingleSizeArray(sizeObj[i]));
        }
      }
    }
  }
  return parsedSizes;
}
function parseGPTSingleSizeArray(singleSize) {
  if (isValidGPTSingleSize(singleSize)) {
    return singleSize[0] + "x" + singleSize[1];
  }
}
function parseGPTSingleSizeArrayToRtbSize(singleSize) {
  if (isValidGPTSingleSize(singleSize)) {
    return { w: singleSize[0], h: singleSize[1] };
  }
}
function getWindowTop() {
  return window.top;
}
function getWindowSelf() {
  return window.self;
}
function getWindowLocation() {
  return window.location;
}
function logMessage() {
  if (debugTurnedOn() && consoleLogExists) {
    console.log.apply(console, decorateLog(arguments, "MESSAGE:"));
  }
}
function logInfo() {
  if (debugTurnedOn() && consoleInfoExists) {
    console.info.apply(console, decorateLog(arguments, "INFO:"));
  }
}
function logWarn() {
  if (debugTurnedOn() && consoleWarnExists) {
    console.warn.apply(console, decorateLog(arguments, "WARNING:"));
  }
  emitEvent(CONSTANTS3.EVENTS.AUCTION_DEBUG, { type: "WARNING", arguments });
}
function logError() {
  if (debugTurnedOn() && consoleErrorExists) {
    console.error.apply(console, decorateLog(arguments, "ERROR:"));
  }
  emitEvent(CONSTANTS3.EVENTS.AUCTION_DEBUG, { type: "ERROR", arguments });
}
function prefixLog(prefix) {
  function decorate(fn) {
    return function(...args) {
      fn(prefix, ...args);
    };
  }
  return {
    logError: decorate(logError),
    logWarn: decorate(logWarn),
    logMessage: decorate(logMessage),
    logInfo: decorate(logInfo)
  };
}
function hasConsoleLogger() {
  return consoleLogExists;
}
function debugTurnedOn() {
  return !!config.getConfig("debug");
}
function createInvisibleIframe() {
  var f = document.createElement("iframe");
  f.id = getUniqueIdentifierStr();
  f.height = 0;
  f.width = 0;
  f.border = "0px";
  f.hspace = "0";
  f.vspace = "0";
  f.marginWidth = "0";
  f.marginHeight = "0";
  f.style.border = "0";
  f.scrolling = "no";
  f.frameBorder = "0";
  f.src = "about:blank";
  f.style.display = "none";
  return f;
}
function getParameterByName(name) {
  return parseQS(getWindowLocation().search)[name] || "";
}
function isA(object, _t) {
  return toString.call(object) === "[object " + _t + "]";
}
function isFn(object) {
  return isA(object, tFn);
}
function isStr(object) {
  return isA(object, tStr);
}
function isArray(object) {
  return isA(object, tArr);
}
function isNumber(object) {
  return isA(object, tNumb);
}
function isPlainObject(object) {
  return isA(object, tObject);
}
function isBoolean(object) {
  return isA(object, tBoolean);
}
function isEmpty(object) {
  if (!object)
    return true;
  if (isArray(object) || isStr(object)) {
    return !(object.length > 0);
  }
  for (var k in object) {
    if (hasOwnProperty.call(object, k))
      return false;
  }
  return true;
}
function isEmptyStr(str) {
  return isStr(str) && (!str || str.length === 0);
}
function _each(object, fn) {
  if (isEmpty(object))
    return;
  if (isFn(object.forEach))
    return object.forEach(fn, this);
  var k = 0;
  var l = object.length;
  if (l > 0) {
    for (;k < l; k++)
      fn(object[k], k, object);
  } else {
    for (k in object) {
      if (hasOwnProperty.call(object, k))
        fn.call(this, object[k], k);
    }
  }
}
function contains(a, obj) {
  if (isEmpty(a)) {
    return false;
  }
  if (isFn(a.indexOf)) {
    return a.indexOf(obj) !== -1;
  }
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}
function _map(object, callback) {
  if (isEmpty(object))
    return [];
  if (isFn(object.map))
    return object.map(callback);
  var output = [];
  _each(object, function(value, key) {
    output.push(callback(value, key, object));
  });
  return output;
}
function hasOwn(objectToCheck, propertyToCheckFor) {
  if (objectToCheck.hasOwnProperty) {
    return objectToCheck.hasOwnProperty(propertyToCheckFor);
  } else {
    return typeof objectToCheck[propertyToCheckFor] !== "undefined" && objectToCheck.constructor.prototype[propertyToCheckFor] !== objectToCheck[propertyToCheckFor];
  }
}
function insertElement(elm, doc, target, asLastChildChild) {
  doc = doc || document;
  let parentEl;
  if (target) {
    parentEl = doc.getElementsByTagName(target);
  } else {
    parentEl = doc.getElementsByTagName("head");
  }
  try {
    parentEl = parentEl.length ? parentEl : doc.getElementsByTagName("body");
    if (parentEl.length) {
      parentEl = parentEl[0];
      let insertBeforeEl = asLastChildChild ? null : parentEl.firstChild;
      return parentEl.insertBefore(elm, insertBeforeEl);
    }
  } catch (e) {
  }
}
function waitForElementToLoad(element, timeout) {
  let timer = null;
  return new Promise((resolve) => {
    const onLoad = function() {
      element.removeEventListener("load", onLoad);
      element.removeEventListener("error", onLoad);
      if (timer != null) {
        window.clearTimeout(timer);
      }
      resolve();
    };
    element.addEventListener("load", onLoad);
    element.addEventListener("error", onLoad);
    if (timeout != null) {
      timer = window.setTimeout(onLoad, timeout);
    }
  });
}
function triggerPixel(url, done, timeout) {
  const img = new Image;
  if (done && internal.isFn(done)) {
    waitForElementToLoad(img, timeout).then(done);
  }
  img.src = url;
}
function callBurl({ source, burl }) {
  if (source === CONSTANTS3.S2S.SRC && burl) {
    internal.triggerPixel(burl);
  }
}
function insertHtmlIntoIframe(htmlCode) {
  if (!htmlCode) {
    return;
  }
  let iframe = document.createElement("iframe");
  iframe.id = getUniqueIdentifierStr();
  iframe.width = 0;
  iframe.height = 0;
  iframe.hspace = "0";
  iframe.vspace = "0";
  iframe.marginWidth = "0";
  iframe.marginHeight = "0";
  iframe.style.display = "none";
  iframe.style.height = "0px";
  iframe.style.width = "0px";
  iframe.scrolling = "no";
  iframe.frameBorder = "0";
  iframe.allowtransparency = "true";
  internal.insertElement(iframe, document, "body");
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(htmlCode);
  iframe.contentWindow.document.close();
}
function insertUserSyncIframe(url, done, timeout) {
  let iframeHtml = internal.createTrackPixelIframeHtml(url, false, "allow-scripts allow-same-origin");
  let div = document.createElement("div");
  div.innerHTML = iframeHtml;
  let iframe = div.firstChild;
  if (done && internal.isFn(done)) {
    waitForElementToLoad(iframe, timeout).then(done);
  }
  internal.insertElement(iframe, document, "html", true);
}
function createTrackPixelHtml(url) {
  if (!url) {
    return "";
  }
  let escapedUrl = encodeURI(url);
  let img = '<div style="position:absolute;left:0px;top:0px;visibility:hidden;">';
  img += '<img src="' + escapedUrl + '"></div>';
  return img;
}
function createTrackPixelIframeHtml(url, encodeUri = true, sandbox = "") {
  if (!url) {
    return "";
  }
  if (encodeUri) {
    url = encodeURI(url);
  }
  if (sandbox) {
    sandbox = `sandbox="${sandbox}"`;
  }
  return `<iframe ${sandbox} id="${getUniqueIdentifierStr()}"
      frameborder="0"
      allowtransparency="true"
      marginheight="0" marginwidth="0"
      width="0" hspace="0" vspace="0" height="0"
      style="height:0px;width:0px;display:none;"
      scrolling="no"
      src="${url}">
    </iframe>`;
}
function getValueString(param, val, defaultValue) {
  if (val === undefined || val === null) {
    return defaultValue;
  }
  if (isStr(val)) {
    return val;
  }
  if (isNumber(val)) {
    return val.toString();
  }
  internal.logWarn("Unsuported type for param: " + param + " required type: String");
}
function uniques(value, index, arry) {
  return arry.indexOf(value) === index;
}
function flatten(a, b) {
  return a.concat(b);
}
function getBidRequest(id, bidderRequests) {
  if (!id) {
    return;
  }
  let bidRequest;
  bidderRequests.some((bidderRequest) => {
    let result = find(bidderRequest.bids, (bid) => ["bidId", "adId", "bid_id"].some((type) => bid[type] === id));
    if (result) {
      bidRequest = result;
    }
    return result;
  });
  return bidRequest;
}
function getKeys(obj) {
  return Object.keys(obj);
}
function getValue(obj, key) {
  return obj[key];
}
function getKeyByValue(obj, value) {
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop] === value) {
        return prop;
      }
    }
  }
}
function getBidderCodes(adUnits = $$PREBID_GLOBAL$$.adUnits) {
  return adUnits.map((unit) => unit.bids.map((bid) => bid.bidder).reduce(flatten, [])).reduce(flatten, []).filter(uniques);
}
function isGptPubadsDefined() {
  if (window.googletag && isFn(window.googletag.pubads) && isFn(window.googletag.pubads().getSlots)) {
    return true;
  }
}
function isApnGetTagDefined() {
  if (window.apntag && isFn(window.apntag.getTag)) {
    return true;
  }
}
function shuffle(array) {
  let counter = array.length;
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}
function adUnitsFilter(filter, bid) {
  return includes(filter, bid && bid.adUnitCode);
}
function deepClone(obj) {
  return import_just_clone.default(obj);
}
function inIframe() {
  try {
    return internal.getWindowSelf() !== internal.getWindowTop();
  } catch (e) {
    return true;
  }
}
function isSafariBrowser() {
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
}
function replaceAuctionPrice(str, cpm) {
  if (!str)
    return;
  return str.replace(/\$\{AUCTION_PRICE\}/g, cpm);
}
function replaceClickThrough(str, clicktag) {
  if (!str || !clicktag || typeof clicktag !== "string")
    return;
  return str.replace(/\${CLICKTHROUGH}/g, clicktag);
}
function timestamp() {
  return new Date().getTime();
}
function getPerformanceNow() {
  return window.performance && window.performance.now && window.performance.now() || 0;
}
function hasDeviceAccess() {
  return config.getConfig("deviceAccess") !== false;
}
function checkCookieSupport() {
  if (window.navigator.cookieEnabled || !!document.cookie.length) {
    return true;
  }
}
function delayExecution(func, numRequiredCalls) {
  if (numRequiredCalls < 1) {
    throw new Error(`numRequiredCalls must be a positive number. Got ${numRequiredCalls}`);
  }
  let numCalls = 0;
  return function() {
    numCalls++;
    if (numCalls === numRequiredCalls) {
      func.apply(this, arguments);
    }
  };
}
function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}
function getDefinedParams(object, params) {
  return params.filter((param) => object[param]).reduce((bid, param) => Object.assign(bid, { [param]: object[param] }), {});
}
function isValidMediaTypes(mediaTypes) {
  const SUPPORTED_MEDIA_TYPES = ["banner", "native", "video"];
  const SUPPORTED_STREAM_TYPES = ["instream", "outstream", "adpod"];
  const types = Object.keys(mediaTypes);
  if (!types.every((type) => includes(SUPPORTED_MEDIA_TYPES, type))) {
    return false;
  }
  if (mediaTypes.video && mediaTypes.video.context) {
    return includes(SUPPORTED_STREAM_TYPES, mediaTypes.video.context);
  }
  return true;
}
function getUserConfiguredParams(adUnits, adUnitCode, bidder) {
  return adUnits.filter((adUnit) => adUnit.code === adUnitCode).map((adUnit) => adUnit.bids).reduce(flatten, []).filter((bidderData) => bidderData.bidder === bidder).map((bidderData) => bidderData.params || {});
}
function getOrigin() {
  if (!window.location.origin) {
    return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
  } else {
    return window.location.origin;
  }
}
function getDNT() {
  return navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1" || navigator.doNotTrack === "yes";
}
function isAdUnitCodeMatchingSlot(slot) {
  return (adUnitCode) => compareCodeAndSlot(slot, adUnitCode);
}
function isSlotMatchingAdUnitCode(adUnitCode) {
  return (slot) => compareCodeAndSlot(slot, adUnitCode);
}
function getGptSlotInfoForAdUnitCode(adUnitCode) {
  let matchingSlot;
  if (isGptPubadsDefined()) {
    matchingSlot = find(window.googletag.pubads().getSlots(), isSlotMatchingAdUnitCode(adUnitCode));
  }
  if (matchingSlot) {
    return {
      gptSlot: matchingSlot.getAdUnitPath(),
      divId: matchingSlot.getSlotElementId()
    };
  }
  return {};
}
function unsupportedBidderMessage(adUnit, bidder) {
  const mediaType = Object.keys(adUnit.mediaTypes || { banner: "banner" }).join(", ");
  return `
    ${adUnit.code} is a ${mediaType} ad unit
    containing bidders that don't support ${mediaType}: ${bidder}.
    This bidder won't fetch demand.
  `;
}
function isInteger(value) {
  if (Number.isInteger) {
    return Number.isInteger(value);
  } else {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
  }
}
function convertCamelToUnderscore(value) {
  return value.replace(/(?:^|\.?)([A-Z])/g, function(x, y) {
    return "_" + y.toLowerCase();
  }).replace(/^_/, "");
}
function cleanObj(obj) {
  return Object.keys(obj).reduce((newObj, key) => {
    if (typeof obj[key] !== "undefined") {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {});
}
function pick(obj, properties) {
  if (typeof obj !== "object") {
    return {};
  }
  return properties.reduce((newObj, prop, i) => {
    if (typeof prop === "function") {
      return newObj;
    }
    let newProp = prop;
    let match = prop.match(/^(.+?)\sas\s(.+?)$/i);
    if (match) {
      prop = match[1];
      newProp = match[2];
    }
    let value = obj[prop];
    if (typeof properties[i + 1] === "function") {
      value = properties[i + 1](value, newObj);
    }
    if (typeof value !== "undefined") {
      newObj[newProp] = value;
    }
    return newObj;
  }, {});
}
function transformBidderParamKeywords(keywords, paramName = "keywords") {
  let arrs = [];
  _each(keywords, (v, k) => {
    if (isArray(v)) {
      let values = [];
      _each(v, (val) => {
        val = getValueString(paramName + "." + k, val);
        if (val || val === "") {
          values.push(val);
        }
      });
      v = values;
    } else {
      v = getValueString(paramName + "." + k, v);
      if (isStr(v)) {
        v = [v];
      } else {
        return;
      }
    }
    arrs.push({ key: k, value: v });
  });
  return arrs;
}
function convertTypes(types, params) {
  Object.keys(types).forEach((key) => {
    if (params[key]) {
      if (isFn(types[key])) {
        params[key] = types[key](params[key]);
      } else {
        params[key] = tryConvertType(types[key], params[key]);
      }
      if (isNaN(params[key])) {
        delete params.key;
      }
    }
  });
  return params;
}
function isArrayOfNums(val, size) {
  return isArray(val) && (size ? val.length === size : true) && val.every((v) => isInteger(v));
}
function fill(value, length) {
  let newArray = [];
  for (let i = 0;i < length; i++) {
    let valueToPush = isPlainObject(value) ? deepClone(value) : value;
    newArray.push(valueToPush);
  }
  return newArray;
}
function chunk(array, size) {
  let newArray = [];
  for (let i = 0;i < Math.ceil(array.length / size); i++) {
    let start = i * size;
    let end = start + size;
    newArray.push(array.slice(start, end));
  }
  return newArray;
}
function getMinValueFromArray(array) {
  return Math.min(...array);
}
function getMaxValueFromArray(array) {
  return Math.max(...array);
}
function compareOn(property) {
  return function compare(a, b) {
    if (a[property] < b[property]) {
      return 1;
    }
    if (a[property] > b[property]) {
      return -1;
    }
    return 0;
  };
}
function parseQS(query) {
  return !query ? {} : query.replace(/^\?/, "").split("&").reduce((acc, criteria) => {
    let [k, v] = criteria.split("=");
    if (/\[\]$/.test(k)) {
      k = k.replace("[]", "");
      acc[k] = acc[k] || [];
      acc[k].push(v);
    } else {
      acc[k] = v || "";
    }
    return acc;
  }, {});
}
function formatQS(query) {
  return Object.keys(query).map((k) => Array.isArray(query[k]) ? query[k].map((v) => `${k}[]=${v}`).join("&") : `${k}=${query[k]}`).join("&");
}
function parseUrl(url, options) {
  let parsed = document.createElement("a");
  if (options && "noDecodeWholeURL" in options && options.noDecodeWholeURL) {
    parsed.href = url;
  } else {
    parsed.href = decodeURIComponent(url);
  }
  let qsAsString = options && "decodeSearchAsString" in options && options.decodeSearchAsString;
  return {
    href: parsed.href,
    protocol: (parsed.protocol || "").replace(/:$/, ""),
    hostname: parsed.hostname,
    port: +parsed.port,
    pathname: parsed.pathname.replace(/^(?!\/)/, "/"),
    search: qsAsString ? parsed.search : internal.parseQS(parsed.search || ""),
    hash: (parsed.hash || "").replace(/^#/, ""),
    host: parsed.host || window.location.host
  };
}
function buildUrl(obj) {
  return (obj.protocol || "http") + "://" + (obj.host || obj.hostname + (obj.port ? `:${obj.port}` : "")) + (obj.pathname || "") + (obj.search ? `?${internal.formatQS(obj.search || "")}` : "") + (obj.hash ? `#${obj.hash}` : "");
}
function deepEqual(obj1, obj2, { checkTypes = false } = {}) {
  if (obj1 === obj2)
    return true;
  else if (typeof obj1 === "object" && obj1 !== null && (typeof obj2 === "object" && obj2 !== null) && (!checkTypes || obj1.constructor === obj2.constructor)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length)
      return false;
    for (let prop in obj1) {
      if (obj2.hasOwnProperty(prop)) {
        if (!deepEqual(obj1[prop], obj2[prop], { checkTypes })) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}
function mergeDeep(target, ...sources) {
  if (!sources.length)
    return target;
  const source = sources.shift();
  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (isPlainObject(source[key])) {
        if (!target[key])
          Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else if (isArray(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: [...source[key]] });
        } else if (isArray(target[key])) {
          source[key].forEach((obj) => {
            let addItFlag = 1;
            for (let i = 0;i < target[key].length; i++) {
              if (deepEqual(target[key][i], obj)) {
                addItFlag = 0;
                break;
              }
            }
            if (addItFlag) {
              target[key].push(obj);
            }
          });
        }
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
}
function cyrb53Hash(str, seed = 0) {
  let imul = function(opA, opB) {
    if (isFn(Math.imul)) {
      return Math.imul(opA, opB);
    } else {
      opB |= 0;
      var result = (opA & 4194303) * opB;
      if (opA & 4290772992)
        result += (opA & 4290772992) * opB | 0;
      return result | 0;
    }
  };
  let h1 = 3735928559 ^ seed;
  let h2 = 1103547991 ^ seed;
  for (let i = 0, ch;i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = imul(h1 ^ ch, 2654435761);
    h2 = imul(h2 ^ ch, 1597334677);
  }
  h1 = imul(h1 ^ h1 >>> 16, 2246822507) ^ imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = imul(h2 ^ h2 >>> 16, 2246822507) ^ imul(h1 ^ h1 >>> 13, 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString();
}
function getWindowFromDocument(doc) {
  return doc ? doc.defaultView : null;
}
var import_just_clone, _getRandomData, isValidGPTSingleSize, decorateLog, getHighestCpmCallback, tryConvertType, CONSTANTS3, tArr, tStr, tFn, tNumb, tObject, tBoolean, toString, consoleExists, consoleLogExists, consoleInfoExists, consoleWarnExists, consoleErrorExists, emitEvent, internal, prebidInternal, uniqueRef, bind, getIncrementalInteger, getHighestCpm, getOldestHighestCpmBid, getLatestHighestCpmBid, compareCodeAndSlot;
var init_utils = __esm(() => {
  init_config();
  import_just_clone = __toESM(require_just_clone(), 1);
  init_polyfill();
  init_dlv();
  init_dset_es();
  _getRandomData = function() {
    if (window && window.crypto && window.crypto.getRandomValues) {
      return crypto.getRandomValues(new Uint8Array(1))[0] % 16;
    } else {
      return Math.random() * 16;
    }
  };
  isValidGPTSingleSize = function(singleSize) {
    return isArray(singleSize) && singleSize.length === 2 && (!isNaN(singleSize[0]) && !isNaN(singleSize[1]));
  };
  decorateLog = function(args, prefix) {
    args = [].slice.call(args);
    let bidder = config.getCurrentBidder();
    prefix && args.unshift(prefix);
    if (bidder) {
      args.unshift(label("#aaa"));
    }
    args.unshift(label("#3b88c3"));
    args.unshift("%cPrebid" + (bidder ? `%c${bidder}` : ""));
    return args;
    function label(color) {
      return `display: inline-block; color: #fff; background: ${color}; padding: 1px 4px; border-radius: 3px;`;
    }
  };
  getHighestCpmCallback = function(useTieBreakerProperty, tieBreakerCallback) {
    return (previous, current) => {
      if (previous.cpm === current.cpm) {
        return tieBreakerCallback(previous[useTieBreakerProperty], current[useTieBreakerProperty]) ? current : previous;
      }
      return previous.cpm < current.cpm ? current : previous;
    };
  };
  tryConvertType = function(typeToConvert, value) {
    if (typeToConvert === "string") {
      return value && value.toString();
    } else if (typeToConvert === "number") {
      return Number(value);
    } else {
      return value;
    }
  };
  CONSTANTS3 = require_constants();
  tArr = "Array";
  tStr = "String";
  tFn = "Function";
  tNumb = "Number";
  tObject = "Object";
  tBoolean = "Boolean";
  toString = Object.prototype.toString;
  consoleExists = Boolean(window.console);
  consoleLogExists = Boolean(consoleExists && window.console.log);
  consoleInfoExists = Boolean(consoleExists && window.console.info);
  consoleWarnExists = Boolean(consoleExists && window.console.warn);
  consoleErrorExists = Boolean(consoleExists && window.console.error);
  emitEvent = function() {
    let ev;
    return function() {
      if (ev == null) {
        ev = (init_events(), __toCommonJS(exports_events));
      }
      return ev.emit.apply(ev, arguments);
    };
  }();
  internal = {
    checkCookieSupport,
    createTrackPixelIframeHtml,
    getWindowSelf,
    getWindowTop,
    getWindowLocation,
    insertUserSyncIframe,
    insertElement,
    isFn,
    triggerPixel,
    logError,
    logWarn,
    logMessage,
    logInfo,
    parseQS,
    formatQS,
    deepEqual
  };
  prebidInternal = {};
  uniqueRef = {};
  bind = function(a, b) {
    return b;
  }.bind(null, 1, uniqueRef)() === uniqueRef ? Function.prototype.bind : function(bind2) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return self.apply(bind2, args.concat(Array.prototype.slice.call(arguments)));
    };
  };
  getIncrementalInteger = function() {
    var count = 0;
    return function() {
      count++;
      return count;
    };
  }();
  getHighestCpm = getHighestCpmCallback("timeToRespond", (previous, current) => previous > current);
  getOldestHighestCpmBid = getHighestCpmCallback("responseTimestamp", (previous, current) => previous > current);
  getLatestHighestCpmBid = getHighestCpmCallback("responseTimestamp", (previous, current) => previous < current);
  compareCodeAndSlot = (slot, adUnitCode) => slot.getAdUnitPath() === adUnitCode || slot.getSlotElementId() === adUnitCode;
});

// src/sizeMapping.js
function setSizeConfig(config4) {
  sizeConfig = config4;
}
function getLabels(bidOrAdUnit, activeLabels) {
  if (bidOrAdUnit.labelAll) {
    return { labelAll: true, labels: bidOrAdUnit.labelAll, activeLabels };
  }
  return { labelAll: false, labels: bidOrAdUnit.labelAny, activeLabels };
}
function resolveStatus({ labels = [], labelAll = false, activeLabels = [] } = {}, mediaTypes, sizes, configs = sizeConfig) {
  let maps = evaluateSizeConfig(configs);
  if (!isPlainObject(mediaTypes)) {
    if (sizes) {
      mediaTypes = {
        banner: {
          sizes
        }
      };
    } else {
      mediaTypes = {};
    }
  } else {
    mediaTypes = deepClone(mediaTypes);
  }
  let oldSizes = dlv(mediaTypes, "banner.sizes");
  if (maps.shouldFilter && oldSizes) {
    mediaTypes.banner.sizes = oldSizes.filter((size) => maps.sizesSupported[size]);
  }
  let allMediaTypes = Object.keys(mediaTypes);
  let results = {
    active: allMediaTypes.every((type) => type !== "banner") || allMediaTypes.some((type) => type === "banner") && dlv(mediaTypes, "banner.sizes.length") > 0 && (labels.length === 0 || (!labelAll && (labels.some((label) => maps.labels[label]) || labels.some((label) => includes(activeLabels, label))) || labelAll && labels.reduce((result, label) => !result ? result : maps.labels[label] || includes(activeLabels, label), true))),
    mediaTypes
  };
  if (oldSizes && oldSizes.length !== mediaTypes.banner.sizes.length) {
    results.filterResults = {
      before: oldSizes,
      after: mediaTypes.banner.sizes
    };
  }
  return results;
}
function processAdUnitsForLabels(adUnits, activeLabels) {
  return adUnits.reduce((adUnits2, adUnit) => {
    let {
      active,
      mediaTypes,
      filterResults
    } = resolveStatus(getLabels(adUnit, activeLabels), adUnit.mediaTypes, adUnit.sizes);
    if (!active) {
      logInfo(`Size mapping disabled adUnit "${adUnit.code}"`);
    } else {
      if (filterResults) {
        logInfo(`Size mapping filtered adUnit "${adUnit.code}" banner sizes from `, filterResults.before, "to ", filterResults.after);
      }
      adUnit.mediaTypes = mediaTypes;
      adUnit.bids = adUnit.bids.reduce((bids, bid) => {
        let {
          active: active2,
          mediaTypes: mediaTypes2,
          filterResults: filterResults2
        } = resolveStatus(getLabels(bid, activeLabels), adUnit.mediaTypes);
        if (!active2) {
          logInfo(`Size mapping deactivated adUnit "${adUnit.code}" bidder "${bid.bidder}"`);
        } else {
          if (filterResults2) {
            logInfo(`Size mapping filtered adUnit "${adUnit.code}" bidder "${bid.bidder}" banner sizes from `, filterResults2.before, "to ", filterResults2.after);
            bid.mediaTypes = mediaTypes2;
          }
          bids.push(bid);
        }
        return bids;
      }, []);
      adUnits2.push(adUnit);
    }
    return adUnits2;
  }, []);
}
var evaluateSizeConfig, sizeConfig;
var init_sizeMapping = __esm(() => {
  init_config();
  init_utils();
  init_polyfill();
  evaluateSizeConfig = function(configs) {
    return configs.reduce((results, config4) => {
      if (typeof config4 === "object" && typeof config4.mediaQuery === "string" && config4.mediaQuery.length > 0) {
        let ruleMatch = false;
        try {
          ruleMatch = getWindowTop().matchMedia(config4.mediaQuery).matches;
        } catch (e) {
          logWarn("Unfriendly iFrame blocks sizeConfig from being correctly evaluated");
          ruleMatch = matchMedia(config4.mediaQuery).matches;
        }
        if (ruleMatch) {
          if (Array.isArray(config4.sizesSupported)) {
            results.shouldFilter = true;
          }
          ["labels", "sizesSupported"].forEach((type) => (config4[type] || []).forEach((thing) => results[type][thing] = true));
        }
      } else {
        logWarn('sizeConfig rule missing required property "mediaQuery"');
      }
      return results;
    }, {
      labels: {},
      sizesSupported: {},
      shouldFilter: false
    });
  };
  sizeConfig = [];
  config.getConfig("sizeConfig", (config4) => setSizeConfig(config4.sizeConfig));
});

// src/ajax.js
function ajaxBuilder(timeout = 3000, { request, done } = {}) {
  return function(url, callback, data, options = {}) {
    try {
      let x;
      let method = options.method || (data ? "POST" : "GET");
      let parser = document.createElement("a");
      parser.href = url;
      let callbacks = typeof callback === "object" && callback !== null ? callback : {
        success: function() {
          logMessage("xhr success");
        },
        error: function(e) {
          logError("xhr error", null, e);
        }
      };
      if (typeof callback === "function") {
        callbacks.success = callback;
      }
      x = new window.XMLHttpRequest;
      x.onreadystatechange = function() {
        if (x.readyState === XHR_DONE) {
          if (typeof done === "function") {
            done(parser.origin);
          }
          let status = x.status;
          if (status >= 200 && status < 300 || status === 304) {
            callbacks.success(x.responseText, x);
          } else {
            callbacks.error(x.statusText, x);
          }
        }
      };
      if (!config.getConfig("disableAjaxTimeout")) {
        x.ontimeout = function() {
          logError("  xhr timeout after ", x.timeout, "ms");
        };
      }
      if (method === "GET" && data) {
        let urlInfo = parseUrl(url, options);
        Object.assign(urlInfo.search, data);
        url = buildUrl(urlInfo);
      }
      x.open(method, url, true);
      if (!config.getConfig("disableAjaxTimeout")) {
        x.timeout = timeout;
      }
      if (options.withCredentials) {
        x.withCredentials = true;
      }
      _each(options.customHeaders, (value, header) => {
        x.setRequestHeader(header, value);
      });
      if (options.preflight) {
        x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      }
      x.setRequestHeader("Content-Type", options.contentType || "text/plain");
      if (typeof request === "function") {
        request(parser.origin);
      }
      if (method === "POST" && data) {
        x.send(data);
      } else {
        x.send();
      }
    } catch (error) {
      logError("xhr construction", error);
      typeof callback === "object" && callback !== null && callback.error(error);
    }
  };
}
var XHR_DONE, ajax;
var init_ajax = __esm(() => {
  init_config();
  init_utils();
  XHR_DONE = 4;
  ajax = ajaxBuilder();
});

// src/videoCache.js
function store(bids, done) {
  const requestData = {
    puts: bids.map(toStorageRequest)
  };
  ajax(config.getConfig("cache.url"), shimStorageCallback(done), JSON.stringify(requestData), {
    contentType: "text/plain",
    withCredentials: true
  });
}
function getCacheUrl(id) {
  return `${config.getConfig("cache.url")}?uuid=${id}`;
}
var wrapURI, toStorageRequest, shimStorageCallback;
var init_videoCache = __esm(() => {
  init_ajax();
  init_config();
  init_auctionManager();
  wrapURI = function(uri, impUrl) {
    let vastImp = impUrl ? `<![CDATA[${impUrl}]]>` : ``;
    return `<VAST version="3.0">
    <Ad>
      <Wrapper>
        <AdSystem>prebid.org wrapper</AdSystem>
        <VASTAdTagURI><![CDATA[${uri}]]></VASTAdTagURI>
        <Impression>${vastImp}</Impression>
        <Creatives></Creatives>
      </Wrapper>
    </Ad>
  </VAST>`;
  };
  toStorageRequest = function(bid, { index = auctionManager2.index } = {}) {
    const vastValue = bid.vastXml ? bid.vastXml : wrapURI(bid.vastUrl, bid.vastImpUrl);
    const auction = index.getAuction(bid);
    let payload = {
      type: "xml",
      value: vastValue,
      ttlseconds: Number(bid.ttl)
    };
    if (config.getConfig("cache.vasttrack")) {
      payload.bidder = bid.bidder;
      payload.bidid = bid.requestId;
      payload.aid = bid.auctionId;
    }
    if (auction != null) {
      payload.timestamp = auction.getAuctionStart();
    }
    if (typeof bid.customCacheKey === "string" && bid.customCacheKey !== "") {
      payload.key = bid.customCacheKey;
    }
    return payload;
  };
  shimStorageCallback = function(done) {
    return {
      success: function(responseBody) {
        let ids;
        try {
          ids = JSON.parse(responseBody).responses;
        } catch (e) {
          done(e, []);
          return;
        }
        if (ids) {
          done(null, ids);
        } else {
          done(new Error("The cache server didn't respond with a responses property."), []);
        }
      },
      error: function(statusText, responseBody) {
        done(new Error(`Error storing video ad in the cache: ${statusText}: ${JSON.stringify(responseBody)}`), []);
      }
    };
  };
});

// src/adloader.js
function loadExternalScript(url, moduleCode, callback, doc) {
  if (!moduleCode || !url) {
    logError("cannot load external script without url and moduleCode");
    return;
  }
  if (!includes(_approvedLoadExternalJSList, moduleCode)) {
    logError(`${moduleCode} not whitelisted for loading external JavaScript`);
    return;
  }
  if (!doc) {
    doc = document;
  }
  const storedCachedObject = getCacheObject(doc, url);
  if (storedCachedObject) {
    if (callback && typeof callback === "function") {
      if (storedCachedObject.loaded) {
        callback();
      } else {
        storedCachedObject.callbacks.push(callback);
      }
    }
    return storedCachedObject.tag;
  }
  const cachedDocObj = _requestCache.get(doc) || {};
  const cacheObject = {
    loaded: false,
    tag: null,
    callbacks: []
  };
  cachedDocObj[url] = cacheObject;
  _requestCache.set(doc, cachedDocObj);
  if (callback && typeof callback === "function") {
    cacheObject.callbacks.push(callback);
  }
  logWarn(`module ${moduleCode} is loading external JavaScript`);
  return requestResource(url, function() {
    cacheObject.loaded = true;
    try {
      for (let i = 0;i < cacheObject.callbacks.length; i++) {
        cacheObject.callbacks[i]();
      }
    } catch (e) {
      logError("Error executing callback", "adloader.js:loadExternalScript", e);
    }
  }, doc);
  function requestResource(tagSrc, callback2, doc2) {
    if (!doc2) {
      doc2 = document;
    }
    var jptScript = doc2.createElement("script");
    jptScript.type = "text/javascript";
    jptScript.async = true;
    const cacheObject2 = getCacheObject(doc2, url);
    if (cacheObject2) {
      cacheObject2.tag = jptScript;
    }
    if (jptScript.readyState) {
      jptScript.onreadystatechange = function() {
        if (jptScript.readyState === "loaded" || jptScript.readyState === "complete") {
          jptScript.onreadystatechange = null;
          callback2();
        }
      };
    } else {
      jptScript.onload = function() {
        callback2();
      };
    }
    jptScript.src = tagSrc;
    insertElement(jptScript, doc2);
    return jptScript;
  }
  function getCacheObject(doc2, url2) {
    const cachedDocObj2 = _requestCache.get(doc2);
    if (cachedDocObj2 && cachedDocObj2[url2]) {
      return cachedDocObj2[url2];
    }
    return null;
  }
}
var _requestCache, _approvedLoadExternalJSList;
var init_adloader = __esm(() => {
  init_polyfill();
  init_utils();
  _requestCache = new WeakMap;
  _approvedLoadExternalJSList = [
    "adloox",
    "criteo",
    "outstream",
    "adagio",
    "browsi",
    "brandmetrics",
    "justtag"
  ];
});

// src/Renderer.js
function Renderer(options) {
  const { url, config: config6, id, callback, loaded, adUnitCode } = options;
  this.url = url;
  this.config = config6;
  this.handlers = {};
  this.id = id;
  this.loaded = loaded;
  this.cmd = [];
  this.push = (func) => {
    if (typeof func !== "function") {
      logError("Commands given to Renderer.push must be wrapped in a function");
      return;
    }
    this.loaded ? func.call() : this.cmd.push(func);
  };
  this.callback = callback || (() => {
    this.loaded = true;
    this.process();
  });
  this.render = function() {
    const renderArgs = arguments;
    const runRender = () => {
      if (this._render) {
        this._render.apply(this, renderArgs);
      } else {
        logWarn(`No render function was provided, please use .setRender on the renderer`);
      }
    };
    if (!isRendererPreferredFromAdUnit(adUnitCode)) {
      this.cmd.unshift(runRender);
      loadExternalScript(url, moduleCode, this.callback, this.documentContext);
    } else {
      logWarn(`External Js not loaded by Renderer since renderer url and callback is already defined on adUnit ${adUnitCode}`);
      runRender();
    }
  }.bind(this);
}
var isRendererPreferredFromAdUnit, moduleCode;
var init_Renderer = __esm(() => {
  init_adloader();
  init_utils();
  init_polyfill();
  isRendererPreferredFromAdUnit = function(adUnitCode) {
    const adUnits = $$PREBID_GLOBAL$$.adUnits;
    const adUnit = find(adUnits, (adUnit2) => {
      return adUnit2.code === adUnitCode;
    });
    if (!adUnit) {
      return false;
    }
    const adUnitRenderer = dlv(adUnit, "renderer");
    const hasValidAdUnitRenderer = !!(adUnitRenderer && adUnitRenderer.url && adUnitRenderer.render);
    const mediaTypeRenderer = dlv(adUnit, "mediaTypes.video.renderer");
    const hasValidMediaTypeRenderer = !!(mediaTypeRenderer && mediaTypeRenderer.url && mediaTypeRenderer.render);
    return !!(hasValidAdUnitRenderer && !(adUnitRenderer.backupOnly === true) || hasValidMediaTypeRenderer && !(mediaTypeRenderer.backupOnly === true));
  };
  moduleCode = "outstream";
  Renderer.install = function({ url, config: config6, id, callback, loaded, adUnitCode }) {
    return new Renderer({ url, config: config6, id, callback, loaded, adUnitCode });
  };
  Renderer.prototype.getConfig = function() {
    return this.config;
  };
  Renderer.prototype.setRender = function(fn) {
    this._render = fn;
  };
  Renderer.prototype.setEventHandlers = function(handlers) {
    this.handlers = handlers;
  };
  Renderer.prototype.handleVideoEvent = function({ id, eventName }) {
    if (typeof this.handlers[eventName] === "function") {
      this.handlers[eventName]();
    }
    logMessage(`Prebid Renderer event for id ${id} type ${eventName}`);
  };
  Renderer.prototype.process = function() {
    while (this.cmd.length > 0) {
      try {
        this.cmd.shift().call();
      } catch (error) {
        logError("Error processing Renderer command: ", error);
      }
    }
  };
});

// node_modules/fun-hooks/no-eval/index.js
var require_no_eval = __commonJS((exports, module) => {
  var hasProxy = function() {
    return !!(typeof Proxy === "function" && Proxy.revocable);
  };
  var rest = function(args, skip) {
    return Array.prototype.slice.call(args, skip);
  };
  var runAll = function(queue) {
    var queued;
    while (queued = queue.shift()) {
      queued();
    }
  };
  var create = function(config6) {
    var hooks = {};
    var postReady = [];
    config6 = assign({}, defaults, config6);
    function dispatch(arg1, arg2) {
      if (typeof arg1 === "function") {
        return hookFn.call(null, "sync", arg1, arg2);
      } else if (typeof arg1 === "string" && typeof arg2 === "function") {
        return hookFn.apply(null, arguments);
      } else if (typeof arg1 === "object") {
        return hookObj.apply(null, arguments);
      }
    }
    var ready;
    if (config6.ready) {
      dispatch.ready = function() {
        ready = true;
        runAll(postReady);
      };
    } else {
      ready = true;
    }
    function hookObj(obj, props, objName) {
      var walk = true;
      if (typeof props === "undefined") {
        props = Object.getOwnPropertyNames(obj);
        walk = false;
      }
      var objHooks = {};
      var doNotHook = ["constructor"];
      do {
        props = props.filter(function(prop) {
          return typeof obj[prop] === "function" && !(doNotHook.indexOf(prop) !== -1) && !prop.match(/^_/);
        });
        props.forEach(function(prop) {
          var parts = prop.split(":");
          var name = parts[0];
          var type = parts[1] || "sync";
          if (!objHooks[name]) {
            var fn = obj[name];
            objHooks[name] = obj[name] = hookFn(type, fn, objName ? [objName, name] : undefined);
          }
        });
        obj = Object.getPrototypeOf(obj);
      } while (walk && obj);
      return objHooks;
    }
    function get2(path) {
      var parts = Array.isArray(path) ? path : path.split(".");
      return reduce.call(parts, function(memo, part, i) {
        var item = memo[part];
        var installed = false;
        if (item) {
          return item;
        } else if (i === parts.length - 1) {
          if (!ready) {
            postReady.push(function() {
              if (!installed) {
                console.warn(packageName + ": referenced '" + path + "' but it was never created");
              }
            });
          }
          return memo[part] = newHookable(function(fn) {
            memo[part] = fn;
            installed = true;
          });
        }
        return memo[part] = {};
      }, hooks);
    }
    function newHookable(onInstall) {
      var before = [];
      var after = [];
      var generateTrap = function() {
      };
      var api = {
        before: function(hook, priority) {
          return add.call(this, before, "before", hook, priority);
        },
        after: function(hook, priority) {
          return add.call(this, after, "after", hook, priority);
        },
        getHooks: function(match) {
          var hooks2 = before.concat(after);
          if (typeof match === "object") {
            hooks2 = hooks2.filter(function(entry) {
              return Object.keys(match).every(function(prop) {
                return entry[prop] === match[prop];
              });
            });
          }
          try {
            assign(hooks2, {
              remove: function() {
                hooks2.forEach(function(entry) {
                  entry.remove();
                });
                return this;
              }
            });
          } catch (e) {
            console.error("error adding `remove` to array, did you modify Array.prototype?");
          }
          return hooks2;
        },
        removeAll: function() {
          return this.getHooks().remove();
        }
      };
      var meta = {
        install: function(type, fn, generate) {
          this.type = type;
          generateTrap = generate;
          generate(before, after);
          onInstall && onInstall(fn);
        }
      };
      hookableMap.set(api.after, meta);
      return api;
      function add(store2, type, hook, priority) {
        var entry = {
          hook,
          type,
          priority: priority || 10,
          remove: function() {
            var index = store2.indexOf(entry);
            if (index !== -1) {
              store2.splice(index, 1);
              generateTrap(before, after);
            }
          }
        };
        store2.push(entry);
        store2.sort(function(a, b) {
          return b.priority - a.priority;
        });
        generateTrap(before, after);
        return this;
      }
    }
    function hookFn(type, fn, name) {
      var meta = fn.after && hookableMap.get(fn.after);
      if (meta) {
        if (meta.type !== type) {
          throw packageName + ": recreated hookable with different type";
        } else {
          return fn;
        }
      }
      var hookable = name ? get2(name) : newHookable();
      var trap;
      var hookedFn;
      var handlers = {
        get: function(target, prop) {
          return hookable[prop] || Reflect.get.apply(Reflect, arguments);
        }
      };
      if (!ready) {
        postReady.push(setTrap);
      }
      if (config6.useProxy && hasProxy()) {
        hookedFn = new Proxy(fn, handlers);
      } else {
        hookedFn = function() {
          return handlers.apply ? handlers.apply(fn, this, rest(arguments)) : fn.apply(this, arguments);
        };
        assign(hookedFn, hookable);
      }
      hookableMap.get(hookedFn.after).install(type, hookedFn, generateTrap);
      return hookedFn;
      function generateTrap(before, after) {
        var order = [];
        var targetIndex;
        if (before.length || after.length) {
          before.forEach(addToOrder);
          targetIndex = order.push(undefined) - 1;
          after.forEach(addToOrder);
          trap = function(target, thisArg, args) {
            var curr = 0;
            var result;
            var callback = type === "async" && typeof args[args.length - 1] === "function" && args.pop();
            function bail(value) {
              if (type === "sync") {
                result = value;
              } else if (callback) {
                callback.apply(null, arguments);
              }
            }
            function next(value) {
              if (order[curr]) {
                var args2 = rest(arguments);
                next.bail = bail;
                args2.unshift(next);
                return order[curr++].apply(thisArg, args2);
              }
              if (type === "sync") {
                result = value;
              } else if (callback) {
                callback.apply(null, arguments);
              }
            }
            order[targetIndex] = function() {
              var args2 = rest(arguments, 1);
              if (type === "async" && callback) {
                delete next.bail;
                args2.push(next);
              }
              var result2 = target.apply(thisArg, args2);
              if (type === "sync") {
                next(result2);
              }
            };
            next.apply(null, args);
            return result;
          };
        } else {
          trap = undefined;
        }
        setTrap();
        function addToOrder(entry) {
          order.push(entry.hook);
        }
      }
      function setTrap() {
        if (ready || type === "sync" && !(config6.ready & create.SYNC) || type === "async" && !(config6.ready & create.ASYNC)) {
          handlers.apply = trap;
        } else if (type === "sync" || !(config6.ready & create.QUEUE)) {
          handlers.apply = function() {
            throw packageName + ": hooked function not ready";
          };
        } else {
          handlers.apply = function() {
            var args = arguments;
            postReady.push(function() {
              hookedFn.apply(args[1], args[2]);
            });
          };
        }
      }
    }
    dispatch.get = get2;
    return dispatch;
  };
  create.SYNC = 1;
  create.ASYNC = 2;
  create.QUEUE = 4;
  var packageName = "fun-hooks";
  var defaults = Object.freeze({
    useProxy: true,
    ready: 0
  });
  var hookableMap = new WeakMap;
  var reduce = [1].reduce(function(a, b, c) {
    return [a, b, c];
  }, 2).toString() === "2,1,0" ? Array.prototype.reduce : function(callback, initial) {
    var o = Object(this);
    var len = o.length >>> 0;
    var k = 0;
    var value;
    if (initial) {
      value = initial;
    } else {
      while (k < len && !(k in o)) {
        k++;
      }
      value = o[k++];
    }
    while (k < len) {
      if (k in o) {
        value = callback(value, o[k], k, o);
      }
      k++;
    }
    return value;
  };
  var assign = Object.assign || function assign(target) {
    return reduce.call(rest(arguments, 1), function(target2, obj) {
      if (obj) {
        Object.keys(obj).forEach(function(prop) {
          target2[prop] = obj[prop];
        });
      }
      return target2;
    }, target);
  };
  module.exports = create;
});

// src/hook.js
var no_eval, hook, getHook;
var init_hook = __esm(() => {
  no_eval = __toESM(require_no_eval(), 1);
  hook = no_eval.default({
    ready: no_eval.default.SYNC | no_eval.default.ASYNC | no_eval.default.QUEUE
  });
  getHook = hook.get;
});

// src/prebidGlobal.js
function getGlobal() {
  return window.$$PREBID_GLOBAL$$;
}
var init_prebidGlobal = __esm(() => {
  window.$$PREBID_GLOBAL$$ = window.$$PREBID_GLOBAL$$ || {};
  window.$$PREBID_GLOBAL$$.cmd = window.$$PREBID_GLOBAL$$.cmd || [];
  window.$$PREBID_GLOBAL$$.que = window.$$PREBID_GLOBAL$$.que || [];
  window._pbjsGlobals = window._pbjsGlobals || [];
  window._pbjsGlobals.push("$$PREBID_GLOBAL$$");
});

// src/bidderSettings.js
class ScopedSettings {
  constructor(getSettings, defaultScope) {
    this.getSettings = getSettings;
    this.defaultScope = defaultScope;
  }
  get(scope, path) {
    let value = this.getOwn(scope, path);
    if (typeof value === "undefined") {
      value = this.getOwn(null, path);
    }
    return value;
  }
  getOwn(scope, path) {
    scope = this.#resolveScope(scope);
    return dlv(this.getSettings(), `${scope}.${path}`);
  }
  getScopes() {
    return Object.keys(this.getSettings()).filter((scope) => scope !== this.defaultScope);
  }
  settingsFor(scope) {
    return mergeDeep({}, this.ownSettingsFor(null), this.ownSettingsFor(scope));
  }
  ownSettingsFor(scope) {
    scope = this.#resolveScope(scope);
    return this.getSettings()[scope] || {};
  }
  #resolveScope(scope) {
    if (scope == null) {
      return this.defaultScope;
    } else {
      return scope;
    }
  }
}
var CONSTANTS4, bidderSettings;
var init_bidderSettings = __esm(() => {
  init_utils();
  init_prebidGlobal();
  CONSTANTS4 = require_constants();
  bidderSettings = new ScopedSettings(() => getGlobal().bidderSettings || {}, CONSTANTS4.JSON_MAPPING.BD_SETTING_STANDARD);
});

// src/storageManager.js
function newStorageManager({ gvlid, moduleName, bidderCode, moduleType } = {}, { bidderSettings: bidderSettings3 = bidderSettings } = {}) {
  function isBidderDisallowed() {
    if (bidderCode == null) {
      return false;
    }
    const storageAllowed = bidderSettings3.get(bidderCode, "storageAllowed");
    return storageAllowed == null ? false : !storageAllowed;
  }
  function isValid(cb) {
    if (includes(moduleTypeWhiteList, moduleType)) {
      let result = {
        valid: true
      };
      return cb(result);
    } else if (isBidderDisallowed()) {
      logInfo(`bidderSettings denied access to device storage for bidder '${bidderCode}'`);
      const result = { valid: false };
      return cb(result);
    } else {
      let value;
      let hookDetails = {
        hasEnforcementHook: false
      };
      validateStorageEnforcement(gvlid, bidderCode || moduleName, hookDetails, function(result) {
        if (result && result.hasEnforcementHook) {
          value = cb(result);
        } else {
          let result2 = {
            hasEnforcementHook: false,
            valid: hasDeviceAccess()
          };
          value = cb(result2);
        }
      });
      return value;
    }
  }
  const setCookie = function(key, value, expires, sameSite, domain, done) {
    let cb = function(result) {
      if (result && result.valid) {
        const domainPortion = domain && domain !== "" ? ` ;domain=${encodeURIComponent(domain)}` : "";
        const expiresPortion = expires && expires !== "" ? ` ;expires=${expires}` : "";
        const isNone = sameSite != null && sameSite.toLowerCase() == "none";
        const secure = isNone ? "; Secure" : "";
        document.cookie = `${key}=${encodeURIComponent(value)}${expiresPortion}; path=/${domainPortion}${sameSite ? `; SameSite=${sameSite}` : ""}${secure}`;
      }
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const getCookie = function(name, done) {
    let cb = function(result) {
      if (result && result.valid) {
        let m = window.document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]*)\\s*(;|$)");
        return m ? decodeURIComponent(m[2]) : null;
      }
      return null;
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const localStorageIsEnabled = function(done) {
    let cb = function(result) {
      if (result && result.valid) {
        try {
          localStorage.setItem("prebid.cookieTest", "1");
          return localStorage.getItem("prebid.cookieTest") === "1";
        } catch (error) {
        } finally {
          try {
            localStorage.removeItem("prebid.cookieTest");
          } catch (error) {
          }
        }
      }
      return false;
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const cookiesAreEnabled = function(done) {
    let cb = function(result) {
      if (result && result.valid) {
        if (checkCookieSupport()) {
          return true;
        }
        window.document.cookie = "prebid.cookieTest";
        return window.document.cookie.indexOf("prebid.cookieTest") !== -1;
      }
      return false;
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const setDataInLocalStorage = function(key, value, done) {
    let cb = function(result) {
      if (result && result.valid && hasLocalStorage()) {
        window.localStorage.setItem(key, value);
      }
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const getDataFromLocalStorage = function(key, done) {
    let cb = function(result) {
      if (result && result.valid && hasLocalStorage()) {
        return window.localStorage.getItem(key);
      }
      return null;
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const removeDataFromLocalStorage = function(key, done) {
    let cb = function(result) {
      if (result && result.valid && hasLocalStorage()) {
        window.localStorage.removeItem(key);
      }
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const hasLocalStorage = function(done) {
    let cb = function(result) {
      if (result && result.valid) {
        try {
          return !!window.localStorage;
        } catch (e) {
          logError("Local storage api disabled");
        }
      }
      return false;
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  const findSimilarCookies = function(keyLike, done) {
    let cb = function(result) {
      if (result && result.valid) {
        const all = [];
        if (hasDeviceAccess()) {
          const cookies = document.cookie.split(";");
          while (cookies.length) {
            const cookie = cookies.pop();
            let separatorIndex = cookie.indexOf("=");
            separatorIndex = separatorIndex < 0 ? cookie.length : separatorIndex;
            const cookieName = decodeURIComponent(cookie.slice(0, separatorIndex).replace(/^\s+/, ""));
            if (cookieName.indexOf(keyLike) >= 0) {
              all.push(decodeURIComponent(cookie.slice(separatorIndex + 1)));
            }
          }
        }
        return all;
      }
    };
    if (done && typeof done === "function") {
      storageCallbacks.push(function() {
        let result = isValid(cb);
        done(result);
      });
    } else {
      return isValid(cb);
    }
  };
  return {
    setCookie,
    getCookie,
    localStorageIsEnabled,
    cookiesAreEnabled,
    setDataInLocalStorage,
    getDataFromLocalStorage,
    removeDataFromLocalStorage,
    hasLocalStorage,
    findSimilarCookies
  };
}
function getCoreStorageManager(moduleName) {
  return newStorageManager({ moduleName, moduleType: "core" });
}
function getStorageManager({ gvlid, moduleName, bidderCode } = {}) {
  if (arguments.length > 1 || arguments.length > 0 && !isPlainObject(arguments[0])) {
    throw new Error("Invalid invocation for getStorageManager");
  }
  return newStorageManager({ gvlid, moduleName, bidderCode });
}
var moduleTypeWhiteList, storageCallbacks, validateStorageEnforcement;
var init_storageManager = __esm(() => {
  init_hook();
  init_utils();
  init_polyfill();
  init_bidderSettings();
  moduleTypeWhiteList = ["core", "prebid-module"];
  storageCallbacks = [];
  validateStorageEnforcement = hook("async", function(gvlid, moduleName, hookDetails, callback) {
    callback(hookDetails);
  }, "validateStorageEnforcement");
});

// src/userSync.js
function newUserSync(userSyncDependencies) {
  let publicApi = {};
  let queue = getDefaultQueue();
  let hasFiredBidder = new Set;
  let numAdapterBids = {};
  let permittedPixels = {
    image: true,
    iframe: false
  };
  let usConfig = userSyncDependencies.config;
  config.getConfig("userSync", (conf) => {
    if (conf.userSync) {
      let fs = conf.userSync.filterSettings;
      if (isPlainObject(fs)) {
        if (!fs.image && !fs.all) {
          conf.userSync.filterSettings.image = {
            bidders: "*",
            filter: "include"
          };
        }
      }
    }
    usConfig = Object.assign(usConfig, conf.userSync);
  });
  function getDefaultQueue() {
    return {
      image: [],
      iframe: []
    };
  }
  function fireSyncs() {
    if (!usConfig.syncEnabled || !userSyncDependencies.browserSupportsCookies) {
      return;
    }
    try {
      loadIframes();
      fireImagePixels();
    } catch (e) {
      return logError("Error firing user syncs", e);
    }
    queue = getDefaultQueue();
  }
  function forEachFire(queue2, fn) {
    shuffle(queue2).forEach((sync) => {
      fn(sync);
      hasFiredBidder.add(sync[0]);
    });
  }
  function fireImagePixels() {
    if (!permittedPixels.image) {
      return;
    }
    forEachFire(queue.image, (sync) => {
      let [bidderName, trackingPixelUrl] = sync;
      logMessage(`Invoking image pixel user sync for bidder: ${bidderName}`);
      triggerPixel(trackingPixelUrl);
    });
  }
  function loadIframes() {
    if (!permittedPixels.iframe) {
      return;
    }
    forEachFire(queue.iframe, (sync) => {
      let [bidderName, iframeUrl] = sync;
      logMessage(`Invoking iframe user sync for bidder: ${bidderName}`);
      insertUserSyncIframe(iframeUrl);
      removeImagePixelsForBidder(queue, bidderName);
    });
  }
  function removeImagePixelsForBidder(queue2, iframeSyncBidderName) {
    queue2.image = queue2.image.filter((imageSync) => {
      let imageSyncBidderName = imageSync[0];
      return imageSyncBidderName !== iframeSyncBidderName;
    });
  }
  function incrementAdapterBids(numAdapterBids2, bidder) {
    if (!numAdapterBids2[bidder]) {
      numAdapterBids2[bidder] = 1;
    } else {
      numAdapterBids2[bidder] += 1;
    }
    return numAdapterBids2;
  }
  publicApi.registerSync = (type, bidder, url) => {
    if (hasFiredBidder.has(bidder)) {
      return logMessage(`already fired syncs for "${bidder}", ignoring registerSync call`);
    }
    if (!usConfig.syncEnabled || !isArray(queue[type])) {
      return logWarn(`User sync type "${type}" not supported`);
    }
    if (!bidder) {
      return logWarn(`Bidder is required for registering sync`);
    }
    if (usConfig.syncsPerBidder !== 0 && Number(numAdapterBids[bidder]) >= usConfig.syncsPerBidder) {
      return logWarn(`Number of user syncs exceeded for "${bidder}"`);
    }
    const canBidderRegisterSync = publicApi.canBidderRegisterSync(type, bidder);
    if (!canBidderRegisterSync) {
      return logWarn(`Bidder "${bidder}" not permitted to register their "${type}" userSync pixels.`);
    }
    queue[type].push([bidder, url]);
    numAdapterBids = incrementAdapterBids(numAdapterBids, bidder);
  };
  function shouldBidderBeBlocked(type, bidder) {
    let filterConfig = usConfig.filterSettings;
    if (isFilterConfigValid(filterConfig, type)) {
      permittedPixels[type] = true;
      let activeConfig = filterConfig.all ? filterConfig.all : filterConfig[type];
      let biddersToFilter = activeConfig.bidders === "*" ? [bidder] : activeConfig.bidders;
      let filterType = activeConfig.filter || "include";
      const checkForFiltering = {
        include: (bidders, bidder2) => !includes(bidders, bidder2),
        exclude: (bidders, bidder2) => includes(bidders, bidder2)
      };
      return checkForFiltering[filterType](biddersToFilter, bidder);
    }
    return !permittedPixels[type];
  }
  function isFilterConfigValid(filterConfig, type) {
    if (filterConfig.all && filterConfig[type]) {
      logWarn(`Detected presence of the "filterSettings.all" and "filterSettings.${type}" in userSync config.  You cannot mix "all" with "iframe/image" configs; they are mutually exclusive.`);
      return false;
    }
    let activeConfig = filterConfig.all ? filterConfig.all : filterConfig[type];
    let activeConfigName = filterConfig.all ? "all" : type;
    if (!activeConfig) {
      return false;
    }
    let filterField = activeConfig.filter;
    let biddersField = activeConfig.bidders;
    if (filterField && filterField !== "include" && filterField !== "exclude") {
      logWarn(`UserSync "filterSettings.${activeConfigName}.filter" setting '${filterField}' is not a valid option; use either 'include' or 'exclude'.`);
      return false;
    }
    if (biddersField !== "*" && !(Array.isArray(biddersField) && biddersField.length > 0 && biddersField.every((bidderInList) => isStr(bidderInList) && bidderInList !== "*"))) {
      logWarn(`Detected an invalid setup in userSync "filterSettings.${activeConfigName}.bidders"; use either '*' (to represent all bidders) or an array of bidders.`);
      return false;
    }
    return true;
  }
  publicApi.syncUsers = (timeout = 0) => {
    if (timeout) {
      return setTimeout(fireSyncs, Number(timeout));
    }
    fireSyncs();
  };
  publicApi.triggerUserSyncs = () => {
    if (usConfig.enableOverride) {
      publicApi.syncUsers();
    }
  };
  publicApi.canBidderRegisterSync = (type, bidder) => {
    if (usConfig.filterSettings) {
      if (shouldBidderBeBlocked(type, bidder)) {
        return false;
      }
    }
    return true;
  };
  return publicApi;
}
var USERSYNC_DEFAULT_CONFIG, storage, browserSupportsCookies, userSync;
var init_userSync = __esm(() => {
  init_utils();
  init_config();
  init_polyfill();
  init_storageManager();
  USERSYNC_DEFAULT_CONFIG = {
    syncEnabled: true,
    filterSettings: {
      image: {
        bidders: "*",
        filter: "include"
      }
    },
    syncsPerBidder: 5,
    syncDelay: 3000,
    auctionDelay: 0
  };
  config.setDefaults({
    userSync: deepClone(USERSYNC_DEFAULT_CONFIG)
  });
  storage = getCoreStorageManager("usersync");
  browserSupportsCookies = !isSafariBrowser() && storage.cookiesAreEnabled();
  userSync = newUserSync({
    config: config.getConfig("userSync"),
    browserSupportsCookies
  });
});

// src/video.js
function isValidVideoBid(bid, { index = auctionManager2.index } = {}) {
  const videoMediaType = dlv(index.getMediaTypes(bid), "video");
  const context = videoMediaType && dlv(videoMediaType, "context");
  const adUnit = index.getAdUnit(bid);
  return checkVideoBidSetup(bid, adUnit, videoMediaType, context);
}
var OUTSTREAM, checkVideoBidSetup;
var init_video = __esm(() => {
  init_adapterManager();
  init_utils();
  init_config();
  init_polyfill();
  init_hook();
  init_auctionManager();
  OUTSTREAM = "outstream";
  checkVideoBidSetup = hook("sync", function(bid, adUnit, videoMediaType, context) {
    if (videoMediaType && context !== OUTSTREAM) {
      if (!config.getConfig("cache.url") && bid.vastXml && !bid.vastUrl) {
        logError(`
        This bid contains only vastXml and will not work when a prebid cache url is not specified.
        Try enabling prebid cache with \$\$PREBID_GLOBAL\$\$.setConfig({ cache: {url: "..."} });
      `);
        return false;
      }
      return !!(bid.vastUrl || bid.vastXml);
    }
    if (context === OUTSTREAM) {
      return !!(bid.renderer || adUnit && adUnit.renderer || videoMediaType.renderer);
    }
    return true;
  }, "checkVideoBidSetup");
});

// src/mediaTypes.js
var VIDEO, BANNER, ADPOD;
var init_mediaTypes = __esm(() => {
  VIDEO = "video";
  BANNER = "banner";
  ADPOD = "adpod";
});

// src/auction.js
function newAuction({ adUnits, adUnitCodes, callback, cbTimeout, labels, auctionId }) {
  let _adUnits = adUnits;
  let _labels = labels;
  let _adUnitCodes = adUnitCodes;
  let _bidderRequests = [];
  let _bidsReceived = [];
  let _noBids = [];
  let _auctionStart;
  let _auctionEnd;
  let _auctionId = auctionId || generateUUID();
  let _auctionStatus;
  let _callback = callback;
  let _timer;
  let _timeout = cbTimeout;
  let _winningBids = [];
  let _timelyBidders = new Set;
  function addBidRequests(bidderRequests) {
    _bidderRequests = _bidderRequests.concat(bidderRequests);
  }
  function addBidReceived(bidsReceived) {
    _bidsReceived = _bidsReceived.concat(bidsReceived);
  }
  function addNoBid(noBid) {
    _noBids = _noBids.concat(noBid);
  }
  function getProperties() {
    return {
      auctionId: _auctionId,
      timestamp: _auctionStart,
      auctionEnd: _auctionEnd,
      auctionStatus: _auctionStatus,
      adUnits: _adUnits,
      adUnitCodes: _adUnitCodes,
      labels: _labels,
      bidderRequests: _bidderRequests,
      noBids: _noBids,
      bidsReceived: _bidsReceived,
      winningBids: _winningBids,
      timeout: _timeout
    };
  }
  function startAuctionTimer() {
    const timedOut = true;
    const timeoutCallback = executeCallback.bind(null, timedOut);
    let timer = setTimeout(timeoutCallback, _timeout);
    _timer = timer;
  }
  function executeCallback(timedOut, cleartimer) {
    if (cleartimer) {
      clearTimeout(_timer);
    }
    if (_auctionEnd === undefined) {
      let timedOutBidders = [];
      if (timedOut) {
        logMessage(`Auction ${_auctionId} timedOut`);
        timedOutBidders = getTimedOutBids(_bidderRequests, _timelyBidders);
        if (timedOutBidders.length) {
          events.emit(CONSTANTS5.EVENTS.BID_TIMEOUT, timedOutBidders);
        }
      }
      _auctionStatus = AUCTION_COMPLETED;
      _auctionEnd = Date.now();
      events.emit(CONSTANTS5.EVENTS.AUCTION_END, getProperties());
      bidsBackCallback(_adUnits, function() {
        try {
          if (_callback != null) {
            const adUnitCodes2 = _adUnitCodes;
            const bids = _bidsReceived.filter(bind.call(adUnitsFilter, this, adUnitCodes2)).reduce(groupByPlacement, {});
            _callback.apply($$PREBID_GLOBAL$$, [bids, timedOut, _auctionId]);
            _callback = null;
          }
        } catch (e) {
          logError("Error executing bidsBackHandler", null, e);
        } finally {
          if (timedOutBidders.length) {
            adapterManager2.callTimedOutBidders(adUnits, timedOutBidders, _timeout);
          }
          let userSyncConfig = config.getConfig("userSync") || {};
          if (!userSyncConfig.enableOverride) {
            syncUsers(userSyncConfig.syncDelay);
          }
        }
      });
    }
  }
  function auctionDone() {
    config.resetBidder();
    logInfo(`Bids Received for Auction with id: ${_auctionId}`, _bidsReceived);
    _auctionStatus = AUCTION_COMPLETED;
    executeCallback(false, true);
  }
  function onTimelyResponse(bidderCode) {
    _timelyBidders.add(bidderCode);
  }
  function callBids() {
    console.log('callBids init')
    _auctionStatus = AUCTION_STARTED;
    _auctionStart = Date.now();
    let bidRequests = adapterManager2.makeBidRequests(_adUnits, _auctionStart, _auctionId, _timeout, _labels);
    logInfo(`Bids Requested for Auction with id: ${_auctionId}`, bidRequests);
    if (bidRequests.length < 1) {
      logWarn("No valid bid requests returned for auction");
      auctionDone();
    } else {
      addBidderRequests.call({
        dispatch: addBidderRequestsCallback,
        context: this
      }, bidRequests);
    }
  }
  function addBidderRequestsCallback(bidRequests) {
    bidRequests.forEach((bidRequest) => {
      addBidRequests(bidRequest);
    });
    let requests = {};
    let call = {
      bidRequests,
      run: () => {
        startAuctionTimer();
        _auctionStatus = AUCTION_IN_PROGRESS;
        events.emit(CONSTANTS5.EVENTS.AUCTION_INIT, getProperties());
        let callbacks = auctionCallbacks(auctionDone, this);
        adapterManager2.callBids(_adUnits, bidRequests, callbacks.addBidResponse, callbacks.adapterDone, {
          request(source, origin) {
            increment(outstandingRequests, origin);
            increment(requests, source);
            if (!sourceInfo[source]) {
              sourceInfo[source] = {
                SRA: true,
                origin
              };
            }
            if (requests[source] > 1) {
              sourceInfo[source].SRA = false;
            }
          },
          done(origin) {
            outstandingRequests[origin]--;
            if (queuedCalls[0]) {
              if (runIfOriginHasCapacity(queuedCalls[0])) {
                queuedCalls.shift();
              }
            }
          }
        }, _timeout, onTimelyResponse);
      }
    };
    if (!runIfOriginHasCapacity(call)) {
      logWarn("queueing auction due to limited endpoint capacity");
      queuedCalls.push(call);
    }
    function runIfOriginHasCapacity(call2) {
      let hasCapacity = true;
      let maxRequests = config.getConfig("maxRequestsPerOrigin") || MAX_REQUESTS_PER_ORIGIN;
      call2.bidRequests.some((bidRequest) => {
        let requests2 = 1;
        let source = typeof bidRequest.src !== "undefined" && bidRequest.src === CONSTANTS5.S2S.SRC ? "s2s" : bidRequest.bidderCode;
        if (sourceInfo[source]) {
          if (sourceInfo[source].SRA === false) {
            requests2 = Math.min(bidRequest.bids.length, maxRequests);
          }
          if (outstandingRequests[sourceInfo[source].origin] + requests2 > maxRequests) {
            hasCapacity = false;
          }
        }
        return !hasCapacity;
      });
      if (hasCapacity) {
        call2.run();
      }
      return hasCapacity;
    }
    function increment(obj, prop) {
      if (typeof obj[prop] === "undefined") {
        obj[prop] = 1;
      } else {
        obj[prop]++;
      }
    }
  }
  function addWinningBid(winningBid) {
    _winningBids = _winningBids.concat(winningBid);
    adapterManager2.callBidWonBidder(winningBid.bidder, winningBid, adUnits);
  }
  function setBidTargeting(bid) {
    adapterManager2.callSetTargetingBidder(bid.bidder, bid);
  }
  return {
    addBidReceived,
    addNoBid,
    executeCallback,
    callBids,
    addWinningBid,
    setBidTargeting,
    getWinningBids: () => _winningBids,
    getAuctionStart: () => _auctionStart,
    getTimeout: () => _timeout,
    getAuctionId: () => _auctionId,
    getAuctionStatus: () => _auctionStatus,
    getAdUnits: () => _adUnits,
    getAdUnitCodes: () => _adUnitCodes,
    getBidRequests: () => _bidderRequests,
    getBidsReceived: () => _bidsReceived,
    getNoBids: () => _noBids
  };
}
function auctionCallbacks(auctionDone, auctionInstance, { index = auctionManager2.index } = {}) {
  let outstandingBidsAdded = 0;
  let allAdapterCalledDone = false;
  let bidderRequestsDone = new Set;
  let bidResponseMap = {};
  const ready = {};
  function waitFor(requestId, result) {
    if (ready[requestId] == null) {
      ready[requestId] = Promise.resolve();
    }
    ready[requestId] = ready[requestId].then(() => Promise.resolve(result).catch(() => {
    }));
  }
  function guard(bidderRequest, fn) {
    let timeout = bidderRequest.timeout;
    if (timeout == null || timeout > auctionInstance.getTimeout()) {
      timeout = auctionInstance.getTimeout();
    }
    const timeRemaining = auctionInstance.getAuctionStart() + timeout - Date.now();
    const wait = ready[bidderRequest.bidderRequestId];
    const orphanWait = ready[""];
    if ((wait != null || orphanWait != null) && timeRemaining > 0) {
      Promise.race([
        new Promise((resolve) => setTimeout(resolve, timeRemaining)),
        Promise.resolve(orphanWait).then(() => wait)
      ]).then(fn);
    } else {
      fn();
    }
  }
  function afterBidAdded() {
    outstandingBidsAdded--;
    if (allAdapterCalledDone && outstandingBidsAdded === 0) {
      auctionDone();
    }
  }
  function handleBidResponse(adUnitCode, bid) {
    bidResponseMap[bid.requestId] = true;
    outstandingBidsAdded++;
    let auctionId = auctionInstance.getAuctionId();
    let bidResponse = getPreparedBidForAuction({ adUnitCode, bid, auctionId });
    if (bidResponse.mediaType === "video") {
      tryAddVideoBid(auctionInstance, bidResponse, afterBidAdded);
    } else {
      addBidToAuction(auctionInstance, bidResponse);
      afterBidAdded();
    }
  }
  function adapterDone() {
    let bidderRequest = this;
    let bidderRequests = auctionInstance.getBidRequests();
    const auctionOptionsConfig = config.getConfig("auctionOptions");
    bidderRequestsDone.add(bidderRequest);
    if (auctionOptionsConfig && !isEmpty(auctionOptionsConfig)) {
      const secondaryBidders = auctionOptionsConfig.secondaryBidders;
      if (secondaryBidders && !bidderRequests.every((bidder) => includes(secondaryBidders, bidder.bidderCode))) {
        bidderRequests = bidderRequests.filter((request) => !includes(secondaryBidders, request.bidderCode));
      }
    }
    allAdapterCalledDone = bidderRequests.every((bidderRequest2) => bidderRequestsDone.has(bidderRequest2));
    bidderRequest.bids.forEach((bid) => {
      if (!bidResponseMap[bid.bidId]) {
        auctionInstance.addNoBid(bid);
        events.emit(CONSTANTS5.EVENTS.NO_BID, bid);
      }
    });
    if (allAdapterCalledDone && outstandingBidsAdded === 0) {
      auctionDone();
    }
  }
  return {
    addBidResponse: function(adUnit, bid) {
      const bidderRequest = index.getBidderRequest(bid);
      waitFor(bidderRequest && bidderRequest.bidderRequestId || "", addBidResponse.call({
        dispatch: handleBidResponse
      }, adUnit, bid));
    },
    adapterDone: function() {
      guard(this, adapterDone.bind(this));
    }
  };
}
function doCallbacksIfTimedout(auctionInstance, bidResponse) {
  if (bidResponse.timeToRespond > auctionInstance.getTimeout() + config.getConfig("timeoutBuffer")) {
    auctionInstance.executeCallback(true);
  }
}
function addBidToAuction(auctionInstance, bidResponse) {
  setupBidTargeting(bidResponse);
  events.emit(CONSTANTS5.EVENTS.BID_RESPONSE, bidResponse);
  auctionInstance.addBidReceived(bidResponse);
  doCallbacksIfTimedout(auctionInstance, bidResponse);
}
function getMediaTypeGranularity(mediaType, mediaTypes2, mediaTypePriceGranularity) {
  if (mediaType && mediaTypePriceGranularity) {
    if (mediaType === VIDEO) {
      const context = dlv(mediaTypes2, `${VIDEO}.context`, "instream");
      if (mediaTypePriceGranularity[`${VIDEO}-${context}`]) {
        return mediaTypePriceGranularity[`${VIDEO}-${context}`];
      }
    }
    return mediaTypePriceGranularity[mediaType];
  }
}
function getStandardBidderSettings(mediaType, bidderCode) {
  const TARGETING_KEYS = CONSTANTS5.TARGETING_KEYS;
  const standardSettings = Object.assign({}, bidderSettings.settingsFor(null));
  if (!standardSettings[CONSTANTS5.JSON_MAPPING.ADSERVER_TARGETING]) {
    standardSettings[CONSTANTS5.JSON_MAPPING.ADSERVER_TARGETING] = defaultAdserverTargeting();
  }
  if (mediaType === "video") {
    const adserverTargeting = standardSettings[CONSTANTS5.JSON_MAPPING.ADSERVER_TARGETING].slice();
    standardSettings[CONSTANTS5.JSON_MAPPING.ADSERVER_TARGETING] = adserverTargeting;
    [TARGETING_KEYS.UUID, TARGETING_KEYS.CACHE_ID].forEach((targetingKeyVal) => {
      if (typeof find(adserverTargeting, (kvPair) => kvPair.key === targetingKeyVal) === "undefined") {
        adserverTargeting.push(createKeyVal(targetingKeyVal, "videoCacheKey"));
      }
    });
    if (config.getConfig("cache.url") && (!bidderCode || bidderSettings.get(bidderCode, "sendStandardTargeting") !== false)) {
      const urlInfo = parseUrl(config.getConfig("cache.url"));
      if (typeof find(adserverTargeting, (targetingKeyVal) => targetingKeyVal.key === TARGETING_KEYS.CACHE_HOST) === "undefined") {
        adserverTargeting.push(createKeyVal(TARGETING_KEYS.CACHE_HOST, function(bidResponse) {
          return dlv(bidResponse, `adserverTargeting.${TARGETING_KEYS.CACHE_HOST}`) ? bidResponse.adserverTargeting[TARGETING_KEYS.CACHE_HOST] : urlInfo.hostname;
        }));
      }
    }
  }
  return standardSettings;
}
function getKeyValueTargetingPairs(bidderCode, custBidObj, { index = auctionManager2.index } = {}) {
  if (!custBidObj) {
    return {};
  }
  const bidRequest = index.getBidRequest(custBidObj);
  var keyValues = {};
  const standardSettings = getStandardBidderSettings(custBidObj.mediaType, bidderCode);
  setKeys(keyValues, standardSettings, custBidObj, bidRequest);
  if (bidderCode && bidderSettings.getOwn(bidderCode, CONSTANTS5.JSON_MAPPING.ADSERVER_TARGETING)) {
    setKeys(keyValues, bidderSettings.ownSettingsFor(bidderCode), custBidObj, bidRequest);
    custBidObj.sendStandardTargeting = bidderSettings.get(bidderCode, "sendStandardTargeting");
  }
  if (custBidObj["native"]) {
    keyValues = Object.assign({}, keyValues, getNativeTargeting(custBidObj));
  }
  return keyValues;
}
function adjustBids(bid) {
  let code = bid.bidderCode;
  let bidPriceAdjusted = bid.cpm;
  const bidCpmAdjustment = bidderSettings.get(code || null, "bidCpmAdjustment");
  if (bidCpmAdjustment && typeof bidCpmAdjustment === "function") {
    try {
      bidPriceAdjusted = bidCpmAdjustment(bid.cpm, Object.assign({}, bid));
    } catch (e) {
      logError("Error during bid adjustment", "bidmanager.js", e);
    }
  }
  if (bidPriceAdjusted >= 0) {
    bid.cpm = bidPriceAdjusted;
  }
}
var tryAddVideoBid, getPreparedBidForAuction, setupBidTargeting, createKeyVal, defaultAdserverTargeting, setKeys, groupByPlacement, getTimedOutBids, syncUsers, adapterManager2, events, CONSTANTS5, AUCTION_STARTED, AUCTION_IN_PROGRESS, AUCTION_COMPLETED, MAX_REQUESTS_PER_ORIGIN, outstandingRequests, sourceInfo, queuedCalls, addBidResponse, addBidderRequests, bidsBackCallback, callPrebidCache, getPriceGranularity, getPriceByGranularity, getAdvertiserDomain;
var init_auction = __esm(() => {
  init_utils();
  init_cpmBucketManager();
  init_native();
  init_videoCache();
  init_Renderer();
  init_config();
  init_userSync();
  init_hook();
  init_polyfill();
  init_video();
  init_mediaTypes();
  init_auctionManager();
  init_bidderSettings();
  tryAddVideoBid = function(auctionInstance, bidResponse, afterBidAdded, { index = auctionManager2.index } = {}) {
    let addBid = true;
    const videoMediaType = dlv(index.getMediaTypes({
      requestId: bidResponse.originalRequestId || bidResponse.requestId,
      transactionId: bidResponse.transactionId
    }), "video");
    const context = videoMediaType && dlv(videoMediaType, "context");
    if (config.getConfig("cache.url") && context !== OUTSTREAM) {
      if (!bidResponse.videoCacheKey || config.getConfig("cache.ignoreBidderCacheKey")) {
        addBid = false;
        callPrebidCache(auctionInstance, bidResponse, afterBidAdded, videoMediaType);
      } else if (!bidResponse.vastUrl) {
        logError("videoCacheKey specified but not required vastUrl for video bid");
        addBid = false;
      }
    }
    if (addBid) {
      addBidToAuction(auctionInstance, bidResponse);
      afterBidAdded();
    }
  };
  getPreparedBidForAuction = function({ adUnitCode, bid, auctionId }, { index = auctionManager2.index } = {}) {
    const bidderRequest = index.getBidderRequest(bid);
    const start = bidderRequest && bidderRequest.start || bid.requestTimestamp;
    let bidObject = Object.assign({}, bid, {
      auctionId,
      responseTimestamp: timestamp(),
      requestTimestamp: start,
      cpm: parseFloat(bid.cpm) || 0,
      bidder: bid.bidderCode,
      adUnitCode
    });
    bidObject.timeToRespond = bidObject.responseTimestamp - bidObject.requestTimestamp;
    events.emit(CONSTANTS5.EVENTS.BID_ADJUSTMENT, bidObject);
    console.log('rmn2 index', index)
    console.log('rmn2 bidObject', bidObject)
    console.log('rmn2 getAdUnit', index.getAdUnit)
    // 好像從這邊壞掉：index.getAdUnit(bidObject).renderer
    // Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'renderer')
    // 應該是 prebid.js 執行時，index.getAdUnit(bidObject) 找不到東西
    // 然後實際是 prebid.js 的 getPreparedBidForAuction 邏輯在執行，不是現在 asealBidAdapter.js 的 code 在執行
    // 感覺有些狀態被藏在 pbjs 的實例裡面，這邊無法取得也無法設定
  
    // 感覺想要繼續往前的話，可以嘗試的方向
    // 1. 讓 pbjs.instance 能夠讀到 private adapter adunit 的 renderer
    // 2. 自己從頭實作 private adapter 的所有邏輯，包含 viewable, id module
    // 3. 修改 prebid.js source code，請 publisher 改裝我們自己 build 出來的 code
    const adUnitRenderer = index.getAdUnit(bidObject).renderer;
    const bidObjectMediaType = bidObject.mediaType;
    const mediaTypes2 = index.getMediaTypes(bidObject);
    const bidMediaType = mediaTypes2 && mediaTypes2[bidObjectMediaType];
    var mediaTypeRenderer = bidMediaType && bidMediaType.renderer;
    var renderer = null;
    if (mediaTypeRenderer && mediaTypeRenderer.url && mediaTypeRenderer.render && !(mediaTypeRenderer.backupOnly === true && bid.renderer)) {
      renderer = mediaTypeRenderer;
    } else if (adUnitRenderer && adUnitRenderer.url && adUnitRenderer.render && !(adUnitRenderer.backupOnly === true && bid.renderer)) {
      renderer = adUnitRenderer;
    }
    if (renderer) {
      bidObject.renderer = Renderer.install({ url: renderer.url, config: renderer.options });
      bidObject.renderer.setRender(renderer.render);
    }
    const mediaTypeGranularity = getMediaTypeGranularity(bid.mediaType, mediaTypes2, config.getConfig("mediaTypePriceGranularity"));
    const priceStringsObj = getPriceBucketString(bidObject.cpm, typeof mediaTypeGranularity === "object" ? mediaTypeGranularity : config.getConfig("customPriceBucket"), config.getConfig("currency.granularityMultiplier"));
    bidObject.pbLg = priceStringsObj.low;
    bidObject.pbMg = priceStringsObj.med;
    bidObject.pbHg = priceStringsObj.high;
    bidObject.pbAg = priceStringsObj.auto;
    bidObject.pbDg = priceStringsObj.dense;
    bidObject.pbCg = priceStringsObj.custom;
    return bidObject;
  };
  setupBidTargeting = function(bidObject) {
    let keyValues;
    const cpmCheck = bidderSettings.get(bidObject.bidderCode, "allowZeroCpmBids") === true ? bidObject.cpm >= 0 : bidObject.cpm > 0;
    if (bidObject.bidderCode && (cpmCheck || bidObject.dealId)) {
      keyValues = getKeyValueTargetingPairs(bidObject.bidderCode, bidObject);
    }
    bidObject.adserverTargeting = Object.assign(bidObject.adserverTargeting || {}, keyValues);
  };
  createKeyVal = function(key, value) {
    return {
      key,
      val: typeof value === "function" ? function(bidResponse, bidReq) {
        return value(bidResponse, bidReq);
      } : function(bidResponse) {
        return getValue(bidResponse, value);
      }
    };
  };
  defaultAdserverTargeting = function() {
    const TARGETING_KEYS = CONSTANTS5.TARGETING_KEYS;
    return [
      createKeyVal(TARGETING_KEYS.BIDDER, "bidderCode"),
      createKeyVal(TARGETING_KEYS.AD_ID, "adId"),
      createKeyVal(TARGETING_KEYS.PRICE_BUCKET, getPriceByGranularity()),
      createKeyVal(TARGETING_KEYS.SIZE, "size"),
      createKeyVal(TARGETING_KEYS.DEAL, "dealId"),
      createKeyVal(TARGETING_KEYS.SOURCE, "source"),
      createKeyVal(TARGETING_KEYS.FORMAT, "mediaType"),
      createKeyVal(TARGETING_KEYS.ADOMAIN, getAdvertiserDomain())
    ];
  };
  setKeys = function(keyValues, bidderSettings4, custBidObj, bidReq) {
    var targeting = bidderSettings4[CONSTANTS5.JSON_MAPPING.ADSERVER_TARGETING];
    custBidObj.size = custBidObj.getSize();
    _each(targeting, function(kvPair) {
      var key = kvPair.key;
      var value = kvPair.val;
      if (keyValues[key]) {
        logWarn("The key: " + key + " is being overwritten");
      }
      if (isFn(value)) {
        try {
          value = value(custBidObj, bidReq);
        } catch (e) {
          logError("bidmanager", "ERROR", e);
        }
      }
      if ((typeof bidderSettings4.suppressEmptyKeys !== "undefined" && bidderSettings4.suppressEmptyKeys === true || key === CONSTANTS5.TARGETING_KEYS.DEAL) && (isEmptyStr(value) || value === null || value === undefined)) {
        logInfo("suppressing empty key '" + key + "' from adserver targeting");
      } else {
        keyValues[key] = value;
      }
    });
    return keyValues;
  };
  groupByPlacement = function(bidsByPlacement, bid) {
    if (!bidsByPlacement[bid.adUnitCode]) {
      bidsByPlacement[bid.adUnitCode] = { bids: [] };
    }
    bidsByPlacement[bid.adUnitCode].bids.push(bid);
    return bidsByPlacement;
  };
  getTimedOutBids = function(bidderRequests, timelyBidders) {
    const timedOutBids = bidderRequests.map((bid) => (bid.bids || []).filter((bid2) => !timelyBidders.has(bid2.bidder))).reduce(flatten, []).map((bid) => ({
      bidId: bid.bidId,
      bidder: bid.bidder,
      adUnitCode: bid.adUnitCode,
      auctionId: bid.auctionId
    }));
    return timedOutBids;
  };
  ({ syncUsers } = userSync);
  adapterManager2 = (init_adapterManager(), __toCommonJS(exports_adapterManager)).default;
  events = (init_events(), __toCommonJS(exports_events));
  CONSTANTS5 = require_constants();
  AUCTION_STARTED = "started";
  AUCTION_IN_PROGRESS = "inProgress";
  AUCTION_COMPLETED = "completed";
  events.on(CONSTANTS5.EVENTS.BID_ADJUSTMENT, function(bid) {
    adjustBids(bid);
  });
  MAX_REQUESTS_PER_ORIGIN = 4;
  outstandingRequests = {};
  sourceInfo = {};
  queuedCalls = [];
  addBidResponse = hook("sync", function(adUnitCode, bid) {
    this.dispatch.call(null, adUnitCode, bid);
  }, "addBidResponse");
  addBidderRequests = hook("sync", function(bidderRequests) {
    this.dispatch.call(this.context, bidderRequests);
  }, "addBidderRequests");
  bidsBackCallback = hook("async", function(adUnits, callback) {
    if (callback) {
      callback();
    }
  }, "bidsBackCallback");
  callPrebidCache = hook("async", function(auctionInstance, bidResponse, afterBidAdded, videoMediaType) {
    store([bidResponse], function(error, cacheIds) {
      if (error) {
        logWarn(`Failed to save to the video cache: ${error}. Video bid must be discarded.`);
        doCallbacksIfTimedout(auctionInstance, bidResponse);
      } else {
        if (cacheIds[0].uuid === "") {
          logWarn(`Supplied video cache key was already in use by Prebid Cache; caching attempt was rejected. Video bid must be discarded.`);
          doCallbacksIfTimedout(auctionInstance, bidResponse);
        } else {
          bidResponse.videoCacheKey = cacheIds[0].uuid;
          if (!bidResponse.vastUrl) {
            bidResponse.vastUrl = getCacheUrl(bidResponse.videoCacheKey);
          }
          addBidToAuction(auctionInstance, bidResponse);
          afterBidAdded();
        }
      }
    });
  }, "callPrebidCache");
  getPriceGranularity = (bid, { index = auctionManager2.index } = {}) => {
    const mediaTypeGranularity = getMediaTypeGranularity(bid.mediaType, index.getMediaTypes(bid), config.getConfig("mediaTypePriceGranularity"));
    const granularity = typeof bid.mediaType === "string" && mediaTypeGranularity ? typeof mediaTypeGranularity === "string" ? mediaTypeGranularity : "custom" : config.getConfig("priceGranularity");
    return granularity;
  };
  getPriceByGranularity = (granularity) => {
    return (bid) => {
      const bidGranularity = granularity || getPriceGranularity(bid);
      if (bidGranularity === CONSTANTS5.GRANULARITY_OPTIONS.AUTO) {
        return bid.pbAg;
      } else if (bidGranularity === CONSTANTS5.GRANULARITY_OPTIONS.DENSE) {
        return bid.pbDg;
      } else if (bidGranularity === CONSTANTS5.GRANULARITY_OPTIONS.LOW) {
        return bid.pbLg;
      } else if (bidGranularity === CONSTANTS5.GRANULARITY_OPTIONS.MEDIUM) {
        return bid.pbMg;
      } else if (bidGranularity === CONSTANTS5.GRANULARITY_OPTIONS.HIGH) {
        return bid.pbHg;
      } else if (bidGranularity === CONSTANTS5.GRANULARITY_OPTIONS.CUSTOM) {
        return bid.pbCg;
      }
    };
  };
  getAdvertiserDomain = () => {
    return (bid) => {
      return bid.meta && bid.meta.advertiserDomains && bid.meta.advertiserDomains.length > 0 ? bid.meta.advertiserDomains[0] : "";
    };
  };
});

// src/auctionIndex.js
function AuctionIndex(getAuctions) {
  Object.assign(this, {
    getAuction({ auctionId }) {
      if (auctionId != null) {
        return getAuctions().find((auction) => auction.getAuctionId() === auctionId);
      }
    },
    getAdUnit({ transactionId }) {
      if (transactionId != null) {
        return getAuctions().flatMap((a) => a.getAdUnits()).find((au) => au.transactionId === transactionId);
      }
    },
    getMediaTypes({ transactionId, requestId }) {
      if (requestId != null) {
        const req = this.getBidRequest({ requestId });
        if (req != null && (transactionId == null || req.transactionId === transactionId)) {
          return req.mediaTypes;
        }
      } else if (transactionId != null) {
        const au = this.getAdUnit({ transactionId });
        if (au != null) {
          return au.mediaTypes;
        }
      }
    },
    getBidderRequest({ requestId, bidderRequestId }) {
      if (requestId != null || bidderRequestId != null) {
        let bers = getAuctions().flatMap((a) => a.getBidRequests());
        if (bidderRequestId != null) {
          bers = bers.filter((ber) => ber.bidderRequestId === bidderRequestId);
        }
        if (requestId == null) {
          return bers[0];
        } else {
          return bers.find((ber) => ber.bids && ber.bids.find((br) => br.bidId === requestId) != null);
        }
      }
    },
    getBidRequest({ requestId }) {
      if (requestId != null) {
        return getAuctions().flatMap((a) => a.getBidRequests()).flatMap((ber) => ber.bids).find((br) => br && br.bidId === requestId);
      }
    }
  });
}
var init_auctionIndex = __esm(() => {
});

// src/auctionManager.js
function newAuctionManager() {
  const _auctions = [];
  const auctionManager5 = {};
  auctionManager5.addWinningBid = function(bid) {
    const auction2 = find(_auctions, (auction3) => auction3.getAuctionId() === bid.auctionId);
    if (auction2) {
      bid.status = CONSTANTS6.BID_STATUS.RENDERED;
      auction2.addWinningBid(bid);
    } else {
      logWarn(`Auction not found when adding winning bid`);
    }
  };
  auctionManager5.getAllWinningBids = function() {
    return _auctions.map((auction2) => auction2.getWinningBids()).reduce(flatten, []);
  };
  auctionManager5.getBidsRequested = function() {
    return _auctions.map((auction2) => auction2.getBidRequests()).reduce(flatten, []);
  };
  auctionManager5.getNoBids = function() {
    return _auctions.map((auction2) => auction2.getNoBids()).reduce(flatten, []);
  };
  auctionManager5.getBidsReceived = function() {
    return _auctions.map((auction2) => {
      if (auction2.getAuctionStatus() === AUCTION_COMPLETED) {
        return auction2.getBidsReceived();
      }
    }).reduce(flatten, []).filter((bid) => bid);
  };
  auctionManager5.getAllBidsForAdUnitCode = function(adUnitCode) {
    return _auctions.map((auction2) => {
      return auction2.getBidsReceived();
    }).reduce(flatten, []).filter((bid) => bid && bid.adUnitCode === adUnitCode);
  };
  auctionManager5.getAdUnits = function() {
    return _auctions.map((auction2) => auction2.getAdUnits()).reduce(flatten, []);
  };
  auctionManager5.getAdUnitCodes = function() {
    return _auctions.map((auction2) => auction2.getAdUnitCodes()).reduce(flatten, []).filter(uniques);
  };
  auctionManager5.createAuction = function({ adUnits, adUnitCodes, callback, cbTimeout, labels, auctionId }) {
    const auction2 = newAuction({ adUnits, adUnitCodes, callback, cbTimeout, labels, auctionId });
    _addAuction(auction2);
    return auction2;
  };
  auctionManager5.findBidByAdId = function(adId) {
    return find(_auctions.map((auction2) => auction2.getBidsReceived()).reduce(flatten, []), (bid) => bid.adId === adId);
  };
  auctionManager5.getStandardBidderAdServerTargeting = function() {
    return getStandardBidderSettings()[CONSTANTS6.JSON_MAPPING.ADSERVER_TARGETING];
  };
  auctionManager5.setStatusForBids = function(adId, status) {
    let bid = auctionManager5.findBidByAdId(adId);
    if (bid)
      bid.status = status;
    if (bid && status === CONSTANTS6.BID_STATUS.BID_TARGETING_SET) {
      const auction2 = find(_auctions, (auction3) => auction3.getAuctionId() === bid.auctionId);
      if (auction2)
        auction2.setBidTargeting(bid);
    }
  };
  auctionManager5.getLastAuctionId = function() {
    return _auctions.length && _auctions[_auctions.length - 1].getAuctionId();
  };
  auctionManager5.clearAllAuctions = function() {
    _auctions.length = 0;
  };
  function _addAuction(auction2) {
    _auctions.push(auction2);
  }
  auctionManager5.index = new AuctionIndex(() => _auctions);
  return auctionManager5;
}
var CONSTANTS6, auctionManager2;
var init_auctionManager = __esm(() => {
  init_utils();
  init_auction();
  init_polyfill();
  init_auctionIndex();
  CONSTANTS6 = require_constants();
  auctionManager2 = newAuctionManager();
});

// src/native.js
function processNativeAdUnitParams(params) {
  if (params && params.type && typeIsSupported(params.type)) {
    return SUPPORTED_TYPES[params.type];
  }
  return params;
}
function decorateAdUnitsWithNativeParams(adUnits) {
  adUnits.forEach((adUnit) => {
    const nativeParams = adUnit.nativeParams || dlv(adUnit, "mediaTypes.native");
    if (nativeParams) {
      adUnit.nativeParams = processNativeAdUnitParams(nativeParams);
    }
  });
}
function nativeBidIsValid(bid, { index = auctionManager2.index } = {}) {
  if (!dlv(bid, "native.clickUrl")) {
    return false;
  }
  const requestedAssets = index.getAdUnit(bid).nativeParams;
  if (!requestedAssets) {
    return true;
  }
  const requiredAssets = Object.keys(requestedAssets).filter((key) => requestedAssets[key].required);
  const returnedAssets = Object.keys(bid["native"]).filter((key) => bid["native"][key]);
  return requiredAssets.every((asset) => includes(returnedAssets, asset));
}
function getNativeTargeting(bid, { index = auctionManager2.index } = {}) {
  let keyValues = {};
  const adUnit = index.getAdUnit(bid);
  if (dlv(adUnit, "nativeParams.rendererUrl")) {
    bid["native"]["rendererUrl"] = getAssetValue(adUnit.nativeParams["rendererUrl"]);
  } else if (dlv(adUnit, "nativeParams.adTemplate")) {
    bid["native"]["adTemplate"] = getAssetValue(adUnit.nativeParams["adTemplate"]);
  }
  const globalSendTargetingKeys = dlv(adUnit, `nativeParams.sendTargetingKeys`) !== false;
  const nativeKeys = getNativeKeys(adUnit);
  const flatBidNativeKeys = { ...bid.native, ...bid.native.ext };
  delete flatBidNativeKeys.ext;
  Object.keys(flatBidNativeKeys).forEach((asset) => {
    const key = nativeKeys[asset];
    let value = getAssetValue(bid.native[asset]) || getAssetValue(dlv(bid, `native.ext.${asset}`));
    if (asset === "adTemplate" || !key || !value) {
      return;
    }
    let sendPlaceholder = dlv(adUnit, `nativeParams.${asset}.sendId`);
    if (typeof sendPlaceholder !== "boolean") {
      sendPlaceholder = dlv(adUnit, `nativeParams.ext.${asset}.sendId`);
    }
    if (sendPlaceholder) {
      const placeholder = `${key}:${bid.adId}`;
      value = placeholder;
    }
    let assetSendTargetingKeys = dlv(adUnit, `nativeParams.${asset}.sendTargetingKeys`);
    if (typeof assetSendTargetingKeys !== "boolean") {
      assetSendTargetingKeys = dlv(adUnit, `nativeParams.ext.${asset}.sendTargetingKeys`);
    }
    const sendTargeting = typeof assetSendTargetingKeys === "boolean" ? assetSendTargetingKeys : globalSendTargetingKeys;
    if (sendTargeting) {
      keyValues[key] = value;
    }
  });
  return keyValues;
}
var typeIsSupported, getAssetValue, getNativeKeys, CONSTANTS7, nativeAdapters, NATIVE_TARGETING_KEYS, IMAGE, SUPPORTED_TYPES;
var init_native = __esm(() => {
  init_utils();
  init_polyfill();
  init_auctionManager();
  typeIsSupported = function(type) {
    if (!(type && includes(Object.keys(SUPPORTED_TYPES), type))) {
      logError(`${type} nativeParam is not supported`);
      return false;
    }
    return true;
  };
  getAssetValue = function(value) {
    if (typeof value === "object" && value.url) {
      return value.url;
    }
    return value;
  };
  getNativeKeys = function(adUnit) {
    const extraNativeKeys = {};
    if (dlv(adUnit, "nativeParams.ext")) {
      Object.keys(adUnit.nativeParams.ext).forEach((extKey) => {
        extraNativeKeys[extKey] = `hb_native_${extKey}`;
      });
    }
    return {
      ...CONSTANTS7.NATIVE_KEYS,
      ...extraNativeKeys
    };
  };
  CONSTANTS7 = require_constants();
  nativeAdapters = [];
  NATIVE_TARGETING_KEYS = Object.keys(CONSTANTS7.NATIVE_KEYS).map((key) => CONSTANTS7.NATIVE_KEYS[key]);
  IMAGE = {
    image: { required: true },
    title: { required: true },
    sponsoredBy: { required: true },
    clickUrl: { required: true },
    body: { required: false },
    icon: { required: false }
  };
  SUPPORTED_TYPES = {
    image: IMAGE
  };
});

// src/adUnits.js
var ensureAdUnit, incrementAdUnitCount, incrementRequestsCounter, incrementBidderRequestsCounter, incrementBidderWinsCounter, getRequestsCounter, getBidderRequestsCounter, getBidderWinsCounter, adUnits, adunitCounter;
var init_adUnits = __esm(() => {
  init_utils();
  ensureAdUnit = function(adunit, bidderCode) {
    let adUnit = adUnits[adunit] = adUnits[adunit] || { bidders: {} };
    if (bidderCode) {
      return adUnit.bidders[bidderCode] = adUnit.bidders[bidderCode] || {};
    }
    return adUnit;
  };
  incrementAdUnitCount = function(adunit, counter, bidderCode) {
    let adUnit = ensureAdUnit(adunit, bidderCode);
    adUnit[counter] = (adUnit[counter] || 0) + 1;
    return adUnit[counter];
  };
  incrementRequestsCounter = function(adunit) {
    return incrementAdUnitCount(adunit, "requestsCounter");
  };
  incrementBidderRequestsCounter = function(adunit, bidderCode) {
    return incrementAdUnitCount(adunit, "requestsCounter", bidderCode);
  };
  incrementBidderWinsCounter = function(adunit, bidderCode) {
    return incrementAdUnitCount(adunit, "winsCounter", bidderCode);
  };
  getRequestsCounter = function(adunit) {
    return dlv(adUnits, `${adunit}.requestsCounter`) || 0;
  };
  getBidderRequestsCounter = function(adunit, bidder) {
    return dlv(adUnits, `${adunit}.bidders.${bidder}.requestsCounter`) || 0;
  };
  getBidderWinsCounter = function(adunit, bidder) {
    return dlv(adUnits, `${adunit}.bidders.${bidder}.winsCounter`) || 0;
  };
  adUnits = {};
  adunitCounter = {
    incrementRequestsCounter,
    incrementBidderRequestsCounter,
    incrementBidderWinsCounter,
    getRequestsCounter,
    getBidderRequestsCounter,
    getBidderWinsCounter
  };
});

// src/refererDetection.js
function detectReferer(win) {
  function getAncestorOrigins(win2) {
    try {
      if (!win2.location.ancestorOrigins) {
        return;
      }
      return win2.location.ancestorOrigins;
    } catch (e) {
    }
  }
  function getCanonicalUrl(doc) {
    let pageURL = config.getConfig("pageUrl");
    if (pageURL)
      return pageURL;
    try {
      const element = doc.querySelector("link[rel='canonical']");
      if (element !== null) {
        return element.href;
      }
    } catch (e) {
    }
    return null;
  }
  function refererInfo() {
    const stack = [];
    const ancestors = getAncestorOrigins(win);
    const maxNestedIframes = config.getConfig("maxNestedIframes");
    let currentWindow;
    let bestReferrer;
    let bestCanonicalUrl;
    let reachedTop = false;
    let level = 0;
    let valuesFromAmp = false;
    let inAmpFrame = false;
    do {
      const previousWindow = currentWindow;
      const wasInAmpFrame = inAmpFrame;
      let currentLocation;
      let crossOrigin = false;
      let foundReferrer = null;
      inAmpFrame = false;
      currentWindow = currentWindow ? currentWindow.parent : win;
      try {
        currentLocation = currentWindow.location.href || null;
      } catch (e) {
        crossOrigin = true;
      }
      if (crossOrigin) {
        if (wasInAmpFrame) {
          const context = previousWindow.context;
          try {
            foundReferrer = context.sourceUrl;
            bestReferrer = foundReferrer;
            valuesFromAmp = true;
            if (currentWindow === win.top) {
              reachedTop = true;
            }
            if (context.canonicalUrl) {
              bestCanonicalUrl = context.canonicalUrl;
            }
          } catch (e) {
          }
        } else {
          logWarn("Trying to access cross domain iframe. Continuing without referrer and location");
          try {
            const referrer = previousWindow.document.referrer;
            if (referrer) {
              foundReferrer = referrer;
              if (currentWindow === win.top) {
                reachedTop = true;
              }
            }
          } catch (e) {
          }
          if (!foundReferrer && ancestors && ancestors[level - 1]) {
            foundReferrer = ancestors[level - 1];
          }
          if (foundReferrer && !valuesFromAmp) {
            bestReferrer = foundReferrer;
          }
        }
      } else {
        if (currentLocation) {
          foundReferrer = currentLocation;
          bestReferrer = foundReferrer;
          valuesFromAmp = false;
          if (currentWindow === win.top) {
            reachedTop = true;
            const canonicalUrl = getCanonicalUrl(currentWindow.document);
            if (canonicalUrl) {
              bestCanonicalUrl = canonicalUrl;
            }
          }
        }
        if (currentWindow.context && currentWindow.context.sourceUrl) {
          inAmpFrame = true;
        }
      }
      stack.push(foundReferrer);
      level++;
    } while (currentWindow !== win.top && level < maxNestedIframes);
    stack.reverse();
    return {
      referer: bestReferrer || null,
      reachedTop,
      isAmp: valuesFromAmp,
      numIframes: level - 1,
      stack,
      canonicalUrl: bestCanonicalUrl || null
    };
  }
  return refererInfo;
}
var getRefererInfo;
var init_refererDetection = __esm(() => {
  init_config();
  init_utils();
  getRefererInfo = detectReferer(window);
});

// src/consentHandler.js
class ConsentHandler {
  #enabled;
  #data;
  #promise;
  #resolve;
  #ready;
  generatedTime;
  constructor() {
    this.reset();
  }
  reset() {
    this.#promise = new Promise((resolve) => {
      this.#resolve = (data) => {
        this.#ready = true;
        this.#data = data;
        resolve(data);
      };
    });
    this.#enabled = false;
    this.#data = null;
    this.#ready = false;
    this.generatedTime = null;
  }
  enable() {
    this.#enabled = true;
  }
  get enabled() {
    return this.#enabled;
  }
  get ready() {
    return this.#ready;
  }
  get promise() {
    if (this.#ready) {
      return Promise.resolve(this.#data);
    }
    if (!this.#enabled) {
      this.#resolve(null);
    }
    return this.#promise;
  }
  setConsentData(data, time = timestamp()) {
    this.generatedTime = time;
    this.#resolve(data);
  }
  getConsentData() {
    return this.#data;
  }
}

class UspConsentHandler extends ConsentHandler {
  getConsentMeta() {
    const consentData = this.getConsentData();
    if (consentData && this.generatedTime) {
      return {
        usp: consentData,
        generatedAt: this.generatedTime
      };
    }
  }
}

class GdprConsentHandler extends ConsentHandler {
  getConsentMeta() {
    const consentData = this.getConsentData();
    if (consentData && consentData.vendorData && this.generatedTime) {
      return {
        gdprApplies: consentData.gdprApplies,
        consentStringSize: isStr(consentData.vendorData.tcString) ? consentData.vendorData.tcString.length : 0,
        generatedAt: this.generatedTime,
        apiVersion: consentData.apiVersion
      };
    }
  }
}
var init_consentHandler = __esm(() => {
  init_utils();
});

// src/adapterManager.js
var exports_adapterManager = {};
__export(exports_adapterManager, {
  uspDataHandler: () => {
    {
      return uspDataHandler;
    }
  },
  setupAdUnitMediaTypes: () => {
    {
      return setupAdUnitMediaTypes;
    }
  },
  partitionBidders: () => {
    {
      return partitionBidders;
    }
  },
  getS2SBidderSet: () => {
    {
      return getS2SBidderSet;
    }
  },
  gdprDataHandler: () => {
    {
      return gdprDataHandler;
    }
  },
  filterBidsForAdUnit: () => {
    {
      return filterBidsForAdUnit;
    }
  },
  default: () => {
    {
      return adapterManager_default;
    }
  },
  coppaDataHandler: () => {
    {
      return coppaDataHandler;
    }
  },
  _partitionBidders: () => {
    {
      return _partitionBidders;
    }
  },
  _filterBidsForAdUnit: () => {
    {
      return _filterBidsForAdUnit;
    }
  },
  PARTITIONS: () => {
    {
      return PARTITIONS;
    }
  }
});
function _filterBidsForAdUnit(bids, s2sConfig, { getS2SBidders = getS2SBidderSet } = {}) {
  if (s2sConfig == null) {
    return bids;
  } else {
    const serverBidders = getS2SBidders(s2sConfig);
    return bids.filter((bid) => serverBidders.has(bid.bidder));
  }
}
function getS2SBidderSet(s2sConfigs) {
  if (!isArray(s2sConfigs))
    s2sConfigs = [s2sConfigs];
  const serverBidders = new Set([null]);
  s2sConfigs.filter((s2s) => s2s && s2s.enabled).flatMap((s2s) => s2s.bidders).forEach((bidder) => serverBidders.add(bidder));
  return serverBidders;
}
function _partitionBidders(adUnits3, s2sConfigs, { getS2SBidders = getS2SBidderSet } = {}) {
  const serverBidders = getS2SBidders(s2sConfigs);
  return getBidderCodes(adUnits3).reduce((memo, bidder) => {
    const partition = serverBidders.has(bidder) ? PARTITIONS.SERVER : PARTITIONS.CLIENT;
    memo[partition].push(bidder);
    return memo;
  }, { [PARTITIONS.CLIENT]: [], [PARTITIONS.SERVER]: [] });
}
var getBids, getAdUnitCopyForPrebidServer, getAdUnitCopyForClientAdapters, getSupportedMediaTypes, tryCallBidderMethod, PARTITIONS, CONSTANTS8, events2, adapterManager3, _bidderRegistry, _aliasRegistry, _s2sConfigs, _analyticsRegistry, hookedGetBids, filterBidsForAdUnit, gdprDataHandler, uspDataHandler, coppaDataHandler, setupAdUnitMediaTypes, partitionBidders, adapterManager_default;
var init_adapterManager = __esm(() => {
  init_utils();
  init_sizeMapping();
  init_native();
  init_bidderFactory();
  init_ajax();
  init_config();
  init_hook();
  init_polyfill();
  init_adUnits();
  init_refererDetection();
  init_consentHandler();
  getBids = function({ bidderCode, auctionId, bidderRequestId, adUnits: adUnits3, src }) {
    return adUnits3.reduce((result, adUnit) => {
      result.push(adUnit.bids.filter((bid) => bid.bidder === bidderCode).reduce((bids, bid) => {
        bid = Object.assign({}, bid, getDefinedParams(adUnit, [
          "nativeParams",
          "ortb2Imp",
          "mediaType",
          "renderer",
          "storedAuctionResponse"
        ]));
        const mediaTypes2 = bid.mediaTypes == null ? adUnit.mediaTypes : bid.mediaTypes;
        if (isValidMediaTypes(mediaTypes2)) {
          bid = Object.assign({}, bid, {
            mediaTypes: mediaTypes2
          });
        } else {
          logError(`mediaTypes is not correctly configured for adunit ${adUnit.code}`);
        }
        bids.push(Object.assign({}, bid, {
          adUnitCode: adUnit.code,
          transactionId: adUnit.transactionId,
          sizes: dlv(mediaTypes2, "banner.sizes") || dlv(mediaTypes2, "video.playerSize") || [],
          bidId: bid.bid_id || getUniqueIdentifierStr(),
          bidderRequestId,
          auctionId,
          src,
          bidRequestsCount: adunitCounter.getRequestsCounter(adUnit.code),
          bidderRequestsCount: adunitCounter.getBidderRequestsCounter(adUnit.code, bid.bidder),
          bidderWinsCount: adunitCounter.getBidderWinsCounter(adUnit.code, bid.bidder)
        }));
        return bids;
      }, []));
      return result;
    }, []).reduce(flatten, []).filter((val) => val !== "");
  };
  getAdUnitCopyForPrebidServer = function(adUnits3, s2sConfig) {
    let adUnitsCopy = deepClone(adUnits3);
    adUnitsCopy.forEach((adUnit) => {
      adUnit.bids = filterBidsForAdUnit(adUnit.bids, s2sConfig).map((bid) => {
        bid.bid_id = getUniqueIdentifierStr();
        return bid;
      });
    });
    adUnitsCopy = adUnitsCopy.filter((adUnit) => {
      return adUnit.bids.length !== 0;
    });
    return adUnitsCopy;
  };
  getAdUnitCopyForClientAdapters = function(adUnits3) {
    let adUnitsClientCopy = deepClone(adUnits3);
    adUnitsClientCopy.forEach((adUnit) => {
      adUnit.bids = filterBidsForAdUnit(adUnit.bids, null);
    });
    adUnitsClientCopy = adUnitsClientCopy.filter((adUnit) => {
      return adUnit.bids.length !== 0;
    });
    return adUnitsClientCopy;
  };
  getSupportedMediaTypes = function(bidderCode) {
    let supportedMediaTypes = [];
    if (includes(adapterManager3.videoAdapters, bidderCode))
      supportedMediaTypes.push("video");
    if (includes(nativeAdapters, bidderCode))
      supportedMediaTypes.push("native");
    return supportedMediaTypes;
  };
  tryCallBidderMethod = function(bidder, method, param) {
    try {
      const adapter = _bidderRegistry[bidder];
      const spec = adapter.getSpec();
      if (spec && spec[method] && typeof spec[method] === "function") {
        logInfo(`Invoking ${bidder}.${method}`);
        config.runWithBidder(bidder, bind.call(spec[method], spec, param));
      }
    } catch (e) {
      logWarn(`Error calling ${method} of ${bidder}`);
    }
  };
  PARTITIONS = {
    CLIENT: "client",
    SERVER: "server"
  };
  CONSTANTS8 = require_constants();
  events2 = (init_events(), __toCommonJS(exports_events));
  adapterManager3 = {};
  _bidderRegistry = adapterManager3.bidderRegistry = {};
  _aliasRegistry = adapterManager3.aliasRegistry = {};
  _s2sConfigs = [];
  config.getConfig("s2sConfig", (config11) => {
    if (config11 && config11.s2sConfig) {
      _s2sConfigs = isArray(config11.s2sConfig) ? config11.s2sConfig : [config11.s2sConfig];
    }
  });
  _analyticsRegistry = {};
  hookedGetBids = hook("sync", getBids, "getBids");
  filterBidsForAdUnit = hook("sync", _filterBidsForAdUnit, "filterBidsForAdUnit");
  gdprDataHandler = new GdprConsentHandler;
  uspDataHandler = new UspConsentHandler;
  coppaDataHandler = {
    getCoppa: function() {
      return !!config.getConfig("coppa");
    }
  };
  setupAdUnitMediaTypes = hook("sync", (adUnits3, labels) => {
    return processAdUnitsForLabels(adUnits3, labels);
  }, "setupAdUnitMediaTypes");
  partitionBidders = hook("sync", _partitionBidders, "partitionBidders");
  adapterManager3.makeBidRequests = hook("sync", function(adUnits3, auctionStart, auctionId, cbTimeout, labels) {
    events2.emit(CONSTANTS8.EVENTS.BEFORE_REQUEST_BIDS, adUnits3);
    decorateAdUnitsWithNativeParams(adUnits3);
    adUnits3 = setupAdUnitMediaTypes(adUnits3, labels);
    let { [PARTITIONS.CLIENT]: clientBidders, [PARTITIONS.SERVER]: serverBidders } = partitionBidders(adUnits3, _s2sConfigs);
    if (config.getConfig("bidderSequence") === RANDOM) {
      clientBidders = shuffle(clientBidders);
    }
    const refererInfo = getRefererInfo();
    let bidRequests = [];
    _s2sConfigs.forEach((s2sConfig) => {
      if (s2sConfig && s2sConfig.enabled) {
        let adUnitsS2SCopy = getAdUnitCopyForPrebidServer(adUnits3, s2sConfig);
        let uniquePbsTid = generateUUID();
        serverBidders.forEach((bidderCode) => {
          const bidderRequestId = getUniqueIdentifierStr();
          const bidderRequest = {
            bidderCode,
            auctionId,
            bidderRequestId,
            uniquePbsTid,
            bids: hookedGetBids({ bidderCode, auctionId, bidderRequestId, adUnits: deepClone(adUnitsS2SCopy), src: CONSTANTS8.S2S.SRC }),
            auctionStart,
            timeout: s2sConfig.timeout,
            src: CONSTANTS8.S2S.SRC,
            refererInfo
          };
          if (bidderRequest.bids.length !== 0) {
            bidRequests.push(bidderRequest);
          }
        });
        adUnitsS2SCopy.forEach((adUnitCopy) => {
          let validBids = adUnitCopy.bids.filter((adUnitBid) => find(bidRequests, (request) => find(request.bids, (reqBid) => reqBid.bidId === adUnitBid.bid_id)));
          adUnitCopy.bids = validBids;
        });
        bidRequests.forEach((request) => {
          if (request.adUnitsS2SCopy === undefined) {
            request.adUnitsS2SCopy = adUnitsS2SCopy.filter((adUnitCopy) => adUnitCopy.bids.length > 0);
          }
        });
      }
    });
    let adUnitsClientCopy = getAdUnitCopyForClientAdapters(adUnits3);
    clientBidders.forEach((bidderCode) => {
      const bidderRequestId = getUniqueIdentifierStr();
      const bidderRequest = {
        bidderCode,
        auctionId,
        bidderRequestId,
        bids: hookedGetBids({ bidderCode, auctionId, bidderRequestId, adUnits: deepClone(adUnitsClientCopy), labels, src: "client" }),
        auctionStart,
        timeout: cbTimeout,
        refererInfo
      };
      const adapter = _bidderRegistry[bidderCode];
      if (!adapter) {
        logError(`Trying to make a request for bidder that does not exist: ${bidderCode}`);
      }
      if (adapter && bidderRequest.bids && bidderRequest.bids.length !== 0) {
        bidRequests.push(bidderRequest);
      }
    });
    if (gdprDataHandler.getConsentData()) {
      bidRequests.forEach((bidRequest) => {
        bidRequest["gdprConsent"] = gdprDataHandler.getConsentData();
      });
    }
    if (uspDataHandler.getConsentData()) {
      bidRequests.forEach((bidRequest) => {
        bidRequest["uspConsent"] = uspDataHandler.getConsentData();
      });
    }
    return bidRequests;
  }, "makeBidRequests");
  adapterManager3.callBids = (adUnits3, bidRequests, addBidResponse2, doneCb, requestCallbacks, requestBidsTimeout, onTimelyResponse) => {
    if (!bidRequests.length) {
      logWarn("callBids executed with no bidRequests.  Were they filtered by labels or sizing?");
      return;
    }
    let [clientBidRequests, serverBidRequests] = bidRequests.reduce((partitions, bidRequest) => {
      partitions[Number(typeof bidRequest.src !== "undefined" && bidRequest.src === CONSTANTS8.S2S.SRC)].push(bidRequest);
      return partitions;
    }, [[], []]);
    var uniqueServerBidRequests = [];
    serverBidRequests.forEach((serverBidRequest) => {
      var index = -1;
      for (var i = 0;i < uniqueServerBidRequests.length; ++i) {
        if (serverBidRequest.uniquePbsTid === uniqueServerBidRequests[i].uniquePbsTid) {
          index = i;
          break;
        }
      }
      if (index <= -1) {
        uniqueServerBidRequests.push(serverBidRequest);
      }
    });
    let counter = 0;
    const sourceTid = generateUUID();
    _s2sConfigs.forEach((s2sConfig) => {
      if (s2sConfig && uniqueServerBidRequests[counter] && getS2SBidderSet(s2sConfig).has(uniqueServerBidRequests[counter].bidderCode)) {
        const s2sAjax = ajaxBuilder(requestBidsTimeout, requestCallbacks ? {
          request: requestCallbacks.request.bind(null, "s2s"),
          done: requestCallbacks.done
        } : undefined);
        let adaptersServerSide = s2sConfig.bidders;
        const s2sAdapter = _bidderRegistry[s2sConfig.adapter];
        let uniquePbsTid = uniqueServerBidRequests[counter].uniquePbsTid;
        let adUnitsS2SCopy = uniqueServerBidRequests[counter].adUnitsS2SCopy;
        let uniqueServerRequests = serverBidRequests.filter((serverBidRequest) => serverBidRequest.uniquePbsTid === uniquePbsTid);
        if (s2sAdapter) {
          let s2sBidRequest = { tid: sourceTid, ad_units: adUnitsS2SCopy, s2sConfig };
          if (s2sBidRequest.ad_units.length) {
            let doneCbs = uniqueServerRequests.map((bidRequest) => {
              bidRequest.start = timestamp();
              return doneCb.bind(bidRequest);
            });
            const bidders = getBidderCodes(s2sBidRequest.ad_units).filter((bidder) => adaptersServerSide.includes(bidder));
            logMessage(`CALLING S2S HEADER BIDDERS ==== ${bidders.length > 0 ? bidders.join(", ") : 'No bidder specified, using "ortb2Imp" definition(s) only'}`);
            uniqueServerRequests.forEach((bidRequest) => {
              events2.emit(CONSTANTS8.EVENTS.BID_REQUESTED, { ...bidRequest, tid: sourceTid });
            });
            s2sAdapter.callBids(s2sBidRequest, serverBidRequests, addBidResponse2, () => doneCbs.forEach((done) => done()), s2sAjax);
          }
        } else {
          logError("missing " + s2sConfig.adapter);
        }
        counter++;
      }
    });
    clientBidRequests.forEach((bidRequest) => {
      bidRequest.start = timestamp();
      const adapter = _bidderRegistry[bidRequest.bidderCode];
      config.runWithBidder(bidRequest.bidderCode, () => {
        logMessage(`CALLING BIDDER`);
        events2.emit(CONSTANTS8.EVENTS.BID_REQUESTED, bidRequest);
      });
      let ajax4 = ajaxBuilder(requestBidsTimeout, requestCallbacks ? {
        request: requestCallbacks.request.bind(null, bidRequest.bidderCode),
        done: requestCallbacks.done
      } : undefined);
      const adapterDone = doneCb.bind(bidRequest);
      try {
        config.runWithBidder(bidRequest.bidderCode, bind.call(adapter.callBids, adapter, bidRequest, addBidResponse2, adapterDone, ajax4, onTimelyResponse, config.callbackWithBidder(bidRequest.bidderCode)));
      } catch (e) {
        logError(`${bidRequest.bidderCode} Bid Adapter emitted an uncaught error when parsing their bidRequest`, { e, bidRequest });
        adapterDone();
      }
    });
  };
  adapterManager3.videoAdapters = [];
  adapterManager3.registerBidAdapter = function(bidAdapter, bidderCode, { supportedMediaTypes = [] } = {}) {
    if (bidAdapter && bidderCode) {
      if (typeof bidAdapter.callBids === "function") {
        _bidderRegistry[bidderCode] = bidAdapter;
        if (includes(supportedMediaTypes, "video")) {
          adapterManager3.videoAdapters.push(bidderCode);
        }
        if (includes(supportedMediaTypes, "native")) {
          nativeAdapters.push(bidderCode);
        }
      } else {
        logError("Bidder adaptor error for bidder code: " + bidderCode + "bidder must implement a callBids() function");
      }
    } else {
      logError("bidAdapter or bidderCode not specified");
    }
  };
  adapterManager3.aliasBidAdapter = function(bidderCode, alias, options) {
    let existingAlias = _bidderRegistry[alias];
    if (typeof existingAlias === "undefined") {
      let bidAdapter = _bidderRegistry[bidderCode];
      if (typeof bidAdapter === "undefined") {
        const nonS2SAlias = [];
        _s2sConfigs.forEach((s2sConfig) => {
          if (s2sConfig.bidders && s2sConfig.bidders.length) {
            const s2sBidders = s2sConfig && s2sConfig.bidders;
            if (!(s2sConfig && includes(s2sBidders, alias))) {
              nonS2SAlias.push(bidderCode);
            } else {
              _aliasRegistry[alias] = bidderCode;
            }
          }
        });
        nonS2SAlias.forEach((bidderCode2) => {
          logError('bidderCode "' + bidderCode2 + '" is not an existing bidder.', "adapterManager.aliasBidAdapter");
        });
      } else {
        try {
          let newAdapter;
          let supportedMediaTypes = getSupportedMediaTypes(bidderCode);
          if (bidAdapter.constructor.prototype != Object.prototype) {
            newAdapter = new bidAdapter.constructor;
            newAdapter.setBidderCode(alias);
          } else {
            let spec = bidAdapter.getSpec();
            let gvlid = options && options.gvlid;
            let skipPbsAliasing = options && options.skipPbsAliasing;
            newAdapter = newBidder(Object.assign({}, spec, { code: alias, gvlid, skipPbsAliasing }));
            _aliasRegistry[alias] = bidderCode;
          }
          adapterManager3.registerBidAdapter(newAdapter, alias, {
            supportedMediaTypes
          });
        } catch (e) {
          logError(bidderCode + " bidder does not currently support aliasing.", "adapterManager.aliasBidAdapter");
        }
      }
    } else {
      logMessage('alias name "' + alias + '" has been already specified.');
    }
  };
  adapterManager3.registerAnalyticsAdapter = function({ adapter, code, gvlid }) {
    if (adapter && code) {
      if (typeof adapter.enableAnalytics === "function") {
        adapter.code = code;
        _analyticsRegistry[code] = { adapter, gvlid };
      } else {
        logError(`Prebid Error: Analytics adaptor error for analytics "${code}"
        analytics adapter must implement an enableAnalytics() function`);
      }
    } else {
      logError("Prebid Error: analyticsAdapter or analyticsCode not specified");
    }
  };
  adapterManager3.enableAnalytics = function(config11) {
    if (!isArray(config11)) {
      config11 = [config11];
    }
    _each(config11, (adapterConfig) => {
      const entry = _analyticsRegistry[adapterConfig.provider];
      if (entry && entry.adapter) {
        entry.adapter.enableAnalytics(adapterConfig);
      } else {
        logError(`Prebid Error: no analytics adapter found in registry for '${adapterConfig.provider}'.`);
      }
    });
  };
  adapterManager3.getBidAdapter = function(bidder) {
    return _bidderRegistry[bidder];
  };
  adapterManager3.getAnalyticsAdapter = function(code) {
    return _analyticsRegistry[code];
  };
  adapterManager3.callTimedOutBidders = function(adUnits3, timedOutBidders, cbTimeout) {
    timedOutBidders = timedOutBidders.map((timedOutBidder) => {
      timedOutBidder.params = getUserConfiguredParams(adUnits3, timedOutBidder.adUnitCode, timedOutBidder.bidder);
      timedOutBidder.timeout = cbTimeout;
      return timedOutBidder;
    });
    timedOutBidders = groupBy(timedOutBidders, "bidder");
    Object.keys(timedOutBidders).forEach((bidder) => {
      tryCallBidderMethod(bidder, "onTimeout", timedOutBidders[bidder]);
    });
  };
  adapterManager3.callBidWonBidder = function(bidder, bid, adUnits3) {
    bid.params = getUserConfiguredParams(adUnits3, bid.adUnitCode, bid.bidder);
    adunitCounter.incrementBidderWinsCounter(bid.adUnitCode, bid.bidder);
    tryCallBidderMethod(bidder, "onBidWon", bid);
  };
  adapterManager3.callSetTargetingBidder = function(bidder, bid) {
    tryCallBidderMethod(bidder, "onSetTargeting", bid);
  };
  adapterManager3.callBidViewableBidder = function(bidder, bid) {
    tryCallBidderMethod(bidder, "onBidViewable", bid);
  };
  adapterManager3.callBidderError = function(bidder, error, bidderRequest) {
    const param = { error, bidderRequest };
    tryCallBidderMethod(bidder, "onBidderError", param);
  };
  adapterManager_default = adapterManager3;
});

// src/bidfactory.js
function createBid(statusCode, identifiers) {
  return new Bid(statusCode, identifiers);
}
var Bid;
var init_bidfactory = __esm(() => {
  init_utils();
  Bid = function(statusCode, { src = "client", bidder = "", bidId, transactionId, auctionId } = {}) {
    var _bidSrc = src;
    var _statusCode = statusCode || 0;
    this.bidderCode = bidder;
    this.width = 0;
    this.height = 0;
    this.statusMessage = _getStatus();
    this.adId = getUniqueIdentifierStr();
    this.requestId = bidId;
    this.transactionId = transactionId;
    this.auctionId = auctionId;
    this.mediaType = "banner";
    this.source = _bidSrc;
    function _getStatus() {
      switch (_statusCode) {
        case 0:
          return "Pending";
        case 1:
          return "Bid available";
        case 2:
          return "Bid returned empty or error response";
        case 3:
          return "Bid timed out";
      }
    }
    this.getStatusCode = function() {
      return _statusCode;
    };
    this.getSize = function() {
      return this.width + "x" + this.height;
    };
    this.getIdentifiers = function() {
      return {
        src: this.source,
        bidder: this.bidderCode,
        bidId: this.requestId,
        transactionId: this.transactionId,
        auctionId: this.auctionId
      };
    };
  };
});

// src/adapters/bidderFactory.js
function registerBidder(spec) {
  console.log('rmn2 spec', spec)
  const mediaTypes3 = Array.isArray(spec.supportedMediaTypes) ? { supportedMediaTypes: spec.supportedMediaTypes } : undefined;
  function putBidder(spec2) {
    const bidder = newBidder(spec2);
    pbjs.registerBidAdapter(() => bidder, spec2.code, mediaTypes3);
    // adapterManager_default.registerBidAdapter(bidder, spec2.code, mediaTypes3);
    console.log('rmn2 pubBidder')
    console.log('rmn2 bidder', bidder)
    console.log('rmn2 code', spec2.code)
  }
  putBidder(spec);
  if (Array.isArray(spec.aliases)) {
    spec.aliases.forEach((alias) => {
      let aliasCode = alias;
      let gvlid;
      let skipPbsAliasing;
      if (isPlainObject(alias)) {
        aliasCode = alias.code;
        gvlid = alias.gvlid;
        skipPbsAliasing = alias.skipPbsAliasing;
      }
      adapterManager_default.aliasRegistry[aliasCode] = spec.code;
      putBidder(Object.assign({}, spec, { code: aliasCode, gvlid, skipPbsAliasing }));
    });
  }
}
function newBidder(spec) {
  console.log('rmn2 newBidder')
  hook.ready()
  return Object.assign(new Adapter(spec.code), {
    getSpec: function() {
      return Object.freeze(spec);
    },
    registerSyncs,
    callBids: function(bidderRequest, addBidResponse2, done, ajax5, onTimelyResponse, configEnabledCallback) {
      console.log('rmn2 callbids')
      console.log('rmn2 callBids params', { bidderRequest, addBidResponse2, done, ajax5, onTimelyResponse, configEnabledCallback })
      if (!Array.isArray(bidderRequest.bids)) {
        return;
      }
      const adUnitCodesHandled = {};
      function addBidWithCode(adUnitCode, bid) {
        adUnitCodesHandled[adUnitCode] = true;
        if (isValid(adUnitCode, bid)) {
          addBidResponse2(adUnitCode, bid);
        }
      }
      const responses = [];
      function afterAllResponses() {
        done();
        config.runWithBidder(spec.code, () => {
          emit(constants.default.EVENTS.BIDDER_DONE, bidderRequest);
          registerSyncs(responses, bidderRequest.gdprConsent, bidderRequest.uspConsent);
        });
      }
      const validBidRequests = bidderRequest.bids.filter(filterAndWarn);
      if (validBidRequests.length === 0) {
        afterAllResponses();
        return;
      }
      const bidRequestMap = {};
      validBidRequests.forEach((bid) => {
        bidRequestMap[bid.bidId] = bid;
        if (!bid.adUnitCode) {
          bid.adUnitCode = bid.placementCode;
        }
      });
      processBidderRequests(spec, validBidRequests, bidderRequest, ajax5, configEnabledCallback, {
        onRequest: (requestObject) => {
          console.log('rmn2 onRequest')
          emit(constants.default.EVENTS.BEFORE_BIDDER_HTTP, bidderRequest, requestObject)
        },
        onResponse: (resp) => {
          console.log('rmn2 onResponse')
          onTimelyResponse(spec.code);
          responses.push(resp);
        },
        onError: (errorMessage, error) => {
          onTimelyResponse(spec.code);
          adapterManager_default.callBidderError(spec.code, error, bidderRequest);
          emit(constants.default.EVENTS.BIDDER_ERROR, { error, bidderRequest });
          logError(`Server call for ${spec.code} failed: ${errorMessage} ${error.status}. Continuing without bids.`);
        },
        onBid: (bid) => {
          console.log('rmn2 onBid')
          const bidRequest = bidRequestMap[bid.requestId];
          if (bidRequest) {
            bid.originalCpm = bid.cpm;
            bid.originalCurrency = bid.currency;
            bid.meta = bid.meta || Object.assign({}, bid[bidRequest.bidder]);
            const prebidBid = Object.assign(createBid(constants.default.STATUS.GOOD, bidRequest), bid);
            addBidWithCode(bidRequest.adUnitCode, prebidBid);
          } else {
            logWarn(`Bidder ${spec.code} made bid for unknown request ID: ${bid.requestId}. Ignoring.`);
          }
        },
        onCompletion: afterAllResponses
      });
    }
  });
  function registerSyncs(responses, gdprConsent, uspConsent) {
    registerSyncInner(spec, responses, gdprConsent, uspConsent);
  }
  function filterAndWarn(bid) {
    if (!spec.isBidRequestValid(bid)) {
      logWarn(`Invalid bid sent to bidder ${spec.code}: ${JSON.stringify(bid)}`);
      return false;
    }
    return true;
  }
}
function preloadBidderMappingFile(fn, adUnits3) {
  if (!config.getConfig("adpod.brandCategoryExclusion")) {
    return fn.call(this, adUnits3);
  }
  let adPodBidders = adUnits3.filter((adUnit) => dlv(adUnit, "mediaTypes.video.context") === ADPOD).map((adUnit) => adUnit.bids.map((bid) => bid.bidder)).reduce(flatten, []).filter(uniques);
  adPodBidders.forEach((bidder) => {
    let bidderSpec = adapterManager_default.getBidAdapter(bidder);
    if (bidderSpec.getSpec().getMappingFileInfo) {
      let info = bidderSpec.getSpec().getMappingFileInfo();
      let refreshInDays = info.refreshInDays ? info.refreshInDays : DEFAULT_REFRESHIN_DAYS;
      let key = info.localStorageKey ? info.localStorageKey : bidderSpec.getSpec().code;
      let mappingData = storage2.getDataFromLocalStorage(key);
      try {
        mappingData = mappingData ? JSON.parse(mappingData) : undefined;
        if (!mappingData || timestamp() > mappingData.lastUpdated + refreshInDays * 24 * 60 * 60 * 1000) {
          ajax(info.url, {
            success: (response) => {
              try {
                response = JSON.parse(response);
                let mapping = {
                  lastUpdated: timestamp(),
                  mapping: response.mapping
                };
                storage2.setDataInLocalStorage(key, JSON.stringify(mapping));
              } catch (error) {
                logError(`Failed to parse ${bidder} bidder translation mapping file`);
              }
            },
            error: () => {
              logError(`Failed to load ${bidder} bidder translation file`);
            }
          });
        }
      } catch (error) {
        logError(`Failed to parse ${bidder} bidder translation mapping file`);
      }
    }
  });
  fn.call(this, adUnits3);
}
function isValid(adUnitCode, bid, { index = auctionManager2.index } = {}) {
  function hasValidKeys() {
    let bidKeys = Object.keys(bid);
    return COMMON_BID_RESPONSE_KEYS.every((key) => includes(bidKeys, key) && !includes([undefined, null], bid[key]));
  }
  function errorMessage(msg) {
    return `Invalid bid from ${bid.bidderCode}. Ignoring bid: ${msg}`;
  }
  if (!adUnitCode) {
    logWarn("No adUnitCode was supplied to addBidResponse.");
    return false;
  }
  if (!bid) {
    logWarn(`Some adapter tried to add an undefined bid for ${adUnitCode}.`);
    return false;
  }
  if (!hasValidKeys()) {
    logError(errorMessage(`Bidder ${bid.bidderCode} is missing required params. Check http://prebid.org/dev-docs/bidder-adapter-1.html for list of params.`));
    return false;
  }
  if (bid.mediaType === "native" && !nativeBidIsValid(bid, { index })) {
    logError(errorMessage("Native bid missing some required properties."));
    return false;
  }
  if (bid.mediaType === "video" && !isValidVideoBid(bid, { index })) {
    logError(errorMessage(`Video bid does not have required vastUrl or renderer property`));
    return false;
  }
  if (bid.mediaType === "banner" && !validBidSize(adUnitCode, bid, { index })) {
    logError(errorMessage(`Banner bids require a width and height`));
    return false;
  }
  return true;
}
var constants, validBidSize, storage2, COMMON_BID_RESPONSE_KEYS, DEFAULT_REFRESHIN_DAYS, processBidderRequests, registerSyncInner;
var init_bidderFactory = __esm(() => {
  init_adapter();
  init_adapterManager();
  init_config();
  init_bidfactory();
  init_userSync();
  init_native();
  init_video();
  constants = __toESM(require_constants(), 1);
  init_events();
  init_polyfill();
  init_ajax();
  init_utils();
  init_mediaTypes();
  init_hook();
  init_storageManager();
  init_auctionManager();
  validBidSize = function(adUnitCode, bid, { index = auctionManager2.index } = {}) {
    if ((bid.width || parseInt(bid.width, 10) === 0) && (bid.height || parseInt(bid.height, 10) === 0)) {
      bid.width = parseInt(bid.width, 10);
      bid.height = parseInt(bid.height, 10);
      return true;
    }
    const bidRequest = index.getBidRequest(bid);
    const mediaTypes3 = index.getMediaTypes(bid);
    const sizes = bidRequest && bidRequest.sizes || mediaTypes3 && mediaTypes3.banner && mediaTypes3.banner.sizes;
    const parsedSizes = parseSizesInput(sizes);
    if (parsedSizes.length === 1) {
      const [width, height] = parsedSizes[0].split("x");
      bid.width = parseInt(width, 10);
      bid.height = parseInt(height, 10);
      return true;
    }
    return false;
  };
  storage2 = getCoreStorageManager("bidderFactory");
  COMMON_BID_RESPONSE_KEYS = ["cpm", "ttl", "creativeId", "netRevenue", "currency"];
  DEFAULT_REFRESHIN_DAYS = 1;
  processBidderRequests = hook("sync", function(spec, bids, bidderRequest, ajax5, wrapCallback, { onRequest, onResponse, onError, onBid, onCompletion }) {
    console.log('rmn2 processBidderRequests')
    let requests = spec.buildRequests(bids, bidderRequest);
    if (!requests || requests.length === 0) {
      onCompletion();
      return;
    }
    if (!Array.isArray(requests)) {
      requests = [requests];
    }
    const requestDone = delayExecution(onCompletion, requests.length);
    requests.forEach((request) => {
      const onSuccess = wrapCallback(function(response, responseObj) {
        try {
          response = JSON.parse(response);
        } catch (e) {
        }
        response = {
          body: response,
          headers: headerParser(responseObj)
        };
        onResponse(response);
        let bids2;
        try {
          bids2 = spec.interpretResponse(response, request);
        } catch (err) {
          logError(`Bidder ${spec.code} failed to interpret the server's response. Continuing without bids`, null, err);
          requestDone();
          return;
        }
        console.log('rmn2 bid2', bids2)
        if (bids2) {
          if (isArray(bids2)) {
            bids2.forEach(onBid);
          } else {
            onBid(bids2);
          }
        }
        requestDone();
        function headerParser(xmlHttpResponse) {
          return {
            get: responseObj.getResponseHeader.bind(responseObj)
          };
        }
      });
      const onFailure = wrapCallback(function(errorMessage, error) {
        onError(errorMessage, error);
        requestDone();
      });
      onRequest(request);
      switch (request.method) {
        case "GET":
          ajax5(`${request.url}${formatGetParameters(request.data)}`, {
            success: onSuccess,
            error: onFailure
          }, undefined, Object.assign({
            method: "GET",
            withCredentials: true
          }, request.options));
          break;
        case "POST":
          ajax5(request.url, {
            success: onSuccess,
            error: onFailure
          }, typeof request.data === "string" ? request.data : JSON.stringify(request.data), Object.assign({
            method: "POST",
            contentType: "text/plain",
            withCredentials: true
          }, request.options));
          break;
        default:
          logWarn(`Skipping invalid request from ${spec.code}. Request type ${request.type} must be GET or POST`);
          requestDone();
      }
      function formatGetParameters(data) {
        if (data) {
          return `?${typeof data === "object" ? parseQueryStringParameters(data) : data}`;
        }
        return "";
      }
    });
  }, "processBidderRequests");
  registerSyncInner = hook("async", function(spec, responses, gdprConsent, uspConsent) {
    const aliasSyncEnabled = config.getConfig("userSync.aliasSyncEnabled");
    if (spec.getUserSyncs && (aliasSyncEnabled || !adapterManager_default.aliasRegistry[spec.code])) {
      let filterConfig = config.getConfig("userSync.filterSettings");
      let syncs = spec.getUserSyncs({
        iframeEnabled: !!(filterConfig && (filterConfig.iframe || filterConfig.all)),
        pixelEnabled: !!(filterConfig && (filterConfig.image || filterConfig.all))
      }, responses, gdprConsent, uspConsent);
      if (syncs) {
        if (!Array.isArray(syncs)) {
          syncs = [syncs];
        }
        syncs.forEach((sync) => {
          userSync.registerSync(sync.type, spec.code, sync.url);
        });
      }
    }
  }, "registerSyncs");
  getHook("checkAdUnitSetup").before(preloadBidderMappingFile);
});

// modules/asealBidAdapter.js
init_bidderFactory();
init_mediaTypes();
init_config();
init_utils();
init_storageManager();
var BIDDER_CODE = "aseal";
var SUPPORTED_AD_TYPES = [BANNER];
var API_ENDPOINT = "https://tkprebid.aotter.net/prebid/adapter";
var WEB_SESSION_ID_KEY = "__tkwsid";
var HEADER_AOTTER_VERSION = "prebid_0.0.2";
var storage3 = getStorageManager({ bidderCode: BIDDER_CODE });
var getTrekWebSessionId = () => {
  let wsid = storage3.localStorageIsEnabled() && storage3.getDataFromLocalStorage(WEB_SESSION_ID_KEY);
  if (!wsid) {
    wsid = generateUUID();
    setTrekWebSessionId(wsid);
  }
  return wsid;
};
var setTrekWebSessionId = (wsid) => {
  if (storage3.localStorageIsEnabled()) {
    storage3.setDataInLocalStorage(WEB_SESSION_ID_KEY, wsid);
  }
};
var canAccessTopWindow = () => {
  try {
    return !!getWindowTop().location.href;
  } catch (errro) {
    return false;
  }
};
var spec = {
  code: 'asealRmn2', // BIDDER_CODE,
  // aliases: ["aotter", "trek"],
  supportedMediaTypes: SUPPORTED_AD_TYPES,
  isBidRequestValid: (bid) => !!bid.params.placeUid && typeof bid.params.placeUid === "string",
  buildRequests: (validBidRequests, bidderRequest) => {
    console.log('rmn2 buildRequests')
    if (validBidRequests.length === 0) {
      return [];
    }
    // const clientId = config.getConfig("aseal.clientId") || "";
    const clientId = pbjs.getConfig("aseal.clientId") || "";
    const windowTop = getWindowTop();
    const windowSelf = getWindowSelf();
    const w = canAccessTopWindow() ? windowTop : windowSelf;
    const data = {
      bids: validBidRequests,
      refererInfo: bidderRequest.refererInfo,
      device: {
        webSessionId: getTrekWebSessionId()
      },
      payload: {
        meta: {
          dr: w.document.referrer,
          drs: windowSelf.document.referrer,
          drt: canAccessTopWindow() && windowTop.document.referrer || "",
          dt: w.document.title,
          dl: w.location.href
        }
      }
    };
    const options = {
      contentType: "application/json",
      withCredentials: true,
      customHeaders: {
        "x-aotter-clientid": clientId,
        "x-aotter-version": HEADER_AOTTER_VERSION
      }
    };

    const result = [
      {
        method: "POST",
        url: API_ENDPOINT,
        data,
        options
      }
    ];

    console.log('rmn2 result', result)
    return result
  },
  interpretResponse: (serverResponse, bidRequest) => {
    console.log('rmn2 interpretResponse')
    if (!Array.isArray(serverResponse.body)) {
      return [];
    }
    const bidResponses = serverResponse.body;
    return bidResponses;
  }
};
// registerBidder(spec);
export {
  storage3 as storage,
  spec as specRMN,
  WEB_SESSION_ID_KEY,
  SUPPORTED_AD_TYPES,
  HEADER_AOTTER_VERSION,
  BIDDER_CODE,
  API_ENDPOINT,
  registerBidder as registerBidderRMN,
};

