const DatasetObserver = require('../dataset-observer').DatasetObserver;
const DatasetLinker = require('../dataset-viewlinker').DatasetLinker;
const feeds = require('../../data/feed-data');

function registerUtils(mk) {
  let opts = { decorators: {}, data: {} };
  opts.decorators = {
    labelize: (id) => `question-title-${id}`,
    uniqueFeedId: (_) => DatasetLinker.incrementUniqueId(mk),
    fulldate: (date) => new Date(date).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    shortened: (qty) => (qty > 999999 ? `${qty / 1000000} M` : qty > 999 ? `${qty / 1000} K` : qty)
  };
  DatasetLinker.registerUtils(opts);
};

function registerFirstFeed() {
  this.registerUtils('feeds');
  DatasetObserver.registerDataTrigger('feeds', structuredClone(FEED_DATA), DatasetLinker.viewSyncer);
};

function linkFeed(domDocument) {
  const key = 'feeds';
  this.registerUtils(key);
  //const domDocument = htmlToDom(viewHTML);

  DatasetObserver.registerDataTrigger(key, structuredClone(feeds.FEED_DATA), DatasetLinker.viewSyncer, domDocument);
  return domDocument.body.innerHTML;
};

module.exports = {
  registerUtils,
  registerFirstFeed,
  linkFeed,
}
