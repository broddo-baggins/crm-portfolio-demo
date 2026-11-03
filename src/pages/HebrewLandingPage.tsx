import React from 'react';
import LandingPage from '@/pages/LandingPage';

/**
 * The Hebrew landing page (/he): the same page as /, set in Hebrew and right to left,
 * so both languages share one design and one set of components.
 */
export const HebrewLandingPage: React.FC = () => <LandingPage lang="he" />;

export default HebrewLandingPage;
