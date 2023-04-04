import { IViewMapper, IStateObject, IDatasetObject, IChannelInputs } from './dataset-interfaces.js'

const DatasetLinker: any = {};
// Primary datasets such as feeds will always start with DatasetLinker.init while registering inputs
// Secondary datasets such as search results may not init. This flag is to account for pages with no primary datasets
// and only a secondary dataset
DatasetLinker.neverinited = true;

DatasetLinker.meta = {};
DatasetLinker.utils = {};

var $$META = DatasetLinker.meta;
var $$UTILS = DatasetLinker.utils;

/*
 * Register local state data and state change callbacks
 */
DatasetLinker.init = function (force: boolean = false) {
  if (force || DatasetLinker.neverinited) {
    DatasetLinker.neverinited = false;
    DatasetLinker.utils = {};
    DatasetLinker.meta = {};
    $$META = DatasetLinker.meta;
    $$UTILS = DatasetLinker.utils;
  }
};

/*
 * Register local state data and state change callbacks
 */
DatasetLinker.registerUtils = function (payload: IChannelInputs) {
  DatasetLinker.init();
  for (const [functionName, callback] of Object.entries(payload.decorators)) {
    $$UTILS[functionName] = callback;
  }
};

/*
 * Invoke registered decorator functions
 */
DatasetLinker.invokeUtils = function (functionName: string, paramArgs: string | number | Date | boolean[]) {
  if (functionName in $$UTILS) {
    return $$UTILS[functionName].call(this, paramArgs);
  } else {
    return 'Not Found';
  }
};

/*
 * Reactively sync view to state data
 * key: string, state: any, oldState: any
 */
DatasetLinker.viewSyncer = function (key: keyof IStateObject, state: IStateObject, _: IStateObject, diffSet: Map <string, Array<IDatasetObject>>, domDocument: Document) {
  if(!domDocument) domDocument = document;
  
  const template = domDocument.querySelector(`template[data-re-dataset="${key}"]`);
  const container = domDocument.querySelector(`[data-re-container="${key}"]`);
  const dataset = state[key];
  let firstRun = false;

  if (!template || !container || !dataset) return;
  
  // viewMappers maps the
  if (!(key in $$META)) {
    $$META[key] = {};
    $$META[key].viewMappers = <IViewMapper[]>[];
    $$META[key].lastUniqueId = 1000;
    firstRun = true;
    DatasetLinker.setViewMapper(key, domDocument);
    DatasetLinker.syncAdditions(key, dataset, template, container, firstRun);
  }

  if (container.children.length <= 1) {
    firstRun = true;
    DatasetLinker.syncAdditions(key, dataset, template, container, firstRun);
  }

  if (diffSet) {
    DatasetLinker.syncDeletions(diffSet.get('del'), container);
    DatasetLinker.syncUpdates(key, diffSet.get('update'), container);
    DatasetLinker.syncAdditions(key, diffSet.get('add'), template, container, firstRun);
  }
};

/*
 * Get incremented unique id
 */
DatasetLinker.incrementUniqueId = function (key: string) {
  return ++$$META[key].lastUniqueId;
};

/*
 * Reactively sync view to state data additions
 */
DatasetLinker.syncAdditions = function (
  stateKey: string,
  dataset: IDatasetObject[],
  template: HTMLTemplateElement,
  container: HTMLElement,
  firstRun: boolean
  ) {
    dataset.forEach(row => {
    const clone = <HTMLElement>template.content.cloneNode(true);

    let attribValue;
    $$META[stateKey].viewMappersGrouped.forEach((value: IViewMapper[], key: string) => {
      const s = clone.querySelector(key);
      if (!s) return;
      value.forEach((attribPair: IViewMapper) => {
        if (!attribPair.decorator) {
          attribValue = row[attribPair.field as keyof IDatasetObject];
        } else {
          const paramArgs: Array<any> = [];
          attribPair.paramList.forEach(
            (col: string) => col.length > 0 && paramArgs.push(row[col as keyof IDatasetObject])
          );

          attribValue = DatasetLinker.invokeUtils(attribPair.decorator, paramArgs);
        }
        if (attribPair.attr === 'content') {
          s.innerHTML = attribValue;
        } else {
          s.setAttribute(attribPair.attr, attribValue);
        }
      });
      row['uid'] = $$META[stateKey].lastUniqueId;
    });
    container.appendChild(clone);
    if (!firstRun) {
      const node = container.querySelector(`[data-uid='${row['uid']}']`);
      node &&
        node.addEventListener('animationend', () => {
          node.classList.remove('changed');
        });
    }
  });
};

/*
 * Reactively sync view to state data deletions
 */
DatasetLinker.syncDeletions = function (dataset: IDatasetObject[], container: HTMLElement) {
  dataset.forEach(row => {
    const node = container.querySelector(`[data-uid='${row['uid']}']`);
    node && node.classList.add('removed');
    node &&
      node.addEventListener('transitionend', () => {
        node.remove();
      });
  });
};

/*
 * Reactively sync view to state data updates
 */
