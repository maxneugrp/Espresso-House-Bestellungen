import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import {
  HashRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import PageNotFound from "@/lib/PageNotFound";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "@/components/Layout";

import NewOrder from "@/pages/NewOrder";
import Orders from "@/pages/Orders";
import MenuPage from "@/pages/MenuPage";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />

        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<NewOrder />} />
            <Route
              path="/bestellungen"
              element={<Orders />}
            />
            <Route
              path="/speisekarte"
              element={<MenuPage />}
            />
          </Route>

          <Route
            path="*"
            element={<PageNotFound />}
          />
        </Routes>
      </Router>

      <Toaster />
    </QueryClientProvider>
  );
}

export default App;