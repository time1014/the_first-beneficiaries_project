<script setup>
import { onBeforeMount, ref, computed, watch } from 'vue';
import { useBeneStore } from '@/stores/surBene';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
const dropdownValues = ref([]);
const userStore = useUserStore();
const user_no = userStore.user_no;
const userbeneStore = useBeneStore();
const notice = ref({
    notice_title: '',
    notice_content: '',
    institution_no: null
});
const props = defineProps({
    visible: Boolean
});
const getInstitutionList = async () => {
    try {
        const res = await fetch('/api/institution');
        const data = await res.json();
        dropdownValues.value = data;
    } catch (err) {
        console.log(err);
    }
};
const emit = defineEmits(['update:visible', 'selectInstitution']);

watch(
    () => notice.value.institution_no,
    (val) => {
        if (!val) return;

        const selected = dropdownValues.value.find((item) => item.institution_no === val);

        if (!selected) return;

        emit('selectInstitution', selected);
        emit('update:visible', false);
    }
);
onBeforeMount(() => {
    getInstitutionList();
});
</script>
<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" :modal="true" :closable="false" :dismissableMask="true" :style="{ width: '50vw' }">
        <template #header>
            <div class="w-full bg-indigo-500 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                <span class="text-lg font-medium"> 기관 </span>

                <button @click="emit('update:visible', false)" class="text-white text-2xl font-light hover:opacity-70">✕</button>
            </div>
        </template>

        <!-- 내용 -->
        <div class="flex-1">
            <Select v-model="notice.institution_no" :options="dropdownValues" optionLabel="institution_name" optionValue="institution_no" placeholder="기관 선택" class="w-full" />
        </div>
    </Dialog>
</template>
