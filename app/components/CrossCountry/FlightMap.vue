
<template>

    <LMap
        style="height:600px"
        :zoom="11"
        :center="center"
    >

        <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <!-- Planned Route -->

        <LPolyline
            :lat-lngs="routeCoordinates"
            color="green"
        />

        <!-- GPS Track -->

        <LPolyline
            v-if="trackCoordinates.length"
            :lat-lngs="trackCoordinates"
            color="blue"
        />

        <!-- Route Markers -->

        <LMarker
            v-for="(point,index) in routeCoordinates"
            :key="index"
            :lat-lng="point"
        >

            <LPopup>

                <strong>

                    {{ route[index].location.name }}

                </strong>

            </LPopup>

        </LMarker>

        <!-- Aircraft -->

        <LMarker
            v-if="currentLocation"
            :lat-lng="currentLocation"
        >

            <LPopup>

                Aircraft

            </LPopup>

        </LMarker>

    </LMap>

</template>

<script setup>

import {

LMap,

LTileLayer,

LPolyline,

LMarker,

LPopup

} from "@vue-leaflet/vue-leaflet"

const props = defineProps({

route:Array,

track:Array,

currentLocation:Array

})

const center = computed(()=>{

if(props.route.length){

return [

props.route[0].location.latitude,

props.route[0].location.longitude

]

}

return [33.9,35.5]

})

const routeCoordinates = computed(()=>{

return props.route.map(item=>[

item.location.latitude,

item.location.longitude

])

})

const trackCoordinates = computed(()=>{

return props.track.map(item=>[

item.latitude,

item.longitude

])

})

</script>