<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

interface ScrapedArticle {
  title: string | null
  url: string
}

const url = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const article = ref<ScrapedArticle | null>(null)

const scrapeArticle = async () => {
  if (!url.value.trim()) {
    error.value = 'Kérem adjon meg egy URL-t'
    return
  }

  loading.value = true
  error.value = null
  article.value = null

  try {
    const response = await axios.post('/api/article-scraper/scrape', {
      url: url.value
    })

    if (response.data.success) {
      article.value = response.data.data
    } else {
      error.value = response.data.message || 'Hiba történt a cikk letöltése során'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Hiba történt a cikk letöltése során'
  } finally {
    loading.value = false
  }
}

const reset = () => {
  url.value = ''
  article.value = null
  error.value = null
}
</script>

<template>
  <div class="article-scraper p-6 max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Cikk szkraper</h2>

      <div class="space-y-4">
        <!-- URL Input -->
        <div>
          <label for="article-url" class="block text-sm font-medium text-gray-700 mb-2">
            Cikk URL
          </label>
          <div class="flex gap-2">
            <input
              id="article-url"
              v-model="url"
              type="url"
              placeholder="https://example.com/cikk"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              :disabled="loading"
              @keyup.enter="scrapeArticle"
            />
            <button
              @click="scrapeArticle"
              :disabled="loading || !url.trim()"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Letöltés...' : 'Letöltés' }}
            </button>
            <button
              v-if="article"
              @click="reset"
              class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Törlés
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="p-4 bg-red-50 border border-red-200 rounded-md"
        >
          <p class="text-red-700">{{ error }}</p>
        </div>

        <!-- Loading Indicator -->
        <div
          v-if="loading"
          class="flex items-center justify-center p-8"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Article Result -->
        <div
          v-if="article && !loading"
          class="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-md"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Eredmény</h3>

          <div class="space-y-3">
            <div>
              <span class="text-sm font-medium text-gray-600">URL:</span>
              <p class="text-gray-800 break-all">{{ article.url }}</p>
            </div>

            <div>
              <span class="text-sm font-medium text-gray-600">Cím:</span>
              <p class="text-xl font-bold text-gray-900 mt-1">
                {{ article.title || 'Nincs cím' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-scraper {
  min-height: 400px;
}
</style>

