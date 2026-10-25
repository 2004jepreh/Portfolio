<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SideNav from './components/SideNav.vue'
import ContactModal from './components/ContactModal.vue'
import IntroLoader from './components/IntroLoader.vue'
import PageTransition from './components/PageTransition.vue'
</script>

<template>
  <IntroLoader />
  <PageTransition />
  <SiteHeader />
  <SideNav />

  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </router-view>

  <ContactModal />
</template>