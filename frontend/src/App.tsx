import React from 'react'

import { Helmet } from 'react-helmet'
import { ThemeProvider, CssBaseline } from '@material-ui/core'
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import theme from 'providers/theme'

import { RelayEnvironmentProvider } from 'react-relay/hooks'
import relayEnv from 'providers/relay'

import Home from 'pages/Home'
//import About from 'pages/About'

const About = React.lazy(() => import('pages/About'))

const App = () => {
  return (
    <div className='App'>
      <Helmet>
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
        />
        <title>Fuck You</title>
      </Helmet>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <React.Suspense fallback='Loading'>
            <Switch>
              <Route path='/' exact component={Home} />
              <Route path='/about' exact component={About} />
            </Switch>
          </React.Suspense>
        </ThemeProvider>
      </BrowserRouter>


    </div>
  )
}
export default App
