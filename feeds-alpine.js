import { DatasetObserver } from './dataset-observer.js';
import { DatasetLinker } from './dataset-viewlinker.js';

function feedLinker() {
  registerUtils: function registerFeedInputs(mk) {
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
  },
  registerFirstFeed: function registerFirstFeed() {
    this.registerUtils('feeds');
    DatasetObserver.registerDataTrigger('feeds', structuredClone(FEED_DATA), DatasetLinker.viewSyncer);
  },
};

module.exports = {
  feedLinker;
}
