import { DatasetObserver } from '../dataset-observer';
import { DatasetLinker } from '../dataset-linker';
import * as FEED_DATA from '../../res/data/feed-data';
import {ISessionUser, IChannelInputs, IDatasetObject} from 'index';

if (!sessionStorage.getItem('user')) {
  sessionStorage.clear();
  const user: ISessionUser = {
    name: 'Augustin Doughman',
    organization: 'Accelor',
    userId: '1',
    orgId: '1',
    lastLogin: '2022-06-17T11:23:00'
  };
  sessionStorage.setItem('user', JSON.stringify(user));
}

function registerUtils(mk: string) {
  let opts = { decorators: {}, data: {} };
  opts.decorators = {
    labelize: (id: string) => `question-title-${id}`,
    uniqueFeedId: (_: string) => DatasetLinker.incrementUniqueId(mk),
    fulldate: (date: any) => new Date(date).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    shortened: (qty: number) => (qty > 999999 ? `${qty / 1000000} M` : qty > 999 ? `${qty / 1000} K` : qty)
  };
  DatasetLinker.registerUtils(opts);
};

function registerFirstFeed() {
  registerUtils('feeds');
  DatasetObserver.registerDataTrigger('feeds', structuredClone(FEED_DATA), DatasetLinker.viewSyncer);
};

function linkFeed(domDocument: Document) {
  const key = 'feeds';
  registerUtils(key);
  //const domDocument = htmlToDom(viewHTML);

  DatasetObserver.registerDataTrigger(key, structuredClone(FEED_DATA), DatasetLinker.viewSyncer, domDocument);
  return domDocument.body.innerHTML;
};

export {
  registerUtils,
  registerFirstFeed,
  linkFeed,
};
