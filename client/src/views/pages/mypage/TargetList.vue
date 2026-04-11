<script setup>
import { computed } from 'vue';

const props = defineProps({
    // 지원대상자 목록
    targets: {
        type: Array,
        default: () => []
    },

    // 현재 선택된 대상자 id
    selectedId: [String, Number]
});

const emit = defineEmits(['select', 'add']);

// 현재 선택된 id
const selected = computed(() => props.selectedId);

// 목록 항목 클릭
function onItemClick(target) {
    emit('select', target.id);
}

// 등록 버튼 클릭
function onAdd() {
    emit('add');
}
</script>

<template>
    <div>
        <!-- 제목/안내 -->
        <div class="mb-4">
            <div class="font-semibold text-2xl text-gray-800 mb-1">등록된 지원대상자</div>
            <div class="text-gray-500 leading-5">등록된 대상자를 선택하거나 새로 등록할 수 있습니다.</div>
        </div>

        <!-- 목록 -->
        <div class="max-h-[420px] overflow-y-auto">
            <div v-if="targets.length === 0" class="text-gray-500 py-4 border-b">지원대상자가 없습니다.</div>

            <div v-for="target in targets" :key="target.id" class="p-3 border-b cursor-pointer transition-colors" :class="selected == target.id ? 'bg-gray-300' : 'hover:bg-gray-200'" @click="onItemClick(target)">
                <div class="text-gray-800 font-medium mb-1">
                    {{ target.name }}
                </div>

                <div class="text-sm text-gray-600">
                    {{ target.relation || '관계 미입력' }}
                </div>
            </div>
        </div>

        <!-- 등록 버튼 -->
        <!-- <button type="button" class="mt-4 w-full bg-green-400 hover:bg-green-500 text-white py-2 rounded-lg font-medium" @click="onAdd">지원대상자 등록</button> -->
        <Button type="button" class="w-full" label="지원대상자 등록" v-on:click="onAdd" />
    </div>
</template>
