// author: Waleed Alhindi : filter
// author: Darshil_Patel : Wishlist and Star Rating

import React, { useState, useEffect } from "react";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import { BrowserView, MobileView } from "react-device-detect";
import { Link } from "react-router-dom";
import { Rating } from "@material-tailwind/react";
import Header from "../header/header";
import Footer from "../footer/footer";
import axios from "axios";
import { Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "../services/services.css";

export default function Services() {
  const [services, setServices] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState([]);
  const [filtered, setFiltered] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const [wishlist, setWishlist] = useState([]); // Track wishlist services
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [removingFromWishlist, setRemovingFromWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const addToWishlist = async (serviceId) => {
    try {
      setAddingToWishlist(true);
      const user = localStorage.getItem("userData");
      const userId = JSON.parse(user)._id;

      const response = await axios.post(`https://urban-canada-backend.onrender.com/wishlist/add`, {
        userId,
        serviceId,
      });

      if (response.data.success) {
        setWishlist([...wishlist, serviceId]);
      } else {
        setWishlistError(response.data.message);
      }
      window.location.reload();

    } catch (error) {
      console.error(error);
      setWishlistError("Error adding to wishlist.");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const removeFromWishlist = async (serviceId) => {
    try {
      setRemovingFromWishlist(true);
      const user = localStorage.getItem("userData");
      const userId = JSON.parse(user)._id;

      const response = await axios.post(
        `https://urban-canada-backend.onrender.com/wishlist/remove`,
        { userId, serviceId }
      );

      if (response.data.success) {
        const updatedWishlist = wishlist.filter((item) => item !== serviceId);
        setWishlist(updatedWishlist); 
      } else {
        setWishlistError(response.data.message);
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      setWishlistError("Error removing from wishlist.");
    } finally {
      setRemovingFromWishlist(false);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const user = localStorage.getItem("userData");
      const userId = JSON.parse(user)._id;

      const response = await axios.get(
        `https://urban-canada-backend.onrender.com/wishlist/getUserWishlist/${userId}`
      );

      if (response.data.success) {
        setWishlist(response.data.user.wishlist);
        // console.log(wishlist);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError("Error fetching wishlist.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserWishlist(); 

  }, []);

  const renderWishlistButton = (serviceId) => {
    const isServiceInWishlist = wishlist.includes(serviceId);


    const heartIconStyle = {
      width: "25px",
      height: "25px",
      transition: "color 0.3s ease-in-out", 
      color:"red"
    };
  
    if (wishlist.includes(serviceId)) {
      return (
        <Button
          sx={{
            backgroundColor: "white",
            borderRadius: 10,
            height: 50,
            marginLeft: "100px",
            position: "absolute",
            width: "50px !important",
            minWidth:"50px",
            "&.MuiButton-root": {
              marginLeft: "11rem !important", 
              marginTop:"0.5rem !important",
            },
          }}
          style={{}}
          color="secondary"
          onClick={() => removeFromWishlist(serviceId)}
          className="text-red-600 font-medium text-sm mx-2"
          disabled={removingFromWishlist}
        >
          <FavoriteIcon sx={{ right: 0 }} style={heartIconStyle}/>
        </Button>
      );
    } else {
      return (
        <Button
          sx={{
            backgroundColor: "white",
            borderRadius: 50,
            height: 50,
            minWidth:"50px",
            "&.MuiButton-root": {
              marginLeft: "11rem !important", 
              marginTop:"0.5rem !important",
            },
            width: "50px !important",
          }}
          color="secondary"
          className="text-green-600 font-medium text-sm mx-2"
          disabled={addingToWishlist}
          onClick={() => addToWishlist(serviceId)}

        >
            <FavoriteBorderIcon
              style={{
                width: "25px",
                height: "25px", 
              }}
              sx={{color:"red" }}
            />
        </Button>
      );
    }
  };

  const fetchData = async () => {
    let data = await fetch("https://urban-canada-backend.onrender.com/allServices", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let serviceJson = await data.json();
    let serviceList = serviceJson["services"];
    for (let x = 0; x < serviceList.length; x++) {
      let rating = 0;
      let vendorId = serviceList[x]["vendorID"];
      let data = await fetch(
        "https://urban-canada-backend.onrender.com/rating/averagerating/" + vendorId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let res = await data.json();
      if ("error" in res) {
        serviceList[x]["rating"] = 0;
      } else {
        serviceList[x]["rating"] = parseInt(res["averageRating"]);
      }
    }
    if (JSON.stringify(services) != JSON.stringify(serviceList)) {
      // console.log(serviceList);
      return setServices(serviceList);
    }
  };

  React.useEffect(() => {
    if (filtered) {
      return;
    }
    if (searched) {
      return;
    }
    fetchData();
  }, services);

  const searchServices = async (event) => {
    event.preventDefault();
    setSearched(true);
    let searchTerm = event.target.value;
    if (searchTerm == "") {
      setSearched(false);
      fetchData();
      return;
    }
    let data = await fetch("https://urban-canada-backend.onrender.com/searchServices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchTerm: searchTerm }),
    });
    let serviceJson = await data.json();
    let serviceList = serviceJson["services"];
    if (JSON.stringify(services) != JSON.stringify(serviceList)) {
      return setServices(serviceList);
    }
  };

  const applyFilters = async (e) => {
    let newFilters = [];
    let elements = document.getElementsByClassName("fltrs");
    for (let x = 0; x < elements.length; x++) {
      if (elements[x].checked) {
        newFilters.push(elements[x].value);
      }
    }
    if (newFilters.length == 0) {
      setFiltered(false);
      fetchData();
      return;
    }
    setFiltered(true);
    let data = await fetch("https://urban-canada-backend.onrender.com/filterServices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters: newFilters }),
    });
    let serviceJson = await data.json();
    let serviceList = serviceJson["services"];
    if (JSON.stringify(services) != JSON.stringify(serviceList)) {
      return setServices(serviceList);
    }
  };

  return (
    <div>
      <Header currentPage="/Services" />

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, shrink-to-fit=no"
      />

      <div className="bg-white">
        <center>
          <div className="flex mt-4 w-fit">
            <label className="block text-base font-medium leading-6 text-gray-900 m-2">
              Search:
            </label>

            <input
              id="search-bar"
              variant="outlined"
              onChange={searchServices}
              type="text"
              className="block flex-1 rounded-md ring-1 ring-gray-300 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6"
            />
          </div>

          <BrowserView>
            <div className="filters-desktop">
              <Accordion className="fltrs-dropdown">
                <AccordionItem header="Category" className="accFltrs text-base">
                  <input
                    type="checkbox"
                    id="cleaning"
                    value="Cleaning"
                    className="fltrs"
                    onClick={applyFilters}
                  ></input>{" "}
                  Cleaning
                  <br></br>
                  <input
                    type="checkbox"
                    id="repair"
                    value="Repair"
                    className="fltrs"
                    onClick={applyFilters}
                  ></input>{" "}
                  Repair
                  <br></br>
                  <input
                    type="checkbox"
                    id="moving"
                    value="Moving"
                    className="fltrs"
                    onClick={applyFilters}
                  ></input>{" "}
                  Moving
                  <br></br>
                  <input
                    type="checkbox"
                    id="carpentry"
                    value="Carpentry"
                    className="fltrs"
                    onClick={applyFilters}
                  ></input>{" "}
                  Carpentry
                  <br></br>
                  <input
                    type="checkbox"
                    id="landscaping"
                    value="Landscaping"
                    className="fltrs"
                    onClick={applyFilters}
                  ></input>{" "}
                  Landscaping
                  <br></br>
                  <input
                    type="checkbox"
                    id="other"
                    value="Other"
                    className="fltrs"
                    onClick={applyFilters}
                  ></input>{" "}
                  Other
                  <br></br>
                  <br></br>
                </AccordionItem>
              </Accordion>
            </div>
          </BrowserView>
          <MobileView>
            <div className="filters-mobile">
              <Accordion className="fltrs-dropdown">
                <AccordionItem header="Filters" className="accFltrs">
                  <div className="floatFix">
                    <div className="l-div">
                      <input
                        type="checkbox"
                        id="cleaning"
                        value="Cleaning"
                        className="fltrs"
                        onClick={applyFilters}
                      ></input>{" "}
                      Cleaning
                      <br></br>
                      <input
                        type="checkbox"
                        id="repair"
                        value="Repair"
                        className="fltrs"
                        onClick={applyFilters}
                      ></input>{" "}
                      Repair
                      <br></br>
                      <input
                        type="checkbox"
                        id="moving"
                        value="Moving"
                        className="fltrs"
                        onClick={applyFilters}
                      ></input>{" "}
                      Moving
                      <br></br>
                    </div>
                    <div className="r-div">
                      <input
                        type="checkbox"
                        id="carpentry"
                        value="Carpentry"
                        className="fltrs"
                        onClick={applyFilters}
                      ></input>{" "}
                      Carpentry
                      <br></br>
                      <input
                        type="checkbox"
                        id="landscaping"
                        value="Landscaping"
                        className="fltrs"
                        onClick={applyFilters}
                      ></input>{" "}
                      Landscaping
                      <br></br>
                      <input
                        type="checkbox"
                        id="other"
                        value="Other"
                        className="fltrs"
                        onClick={applyFilters}
                      ></input>{" "}
                      Other
                      <br></br>
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </MobileView>
        </center>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {services?.map((service) => (
              <div className="service_card group p-2 decoration-white no-underline">
                <p
                  style={{ color: "inherit" }}
                  className="mt-1 text-l font-medium text-gray-900"
                >
                  {service.serviceName}
                </p>

                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                  <img
                    style={{ color: "inherit" }}
                    src={service.serviceImg}
                    alt={service.serviceName}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                  <div>
                  {renderWishlistButton(service._id)}
                  </div>
                </div>

                <h3
                  style={{ color: "inherit" }}
                  className="mt-4 text-sm text-gray-700"
                >
                  Vendor: {service.vendorName}
                </h3>
                <h3
                  style={{ color: "inherit" }}
                  className="text-sm text-gray-700"
                >
                  Location: {service.vendorLocation}
                </h3>
                <h3
                  style={{ color: "inherit" }}
                  className="text-sm text-gray-700"
                >
                  Category: {service.category}
                </h3>

                <div className="flex">
                  <Rating
                    unratedColor="amber"
                    ratedColor="amber"
                    value={service.rating}
                    readonly
                  />

                  <Link
                    to={{ pathname: `/rating/${service.vendorID}` }}
                    className="text-gray-800 font-medium text-sm mx-2"
                    state={service}
                  >
                    View
                  </Link>
                </div>

                <p
                  style={{ color: "inherit" }}
                  className="mb-2 text-lg font-medium text-gray-900"
                >
                  Rate: ${service.pricePerHour}/hr.
                </p>

                <div className="mb-2">
                  <Link
                    to="/booking"
                    className="text-white no-underline"
                    state={service}
                  >
                    <button
                      type="submit"
                      variant="contained"
                      className="rounded-md bg-gray-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Book
                    </button>
                  </Link>
                </div>

                <p className="mb-0 text-sm">{service.serviceDesc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
