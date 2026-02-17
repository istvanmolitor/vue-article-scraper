<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { getBackandUrl, useDevError } from '@admin/lib/utils'
import Button from '@admin/components/ui/Button.vue'
import Input from '@admin/components/ui/Input.vue'
import Label from '@admin/components/ui/Label.vue'
import Card from '@admin/components/ui/Card.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import CardContent from '@admin/components/ui/CardContent.vue'

const { showDevError } = useDevError()

const api = axios.create({
  baseURL: getBackandUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
)

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
    const response = await api.post('/api/article-scraper/scrape', {
      url: url.value
    })

    if (response.data.success) {
      article.value = response.data.data
    } else {
      error.value = response.data.message || 'Hiba történt a cikk letöltése során'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Hiba történt a cikk letöltése során'
    showDevError(err)
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
    showDevError(err)
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
  <div class="space-y-4">
        <!-- URL Input -->
        <div class="space-y-2">
          <Label for="article-url">
            Cikk URL
          </Label>
          <div class="flex gap-2">
            <Input
              id="article-url"
              v-model="url"
              type="url"
              placeholder="https://example.com/cikk"
              class="flex-1"
              :disabled="loading || saving"
              @keyup.enter="scrapeArticle"
            />
            <Button
              @click="scrapeArticle"
              :disabled="loading || saving || !url.trim()"
            >
              {{ loading ? 'Letöltés...' : 'Letöltés' }}
            </Button>
            <Button
              v-if="article"
              @click="saveAsPage"
              :disabled="saving || loading"
              variant="secondary"
            >
              {{ saving ? 'Mentés...' : 'Mentés Page-ként' }}
            </Button>
            <Button
              v-if="article"
              @click="reset"
              :disabled="saving || loading"
              variant="outline"
            >
              Törlés
            </Button>
          </div>
        </div>

        <!-- Success Message -->
        <Card
          v-if="saveSuccess"
          class="border-green-200 bg-green-50"
        >
          <CardContent class="pt-6">
            <p class="text-green-700">{{ saveSuccess }}</p>
          </CardContent>
        </Card>

        <!-- Error Message -->
        <Card
          v-if="error"
          class="border-red-200 bg-red-50"
        >
          <CardContent class="pt-6">
            <p class="text-red-700">{{ error }}</p>
          </CardContent>
        </Card>

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
          <Card>
            <!-- Article Header -->
            <CardHeader class="border-b">
              <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span class="font-medium">{{ article.portal }}</span>
                <span>•</span>
                <span v-if="article.createdAt">{{ new Date(article.createdAt).toLocaleDateString('hu-HU') }}</span>
              </div>

              <CardTitle class="text-3xl mb-4">
                {{ article.title }}
              </CardTitle>

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
            </CardHeader>

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
            <CardContent v-if="article.lead" class="bg-gray-50 border-b pt-6">
              <p class="text-lg font-medium text-gray-800 leading-relaxed">
                {{ article.lead }}
              </p>
            </CardContent>

            <!-- Article Content -->
            <CardContent class="pt-6">
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
            </CardContent>

            <!-- Article Footer -->
            <CardContent class="bg-gray-50 border-t pt-6">
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
            </CardContent>
          </Card>
        </div>
  </div>
</template>

<style scoped>

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

