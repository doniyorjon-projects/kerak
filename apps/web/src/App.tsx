import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { Home } from "./pages/Home";
import { Categories } from "./pages/Categories";
import { CategoryFeed } from "./pages/CategoryFeed";
import { ListingDetail } from "./pages/ListingDetail";
import { CreateListing } from "./pages/CreateListing";
import { Favorites } from "./pages/Favorites";
import { Profile } from "./pages/Profile";
import { MyListings } from "./pages/MyListings";
import { Admin } from "./pages/Admin";
import { Notifications } from "./pages/Notifications";
import { EditListing } from "./pages/EditListing";
import { Plans } from "./pages/Plans";
import { Advertise } from "./pages/Advertise";

function useSharedListingRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const listingId = new URLSearchParams(location.search).get("listing");
    if (listingId) navigate(`/listings/${listingId}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function App() {
  useSharedListingRedirect();

  return (
    <div className="min-h-screen bg-app pb-28 text-ink">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:categoryId" element={<CategoryFeed />} />
        <Route path="/listings/:listingId" element={<ListingDetail />} />
        <Route path="/listings/:listingId/edit" element={<EditListing />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/listings/:listingId/advertise" element={<Advertise />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
