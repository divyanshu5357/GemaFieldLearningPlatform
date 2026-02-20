import { RouterProvider } from 'react-router';
import { router } from './appRoutes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
