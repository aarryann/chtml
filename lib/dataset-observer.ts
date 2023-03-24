import { IStateObject, IDatasetObject } from './dataset-interfaces.js'

const DatasetObserver: any = {};
// Primary datasets such as feeds will always start with DatasetObserver.init while registering inputs
// Secondary datasets such as search results may not init. This flag is to account for pages with no primary datasets
// and only a secondary dataset
DatasetObserver.neverinited = true;

DatasetObserver.subscriptions = {};
DatasetObserver.meta = {};

var $$SUBSCRIPTIONS = DatasetObserver.subscriptions;
var $$META = DatasetObserver.meta;

/*
 * Register local state data and state change callbacks
 */
DatasetObserver.init = function (force: boolean = false) {
  if (force || DatasetObserver.neverinited) {
    DatasetObserver.neverinited = false;
    DatasetObserver.subscriptions = {};
    DatasetObserver.meta = {};
    $$SUBSCRIPTIONS = DatasetObserver.subscriptions;
    $$META = DatasetObserver.meta;
    DatasetObserver.state = DatasetObserver.stateFactory({}, $$SUBSCRIPTIONS);
  }
};

/*
 * Register local state data and state change callbacks
 */
DatasetObserver.registerDataTrigger = function (stateKey: string, dataset: IDatasetObject[], viewSyncerCallback: Function, domDocument: Document) {
  DatasetObserver.init();
  DatasetObserver.subscribe('CHANNEL_DECORATORS', stateKey, (state: IStateObject, oldState: IStateObject, diffSet: Map <string, Array<IDatasetObject>>) => {
    // linkerCallback gets registered here but gets called after updateChannelData in the proxy
    viewSyncerCallback(stateKey, state, oldState, diffSet, domDocument);
  });
  DatasetObserver.updateObservedData(stateKey, dataset);
};

/*
 * Channel data to be available for automatic actions
 */
DatasetObserver.updateObservedData = function (stateKey: string, dataset: IDatasetObject[]) {
  // find difference between old and new dataset
  if (stateKey in DatasetObserver.state) {
    const diff = DatasetObserver.diffDatasets(DatasetObserver.state[stateKey], dataset, 'id');
    $$META[stateKey] || ($$META[stateKey] = {});
    $$META[stateKey].previousState = DatasetObserver.state[stateKey];
    $$META[stateKey].stateDiff = diff;
  } else {
  }
  // assigning the dataset will trigger the observer
  DatasetObserver.state[stateKey] = dataset;
};

/*
 * Local state register state change callbacks
 */
DatasetObserver.subscribe = function (
  subscriptionKey: string,
  stateToBind: string,
  subscriptionCallback: (state: IStateObject, oldState: IStateObject, diffSet: Map <string, Array<IDatasetObject>>) => void
) {
  if (!(stateToBind in $$SUBSCRIPTIONS)) {
    $$SUBSCRIPTIONS[stateToBind] = new Map();
  }
  $$SUBSCRIPTIONS[stateToBind].set(subscriptionKey, subscriptionCallback);
};

/*
 * Setup a listening local state
 */
DatasetObserver.stateFactory = function (
  initialState: IStateObject,
  subscriptions: { [key: string]: Map<string, (state: IStateObject, oldState: IStateObject, diffSet: Map <string, Array<IDatasetObject>>) => void> }
) {
  return new Proxy(initialState, {
    set: function (state: IStateObject, prop: string, value: IDatasetObject[]) {
      const oldState: IStateObject = { ...state };
      state[prop] = value;
      // Proxy listens to state change and invokes registered callback on state change
      // This is the core of reactivity is implemented
      subscriptions[prop].forEach((subscriptionCallback: (s: IStateObject, o: IStateObject, d: Map <string, Array<IDatasetObject>>) => void) =>
        subscriptionCallback(state, oldState, $$META[prop] && $$META[prop].stateDiff)
      );
      return true;
    }
  });
};

/*
 * - Diff two datasets to identify additions, updates and deletions
 */
DatasetObserver.diffDatasets = function (o: Array<IDatasetObject>, n: Array<IDatasetObject>, id: keyof IDatasetObject): Map <string, Array<IDatasetObject>> {
  const ns = new Map<string, Array<IDatasetObject>>();
  const nsupdate = [];
  const oids = new Map<string, IDatasetObject>();
  const nids = new Map<string, IDatasetObject>();
  for (var i = 0; i < o.length; i++) {
    let or = o[i];
    oids.set(<string>or[id], or);
    let updaterow: any = {};
    for (var j = 0; j < n.length; j++) {
      let nr = n[j];
      if (i === 0) {
        nids.set(<string>nr[id], nr);
      }
      if (nr[id] !== or[id]) {
        continue;
      } else {
        oids.delete(<string>or[id]);
        nids.delete(<string>nr[id]);
      }
      let updated = false;
      for (const [key, value] of Object.entries(nr)) {
        if (key === id) {
          nr['uid'] = or['uid'];
          //updaterow['uid'] = or['uid'];
          //updaterow['id'] = or['id'];
          continue;
        }
        if (nr[key as keyof IDatasetObject] !== or[key as keyof IDatasetObject]) {
          updated = true;
          updaterow['updated'] = key;
          if (!('fullrecord' in updaterow)) {
            updaterow['fullrecord'] = nr;
          }
        }
      }
      if (updated) nsupdate.push(<IDatasetObject>updaterow);
    }
  }
  ns.set('update', nsupdate);
  ns.set('add', Array.from(nids.values()));
  ns.set('del', Array.from(oids.values()));
  
  return ns;
};

export { DatasetObserver };
