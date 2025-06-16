import React, { useState, useEffect } from "react";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import Robot from "../../assets/mobile-character.jpg";

const MainDashboard = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Responsive handling
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.body);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="relative w-full h-[91vh] bg-gray-900 overflow-hidden">
      {isLoading && <LoadingOverlay />}
      <div className="absolute inset-0">
        {isMobile ? (
          <img
            src={Robot}
            alt="Robot"
            width={"full"}
            height={"full"}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <Spline
            scene="https://prod.spline.design/lTMzvAb26365illx/scene.splinecode"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  );
};

const LoadingOverlay = () => (
  <div className="flex flex-col items-center justify-center bg-gray-900 h-full">
    <div className="spinner"></div>
    <h3 className="text-white mt-4 text-lg animate-pulse">
      Loading Interactive Experience
    </h3>
  </div>
);

export default MainDashboard;
