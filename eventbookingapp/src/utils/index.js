export const createPageUrl = (pageName) => {
  const routes = {
    'Home': '/',
    'EventDetails': '/event',
    'CreateEvent': '/create',
    'Favorites': '/favorites',
    'MyEvents': '/my-events',
    'SearchResults': '/search',
    'Profile': '/profile'
  };
  return routes[pageName] || '/';
};