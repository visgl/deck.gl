import React from 'react';
import {Router, Route, IndexRoute, IndexRedirect, useRouterHistory} from 'react-router';
import {createHashHistory} from 'history';

import App from './components/app';
import Home from './components/home';
import Gallery from './components/gallery';
import Page from './components/page';
import Blog from './components/blog';

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
  const {children, path, content, embedded} = page;
  if (!children) {
    return (<Route key={i} path={path} component={Page}
      content={content} embedded={embedded} />);
  }

  return (
    <Route key={i} path={path} >
      <IndexRedirect to={getDefaultPath(children)} />
      {children.map(renderRoute)}
    </Route>
  );
};

const renderRouteGroup = (path, pages) => {
  return (
    <Route path={path} component={Gallery} pages={pages}>
      <IndexRedirect to={getDefaultPath(pages)} />
      {pages.map(renderRoute)}
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
      <Route path="blog">
        <IndexRoute component={Blog} />
        <Route path="*" component={Blog} />
      </Route>
      <Route path="*" component={Home} />
    </Route>
  </Router>
);
