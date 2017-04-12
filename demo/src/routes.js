import React from 'react';
import {Router, Route, IndexRoute,
  IndexRedirect, Redirect, useRouterHistory} from 'react-router';
import {createHashHistory} from 'history';

import App from './components/app';
import Home from './components/home';
import Gallery from './components/gallery';
import Page from './components/page';

import {examplePages, docPages} from './constants/pages';

const appHistory = useRouterHistory(createHashHistory)({queryKey: false});

const getDefaultPath = pages => {
  const path = [];
  let page;
  while (pages) {
    page = pages[0];
    pages = page.children;
    path.push(page.path);
  }
  return path.join('/');
};

const renderRoute = (page, i) => {
  const {children, path, content} = page;
  if (!children) {
    return (<Route key={i} path={path} component={Page} content={content} />);
  }

  return (
    <Route key={i} path={path} >
      <IndexRedirect to={getDefaultPath(children)} />
      {children.map(renderRoute)}
    </Route>
  );
};

const renderRouteGroup = (path, pages) => {
  const defaultPage = getDefaultPath(pages);
  return (
    <Route path={path} component={Gallery} pages={pages}>
      <IndexRedirect to={defaultPage} />
      {pages.map(renderRoute)}
      <Redirect from="*" to={defaultPage} />
    </Route>
  );
};

// eslint-disable-next-line react/display-name
export default () => (
  <Router history={appHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      {renderRouteGroup('examples', examplePages)}
      {renderRouteGroup('documentation', docPages)}
      <Redirect from="*" to="/" />
    </Route>
  </Router>
);
