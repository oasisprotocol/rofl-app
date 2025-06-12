import { type FC } from 'react';
import { Header } from '../../components/Layout/Header';
import { Footer } from '../../components/Layout/Footer';
import { Cards } from './Cards';
import { Hero } from './Hero';

export const Landing: FC = () => {
  return (
    <div className="container mx-auto ">
      <Header />
      <Hero />
      <Cards />
      <Footer />
    </div>
  );
};
