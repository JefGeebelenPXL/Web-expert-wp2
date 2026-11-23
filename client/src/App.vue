<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useStore } from '@/stores/index'

const store = useStore()
const isAdmin = computed(() => store.isAdmin)
const username = computed(() => store.user.username)
</script>

<template>
  <header>
    <nav>
      <span class="brand">Taakbeheer</span>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/tasks">Mijn taken</RouterLink>
      <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
      <span v-if="username" class="who">{{ username }}</span>
    </nav>
  </header>

  <RouterView />
</template>
