import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Cards } from './components/Home/Cards';

function App() {
  return (
    <div className="container mx-auto ">
      <Header />
      <Cards />
      <Footer />
    </div>
  );
}

export default App;