DatasetLinker.syncUpdates = function (stateKey: string, dataset: IDatasetObject[], container: HTMLElement) {
  // dataset provides an array of objects with uid and updated values
  // dataset = [{updated: "replies", fullrecord: {...}}, {uid: 1006, likes: 786}, ...]
  dataset.forEach(row => {
    // for each row = {uid: 1001, replies: 51}, locate the element id for the
    // column (replies in this case) in DatasetLinker.viewMapperFieldGrouped
    const { updated, fullrecord } = row;
    if (!fullrecord || !updated) return;
    const parent = container.querySelector(`[data-uid="${fullrecord.uid}"]`);

    // viewMappersFieldGrouped groups the state data by field into a map
    // viewMappersFieldGrouped = [{"id"} => Array(2), {"replies"} => Array(1), {"likes"} => Array(2)...]
    const rowValueArr = $$META[stateKey].viewMappersFieldGrouped.get(updated);
    // rowValueArr = [{"id": '[data-re-data-uid="uniqueFeedId(id)"][class="bg-white px-4 py-6 shadow sm:p-6 sm:rounded-lg"]',"attr": "data-uid", "decorator": "uniqueFeedId", "paramList": ["id"],"paramValues": "id"}, {"id": "[data-re-content=\"shortened(replies)\"]", "attr": "content","decorator": "shortened","paramList": ["replies"],"paramValues": "replies"}, ...]

    let attribValue;
    rowValueArr.forEach((rowValue: any) => {
      const s = parent?.querySelector(`${rowValue['id']}`);
      if (!s) return;
      if (!rowValue.decorator) {
        attribValue = fullrecord[updated as keyof IDatasetObject];
      } else {
        const paramArgs: Array<any> = [];
        rowValue.paramList.forEach(
          (col: any) => col.length > 0 && paramArgs.push(fullrecord[col as keyof IDatasetObject])
        );

        attribValue = DatasetLinker.invokeUtils(rowValue.decorator, paramArgs);
      }
      if (rowValue.attr === 'content') {
        s.innerHTML = attribValue;
      } else {
        s.setAttribute(rowValue.attr, attribValue);
      }
      s.classList.add('changed');
      s.addEventListener('animationend', () => {
        s.classList.remove('changed');
      });
    });
  });
};

/*
 * Establish view - state data field mappings
 */
DatasetLinker.setViewMapper = function (stateKey: string, domDocument: Document) {
  const template = domDocument.querySelector(`template[data-re-dataset="${stateKey}"]`);
  // One phrase per element
  const matchedPhrases = template?.innerHTML.match(/data-re-.+["']/g);
  if (!matchedPhrases || matchedPhrases.length === 0) {
    $$META[stateKey].viewMappers = <IViewMapper[]>[];
    $$META[stateKey].viewMappersGrouped = new Map<string, IViewMapper[]>();
    $$META[stateKey].viewMappersFieldGrouped = new Map<string, IViewMapper[]>();
    return;
  }
  for (var i = 0; i < matchedPhrases.length; i++) {
    // replace all single quotes to double to simplify regex
    const phrase = matchedPhrases[i].replaceAll("'", '"');
    // skip dataset or container node
    if (!phrase || phrase.indexOf('data-re-dataset') > 0 || phrase.indexOf('data-re-container') > 0) continue;
    // setup identifying key for the line containing phrases - filter format for multiple attributes for queryselectorall
    // example input: data-re-content="fulldate(date)" data-re-datetime="date" data-re-src="avatar"   
    // output: [data-re-content="fulldate(date)"][data-re-datetime="date"][data-re-src="avatar"]
    const filter = `[${phrase.replaceAll('" ', '"][')}]`;
    const mwArr = phrase.match(/data-re-[^\s]+"/g);
    if (!mwArr) continue;
    // for each matching attribute in a phrase
    phrase.match(/data-re-[^\s]+"/g)?.forEach(matchedAttrValue => {
      const maValueArr = matchedAttrValue.match(
        /data-re-(?<attrib>[^="']+).{1,2}(?<value>[^\s"'\(]+).(?<param>[^\s\)"'>]+)?["'\)]{0,2}/
      );
      if (!maValueArr) return;
      const { groups: group } = maValueArr;
      // find the relevant node corresponding to the data attribute
      //const paramValues = group?.param || group?.value || "";
      const paramValues = group?.param;
      const field = group?.param ? null : group?.value;
      const decorator = group?.param && group?.value;
      $$META[stateKey].viewMappers.push(<IViewMapper>{
        id: filter,
        attr: group?.attrib,
        decorator,
        field,
        paramList: paramValues?.split(',') || [],
        paramValues
      });
    });
  }
  $$META[stateKey].viewMappersGrouped = DatasetLinker.groupBy($$META[stateKey].viewMappers, 'id');
  $$META[stateKey].viewMappersFieldGrouped = DatasetLinker.groupByNested($$META[stateKey].viewMappers, 'paramList');
};

/*
 * Array groupBy util function
 */
DatasetLinker.groupBy = function (coll: IViewMapper[], group: keyof IViewMapper) {
  return coll.reduce(
    (entryMap: Map<string, IViewMapper[]>, e: IViewMapper) =>
      entryMap.set(<string>e[group], [...(entryMap.get(<string>e[group]) || []), e]),
    new Map<string, IViewMapper[]>()
  );
};

/*
 * Array groupBy util function
 */
DatasetLinker.groupByNested = function (coll: IViewMapper[], group: keyof IViewMapper) {
  return coll.reduce((entryMap: Map<string, IViewMapper[]>, e: IViewMapper) => {
    (<string[]>e[group]).forEach((element: string) => {
      entryMap.set(element, [...(entryMap.get(element) || []), e]);
    });
    return entryMap;
  }, new Map<string, IViewMapper[]>());
};

export { DatasetLinker };
