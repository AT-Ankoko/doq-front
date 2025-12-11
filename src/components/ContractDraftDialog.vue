<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800" scrollable>
    <v-card rounded="xl" style="background-color: #FFFFFF">
      <v-card-title class="d-flex | align-center | pa-2 | border-b">
        <v-icon class="mr-2| ml-2">mdi-file-document</v-icon>
        계약서 초안
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-6" style="max-height: 70vh; overflow-y: auto;">
        <div 
          class="contract-content | mx-auto" 
          style="max-width: 680px;" 
          v-html="renderedContractDraft"
        ></div>
      </v-card-text>

      <v-card-actions class="pl-4 | pr-4 | pt-2 | pb-2 | border-t">
        <v-btn variant="outlined" size="small" @click="copyContractDraft">
          <v-icon class="mr-1" size="18">mdi-content-copy</v-icon>
          복사
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';
import markdownit from 'markdown-it';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  contractDraft: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const md = markdownit({
  html: true,
  breaks: true,
});

const renderedContractDraft = computed(() => {
  return md.render(props.contractDraft || '');
});

const copyContractDraft = () => {
  navigator.clipboard.writeText(props.contractDraft).then(() => alert('복사완료'));
};
</script>

<style scoped>
.contract-content :deep(h1),
.contract-content :deep(h2),
.contract-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.contract-content :deep(h1) { font-size: 1.8em; }
.contract-content :deep(h2) { font-size: 1.5em; }
.contract-content :deep(h3) { font-size: 1.2em; }

.contract-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
  border: 1px solid #ccc;
  font-size: 0.95em;
}

.contract-content :deep(th),
.contract-content :deep(td) {
  border: 1px solid #ccc;
  padding: 12px 15px;
  text-align: left;
}

.contract-content :deep(th) {
  background-color: #f5f5f5;
  font-weight: 600;
}

.contract-content :deep(tr:nth-child(even)) {
  background-color: #fafafa;
}
</style>
