import 'babel-polyfill';
import express from 'express';
import { matchRoutes } from 'react-router-config';
import proxy from 'express-http-proxy';
import Routes from './client/Routes';
import renderer from './helpers/renderer';
import createStore from './helpers/createStore';

const app = express();
//proxy setup
app.use('/api', proxy('http://react-ssr-api.herokuapp.com', {
  proxyReqOptDecorator(opts) {
    opts.headers['x-forwarded-host'] = 'localhost:3000';
    return opts;
  }
}));
//use public dir to find client side bundle
app.use(express.static('public'));

//handle all routes by passing it to renderer
app.get('*', (req, res) => {
  //create store and load data here before we render app
  const store = createStore(req);
  //map through extracted object from array and from every component load data if there is any
  //returns an array of promises
  //map through array of promises and null,if its promise
  // wrap it with new Promise and no matter what resolve inner promise
  const promises = matchRoutes(Routes, req.path).map(({ route }) => {
    route.loadData ? route.loadData(store) : null;
  }).map(promise => {
    if (promise) {
      return new Promise((resolve, reject) => {
        promise.then(resolve).catch(resolve);
      });
    }
  });
  //after all promises are resolved render component
  Promise.all(promises).then(() => {
      const context = {};
      const content = renderer(req, store, context);
      if(context.url) {
        return res.redirect(301, context.url);
      }
      if(context.notFound) {
        res.status(404);
      }
      res.send(content);
  });
});

app.listen(3000, () => {
  console.log('app listen on port 3000');
});
