<template>
  <q-input
    :type="showPassword ? 'text' : 'password'"
    filled
    label-color="grey-5"
    :model-value="modelValue"
    :autocomplete="autocomplete"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #append>
      <q-icon
        :name="showPassword ? 'visibility' : 'visibility_off'"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>

    <slot></slot>
  </q-input>
</template>

<script lang="ts">
import type { QInputProps } from 'quasar';

export interface PasswordFieldProps extends QInputProps {
  modelValue: string;
  autocomplete: 'current-password' | 'new-password';
}
</script>

<script setup lang="ts">
defineProps<PasswordFieldProps>();

const showPassword = ref(false);
</script>
