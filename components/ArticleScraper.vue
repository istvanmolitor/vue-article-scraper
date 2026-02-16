<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { getBackandUrl } from '@admin/lib/utils'

interface ArticleImage {
  src: string
  alt: string | null
  author: string | null
}

interface ArticleContentElement {
  type: string
  content?: string
  src?: string
  alt?: string
  author?: string
  items?: string[]
}

interface ScrapedArticle {
  portal: string
  url: string
  title: string
  authors: string[]
  mainImage: ArticleImage | null
  lead: string
  keywords: string[]
  content: ArticleContentElement[]
  createdAt: string | null
}

const url = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const saveSuccess = ref<string | null>(null)
const article = ref<ScrapedArticle | null>(null)

const scrapeArticle = async () => {
  if (!url.value.trim()) {
    error.value = 'Kérem adjon meg egy URL-t'
    return
  }

  loading.value = true
  error.value = null
  saveSuccess.value = null
  article.value = null

  try {
    const response = await axios.post(`${getBackandUrl()}/api/article-scraper/scrape`, {
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

const saveAsPage = async () => {
  if (!url.value.trim()) {
    error.value = 'Nincs URL megadva'
    return
  }

  saving.value = true
  error.value = null
  saveSuccess.value = null

  try {
    const response = await axios.post(`${getBackandUrl()}/api/article-scraper/scrape-and-save`, {
      url: url.value,
      publish: false
    })

    if (response.data.success) {
      saveSuccess.value = `Cikk sikeresen elmentve: ${response.data.data.title}`
      // Optionally redirect to the page editor
      // window.location.href = `/admin/pages/${response.data.data.page_id}/edit`
    } else {
      error.value = response.data.message || 'Hiba történt a cikk mentése során'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Hiba történt a cikk mentése során'
  } finally {
    saving.value = false
  }
}

const reset = () => {
  url.value = ''
  article.value = null
  error.value = null
  saveSuccess.value = null
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
              :disabled="loading || saving"
              @keyup.enter="scrapeArticle"
            />
            <button
              @click="scrapeArticle"
              :disabled="loading || saving || !url.trim()"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Letöltés...' : 'Letöltés' }}
            </button>
            <button
              v-if="article"
              @click="saveAsPage"
              :disabled="saving || loading"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {{ saving ? 'Mentés...' : 'Mentés Page-ként' }}
            </button>
            <button
              v-if="article"
              @click="reset"
              :disabled="saving || loading"
              class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Törlés
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div
          v-if="saveSuccess"
          class="p-4 bg-green-50 border border-green-200 rounded-md"
        >
          <p class="text-green-700">{{ saveSuccess }}</p>
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
          class="mt-6"
        >
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <!-- Article Header -->
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span class="font-medium">{{ article.portal }}</span>
                <span>•</span>
                <span v-if="article.createdAt">{{ new Date(article.createdAt).toLocaleDateString('hu-HU') }}</span>
              </div>

              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                {{ article.title }}
              </h1>

              <!-- Authors -->
              <div v-if="article.authors && article.authors.length > 0" class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ article.authors.join(', ') }}</span>
              </div>

              <!-- Keywords -->
              <div v-if="article.keywords && article.keywords.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="(keyword, index) in article.keywords"
                  :key="index"
                  class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>

            <!-- Main Image -->
            <div v-if="article.mainImage" class="relative">
              <img
                :src="article.mainImage.src"
                :alt="article.mainImage.alt || article.title"
                class="w-full h-auto"
              />
              <div v-if="article.mainImage.author" class="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-3 py-1">
                Fotó: {{ article.mainImage.author }}
              </div>
            </div>

            <!-- Lead -->
            <div v-if="article.lead" class="p-6 bg-gray-50 border-b border-gray-200">
              <p class="text-lg font-medium text-gray-800 leading-relaxed">
                {{ article.lead }}
              </p>
            </div>

            <!-- Article Content -->
            <div class="p-6">
              <div class="prose prose-lg max-w-none">
                <template v-for="(element, index) in article.content" :key="index">
                  <!-- Paragraph -->
                  <p v-if="element.type === 'paragraph'" class="mb-4 text-gray-800 leading-relaxed">
                    {{ element.content }}
                  </p>

                  <!-- Heading -->
                  <h2 v-else-if="element.type === 'heading'" class="text-2xl font-bold text-gray-900 mt-6 mb-4">
                    {{ element.content }}
                  </h2>

                  <!-- Image -->
                  <figure v-else-if="element.type === 'image'" class="my-6">
                    <img
                      :src="element.src"
                      :alt="element.alt || ''"
                      class="w-full h-auto rounded-lg"
                    />
                    <figcaption v-if="element.author || element.alt" class="text-sm text-gray-600 mt-2 text-center">
                      <span v-if="element.alt">{{ element.alt }}</span>
                      <span v-if="element.author"> - Fotó: {{ element.author }}</span>
                    </figcaption>
                  </figure>

                  <!-- Quote -->
                  <blockquote v-else-if="element.type === 'quote'" class="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-700">
                    {{ element.content }}
                  </blockquote>

                  <!-- List -->
                  <ul v-else-if="element.type === 'list'" class="list-disc list-inside mb-4 space-y-2">
                    <li v-for="(item, itemIndex) in element.items" :key="itemIndex" class="text-gray-800">
                      {{ item }}
                    </li>
                  </ul>

                  <!-- Video -->
                  <div v-else-if="element.type === 'video'" class="my-6">
                    <video :src="element.src" controls class="w-full rounded-lg">
                      A böngésző nem támogatja a videó lejátszást.
                    </video>
                  </div>

                  <!-- Iframe -->
                  <div v-else-if="element.type === 'iframe'" class="my-6">
                    <iframe
                      :src="element.src"
                      class="w-full h-96 rounded-lg border-0"
                      allowfullscreen
                    ></iframe>
                  </div>
                </template>
              </div>
            </div>

            <!-- Article Footer -->
            <div class="p-6 bg-gray-50 border-t border-gray-200">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <a
                  :href="article.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>Eredeti cikk megtekintése</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
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

.prose {
  color: #374151;
}

.prose p {
  margin-bottom: 1rem;
}

.prose h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose img {
  border-radius: 0.5rem;
}
</style>

