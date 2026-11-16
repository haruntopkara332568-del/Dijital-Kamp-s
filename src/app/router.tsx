import { createBrowserRouter } from 'react-router';
import {
  CampusMapRoutePage,
  DesignSystemRoutePage,
  HomeRoutePage,
  JourneyRoutePage,
  LearningAreaRoutePage,
  MissionRoutePage,
  NotFoundRoutePage,
} from '@/src/app/CampusPages';

/**
 * React Router tek kullanım modu: istemci tarafı createBrowserRouter.
 */
export const campusRouter = createBrowserRouter([
  { path: '/', element: <HomeRoutePage /> },
  { path: '/harita', element: <CampusMapRoutePage /> },
  { path: '/alan/:id', element: <LearningAreaRoutePage /> },
  { path: '/gorev/:id', element: <MissionRoutePage /> },
  { path: '/yolculugum', element: <JourneyRoutePage /> },
  { path: '/tasarim-sistemi', element: <DesignSystemRoutePage /> },
  { path: '*', element: <NotFoundRoutePage /> },
]);
