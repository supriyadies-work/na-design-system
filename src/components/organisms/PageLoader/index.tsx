"use client";

import { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";
import styles from "./PageLoader.module.css";

export default function PageLoader() {
  const [lottieData, setLottieData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isNewPage, setIsNewPage] = useState(false);
  const finishLoadingRef = useRef<(() => void) | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const body = document.body;
    const $body = (window as any).jQuery
      ? (window as any).jQuery("body")
      : null;

    $body ? $body.addClass("loading") : body.classList.add("loading");

    fetch("/lottie/nisaaulia-intro.json")
      .then((res) => res.json())
      .then((json) => {
        setLottieData(json);
      })
      .catch((error) => {
        console.error("Failed to load Lottie animation:", error);
      });

    const fallbackTimer = setTimeout(() => {
      if (!isLoadedRef.current) {
        finishLoadingRef.current?.();
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishLoading = () => {
    if (isLoadedRef.current) {
      return;
    }

    const body = document.body;
    const $body = (window as any).jQuery
      ? (window as any).jQuery("body")
      : null;

    isLoadedRef.current = true;
    setIsLoaded(true);

    $body
      ? $body.addClass("loaded").removeClass("loading")
      : (body.classList.add("loaded"), body.classList.remove("loading"));

    setTimeout(() => {
      setIsNewPage(true);
      $body ? $body.addClass("new-page") : body.classList.add("new-page");

      const pageContent = document.querySelector(
        ".page-content"
      ) as HTMLElement | null;

      if (pageContent) {
        pageContent.style.opacity = "1";
        pageContent.style.visibility = "visible";
        pageContent.style.pointerEvents = "auto";
      }
    }, 300);
  };

  finishLoadingRef.current = finishLoading;

  return (
    <div
      className={`${styles.container} ${isLoaded ? "loaded" : ""}`}
      style={{ backgroundColor: "#ffffff" }}
      suppressHydrationWarning
    >
      {lottieData && (
        <Lottie
          animationData={lottieData}
          loop={false}
          className={styles.lottie}
          onComplete={() => {
            finishLoading();
          }}
        />
      )}
    </div>
  );
}
