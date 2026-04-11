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
    <div class="flex h-screen m-0">
        <div class="md:w-1/2">
            <div class="h-full bg-[#034487] flex flex-col items-center justify-center gap-6">
                <img src="../assets/logo/logo_white.png" class="w-100 object-contain" />
                <span class="text-2xl font-bold text-white text-center"> 발달장애인 지원프로그램에 오신 걸 환영합니다.</span>
            </div>
        </div>
        <div class="md:w-1/2 h-screen overflow-y-auto bg-white">
            <router-view />
        </div>
    </div>
</template>
