import React, { useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { Autoplay } from 'swiper/modules';

import "./App.css";

export default function App() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVICE_ENDPOINT}/content`);
        const json = await response.json();
        const images = json["files"].map((filename: string) => {
          return `${import.meta.env.VITE_SERVICE_ENDPOINT}/static/${filename}`;
        });

        setImages(images);
      } catch (error) {
        console.error('Error fetching data:', error);
      } 
    };

    fetchImages();
  }, []);

  return (<>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img src={image} />
          </SwiperSlide>
        ))}
      </Swiper>
  </>)
}
