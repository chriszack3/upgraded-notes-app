<template>
  <div
    style="
      margin: 0 20px;
      margin-bottom: 40px;
      width: 300px;

      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 28px;

      display: flex;
      flex-direction: column;
    "
  >
    <div style="font-size: 30px; font-weight: bold">
      {{ title }}
    </div>

    <Gap style="height: 40px" />

    <div style="text-align: center; font-weight: bold">
      <span style="font-size: 46px">${{ price }}</span>
      <span style="font-size: 12px; color: #d0d0d0">/ month</span>
    </div>

    <Gap style="height: 48px" />

    <div style="font-weight: bold; color: #4e9cea; font-size: 14px">
      <template v-if="previous == null">Features:</template>
      <template v-else>Everything in {{ previous }}, plus:</template>
    </div>

    <Gap style="height: 18px" />

    <ul style="margin: 0; padding-inline-start: 48px; font-size: 14px">
      <li
        v-for="feature in features"
        :key="feature.text"
      >
        <q-icon
          :name="feature.icon"
          size="28px"
          class="feature-icon"
        />

        {{ feature.text }}

        <q-icon
          v-if="feature.help != null"
          name="mdi-help-circle"
          size="16px"
          style="margin-left: 4px; margin-top: -1px; pointer-events: auto"
        >
          <q-tooltip
            anchor="top middle"
            self="bottom middle"
            transition-show="jump-up"
            transition-hide="jump-down"
            max-width="190px"
          >
            {{ feature.help }}
          </q-tooltip>
        </q-icon>
      </li>
    </ul>

    <Gap style="height: 46px" />

    <q-space />

    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  price: number;
  previous?: string;
  features: {
    icon: string;
    text: string;
    help?: string;
  }[];
}>();
</script>

<style scoped lang="scss">
ul :deep() {
  list-style: none;

  > li {
    position: relative;

    margin-bottom: 20px;
  }
}

.feature-icon {
  position: absolute;
  left: -44px;
  top: -3px;
}
</style>
