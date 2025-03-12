import React, { Fragment, useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ProductDetailsContext } from "./index";
import { LayoutContext } from "../layout";
import Submenu from "./Submenu";
import ProductDetailsSectionTwo from "./ProductDetailsSectionTwo";
import { getSingleProduct } from "./FetchApi";
import { cartListProduct } from "../partials/FetchApi";
import { isWishReq, unWishReq, isWish } from "../home/Mixins";
import { updateQuantity, slideImage, addToCart, cartList } from "./Mixins";
import { totalCost } from "../partials/Mixins";

const apiURL = process.env.REACT_APP_API_URL;

const ProductDetailsSection = () => {
  let { id } = useParams();
  const { data, dispatch } = useContext(ProductDetailsContext);
  const { data: layoutData, dispatch: layoutDispatch } = useContext(LayoutContext);
  const sProduct = layoutData.singleProductDetail;
  const [pImages, setPimages] = useState(null);
  const [count, setCount] = useState(0);
  const [quantitiy, setQuantitiy] = useState(1);
  const [, setAlertq] = useState(false);
  const [wList, setWlist] = useState(JSON.parse(localStorage.getItem("wishList")));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      let responseData = await getSingleProduct(id);
      setTimeout(() => {
        if (responseData.Product) {
          layoutDispatch({
            type: "singleProductDetail",
            payload: responseData.Product,
          });
          setPimages(responseData.Product.pImages);
          dispatch({ type: "loading", payload: false });
          layoutDispatch({ type: "inCart", payload: cartList() });
        }
      }, 500);
    } catch (error) {
      console.log(error);
    }
    fetchCartProduct();
  };

  const fetchCartProduct = async () => {
    try {
      let responseData = await cartListProduct();
      if (responseData && responseData.Products) {
        layoutDispatch({ type: "cartProduct", payload: responseData.Products });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg className="w-12 h-12 animate-spin text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
    );
  }

  if (!sProduct) {
    return <div>No product</div>;
  }

  return (
    <Fragment>
      <Submenu value={{categoryId: sProduct.pCategory._id, product: sProduct.pName, category: sProduct.pCategory.cName}} />
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Thumbnails */}
          <div className="hidden md:block md:col-span-1">
            <div className="flex flex-col gap-2">
              {sProduct.pImages.map((img, index) => (
                <img
                  key={index}
                  onClick={() => slideImage("increase", index, count, setCount, pImages)}
                  className={`${count === index ? "border-2 border-yellow-500" : "opacity-50"} 
                    cursor-pointer w-16 h-16 object-contain rounded-lg hover:opacity-100 transition`}
                  src={`${apiURL}/uploads/products/${img}`}
                  alt={`thumbnail-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Main Image */}
          <div className="col-span-1 md:col-span-6">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                className="w-full h-[200px] object-contain"
                src={`${apiURL}/uploads/products/${sProduct.pImages[count]}`}
                alt={sProduct.pName}
              />
              <div className="absolute inset-0 flex justify-between items-center px-4">
                <button 
                  onClick={() => slideImage("decrease", null, count, setCount, pImages)}
                  className="p-2 rounded-full bg-white/70 hover:bg-white shadow-lg transition"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => slideImage("increase", null, count, setCount, pImages)}
                  className="p-2 rounded-full bg-white/70 hover:bg-white shadow-lg transition"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="col-span-1 md:col-span-5">
            <div className="flex flex-col space-y-4">
              <h1 className="text-3xl font-semibold text-gray-800">{sProduct.pName}</h1>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-yellow-700">${sProduct.pPrice}.00</span>
                <button onClick={(e) => isWishReq(e, sProduct._id, setWlist)} 
                  className={`${isWish(sProduct._id, wList) ? 'hidden' : ''} text-yellow-700`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 leading-relaxed">{sProduct.pDescription}</p>

              <div className="border rounded-lg p-4 space-y-4">
                {quantitiy === sProduct.pQuantity && (
                  <span className="text-sm text-red-500">Stock limited</span>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Quantity</span>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => updateQuantity("decrease", sProduct.pQuantity, quantitiy, setQuantitiy, setAlertq)}
                      className="p-1 rounded-md hover:bg-gray-100"
                      disabled={quantitiy <= 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                      </svg>
                    </button>
                    <span className="font-semibold w-8 text-center">{quantitiy}</span>
                    <button 
                      onClick={() => updateQuantity("increase", sProduct.pQuantity, quantitiy, setQuantitiy, setAlertq)}
                      className="p-1 rounded-md hover:bg-gray-100"
                      disabled={quantitiy >= sProduct.pQuantity}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {sProduct.pQuantity > 0 ? (
                  layoutData.inCart?.includes(sProduct._id) ? (
                    <button className="w-full py-3 bg-gray-800 text-white rounded-lg opacity-75 cursor-not-allowed">
                      In Cart
                    </button>
                  ) : (
                    <button 
                      onClick={() => addToCart(sProduct._id, quantitiy, sProduct.pPrice, layoutDispatch, setQuantitiy, setAlertq, fetchData, totalCost)}
                      className="w-full py-3 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 transition"
                    >
                      Add to Cart
                    </button>
                  )
                ) : (
                  <button className="w-full py-3 bg-gray-800 text-white rounded-lg opacity-50 cursor-not-allowed">
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProductDetailsSectionTwo />
    </Fragment>
  );
};

export default ProductDetailsSection;