const DatasetLinker = {};
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
DatasetLinker.init = function (force = false) {
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
DatasetLinker.registerUtils = function (payload) {
    DatasetLinker.init();
    for (const [functionName, callback] of Object.entries(payload.decorators)) {
        $$UTILS[functionName] = callback;
    }
};
/*
 * Invoke registered decorator functions
 */
DatasetLinker.invokeUtils = function (functionName, paramArgs) {
    if (functionName in $$UTILS) {
        return $$UTILS[functionName].call(this, paramArgs);
    }
    else {
        return 'Not Found';
    }
};
/*
 * Reactively sync view to state data
 * key: string, state: any, oldState: any
 */
DatasetLinker.viewSyncer = function (key, state, _, diffSet) {
    const template = document.querySelector(`template[data-re-dataset="${key}"]`);
    const container = document.querySelector(`[data-re-container="${key}"]`);
    const dataset = state[key];
    let firstRun = false;
    if (!template || !container || !dataset)
        return;
    // viewMappers maps the
    if (!(key in $$META)) {
        $$META[key] = {};
        $$META[key].viewMappers = [];
        $$META[key].lastUniqueId = 1000;
        firstRun = true;
        DatasetLinker.setViewMapper(key);
        DatasetLinker.syncAdditions(key, dataset, template, container, firstRun);
    }
    if (container.children.length <= 1) {
        firstRun = true;
        DatasetLinker.syncAdditions(key, dataset, template, container, firstRun);
    }
    if (!firstRun) {
        //const diffSets = $$META[key].stateDiff;
        DatasetLinker.syncDeletions(diffSet.get('del'), container);
        DatasetLinker.syncUpdates(key, diffSet.get('update'), container);
        DatasetLinker.syncAdditions(key, diffSet.get('add'), template, container, firstRun);
    }
};
/*
 * Get incremented unique id
 */
DatasetLinker.incrementUniqueId = function (key) {
    return ++$$META[key].lastUniqueId;
};
/*
 * Reactively sync view to state data additions
 */
DatasetLinker.syncAdditions = function (stateKey, dataset, template, container, firstRun) {
    dataset.forEach(row => {
        const clone = template.content.cloneNode(true);
        let attribValue;
        $$META[stateKey].viewMappersGrouped.forEach((value, key) => {
            const s = clone.querySelector(key);
            if (!s)
                return;
            value.forEach((attribPair) => {
                if (!attribPair.decorator) {
                    attribValue = row[attribPair.field];
                }
                else {
                    const paramArgs = [];
                    attribPair.paramList.forEach((col) => col.length > 0 && paramArgs.push(row[col]));
                    attribValue = DatasetLinker.invokeUtils(attribPair.decorator, paramArgs);
                }
                if (attribPair.attr === 'content') {
                    s.innerHTML = attribValue;
                }
                else {
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
DatasetLinker.syncDeletions = function (dataset, container) {
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
DatasetLinker.syncUpdates = function (stateKey, dataset, container) {
    // dataset provides an array of objects with uid and updated values
    // dataset = [{updated: "replies", fullrecord: {...}}, {uid: 1006, likes: 786}, ...]
    dataset.forEach(row => {
        // for each row = {uid: 1001, replies: 51}, locate the element id for the
        // column (replies in this case) in DatasetLinker.viewMapperFieldGrouped
        const { updated, fullrecord } = row;
        if (!fullrecord || !updated)
            return;
        const parent = container.querySelector(`[data-uid="${fullrecord.uid}"]`);
        // viewMappersFieldGrouped groups the state data by field into a map
        // viewMappersFieldGrouped = [{"id"} => Array(2), {"replies"} => Array(1), {"likes"} => Array(2)...]
        const rowValueArr = $$META[stateKey].viewMappersFieldGrouped.get(updated);
        // rowValueArr = [{"id": '[data-re-data-uid="uniqueFeedId(id)"][class="bg-white px-4 py-6 shadow sm:p-6 sm:rounded-lg"]',"attr": "data-uid", "decorator": "uniqueFeedId", "paramList": ["id"],"paramValues": "id"}, {"id": "[data-re-content=\"shortened(replies)\"]", "attr": "content","decorator": "shortened","paramList": ["replies"],"paramValues": "replies"}, ...]
        let attribValue;
        rowValueArr.forEach((rowValue) => {
            const s = parent?.querySelector(`${rowValue['id']}`);
            if (!s)
                return;
            if (!rowValue.decorator) {
                attribValue = fullrecord[updated];
            }
            else {
                const paramArgs = [];
                rowValue.paramList.forEach((col) => col.length > 0 && paramArgs.push(fullrecord[col]));
                attribValue = DatasetLinker.invokeUtils(rowValue.decorator, paramArgs);
            }
            if (rowValue.attr === 'content') {
                s.innerHTML = attribValue;
            }
            else {
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
DatasetLinker.setViewMapper = function (stateKey) {
    const template = document.querySelector(`template[data-re-dataset="${stateKey}"]`);
    // One phrase per element
    const matchedPhrases = template?.innerHTML.match(/data-re-.+["']/g);
    if (!matchedPhrases || matchedPhrases.length === 0) {
        $$META[stateKey].viewMappers = [];
        $$META[stateKey].viewMappersGrouped = new Map();
        $$META[stateKey].viewMappersFieldGrouped = new Map();
        return;
    }
    for (var i = 0; i < matchedPhrases.length; i++) {
        // replace all single quotes to double to simplify regex
        const phrase = matchedPhrases[i].replaceAll("'", '"');
        // skip dataset or container node
        if (!phrase || phrase.indexOf('data-re-dataset') > 0 || phrase.indexOf('data-re-container') > 0)
            continue;
        // setup filter format for multiple attributes for queryselectorall
        const filter = `[${phrase.replaceAll('" ', '"][')}]`;
        const mwArr = phrase.match(/data-re-[^\s]+"/g);
        if (!mwArr)
            continue;
        // for each matching attribute in a phrase
        phrase.match(/data-re-[^\s]+"/g)?.forEach(matchedAttrValue => {
            const maValueArr = matchedAttrValue.match(/data-re-(?<attrib>[^="']+).{1,2}(?<value>[^\s"'\(]+).(?<param>[^\s\)"'>]+)?["'\)]{0,2}/);
            if (!maValueArr)
                return;
            const { groups: group } = maValueArr;
            // find the relevant node corresponding to the data attribute
            //const paramValues = group?.param || group?.value || "";
            const paramValues = group?.param;
            const field = group?.param ? null : group?.value;
            const decorator = group?.param && group?.value;
            $$META[stateKey].viewMappers.push({
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
DatasetLinker.groupBy = function (coll, group) {
    return coll.reduce((entryMap, e) => entryMap.set(e[group], [...(entryMap.get(e[group]) || []), e]), new Map());
};
/*
 * Array groupBy util function
 */
DatasetLinker.groupByNested = function (coll, group) {
    return coll.reduce((entryMap, e) => {
        e[group].forEach((element) => {
            entryMap.set(element, [...(entryMap.get(element) || []), e]);
        });
        return entryMap;
    }, new Map());
};
export { DatasetLinker };
