<template>
  <div class="admin">
    <h1>Beheer</h1>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- niet ingelogd of geen admin -->
    <p v-if="!isAdmin" class="notice">
      Deze pagina is enkel voor administrators. Log in als admin via <RouterLink to="/tasks">Mijn taken</RouterLink>.
    </p>

    <template v-else>
      <!-- tabs om te wisselen tussen taken en gebruikers -->
      <div class="tabs">
        <button :class="{ active: tab === 'tasks' }" @click="tab = 'tasks'; successMessage = ''">
          Alle taken ({{ allTasks.length }})
        </button>
        <button :class="{ active: tab === 'users' }" @click="tab = 'users'; successMessage = ''">
          Alle gebruikers ({{ users.length }})
        </button>
      </div>

      <p v-if="loading" class="notice">Laden...</p>

      <!-- (a) + (c): overzicht van alle taken met toekennen -->
      <table v-if="tab === 'tasks' && !loading">
        <thead>
          <tr>
            <th>Taak</th>
            <th>Status</th>
            <th>Toegekend aan</th>
            <th>Toekennen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in allTasks" :key="task._id">
            <td>{{ task.todo }}</td>
            <td>
              <span :class="['badge', task.completed ? 'done' : 'open']">
                {{ task.completed ? 'Klaar' : 'Open' }}
              </span>
            </td>
            <td>{{ usernameOf(task.userId) }}</td>
            <td>
              <div class="assign">
              <select v-model="selected[task._id]">
                <option disabled value="">Kies gebruiker</option>
                <option v-for="user in users" :key="user._id" :value="user._id">
                  {{ user.username }}
                </option>
              </select>
              <button :disabled="!selected[task._id]" @click="assign(task._id)">Toekennen</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- (b): overzicht van alle gebruikers -->
      <table v-if="tab === 'users' && !loading">
        <thead>
          <tr>
            <th>Gebruiker</th>
            <th>Rollen</th>
            <th>Aantal taken</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.username }}</td>
            <td>{{ user.roles.join(', ') }}</td>
            <td>{{ taskCount(user._id) }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useStore } from '@/stores/index';

const store = useStore();

const tab = ref('tasks');
const errorMessage = ref('');
const successMessage = ref('');
// per taak de gekozen gebruiker in de dropdown
const selected = reactive({});

const isAdmin = computed(() => store.isAdmin);
const allTasks = computed(() => store.allTasks);
const users = computed(() => store.users);
const loading = computed(() => store.loading);

// zoekt de gebruikersnaam bij een userId
const usernameOf = (userId) => {
  if (!userId) return '—';
  const user = users.value.find(u => u._id === userId);
  return user ? user.username : 'onbekend';
};

// telt hoeveel taken een gebruiker heeft
const taskCount = (userId) => allTasks.value.filter(t => t.userId === userId).length;

const loadData = async () => {
  try {
    errorMessage.value = '';
    await store.retrieveAllUsers();
    await store.retrieveAllTasks();
    // elke dropdown start op "Kies gebruiker"
    store.allTasks.forEach(task => { selected[task._id] = ''; });
  } catch (error) {
    errorMessage.value = error.message;
  }
};

const assign = async (taskId) => {
  try {
    errorMessage.value = '';
    successMessage.value = '';
    const userId = selected[taskId];
    await store.assignTask(taskId, userId);
    successMessage.value = `Taak toegekend aan ${usernameOf(userId)}.`;
    selected[taskId] = '';
  } catch (error) {
    errorMessage.value = error.message;
  }
};

onMounted(async () => {
  try {
    // na een refresh weten we nog niet wie er ingelogd is
    if (!store.user.username) {
      await store.checkLogin();
    }
  } catch (error) {
    // niet ingelogd: de melding hierboven wordt getoond
  }
  if (store.isAdmin) {
    await loadData();
  }
});
</script>

<style scoped>
.admin {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

h1 {
  font-size: 1.6rem;
  margin-bottom: 16px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tabs button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 0.95rem;
}

.tabs button.active {
  background: #0f9d76;
  border-color: #0f9d76;
  color: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

th, td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}

th {
  background: #f6f8f7;
  font-weight: 600;
  font-size: 0.9rem;
}

.badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
}

.badge.open { background: #fff3e0; color: #b25e00; }
.badge.done { background: #e6f6ef; color: #0b7a5b; }

.assign {
  display: flex;
  gap: 8px;
}

.assign select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.assign button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #0f9d76;
  color: #fff;
  cursor: pointer;
}

.assign button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.notice { color: #666; }

.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.success {
  color: #0b7a5b;
  background: #e6f6ef;
  padding: 10px;
  border-radius: 4px;
  margin-top: 12px;
}

@media (max-width: 600px) {
  .assign { flex-direction: column; }
  th, td { padding: 8px; font-size: 0.9rem; }
}
</style>
