import 'babel-polyfill';

import React from 'react';
import {Router, Route, IndexRoute, IndexRedirect, useRouterHistory} from 'react-router'
import { createHashHistory } from 'history';

import App from './components/app';
import Home from './components/home';
import Gallery from './components/gallery';
import Page from './components/page';

import {examplePages, docPages, layerDocPages} from './constants/pages';

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false })

export default () => (
  <Router history={appHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      { renderRouteGroup('examples', examplePages) }
      { renderRouteGroup('documentation', docPages) }
      { renderRouteGroup('layers', layerDocPages) }
      <Route path="*" component={Home} />
    </Route>
  </Router>
);

function renderRoute(page, i) {
  const {children, path, content} = page;
  if (children) {
    return (
      <Route key={i} path={path} >
        <IndexRedirect to={ getDefaultPath(children) } />
        { children.map(renderRoute) }
      </Route>
    );
  }
  return <Route key={i} path={path} component={Page} content={content} />
}

function renderRouteGroup(path, pages) {
  return (
    <Route path={path} component={Gallery} pages={pages}>
      <IndexRedirect to={ getDefaultPath(pages) } />
      { pages.map(renderRoute) }
    </Route>
  );
}

function getDefaultPath(pages) {
  let path = [];
  let page;
  while(pages) {
    page = pages[0];
    pages = page.children;
    path.push(page.path);
  }
  return path.join('/');
}
