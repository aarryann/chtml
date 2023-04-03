export { ISessionUser, IStateObject, IChannelInputs, IDatasetObject };

declare global {
  interface Window {
    goCom: {
      mobileHome: Function;
    };
    Components: {
      listbox: Function;
      menu: Function;
      popoverGroup: Function;
      popover: Function;
      radioGroup: Function;
      tabs: Function;
      tab: Function;
      tabPanel: Function;
    };
    com: {
      go: {
        alpine: {
          topnav: {
            mainnav: Function;
            navaccount: Function;
            navsearch: Function;
            searchresultscontainer: Function;
            mobilehome: Function;
          },
          feedList: Function;
          feedLinker: Function;
        };
      };
    };
  }
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

interface ISessionUser {
  name: string;
  organization: string;
  userId: string;
  orgId: string;
  lastLogin: string;
}
