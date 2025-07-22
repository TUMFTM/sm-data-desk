<template>
  <div class="quiz-panel">
    <div class="quiz-header">Time for a little quiz</div>

    <div class="quiz-content" v-if="currentQuestionIndex < questions.length">
      <h2 class="quiz-question">
        {{ currentQuestion.question }}
      </h2>

      <div class="quiz-options">
        <button
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          class="quiz-option"
          :class="{
            correct: answered && index === currentQuestion.correctIndex,
            wrong: answered && index === selectedIndex && index !== currentQuestion.correctIndex
          }"
          @click="selectOption(index)"
          :disabled="answered"
        >
          {{ option }}
        </button>
      </div>

      <div class="next-button-wrapper" v-if="answered">
        <button @click="goToNextQuestion" class="next-button">Next</button>
      </div>
    </div>

    <div class="quiz-result" v-else>
      <h2 class="quiz-question">You’ve completed the quiz!</h2>
      <p class="quiz-score">✅ Your score: {{ score }} / {{ questions.length }}</p>
      <button class="retry-button" @click="restartQuiz">🔁 Do again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const questions = [
  {
    question: 'Which of these is a renewable energy source?',
    options: ['Coal', 'Solar', 'Natural Gas', 'Nuclear'],
    correctIndex: 1
  },
  {
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctIndex: 2
  }
]

const currentQuestionIndex = ref(0)
const selectedIndex = ref(null)
const answered = ref(false)
const score = ref(0)

const currentQuestion = computed(() => questions[currentQuestionIndex.value])

function selectOption(index) {
  if (!answered.value) {
    selectedIndex.value = index
    answered.value = true
    if (index === currentQuestion.value.correctIndex) {
      score.value++
    }
  }
}

function goToNextQuestion() {
  currentQuestionIndex.value++
  selectedIndex.value = null
  answered.value = false
}

function restartQuiz() {
  currentQuestionIndex.value = 0
  selectedIndex.value = null
  answered.value = false
  score.value = 0
}
</script>

<style scoped>
.quiz-panel {
  background-color: #e6edf5;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: Arial;
  font-weight: bold;
}

.quiz-header {
  background-color: #0061c3;
  color: white;
  font-size: 22px;
  padding: 4px 5px 0 12px;
  font-weight: bold;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  text-align: left;
}

.quiz-content {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.quiz-question {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #000;
  text-align: center;
}

.quiz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
  flex-grow: 1;
}

.quiz-option {
  width: 100%;
  height: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #d6e4f0;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.quiz-option:hover:enabled {
  background-color: #bcd4ec;
}

.quiz-option.correct {
  background-color: #b4e4b4 !important;
}

.quiz-option.wrong {
  background-color: #f4b6b6 !important;
}

.next-button-wrapper {
  margin-top: 1rem;
  text-align: center;
}

.next-button,
.retry-button {
  background-color: #0061c3;
  color: white;
  font-size: 1rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.quiz-result {
  padding: 2rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quiz-score {
  font-size: 1.5rem;
  color: #0061c3;
  font-weight: bold;
  margin: 1rem 0;
}
</style>
