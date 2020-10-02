import {Environment, Network, RecordSource, Store} from 'relay-runtime'

const { REACT_APP_API_ENDPOINT } = process.env

// let cache = {

// }

const source = new RecordSource();
const store = new Store(source);

const network = Network.create((operation, variables) => {
  if(!REACT_APP_API_ENDPOINT) throw new Error('please set up .env file')

  //const hashedQueryString = operation.text ?  btoa(operation.text) : ''

  //if(cache[hashedQueryString]) return cache[hashedQueryString]

  return fetch(REACT_APP_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: operation.text, // GraphQL text from input
      variables,
    }),
  }).then(response => {
    return response.json();
  });
});

const environment = new Environment({
  network,
  store,
})

export default environment