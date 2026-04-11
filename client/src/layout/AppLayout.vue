<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, hideMobileMenu } = useLayout();

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.mobileMenuActive,
        'layout-static-inactive': layoutState.staticMenuInactive
    };
});
</script>

<template>
    <div class="layout-wrapper flex flex-col h-screen" :class="containerClass">
        <AppTopbar />
        <AppSidebar />
        <div class="layout-main-container flex flex-1 overflow-hidden">
            <div class="layout-main flex-1 overflow-hidden">
                <router-view />
            </div>
        </div>
        <div class="layout-mask animate-fadein" @click="hideMobileMenu" />
    </div>
    <Toast />
</template>
