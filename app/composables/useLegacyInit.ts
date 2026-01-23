
// composables/useLegacyInit.ts
export const useLegacyInit = () => {
  const initAll = () => {
    if (!import.meta.client) return;

    const $ = window.jQuery;
    const Swiper = window.Swiper;

    // 1. Preloader logic
    if ($) {
      $(".egns-preloader").delay(1600).fadeOut("slow");
    }

    // 2. Swiper initializations
    if (Swiper) {
      // banner4-slider
      new Swiper(".banner4-slider", {
        slidesPerView: 1,
        speed: 1200,
        spaceBetween: 15,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: true,
        loop: true,
        pagination: {
          el: ".swiper-banner-pagination",
          clickable: true,
        },
      });

      // banner5-slider
      new Swiper(".banner5-slider", {
        slidesPerView: 1,
        speed: 1200,
        spaceBetween: 15,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: true,
        loop: true,
        pagination: {
          el: ".swiper-pagination-number",
          clickable: true,
          renderBullet: (index: number, className: string) => {
            return `<span class="${className}">${index + 1}</span>`;
          },
        },
      });

      // best-plan-slider
      new Swiper(".best-plan-slider", {
        slidesPerView: 1,
        speed: 1200,
        spaceBetween: 25,
        loop: true,
        roundLengths: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: '.plan1-prev',
          prevEl: '.plan1-next',
        },
        breakpoints: {
          280: { slidesPerView: 1 },
          576: { slidesPerView: 2 },
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
          1200: { slidesPerView: 3 },
        }
      });
    }
  };

  return { initAll };
};
