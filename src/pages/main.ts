import { ractfeeds } from "./main.ract";
import { FEED_DATA_NEW } from "../share/data/feed-data-new";

export function func() {
  console.log('main');
}

export function callRact() {
  const decorators = {
    labelize: (id: string) => `question-title-${id}`,
    uniqueFeedId: (id: string) => `feed-${id}`,
    fulldate: (date: string) => new Date(date).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    shortened: (qty: number) => (qty > 999999 ? `${qty / 1000000} M` : qty > 999 ? `${qty / 1000} K` : qty)
  };
  ractfeeds(FEED_DATA_NEW, decorators);
}