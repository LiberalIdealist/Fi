import { redirect } from 'next/navigation';
import { NextPage } from 'next';

interface AuthRouteParams {
  params: {
    path?: string[];
  };
}

const AuthRoutes: NextPage<AuthRouteParams> = ({ params }) => {
  const path = params.path?.[0] || '';
  
  if (path === 'login') {
    redirect('/login');
  } else if (path === 'register') {
    redirect('/signup');
  } else {
    redirect('/login');
  }
  
  // This line will never be reached because of the redirects
  // but is needed to satisfy TypeScript
  return null;
};

export default AuthRoutes;