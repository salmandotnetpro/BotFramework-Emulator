import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import bot from '../../../../data/reducer/bot';
import { LuisService } from 'msbot/bin/models';
import { LuisExplorerContainer } from './luisExplorerContainer';
import { LuisExplorer } from './luisExplorer';
import { load, setActive } from '../../../../data/action/botActions';
import {
  launchLuisModelsViewer,
  openLuisDeepLink,
  openLuisExplorerContextMenu
} from '../../../../data/action/luisServiceActions';
import { LuisEditorContainer } from './luisEditor';
import {
  AzureLoginFailedDialogContainer,
  AzureLoginSuccessDialogContainer,
  ConnectLuisAppPromptDialogContainer, GetStartedWithLuisDialogContainer
} from '../../../dialogs';
import { LuisModelsViewerContainer } from './luisModelsViewerDialog/luisModelsViewerContainer';

jest.mock('../../../dialogs', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../servicePane/servicePane.scss', () => ({}));
jest.mock('./luisModelsViewerDialog/luisModelsViewer.scss', () => ({}));

describe('The LuisExplorer component should', () => {
  let parent;
  let node;
  let mockStore;
  let mockBot;
  let mockDispatch;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ bot }));
    mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "secretKey": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(<Provider store={ mockStore }>
      <LuisExplorerContainer/>
    </Provider>);
    node = parent.find(LuisExplorer);
  });

  it('should render deeply', () => {
    expect(parent.find(LuisExplorerContainer)).not.toBe(null);
    expect(parent.find(LuisExplorer)).not.toBe(null);
  });

  it('should dispatch a request to open a luis deep link when a service is clicked', () => {
    const instance = node.instance();
    instance.onLinkClick({ currentTarget: { dataset: { index: 0 } } });
    expect(mockDispatch).toHaveBeenCalledWith(openLuisDeepLink(mockBot.services[0]));
  });

  it('should dispatch a request to open the context menu when right clicking on a luis service', () => {
    const instance = node.instance();
    const mockLi = document.createElement('li');
    mockLi.setAttribute('data-index', '0');

    instance.onContextMenuOverLiElement(mockLi);
    expect(mockDispatch)
      .toHaveBeenCalledWith(openLuisExplorerContextMenu(LuisEditorContainer, new LuisService(mockBot.services[0])));
  });

  it('should dispatch a request to open the luis models viewer when the add icon is clicked', () => {
    const instance = node.instance();
    instance.onAddIconClick(null);

    expect(mockDispatch).toHaveBeenCalledWith(launchLuisModelsViewer({
      azureAuthWorkflowComponents: {
        loginFailedDialog: AzureLoginFailedDialogContainer,
        loginSuccessDialog: AzureLoginSuccessDialogContainer,
        promptDialog: ConnectLuisAppPromptDialogContainer
      },
      getStartedWithLuisDialog: GetStartedWithLuisDialogContainer,
      luisEditorComponent: LuisEditorContainer,
      luisModelViewer: LuisModelsViewerContainer,
    }));
  });
});
