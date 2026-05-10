const formatArgs = (...args) => args.map((item) => {
  if (item instanceof Error) {
    return item.stack || item.message;
  }
  return item;
});

const info = (...args) => {
  console.info('[TravelMind]', ...formatArgs(...args));
};

const warn = (...args) => {
  console.warn('[TravelMind]', ...formatArgs(...args));
};

const error = (...args) => {
  console.error('[TravelMind]', ...formatArgs(...args));
};

module.exports = {
  info,
  warn,
  error
};
