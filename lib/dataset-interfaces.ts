interface IViewMapper {
  id: string;
  attr: string;
  decorator: string;
  field: string;
  paramList: string[];
  paramValues: string;
}

interface IStateObject {
  [key: string]: IDatasetObject[];
}

interface IDatasetObject {
  id: string;
  uid: string;
  updated: string;
  fullrecord: IDatasetObject;
}

interface IChannelInputs {
  decorators: { [key: string]: Function };
  data: { [key: string]: IDatasetObject[] };
}

export { IViewMapper, IStateObject, IDatasetObject, IChannelInputs };
