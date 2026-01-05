<template>
  <div class="destination-section pt-120 pb-120">
    <div class="container text-center">
        <div class="nav d-inline-flex flex-row justify-content-center nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            <button class="nav-link active nav-btn-style  mb-20" id="v-pills-information-tab" data-bs-toggle="pill" data-bs-target="#v-pills-information" type="button" role="tab" aria-controls="v-pills-information" aria-selected="true"><i class="bi bi-card-image"></i> Image Gallery</button>
            <button class="nav-link nav-btn-style mb-20" id="v-pills-plan-tab" data-bs-toggle="pill" data-bs-target="#v-pills-plan" type="button" role="tab" aria-controls="v-pills-plan" aria-selected="true"><i class="bi bi-play-btn"></i> Video Gallery</button>
        </div>
        <div class="tab-content mt-40" id="v-pills-tabContent">
            <div class="tab-pane fade show active" id="v-pills-information" role="tabpanel" aria-labelledby="v-pills-information-tab">
                <div class="row justify-content-center">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image1.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img1.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image4.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img4.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image7.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img7.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image10.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img10.png" class="img-fluid" alt="image">
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image2.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img2.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image5.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img5.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image8.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img8.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image11.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img11.png" class="img-fluid" alt="image">
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image3.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img3.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image6.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img6.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image9.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img9.png" class="img-fluid" alt="image">
                        </div>
                        <div class="image-gallery-single position-relative">
                            <div class="image-view">
                                <a href="/assets/images/gallery/big-gallery-image12.png" class="video-icon image-open"><i class="bi bi-binoculars"></i></a>
                            </div>
                            <img src="/assets/images/gallery/gallery-img12.png" class="img-fluid" alt="image">
                        </div>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="v-pills-plan" role="tabpanel" aria-labelledby="v-pills-plan-tab">
                <div class="row justify-content-center g-4">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="video-gallery-single position-relative">
                            <div class="video-play sibling-4">
                                <a href="https://www.youtube.com/watch?v=u31qwQUeGuM" class="popup-youtube video-icon"><i class="bx bx-play"></i></a>
                            </div>
                            <img src="/assets/images/gallery/video-gallery1.png" class="img-fluid" alt="image">
                        </div>
                        <div class="video-gallery-single position-relative">
                            <div class="video-play sibling-4">
                                <a href="https://www.youtube.com/watch?v=u31qwQUeGuM" class="popup-youtube video-icon"><i class="bx bx-play"></i></a>
                            </div>
                            <img src="/assets/images/gallery/video-gallery2.png" class="img-fluid" alt="image">
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="video-gallery-single position-relative">
                            <div class="video-play sibling-4">
                                <a href="https://www.youtube.com/watch?v=u31qwQUeGuM" class="popup-youtube video-icon"><i class="bx bx-play"></i></a>
                            </div>
                            <img src="/assets/images/gallery/video-gallery3.png" class="img-fluid" alt="image">
                        </div>
                        <div class="video-gallery-single position-relative">
                            <div class="video-play sibling-4">
                                <a href="https://www.youtube.com/watch?v=u31qwQUeGuM" class="popup-youtube video-icon"><i class="bx bx-play"></i></a>
                            </div>
                            <img src="/assets/images/gallery/video-gallery4.png" class="img-fluid" alt="image">
                        </div>
                        <div class="video-gallery-single position-relative">
                            <div class="video-play sibling-4">
                                <a href="https://www.youtube.com/watch?v=u31qwQUeGuM" class="popup-youtube video-icon"><i class="bx bx-play"></i></a>
                            </div>
                            <img src="/assets/images/gallery/video-gallery5.png" class="img-fluid" alt="image">
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="video-gallery-single position-relative">
                            <div class="video-play sibling-4">
                                <a href="https://www.youtube.com/watch?v=u31qwQUeGuM" class="popup-youtube video-icon"><i class="bx bx-play"></i></a>
                            </div>
                            <img src="/assets/images/gallery/video-gallery6.png" class="img-fluid" alt="image">
                        </div>
                        <div class="video-gallery-single position-relative">
                            <div class="video-play sibling-4">
                                <a href="https://www.youtube.com/watch?v=u31qwQUeGuM" class="popup-youtube video-icon"><i class="bx bx-play"></i></a>
                            </div>
                            <img src="/assets/images/gallery/video-gallery7.png" class="img-fluid" alt="image">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>

</script>

<style scoped>

</style>