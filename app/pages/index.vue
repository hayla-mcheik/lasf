<script setup lang="ts">
import Activities from '~/components/Frontend/Activities.vue';
import Destination from '~/components/Frontend/Destination.vue';
import HeroSlider from '~/components/Frontend/HeroSlider.vue';
import News from '~/components/Frontend/News.vue';
import Pilot from '~/components/Frontend/Pilot.vue';
import Searchbar from '~/components/Frontend/Searchbar.vue';
import Test from '~/components/Frontend/Test.vue';
import Testimonials from '~/components/Frontend/Testimonials.vue';
import WeatherCheck from '~/components/Frontend/WeatherCheck.vue';
import WhyChooseUse from '~/components/Frontend/WhyChooseUse.vue';

</script>

<template>
  <div>
<HeroSlider />
<WeatherCheck />
<!-- <Searchbar /> -->
<Destination />
<Activities />
<WhyChooseUse />
<Pilot />
<Testimonials />
<News />
  </div>
</template>
